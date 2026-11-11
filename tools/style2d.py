"""Ubah gambar karakter (avatar, maskot, hewan) ke gaya ilustrasi 2D:
garis luar ungu tua yang lebih tipis, warna lebih cerah, bayangan lembut di sisi kanan-bawah
dan kilau di sisi kiri-atas (seperti ilustrasi kartu referensi). Semua tetap FACELESS.

Jalankan dari akar proyek:  python3 tools/style2d.py
Aman dijalankan berulang (file yang sudah diubah dilewati)."""
import glob
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MARK = 'data-style="2d"'
OUTLINE = '#2b1f5c'

# Warna lama -> warna cerah baru
PALETTE = {
    '#1c1b33': OUTLINE,
    '#38cf8a': '#2fd07d', '#52c4ff': '#22b0f2', '#ff9345': '#ff8a2a', '#ffd23f': '#ffc928',
    '#8f6bff': '#7a3df0', '#ff5c93': '#ff4f7b', '#ffd9b3': '#ffd2ac',
}


def filt(scale):
    d = 5 * scale
    return (
        '<filter id="s2d" x="-5%" y="-5%" width="110%" height="110%">'
        # bayangan: bagian bentuk yang tidak tertutup salinannya yang digeser ke kiri-atas
        f'<feOffset in="SourceAlpha" dx="{-d:.1f}" dy="{-d * .7:.1f}" result="a"/>'
        '<feComposite in="SourceAlpha" in2="a" operator="out" result="edgeS"/>'
        f'<feFlood flood-color="{OUTLINE}" flood-opacity=".2"/>'
        '<feComposite in2="edgeS" operator="in" result="shadow"/>'
        # kilau: kebalikannya, di kiri-atas
        f'<feOffset in="SourceAlpha" dx="{d * .6:.1f}" dy="{d * .5:.1f}" result="b"/>'
        '<feComposite in="SourceAlpha" in2="b" operator="out" result="edgeH"/>'
        '<feFlood flood-color="#ffffff" flood-opacity=".3"/>'
        '<feComposite in2="edgeH" operator="in" result="hi"/>'
        '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shadow"/><feMergeNode in="hi"/></feMerge>'
        '</filter>'
    )


def convert(path):
    src = open(path, encoding='utf8').read()
    if MARK in src:
        return False
    for old, new in PALETTE.items():
        src = re.sub(re.escape(old), new, src, flags=re.I)
    m = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', src)
    scale = float(m.group(1)) / 200 if m else 1
    # garis luar sedikit lebih tipis (gaya 2D bersih)
    src = re.sub(r'stroke-width="([\d.]+)"',
                 lambda k: 'stroke-width="%g"' % round(float(k.group(1)) * .85, 1), src)
    open_end = src.index('>', src.index('<svg')) + 1
    close = src.rindex('</svg>')
    body = src[open_end:close]
    head = src[:open_end].replace('<svg ', '<svg ' + MARK + ' ', 1)
    src = head + '<defs>' + filt(scale) + '</defs><g filter="url(#s2d)">' + body + '</g></svg>\n'
    open(path, 'w', encoding='utf8').write(src)
    return True


files = (glob.glob(os.path.join(ROOT, 'assets/avatar/*.svg'))
         + glob.glob(os.path.join(ROOT, 'assets/images/animals/*.svg'))
         + [os.path.join(ROOT, 'assets/images/mascot.svg')])
n = sum(convert(f) for f in files)
print('diubah:', n, 'dari', len(files), 'file')
