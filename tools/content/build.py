"""Bangun & validasi data/gameXX.json dari file konten gXX.py.
Pakai: python3 build.py 1   (atau beberapa nomor game)
Setiap gXX.py mendefinisikan T1, T2, T3 (daftar entri berurutan dari mudah ke sulit)."""
import json, os, random, re, sys, importlib.util, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
COUNT = {1: 30, 2: 30, 3: 40}
TYPE = {1: 'match_image', 2: 'spell_letters', 3: 'guess_image', 4: 'fill_blank', 5: 'pop_balloon',
        6: 'memory_card', 7: 'listen_choose', 8: 'arrange_words', 9: 'runner', 10: 'speak_repeat'}

# Rentang emoji berwajah / makhluk hidup berwajah (aturan wajib: faceless).
DENY = [(0x1F400, 0x1F43F), (0x1F440, 0x1F450), (0x1F464, 0x1F487), (0x1F4A9, 0x1F4A9),
        (0x1F31A, 0x1F31E), (0x1F383, 0x1F385), (0x1F3C2, 0x1F3C4), (0x1F3C7, 0x1F3C7), (0x1F3CA, 0x1F3CC), (0x1F54A, 0x1F54A),
        (0x1F574, 0x1F57A), (0x1F577, 0x1F577), (0x1F600, 0x1F64F), (0x1F6A3, 0x1F6A3),
        (0x1F6B4, 0x1F6B6), (0x1F6C0, 0x1F6C0), (0x1F6CC, 0x1F6CC), (0x1F910, 0x1F93F),
        (0x1F970, 0x1F97A), (0x1F980, 0x1F9AE), (0x1F9B0, 0x1F9B9), (0x1F9CD, 0x1F9DF),
        (0x1F9F8, 0x1F9F8), (0x1FAB0, 0x1FABD), (0x1FAC0, 0x1FAC5), (0x2603, 0x2603), (0x26C4, 0x26C4),
        (0x1F32C, 0x1F32C), (0x1F47B, 0x1F47F), (0x1F916, 0x1F916), (0x263A, 0x263A), (0x2639, 0x2639),
        (0x1F3AD, 0x1F3AD), (0x1F5FD, 0x1F5FD),  # topeng teater, patung (berwajah)
        (0x1FA7B, 0x1FA7B), (0x1F3A3, 0x1F3A3),  # rontgen (tengkorak), pancing (ikan berwajah)
        (0x1F0CF, 0x1F0CF)]  # kartu joker (badut)


def bad_emoji(s):
    for ch in s or '':
        cp = ord(ch)
        for a, b in DENY:
            if a <= cp <= b:
                return ch
    return None


def shuffled(seed, items):
    r = random.Random(seed)
    items = list(items)
    r.shuffle(items)
    return items


