"""Bangun data dek kartu (Card Game) ke data/cards/*.json dan validasi.
Jalankan dari akar proyek:  python3 tools/cards/build.py

Validasi: 100 kartu per dek, nama unik, gambar ada, emoji tanpa wajah (aturan faceless),
gambar hewan wajib versi faceless (data-faceless), clue 3 ada & tidak menyebut jawaban,
kartu "Where is" memakai kata posisi yang dikenal dan tidak ada adegan ganda."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'content'))

from where import WHERE, PREPS, ADJUST  # noqa: E402
from jobs import JOBS, OUTFIT, CLUE3 as JOB_CLUE3  # noqa: E402
from nature import ANIMALS, FRUITS, CLUE3 as NAT_CLUE3  # noqa: E402
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
    for i, row in enumerate(WHERE, 1):
        name, emo, prep, place, pemo, plural = row[:6]
        two = row[6] if len(row) > 6 else None
        check_emoji('where', name, emo)
        check_emoji('where', name + ' (tempat)', pemo)
        if prep not in PREPS:
            errors.append(f'where: kata posisi "{prep}" tidak dikenal')
        if (prep == 'between') != bool(two):
            errors.append(f'where: {name} {prep} harus punya 2 tempat hanya untuk "between"')
        loc = f'{prep} the {place}' + (f' and the {two[0]}' if two else '')
        be = 'are' if plural else 'is'
        c = {
            'id': 'W%03d' % i, 'name': name, 'image': emo, 'prep': prep, 'meaning': PREPS.get(prep, ''),
            'place': pemo, 'placeName': place, 'location': loc,
            'ask': f'Where {be} the {name}?',
            'answer': f'{"They are" if plural else "It is"} {loc}.',
            'sentence': f'The {name} {be} {loc}.',
        }
        adj = ADJUST.get((name, prep, place))
        if adj:
            c['adjust'] = list(adj)
        if two:
            check_emoji('where', two[0] + ' (tempat)', two[1])
            c['place2'] = two[1]
            c['place2Name'] = two[0]
        out.append(c)
    unique('where', [c['sentence'] for c in out])
    return out


def clue3(deck, c, table):
    t = table.get(c['name'])
    if not t:
        errors.append(f'{deck}: {c["name"]} belum punya clue 3')
        return
    words = t.lower().replace('.', ' ').replace(',', ' ').replace('!', ' ').replace('"', ' ').split()
    for w in c['name'].lower().split():
        if w in words:
            errors.append(f'{deck}: clue 3 "{c["name"]}" menyebut jawabannya')
    c['clue3'] = t


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
        c = {'id': 'J%03d' % i, 'name': name, 'clue': clue, 'tool': tool, 'figure': fig}
        clue3('jobs', c, JOB_CLUE3)
        out.append(c)
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
        clue3('nature', c, NAT_CLUE3)
        if c['name'].lower() in (c['clue'] + ' ' + c.get('clue3', '')).lower():
            errors.append(f'nature: clue "{c["name"]}" menyebut jawabannya')
    return out


decks = {'where': build_where(), 'jobs': build_jobs(), 'nature': build_nature()}
for k, v in decks.items():
    if len(v) != 100:
        errors.append(f'{k}: {len(v)} kartu (harus 100)')
for k, tbl in (('jobs', JOB_CLUE3), ('nature', NAT_CLUE3)):
    extra = set(tbl) - {c['name'] for c in decks[k]}
    if extra:
        errors.append(f'{k}: clue 3 tanpa kartu: {sorted(extra)}')
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
