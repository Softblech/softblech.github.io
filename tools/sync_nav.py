#!/usr/bin/env python3
"""Kopiert die Navigation (<header class="top"> aus index.html) auf alle Unterseiten.

Nach jeder Aenderung an der Navigation oder am Laufband in index.html ausfuehren:
    python3 tools/sync_nav.py
make_release.py ruft das automatisch auf.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SUB = [p for p in sorted(ROOT.glob('*/index.html')) if p.parent.name not in ('tools', 'danke', 'fast-geschafft')]
LEGAL = [ROOT / n for n in ('impressum.html', 'datenschutz.html', 'widerruf.html')]

src = (ROOT / 'index.html').read_text(encoding='utf-8')
header = re.search(r'<header class="top">.*?</header>', src, re.S).group(0)
footer = re.search(r'<footer class="site-foot">.*?</footer>', src, re.S).group(0)
D = dict(re.findall(r'"((?:[^"\\]|\\.)*)":"((?:[^"\\]|\\.)*)"', (ROOT / 'lang.js').read_text(encoding='utf-8')))


def build(prefix, i18n):
    h = header
    h = h.replace('href="#start"', f'href="{prefix or "./"}"')
    h = re.sub(r'href="#([a-z-]+)"', lambda m: f'href="{prefix}#{m.group(1)}"' if prefix else f'href="./#{m.group(1)}"', h)
    h = h.replace('src="img/', f'src="{prefix}img/')
    if not i18n:
        h = re.sub(r'\s*<div class="lang".*?</div>', '', h, flags=re.S)

    def tr(m):
        t = m.group(2)
        if i18n and t.strip() in D:
            t = f'<span data-l="de">{t}</span><span data-l="en">{D[t.strip()]}</span>'
        return m.group(1) + t + m.group(3)
    # Texte in Menue-Links, Burger-Label und Laufband
    h = re.sub(r'(<a [^>]*>)([^<]+)(</a>)', tr, h)
    h = re.sub(r'(<b>)([^<]+)(</b>)', tr, h)
    h = re.sub(r'(<span>)([^<]+)(</span>)', tr, h)
    return '<!-- NAV: automatisch aus index.html (tools/sync_nav.py), hier nicht von Hand aendern -->\n' + h


def build_foot(prefix, i18n, cookies=False):
    f = footer
    # Cookie-Einstellungen nur auf Seiten mit Cookie-Banner (Startseite + Song-Seiten mit release.js)
    if not cookies:
        f = re.sub(r'\s*<button [^>]*data-open-cookies[^>]*>.*?</button>', '', f, flags=re.S)
    elif i18n:
        f = f.replace('>Cookie-Einstellungen</button>', '><span data-l="de">Cookie-Einstellungen</span><span data-l="en">Cookie settings</span></button>')
    f = re.sub(r'href="(impressum|datenschutz|widerruf)\.html"', lambda m: f'href="{prefix}{m.group(1)}.html"', f)
    if i18n:
        tr = lambda m: m.group(1) + (f'<span data-l="de">{m.group(2)}</span><span data-l="en">{D[m.group(2).strip()]}</span>' if m.group(2).strip() in D else m.group(2)) + m.group(3)
        f = re.sub(r'(<a [^>]*>)([^<]+)(</a>)', tr, f)
    return '<!-- FOOTER: automatisch aus index.html (tools/sync_nav.py), hier nicht von Hand aendern -->\n' + f


def patch(path, prefix, i18n):
    t = path.read_text(encoding='utf-8')
    new = build(prefix, i18n)
    t = re.sub(r'(<!-- NAV:[^\n]*-->\n)?<header\b.*?</header>', lambda m: new, t, count=1, flags=re.S)
    foot = build_foot(prefix, i18n, 'release.js' in t)
    if re.search(r'<footer\b', t):
        t = re.sub(r'(<!-- FOOTER:[^\n]*-->\n)?<footer\b.*?</footer>', lambda m: foot, t, count=1, flags=re.S)
    else:
        t = t.replace('</main>', '</main>\n' + foot, 1)
    t = re.sub(r'nav\.css\?v=\d+', 'nav.css?v=3', t)
    if 'nav.css' not in t:
        t = t.replace('</head>', f'<link rel="stylesheet" href="{prefix}nav.css?v=2">\n</head>', 1)
    if 'nav.js' not in t:
        t = t.replace('</body>', f'<script src="{prefix}nav.js?v=1"></script>\n</body>', 1)
    t = re.sub(r'<body(?![^>]*has-nav)([^>]*)>', lambda m: '<body' + (m.group(1).replace('class="', 'class="has-nav ') if 'class="' in m.group(1) else m.group(1) + ' class="has-nav"') + '>', t, count=1)
    path.write_text(t, encoding='utf-8')
    print('ok', path.relative_to(ROOT))


for p in SUB:
    patch(p, '../', True)
for p in LEGAL:
    patch(p, '', False)