def load(game):
    path = os.path.join(HERE, 'g%02d.py' % game)
    spec = importlib.util.spec_from_file_location('g%02d' % game, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def make(game, tier, idx, e):
    """Ubah entri ringkas menjadi objek soal (DESIGN.md bagian 11)."""
    qid = 'G%d-T%d-%04d' % (game, tier, idx + 1)
    q = {'id': qid, 'game': game, 'tier': tier, 'stage': idx // 10 + 1, 'type': TYPE[game],
         'prompt': '', 'options': [], 'answer': '', 'image': '', 'audio': ''}
    if game in (1, 6):           # (gambar, jawaban, [pengecoh])
        img, ans, d = e
        q.update(image=img, answer=ans, options=shuffled(qid, [ans] + d), audio=ans)
    elif game == 2:              # (gambar, kata, 'huruf pengecoh')
        img, ans, extra = e
        q.update(image=img, answer=ans, options=list(extra), audio=ans)
    elif game == 3:              # (gambar, petunjuk, jawaban, [pengecoh])
        img, clue, ans, d = e
        q.update(image=img, prompt=clue, answer=ans, options=shuffled(qid, [ans] + d), audio=ans)
    elif game == 4:              # (gambar, 'kalimat ___', jawaban, [pengecoh])
        img, prompt, ans, d = e
        q.update(image=img, prompt=prompt, answer=ans, options=shuffled(qid, [ans] + d),
                 audio=prompt.replace('___', ans))
    elif game == 5:              # (kata Inggris, arti, [pengecoh])
        en, ans, d = e
        q.update(prompt=en, answer=ans, options=shuffled(qid, [ans] + d), audio=en)
    elif game == 7:              # (yang diucapkan, [pengecoh])  jawaban = yang diucapkan
        audio, d = e
        q.update(audio=audio, answer=audio, options=shuffled(qid, [audio] + d))
    elif game == 8:              # (gambar, kalimat)
        img, sentence = e
        q.update(image=img, answer=sentence, audio=sentence)
    elif game == 9:              # (gambar, pertanyaan, jawaban, [pengecoh])
        img, prompt, ans, d = e
        q.update(image=img, prompt=prompt, answer=ans, options=shuffled(qid, [ans] + d),
                 audio=prompt.replace('___', '…'))  # diucapkan saat soal muncul: jangan bocorkan jawaban
    elif game == 10:             # (gambar, teks, [mirip])
        img, text, d = e
        q.update(image=img, prompt=text, answer=text, audio=text, options=shuffled(qid, [text] + d))
    return q


MIN_OPTS = {1: 3, 2: 3, 3: 4}


def validate(game, tier, qs):
    errs = []
    if len(qs) != COUNT[tier]:
        errs.append('T%d: %d soal (harus %d)' % (tier, len(qs), COUNT[tier]))
    seen = set()
    for q in qs:
        tag = q['id']
        key = (q['prompt'], q['answer'], q['image'], q['audio'])
        if key in seen:
            errs.append('%s duplikat' % tag)
        seen.add(key)
        b = bad_emoji(q['image']) or bad_emoji(q['prompt'])
        if b:
            errs.append('%s emoji berwajah/makhluk: %s U+%04X' % (tag, b, ord(b)))
        if q['image'].endswith('.svg') and not os.path.exists(os.path.join(ROOT, 'assets/images', q['image'])):
            errs.append('%s gambar tidak ada: %s' % (tag, q['image']))
        if game not in (2, 8):
            if q['answer'] not in q['options']:
                errs.append('%s jawaban tidak ada di pilihan' % tag)
            if len(set(q['options'])) != len(q['options']):
                errs.append('%s pilihan ganda: %s' % (tag, q['options']))
            if len(q['options']) < MIN_OPTS[tier] and game != 10:
                errs.append('%s pilihan kurang (%d)' % (tag, len(q['options'])))
            if game == 10 and len(q['options']) < 3:
                errs.append('%s mode alternatif butuh 3 pilihan' % tag)
        if game == 2:
            if not re.fullmatch(r'[a-z]+', q['answer']):
                errs.append('%s kata ejaan harus huruf kecil a-z: %s' % (tag, q['answer']))
        if game == 4 and q['prompt'].count('___') != 1:
            errs.append('%s kalimat rumpang harus punya tepat satu ___' % tag)
        if game == 8 and len(q['answer'].split()) < 2:
            errs.append('%s kalimat terlalu pendek' % tag)
        if game in (1, 6) and not q['image']:
            errs.append('%s butuh gambar' % tag)
        for o in q['options']:
            if bad_emoji(o):
                errs.append('%s emoji di pilihan' % tag)
    return errs


def build(game):
    mod = load(game)
    out, errs = [], []
    for tier in (1, 2, 3):
        entries = getattr(mod, 'T%d' % tier, [])
        qs = [make(game, tier, i, e) for i, e in enumerate(entries)]
        errs += validate(game, tier, qs)
        out += qs
    if errs:
        print('GAME %d: %d MASALAH' % (game, len(errs)))
        for e in errs:
            print('  -', e)
        return False
    with open(os.path.join(ROOT, 'data', 'game%02d.json' % game), 'w') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')
    per = {t: sum(1 for q in out if q['tier'] == t) for t in (1, 2, 3)}
    print('GAME %d OK: %d soal (T1 %d, T2 %d, T3 %d) -> data/game%02d.json' % (game, len(out), per[1], per[2], per[3], game))
    return True


if __name__ == '__main__':
    ok = all([build(int(a)) for a in sys.argv[1:]])
    sys.exit(0 if ok else 1)
