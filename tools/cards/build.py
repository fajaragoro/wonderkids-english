"""Bangun data dek kartu (Card Game) ke data/cards/*.json dan validasi.
Jalankan dari akar proyek:  python3 tools/cards/build.py

Validasi: 100 kartu per dek, nama unik, gambar ada, emoji tanpa wajah (aturan faceless),
gambar hewan wajib versi faceless (data-faceless)."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'content'))

from where import WHERE  # noqa: E402
from jobs import JOBS, OUTFIT  # noqa: E402
from nature import ANIMALS, FRUITS  # noqa: E402
from build import DENY  # noqa: E402  (daftar rentang emoji berwajah dari validator soal)

# Emoji di rentang tolak yang terbukti TIDAK berwajah.
ALLOW = {'🐾', '🪴', '🎄', '🦷'}  # jejak kaki, tanaman pot, pohon natal, gigi
SKINS = ['#ffd2ac', '#f1b98c', '#d99a6c', '#a86b45', '#7a4a2c']
HAIRS = [('short', '#4a2f23'), ('long', '#2b1d16'), ('bun', '#6b3e26'), ('hijab', '#7a3df0'),
         ('short', '#1f1a17'), ('long', '#8b5a3c'), ('hijab', '#22b0f2'), ('bun', '#2b1d16')]
HIJAB_COLORS = ['#7a3df0', '#22b0f2', '#2fd07d', '#ff4f7b', '#ff8a2a']

errors = []


def slug(name):
    return name.replace(' ', '-')


def face_emoji(s):
    if s in ALLOW:
        return None
    for ch in s or '':
        cp = ord(ch)
        for a, b in DENY:
            if a <= cp <= b:
                return ch
    return None


def check_emoji(deck, name, e):
    if not e:
        errors.append(f'{deck}: {name} tanpa gambar')
    bad = face_emoji(e)
    if bad:
        errors.append(f'{deck}: {name} memakai emoji berwajah {bad}')


def unique(deck, names):
    seen = set()
    for n in names:
        if n in seen:
            errors.append(f'{deck}: nama ganda "{n}"')
        seen.add(n)


def build_where():
    out = []
    for i, (name, emo, loc, place, plural) in enumerate(WHERE, 1):
        check_emoji('where', name, emo)
        check_emoji('where', name + ' (tempat)', place)
        be = 'are' if plural else 'is'
        out.append({
            'id': 'W%03d' % i, 'name': name, 'image': emo, 'place': place, 'location': loc,
            'ask': f'Where {be} the {name}?',
            'answer': f'{"They are" if plural else "It is"} {loc}.',
            'sentence': f'The {name} {be} {loc}.',
        })
    unique('where', [c['name'] for c in out])
    return out


def build_jobs():
    out = []
    for i, (name, clue, tool, outfit) in enumerate(JOBS, 1):
        check_emoji('jobs', name, tool)
        if outfit not in OUTFIT:
            errors.append(f'jobs: {name} memakai gaya "{outfit}" yang tidak ada')
            continue
        fig = dict(OUTFIT[outfit])
        fig['skin'] = SKINS[(i * 3) % len(SKINS)]
        hair, color = HAIRS[i % len(HAIRS)]
        if 'hair' not in fig:
            # kerudung hanya bila tidak memakai topi/helm
            if hair == 'hijab' and fig.get('hat'):
                hair, color = 'long', '#2b1d16'
            fig['hair'] = hair
            fig['hairColor'] = color
        if fig['hair'] == 'hijab':
            fig['hijabColor'] = HIJAB_COLORS[i % len(HIJAB_COLORS)]
        for word in name.lower().split():
            if word in clue.lower().replace('.', ' ').replace(',', ' ').split():
                errors.append(f'jobs: clue "{name}" menyebut jawabannya')
        out.append({'id': 'J%03d' % i, 'name': name, 'clue': clue, 'tool': tool, 'figure': fig})
    unique('jobs', [c['name'] for c in out])
    return out


def build_nature():
    out = []
    for i, (name, clue) in enumerate(ANIMALS, 1):
        rel = 'cards/animals/%s.svg' % slug(name)
        path = os.path.join(ROOT, 'assets', rel)
        if not os.path.exists(path):
            errors.append(f'nature: gambar {rel} tidak ada')
        elif 'data-faceless' not in open(path).read():
            errors.append(f'nature: {rel} belum versi faceless')
        out.append({'id': 'A%03d' % i, 'kind': 'animal', 'name': name, 'clue': clue, 'image': rel})
    for i, (name, clue, emo) in enumerate(FRUITS, 1):
        if emo:
            check_emoji('nature', name, emo)
            img = emo
        else:
            img = 'cards/fruits/%s.svg' % slug(name)
            if not os.path.exists(os.path.join(ROOT, 'assets', img)):
                errors.append(f'nature: gambar {img} tidak ada')
        out.append({'id': 'F%03d' % i, 'kind': 'fruit', 'name': name, 'clue': clue, 'image': img})
    unique('nature', [c['name'] for c in out])
    for c in out:
        if c['name'].lower() in c['clue'].lower():
            errors.append(f'nature: clue "{c["name"]}" menyebut jawabannya')
    return out


decks = {'where': build_where(), 'jobs': build_jobs(), 'nature': build_nature()}
for k, v in decks.items():
    if len(v) != 100:
        errors.append(f'{k}: {len(v)} kartu (harus 100)')
if len([c for c in decks['nature'] if c['kind'] == 'animal']) != 60:
    errors.append('nature: hewan harus 60')

if errors:
    print('GAGAL:')
    print('\n'.join('  - ' + e for e in errors))
    sys.exit(1)

os.makedirs(os.path.join(ROOT, 'data', 'cards'), exist_ok=True)
for k, v in decks.items():
    with open(os.path.join(ROOT, 'data', 'cards', k + '.json'), 'w', encoding='utf8') as f:
        json.dump(v, f, ensure_ascii=False, indent=1)
    print(f'{k}: {len(v)} kartu -> data/cards/{k}.json')
