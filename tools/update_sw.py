"""Perbarui daftar file offline di sw.js dan naikkan versinya.
Jalankan setiap kali ada file yang ditambah/diubah sebelum mengunggah:  python3 tools/update_sw.py"""
import os, re, time
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
INCLUDE_DIRS = ['css', 'js', 'data', 'assets']
EXT = ('.html', '.css', '.js', '.json', '.svg', '.png', '.webp', '.webmanifest')
files = ['./', 'index.html', 'manifest.webmanifest']
for d in INCLUDE_DIRS:
    for base, _, names in os.walk(os.path.join(ROOT, d)):
        for n in sorted(names):
            if n.endswith(EXT):
                files.append(os.path.relpath(os.path.join(base, n), ROOT).replace(os.sep, '/'))
files = sorted(set(files), key=lambda f: (f != './', f))
path = os.path.join(ROOT, 'sw.js')
src = open(path).read()
version = 'wk-' + time.strftime('%Y%m%d-%H%M%S')
src = re.sub(r"var VERSION = '[^']*';", "var VERSION = '%s';" % version, src)
listing = ',\n'.join("  '%s'" % f for f in files)
src = re.sub(r"var PRECACHE = \[[\s\S]*?\];", 'var PRECACHE = [\n%s\n];' % listing, src)
open(path, 'w').write(src)
print('sw.js:', version, len(files), 'file')
