"""Buah yang tidak ada di set emoji, digambar dengan gaya Fluent Flat (datar, tanpa garis luar, viewBox 32).
Jalankan: python3 tools/cards/fruits.py assets/cards/fruits"""
import os
import sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)


def svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="none">{body}</g></svg>\n'


LEAF = '#00a6ed'
G1, G2 = '#44911b', '#86d72f'
STEM = '#6d4534'

F = {}

# pepaya: lonjong oranye, potongan dengan biji hitam
F['papaya'] = (
    f'<path fill="{G2}" d="M8 6c4-3 13-3 17 2c4 6 2 17-6 20c-7 3-14-3-14-10c0-5 1-9 3-12z"/>'
    f'<path fill="#ff8a2a" d="M10 9c3-2 10-2 13 2c3 5 1 13-5 15c-5 2-11-2-11-8c0-4 1-7 3-9z"/>'
    f'<path fill="#ffb02e" d="M16 11c3 0 5 3 5 6s-2 6-5 6s-4-3-4-6s1-6 4-6z"/>'
    '<g fill="#3a2a2a"><circle cx="15" cy="14" r="1"/><circle cx="17.5" cy="15" r="1"/><circle cx="15" cy="17.5" r="1"/>'
    '<circle cx="17.5" cy="18.5" r="1"/><circle cx="15.5" cy="20.5" r="1"/><circle cx="18" cy="21.5" r=".9"/></g>'
    f'<path fill="{STEM}" d="M15 3h2v4h-2z"/>')

# durian: hijau kekuningan berduri
spikes = ''.join(f'<path fill="#7cb518" d="M{x} {y}l1.6 -2.8l1.6 2.8z"/>' for x, y in
                 [(8, 12), (12, 9), (16.5, 8.5), (21, 10), (7, 17), (11.5, 14), (16, 13.5), (20.5, 14.5), (24, 17),
                  (9.5, 20), (14, 19), (18.5, 19), (22.5, 21), (12, 24), (17, 24)])
F['durian'] = (
    '<ellipse cx="16" cy="18" rx="11" ry="10.5" fill="#a3c93a"/>'
    '<path fill="#8ab52d" d="M27 18c0 6-5 10.5-11 10.5c4-3 6-6 6-10.5s-2-8-6-10.5c6 0 11 4.5 11 10.5z"/>'
    + spikes +
    f'<path fill="{STEM}" d="M15 3.5h2.2v5h-2.2z"/>')

# rambutan: merah berambut, satu dibuka putih
hair = ''.join(f'<path stroke="#ff6d6d" stroke-width="1.3" stroke-linecap="round" d="M{cx} {cy}l{dx} {dy}"/>'
               for cx, cy, dx, dy in [(10, 9, -1, -2.5), (14, 7.5, 0, -2.5), (18, 8, 1, -2.4), (21.5, 10.5, 2.2, -1.5),
                                       (23, 15, 2.6, 0), (22, 19.5, 2.2, 1.6), (7, 13, -2.4, -1), (6.5, 17.5, -2.6, .5)])
F['rambutan'] = (
    hair + '<circle cx="15" cy="15" r="8.5" fill="#f8312f"/>'
    '<path fill="#ca0b4a" d="M23.5 15a8.5 8.5 0 0 1-15.4 5c5 2 12-1 12.5-8.5a8.5 8.5 0 0 1 2.9 3.5z"/>'
    '<path fill="#5c913b" d="M13 10l2 2l2-2l-2-1.5z"/>'
    '<circle cx="23" cy="24" r="5.5" fill="#f8312f"/>'
    '<ellipse cx="23" cy="24" rx="4" ry="3.6" fill="#fff8e6"/>'
    '<ellipse cx="22" cy="23" rx="1.4" ry="1" fill="#ffffff"/>')

# manggis: ungu tua dengan kelopak hijau, isi putih
F['mangosteen'] = (
    '<circle cx="16" cy="18" r="10" fill="#6b2d6b"/>'
    '<path fill="#4a1d4a" d="M26 18a10 10 0 0 1-17.6 6.5c6 1.5 14-1 15-11a10 10 0 0 1 2.6 4.5z"/>'
    '<path fill="#5c913b" d="M16 9.5c-2 0-4.5-.5-5.5-2c2-.5 3.5 0 4.5 1c0-1.2.5-2.5 1-3.5c.5 1 1 2.3 1 3.5c1-1 2.5-1.5 4.5-1c-1 1.5-3.5 2-5.5 2z"/>'
    '<ellipse cx="16" cy="19" rx="5.5" ry="5" fill="#fff8e6"/>'
    '<path stroke="#e8dcc0" stroke-width=".8" d="M16 14v10M11 19h10M12.3 15.5l7.4 7M19.7 15.5l-7.4 7"/>')

