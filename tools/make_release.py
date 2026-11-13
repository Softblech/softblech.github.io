#!/usr/bin/env python3
"""Baut eine Release-Landingpage aus tools/releases/<slug>.json.

Aufruf:  python3 tools/make_release.py i-want-to-be-with-you
Ergebnis: <slug>/index.html  ->  https://softblech.com/<slug>
"""
import json, sys, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
slug = sys.argv[1]
c = json.loads((ROOT / "tools/releases" / f"{slug}.json").read_text(encoding="utf-8"))
e = lambda s: html.escape(s or "", quote=True)
paras = lambda ps: "".join(f"<p>{e(p).replace(chr(10), '<br>')}</p>" for p in ps if p.strip())

def interview(items):
    return "".join(
        f'<div class="qa"><h4>{e(i["q"])}</h4><p><b>{e(i["who"])}:</b> {e(i["a"])}</p></div>' for i in items)

def lyrics(t):
    out = []
    for block in t.split("\n\n"):
        lines = block.strip().split("\n")
        if len(lines) == 1 and len(lines[0]) < 20 and not lines[0].endswith((".", ",")):
            out.append(f'<h4>{e(lines[0])}</h4>')
            continue
        if lines and lines[0] in ("Verse 1", "Verse 2", "Chorus", "Bridge", "Outro", "Intro"):
            out.append(f'<h4>{e(lines[0])}</h4>'); lines = lines[1:]
        out.append("<p>" + "<br>".join(e(l) for l in lines) + "</p>")
    return "".join(out)

links = "".join(
    f'<a class="btn {"solid" if i == 0 else "ghost"}" href="{e(u)}" target="_blank" rel="noopener">{e(n)}</a>'
    for i, (n, u) in enumerate(c["links"]))
credits = "".join(f"<dt>{e(k)}</dt><dd>{e(v)}</dd>" for k, v in c["credits"])
url = f"https://softblech.com/{slug}"
img = f"https://softblech.com/{c['cover']}"

page = f"""<!doctype html>
<html lang="de" data-lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(c['title'])} · SOFTBLECH</title>
<meta name="description" content="{e(c['teaser_de'])}">
<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="../img/favicon-32.png">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<meta name="theme-color" content="#ff2f3f">
<link rel="canonical" href="{url}">
<meta property="og:type" content="music.song">
<meta property="og:title" content="SOFTBLECH – {e(c['title'])}">
<meta property="og:description" content="{e(c['type'])} · {e(c['date_de'])}. {e(c['teaser_de'])}">
<meta property="og:image" content="{img}">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="../release.css">
</head>
<body>
<header class="top"><div class="wrap">
  <a class="logo" href="../" aria-label="Zur Startseite"><img src="../img/logo-schwarz.png" alt="SOFTBLECH" width="400" height="139"></a>
  <div class="lang" role="group" aria-label="Sprache / Language">
    <button type="button" data-lang="de" aria-pressed="true">DE</button><button type="button" data-lang="en" aria-pressed="false">EN</button>
  </div>
</div></header>

<main>
<section class="rhero"><div class="wrap">
  <img class="cover" src="../{e(c['cover'])}" alt="Cover von {e(c['title'])}" width="1200" height="1200">
  <div class="info">
    <div class="eyebrow"><span data-l="de">Neue {e(c['type'])}</span><span data-l="en">New {e(c['type'])}</span> · <span data-l="de">{e(c['date_de'])}</span><span data-l="en">{e(c['date_en'])}</span></div>
    <h1 class="cond">{e(c['title'])}</h1>
    <p class="teaser"><span data-l="de">{e(c['teaser_de'])}</span><span data-l="en">{e(c['teaser_en'])}</span></p>
    <div class="btns">{links}<button class="btn ghost" type="button" id="share"><span data-l="de">Link teilen</span><span data-l="en">Share</span></button></div>
    <div class="player" id="player" data-src="https://open.spotify.com/embed/track/{e(c['spotify_track'])}?utm_source=generator&amp;theme=0">
      <button type="button" class="btn solid" id="loadplayer">▶ <span data-l="de">Hier anhören</span><span data-l="en">Listen here</span></button>
      <small><span data-l="de">Lädt den Spotify-Player. Dabei werden Daten an Spotify übertragen.</span><span data-l="en">Loads the Spotify player, which sends data to Spotify.</span> <a href="../datenschutz.html">Datenschutz</a></small>
    </div>
  </div>
</div></section>

<section class="sec pitch"><div class="wrap narrow">
  <p class="lead" data-l="de">{e(c['pitch_de'])}</p>
  <p class="lead" data-l="en">{e(c['pitch_en'])}</p>
  <blockquote><p>„{e(c['quote_short_en'])}“</p><cite>{e(c['quote_by'])}</cite></blockquote>
</div></section>

<section class="sec on-red"><div class="wrap narrow">
  <h2 class="cond"><span data-l="de">Presse</span><span data-l="en">Press</span></h2>
  <p><span data-l="de">Pressemappe mit Pressetext, Fotos, Cover und Lyrics. Fotos sind zur redaktionellen Nutzung freigegeben, bitte Fotograf*in nennen.</span><span data-l="en">Press kit with press release, photos, cover and lyrics. Photos are free for editorial use, please credit the photographer.</span></p>
  <div class="btns">
    <a class="btn solid" href="{e(c['presskit'])}" target="_blank" rel="noopener"><span data-l="de">Pressemappe &amp; Fotos</span><span data-l="en">Press kit &amp; photos</span></a>
    <a class="btn ghost" href="../{e(c['cover'])}" download><span data-l="de">Cover laden</span><span data-l="en">Download cover</span></a>
  </div>
  <p class="small"><span data-l="de">Fotos</span><span data-l="en">Photos</span>: {e(', '.join(c.get('photo_credits', [])))} · Cover: {e(c['cover_credit'])}</p>
</div></section>

<section class="sec"><div class="wrap narrow">
  <h2 class="cond">Credits</h2>
  <dl class="credits">
    <dt><span data-l="de">Veröffentlichung</span><span data-l="en">Release</span></dt><dd><span data-l="de">{e(c['date_de'])}</span><span data-l="en">{e(c['date_en'])}</span></dd>
    <dt><span data-l="de">Länge</span><span data-l="en">Length</span></dt><dd>{e(c['length'])}</dd>
    <dt>Genre</dt><dd>{e(c['genre'])}</dd>
    {credits}
  </dl>
</div></section>

<section class="sec"><div class="wrap narrow">
  <details><summary class="cond"><span data-l="de">Über den Song</span><span data-l="en">About the song</span></summary>
    <div data-l="de">{paras(c['text_de'])}</div>
    <div data-l="en">{paras(c['text_en'])}</div>
  </details>
  <details><summary class="cond">Lyrics</summary><div class="lyrics">{lyrics(c['lyrics'])}</div></details>
  <details><summary class="cond">Interview</summary>
    <div data-l="de">{interview(c['interview_de'])}</div>
    <div data-l="en">{interview(c['interview_en'])}</div>
  </details>
</div></section>

<section class="sec contact"><div class="wrap narrow">
  <h2 class="cond"><span data-l="de">Kontakt</span><span data-l="en">Contact</span></h2>
  <p><span data-l="de">Fragen, Interviews, Konzertanfragen:</span><span data-l="en">Questions, interviews, bookings:</span> <a href="mailto:softblech@gmail.com">softblech@gmail.com</a></p>
</div></section>
</main>

<footer><div class="wrap">
  <a href="../">softblech.com</a>
  <a href="../impressum.html">Impressum</a>
  <a href="../datenschutz.html">Datenschutz</a>
  <span>© 2026 Softblech</span>
</div></footer>
<script src="../release.js"></script>
</body>
</html>
"""
out = ROOT / slug / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(page, encoding="utf-8")
print("geschrieben:", out.relative_to(ROOT))