# salak: coklat bersisik berbentuk tetes
scales = ''.join(f'<path fill="#5a3426" d="M{x} {y}q1.2 -1.6 2.4 0z"/>' for x, y in
                 [(12, 12), (16, 11), (10, 16), (14, 15), (18, 15), (21, 18), (9, 20), (13, 19.5), (17, 19.5),
                  (11.5, 24), (15.5, 24), (19.5, 23)])
F['snake fruit'] = (
    '<path fill="#8b5a3c" d="M16 5c5 3 10 9 10 15a10 9 0 0 1-20 0c0-6 5-12 10-15z"/>'
    '<path fill="#73452f" d="M26 20a10 9 0 0 1-10 9c5-2 7.5-5 7.5-9c0-5-3.5-10-7.5-15c5 3 10 9 10 15z"/>'
    + scales)

# nangka: lonjong hijau berbintik
dots = ''.join(f'<circle cx="{x}" cy="{y}" r=".8" fill="#7a9a16"/>' for x, y in
               [(10, 10), (14, 9), (18, 9.5), (21, 12), (9, 14), (13, 13.5), (17, 13.5), (21, 16), (10, 18),
                (14, 18), (18, 18), (22, 20), (11, 22), (15, 22.5), (19, 22.5), (14, 26), (18, 26)])
F['jackfruit'] = (
    '<path fill="#b5cf3b" d="M9 8c4-4 12-4 15 1c3 5 3 13-1 17c-4 4-11 3-14-1c-3-5-4-12 0-17z"/>'
    '<path fill="#9fbd28" d="M24 9c3 5 3 13-1 17c-2 2-5 3-8 3c4-2 7-6 7-12c0-4-1-7-3-10c2 0 4 0 5 2z"/>'
    + dots + f'<path fill="{STEM}" d="M15 2.5h2v4h-2z"/>')

# jambu biji: hijau muda, potongan pink
F['guava'] = (
    f'<path fill="{G2}" d="M16 6c6 0 10 5 10 11s-4 11-10 11S6 23 6 17S10 6 16 6z"/>'
    '<path fill="#ff8fab" d="M16 10c4 0 7 3 7 7s-3 7-7 7s-7-3-7-7s3-7 7-7z"/>'
    '<path fill="#ffc2d1" d="M16 13c2.2 0 4 1.8 4 4s-1.8 4-4 4s-4-1.8-4-4s1.8-4 4-4z"/>'
    '<g fill="#fff3c4"><circle cx="15" cy="16" r=".6"/><circle cx="17" cy="16" r=".6"/><circle cx="16" cy="18" r=".6"/>'
    '<circle cx="14.5" cy="18.5" r=".6"/><circle cx="17.5" cy="18.5" r=".6"/></g>'
    f'<path fill="{STEM}" d="M15 2.5h2v4h-2z"/><path fill="{G1}" d="M17 4.5c2-2 5-2 7-.5c-2 2-5 2-7 .5z"/>')

# buah naga: pink dengan sirip hijau, isi putih bintik hitam
F['dragon fruit'] = (
    '<path fill="#ff2e88" d="M16 4c6 2 10 8 10 14a10 10 0 0 1-20 0c0-6 4-12 10-14z"/>'
    '<path fill="#86d72f" d="M6.5 14l-3-2l4 .5zM25.5 14l3-2l-4 .5zM8 21l-3.5 0l3.8-1.6zM24 21l3.5 0l-3.8-1.6zM16 4l-1.5-3l3 0zM11 8l-2.5-2l3 .3zM21 8l2.5-2l-3 .3z"/>'
    '<ellipse cx="16" cy="19" rx="6" ry="7" fill="#ffffff"/>'
    '<g fill="#2b1f2b"><circle cx="14" cy="16" r=".55"/><circle cx="17.5" cy="15.5" r=".55"/><circle cx="16" cy="18.5" r=".55"/>'
    '<circle cx="13" cy="20" r=".55"/><circle cx="18.5" cy="20" r=".55"/><circle cx="15" cy="22.5" r=".55"/><circle cx="17.5" cy="23" r=".55"/></g>')

# belimbing: bintang kuning
F['starfruit'] = (
    '<path fill="#ffd23f" d="M16 3l3.6 8.2l8.9.8l-6.7 5.9l2 8.7L16 22l-7.8 4.6l2-8.7L3.5 12l8.9-.8z"/>'
    '<path fill="#f4b400" d="M16 3l3.6 8.2l8.9.8l-6.7 5.9l2 8.7L16 22z"/>'
    '<path fill="#fff1a8" d="M16 9l1.6 3.8l4 .4l-3 2.6l.9 3.9L16 17.6l-3.5 2.1l.9-3.9l-3-2.6l4-.4z"/>')

# leci: merah bertekstur, satu dibuka
F['lychee'] = (
    '<circle cx="12" cy="13" r="8" fill="#e53935"/>'
    '<g fill="#b71c1c"><circle cx="9" cy="10" r="1"/><circle cx="13" cy="9" r="1"/><circle cx="16" cy="12" r="1"/>'
    '<circle cx="8" cy="14" r="1"/><circle cx="12" cy="14" r="1"/><circle cx="15" cy="16" r="1"/><circle cx="10" cy="18" r="1"/></g>'
    f'<path fill="{STEM}" d="M11.5 3h1.6v3h-1.6z"/>'
    '<circle cx="22" cy="22" r="7" fill="#e53935"/>'
    '<ellipse cx="22" cy="22" rx="5.4" ry="5.2" fill="#fbf7ef"/>'
    '<ellipse cx="20.5" cy="20.5" rx="1.8" ry="1.2" fill="#ffffff"/>')

# delima: merah dengan mahkota, potongan biji
F['pomegranate'] = (
    '<circle cx="16" cy="18" r="10" fill="#d81b60"/>'
    '<path fill="#ad1457" d="M26 18a10 10 0 0 1-18 6c7 1 15-3 14-12a10 10 0 0 1 4 6z"/>'
    '<path fill="#d81b60" d="M12.5 9l1-4l1.5 2l1-2.5l1 2.5l1.5-2l1 4z"/>'
    '<ellipse cx="15" cy="18" rx="6" ry="5.5" fill="#fff0f3"/>'
    '<g fill="#e53950"><circle cx="12.5" cy="16.5" r="1.1"/><circle cx="15" cy="15.5" r="1.1"/><circle cx="17.5" cy="16.5" r="1.1"/>'
    '<circle cx="13" cy="19" r="1.1"/><circle cx="15.5" cy="18.5" r="1.1"/><circle cx="18" cy="19.5" r="1.1"/>'
    '<circle cx="14.5" cy="21.3" r="1.1"/><circle cx="17" cy="21.5" r="1.1"/></g>')

# plum: ungu bulat dengan daun
F['plum'] = (
    '<path fill="#7b3fe4" d="M16 8c6-1 11 3 11 10c0 6-5 10-11 10S5 24 5 18c0-6 5-10 11-10z"/>'
    '<path fill="#5b2bb5" d="M27 18c0 6-5 10-11 10c5-2 8-6 8-11c0-4-2-7-5-9c4 1 8 4 8 10z"/>'
    '<path stroke="#5b2bb5" stroke-width="1" d="M15 9c1 5 1 12 0 18"/>'
    f'<path fill="{STEM}" d="M15 4h1.8v5H15z"/><path fill="{G1}" d="M17 6c2-3 6-3 8-1c-2 3-6 3-8 1z"/>'
    '<ellipse cx="10" cy="14" rx="1.6" ry="2.6" fill="#a37cf5"/>')

# ara: ungu tetes dengan potongan merah
F['fig'] = (
    '<path fill="#8e4a8e" d="M16 5c2 0 3 2 4 4c4 3 6 7 6 11a10 9 0 0 1-20 0c0-4 2-8 6-11c1-2 2-4 4-4z"/>'
    '<path fill="#6f346f" d="M26 20a10 9 0 0 1-10 9c5-2 7-5 7-9s-2-8-5-11c4 3 8 7 8 11z"/>'
    f'<path fill="{G1}" d="M14.5 3h3l-.5 3h-2z"/>'
    '<ellipse cx="15" cy="20" rx="5" ry="5" fill="#ffd6a5"/><ellipse cx="15" cy="20" rx="3.6" ry="3.6" fill="#e05570"/>'
    '<g fill="#ffd6a5"><circle cx="14" cy="19" r=".5"/><circle cx="16" cy="19.5" r=".5"/><circle cx="15" cy="21.3" r=".5"/></g>')

# raspberi & blackberry: kumpulan butir
def berry(name, c1, c2):
    pts = [(13, 11), (17, 11), (11, 15), (15, 15), (19, 15), (13, 19), (17, 19), (21, 19), (11, 19), (15, 23), (19, 23), (13, 26.5),
           (17, 26.5)]
    beads = ''.join(f'<circle cx="{x}" cy="{y}" r="2.4" fill="{c1}"/><circle cx="{x - .7}" cy="{y - .7}" r=".8" fill="{c2}"/>'
                    for x, y in pts)
    F[name] = (f'<path fill="{G1}" d="M16 9c-3 0-6-1-7-3c3-.5 5 .5 6 1.5c0-1.5 .5-3 1-4c.5 1 1 2.5 1 4c1-1 3-2 6-1.5c-1 2-4 3-7 3z"/>' + beads)


berry('raspberry', '#ef3b5d', '#ff8fa3')
berry('blackberry', '#3d2352', '#7a5a96')

# markisa: ungu dibelah, isi kuning biji hitam
F['passion fruit'] = (
    '<circle cx="11" cy="13" r="8" fill="#5e2a6e"/>'
    '<g fill="#7d4a8d"><circle cx="8" cy="10" r=".8"/><circle cx="13" cy="9" r=".8"/><circle cx="9" cy="15" r=".8"/><circle cx="14" cy="15" r=".8"/></g>'
    '<circle cx="21" cy="21" r="8" fill="#5e2a6e"/><circle cx="21" cy="21" r="6.6" fill="#fff4d6"/>'
    '<circle cx="21" cy="21" r="5.4" fill="#ffc107"/>'
    '<g fill="#2b1f2b"><circle cx="19" cy="19" r=".7"/><circle cx="22.5" cy="18.5" r=".7"/><circle cx="21" cy="21.5" r=".7"/>'
    '<circle cx="18.5" cy="23" r=".7"/><circle cx="23.5" cy="22.5" r=".7"/><circle cx="21" cy="24.5" r=".7"/></g>')

# jeruk bali/grapefruit: potongan merah muda
F['grapefruit'] = (
    '<circle cx="12" cy="13" r="8.5" fill="#ffa94d"/>'
    '<path fill="#f08c2e" d="M20.5 13a8.5 8.5 0 0 1-15 5.5c5 1 11-1.5 12-9a8.5 8.5 0 0 1 3 3.5z"/>'
    '<circle cx="21" cy="21" r="8" fill="#ffd8a8"/><circle cx="21" cy="21" r="6.6" fill="#ff6b6b"/>'
    '<path stroke="#ffd8a8" stroke-width="1" d="M21 14.5v13M14.5 21h13M16.4 16.4l9.2 9.2M25.6 16.4l-9.2 9.2"/>'
    '<circle cx="21" cy="21" r="1.2" fill="#ffd8a8"/>')

# kesemek: oranye pipih dengan kelopak hijau
F['persimmon'] = (
    '<path fill="#ff7a1a" d="M16 9c7 0 11 4 11 9.5S22 28 16 28S5 24 5 18.5S9 9 16 9z"/>'
    '<path fill="#e8630a" d="M27 18.5C27 24 22 28 16 28c5-2 8-5 8-10c0-3-1-6-4-8c4 1 7 4 7 8.5z"/>'
    '<path fill="#5c913b" d="M16 11c-3 0-6 0-7.5-1.5c2-1 4-1 5.5 0c-.5-1.5 0-3 .5-4c1 .8 1.5 2 1.5 3.3c0-1.3.5-2.5 1.5-3.3c.5 1 1 2.5.5 4c1.5-1 3.5-1 5.5 0C22 11 19 11 16 11z"/>'
    f'<path fill="{STEM}" d="M15.2 3.5h1.6v3h-1.6z"/>'
    '<ellipse cx="10.5" cy="16" rx="1.6" ry="2.6" fill="#ffb06b"/>')

# aprikot: oranye muda dengan alur, daun
F['apricot'] = (
    '<circle cx="16" cy="18" r="10" fill="#ffb347"/>'
    '<path fill="#f59a23" d="M26 18a10 10 0 0 1-17.5 6.5c7 1 14-3 13.5-12a10 10 0 0 1 4 5.5z"/>'
    '<path stroke="#f08a12" stroke-width="1" fill="none" d="M15 9c-2 5-2 13 1 18"/>'
    f'<path fill="{STEM}" d="M15 4h1.8v5H15z"/><path fill="{G1}" d="M17 6.5c2-3 6-3 8-1c-2 3-6 3-8 1z"/>'
    '<ellipse cx="10.5" cy="15" rx="1.6" ry="2.6" fill="#ffd59a"/>')

for name, body in F.items():
    open(os.path.join(OUT, name.replace(' ', '-') + '.svg'), 'w').write(svg(body))
print(len(F), 'buah')
