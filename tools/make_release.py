#!/usr/bin/env python3
"""Baut Release-Landingpages aus tools/releases/<slug>.json.

Aufruf:  python3 tools/make_release.py            (alle Releases)
         python3 tools/make_release.py <slug>     (nur einer)
Ergebnis: <slug>/index.html  ->  https://softblech.com/<slug>

Felder, die fehlen (z. B. lyrics, interview_de, pitch_de), werden einfach weggelassen.
"""
import json, sys, html, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
ALL = sorted((json.loads(p.read_text(encoding="utf-8")) for p in (ROOT / "tools/releases").glob("*.json")),
             key=lambda r: r["date"], reverse=True)
e = lambda s: html.escape(s or "", quote=True)
paras = lambda ps: "".join(f"<p>{e(p).replace(chr(10), '<br>')}</p>" for p in ps if p.strip())


def bi(de, en):
    """Zweisprachiger Text; fehlt eine Sprache, steht die andere in beiden."""
    de, en = de or en, en or de
    return f'<span data-l="de">{de}</span><span data-l="en">{en}</span>'


def interview(items):
    out = []
    for i in items or []:
        answers = i.get("answers") or [[i["who"], i["a"]]]
        out.append(f'<div class="qa"><h4>{e(i["q"])}</h4>' +
                   "".join(f'<p><b>{e(w)}:</b> {e(a)}</p>' for w, a in answers) + "</div>")
    return "".join(out)


def lyrics(t):
    out = []
    for block in t.split("\n\n"):
        lines = [l.rstrip() for l in block.strip().split("\n") if l.strip()]
        if not lines:
            continue
        if len(lines) == 1 and len(lines[0]) < 20 and not lines[0].endswith((".", ",")):
            out.append(f'<h4>{e(lines[0])}</h4>'); continue
        if lines[0] in ("Verse 1", "Verse 2", "Verse 3", "Chorus", "Bridge", "Outro", "Intro", "Pre-Chorus"):
            out.append(f'<h4>{e(lines[0])}</h4>'); lines = lines[1:]
        out.append("<p>" + "<br>".join(e(l) for l in lines) + "</p>")
    return "".join(out)


def build(c):
    slug = c["slug"]
    is_new = (datetime.date.today() - datetime.date.fromisoformat(c["date"])).days <= 60
    t_de, t_en = c.get("type", "Single"), c.get("type_en", c.get("type", "Single"))
    eyebrow = bi(("Neue " if is_new else "") + t_de, ("New " if is_new else "") + t_en)
    links = "".join(
        f'<a class="btn {"solid" if i == 0 else "ghost"}" href="{e(u)}" target="_blank" rel="noopener">{e(n)}</a>'
        for i, (n, u) in enumerate(c["links"]))
    credits = "".join(f"<dt>{e(k)}</dt><dd>{e(v)}</dd>" for k, v in c.get("credits", []))
    if c.get("length"):
        credits = f'<dt>{bi("Länge", "Length")}</dt><dd>{e(c["length"])}</dd>' + credits
    url = f"https://softblech.com/{slug}/"
    desc_de = c.get("teaser_de") or c.get("pitch_de") or f"{c['title']}, {t_de} von SOFTBLECH"
    teaser = (f'<p class="teaser">{bi(e(c.get("teaser_de")), e(c.get("teaser_en")))}</p>'
              if c.get("teaser_de") or c.get("teaser_en") else "")

    pitch = ""
    if c.get("pitch_de") or c.get("pitch_en") or c.get("quote_short_en"):
        pitch = '<section class="sec pitch"><div class="wrap narrow">'
        if c.get("pitch_de") or c.get("pitch_en"):
            pitch += f'<p class="lead">{bi(e(c.get("pitch_de")), e(c.get("pitch_en")))}</p>'
        if c.get("quote_short_en"):
            pitch += f'<blockquote><p>„{e(c["quote_short_en"])}“</p><cite>{e(c.get("quote_by", "SOFTBLECH"))}</cite></blockquote>'
        pitch += "</div></section>"

    photo = ", ".join(c.get("photo_credits", []))
    credit_line = " · ".join(x for x in [
        f'{bi("Fotos", "Photos")}: {e(photo)}' if photo else "",
        f'Cover: {e(c["cover_credit"])}' if c.get("cover_credit") else ""] if x)

    more = ""
    if c.get("text_de") or c.get("text_en"):
        more += (f'<details><summary class="cond">{bi("Über den Song", "About the song")}</summary>'
                 f'<div data-l="de">{paras(c.get("text_de") or c.get("text_en"))}</div>'
                 f'<div data-l="en">{paras(c.get("text_en") or c.get("text_de"))}</div></details>')
    if c.get("lyrics"):
        more += f'<details><summary class="cond">Lyrics</summary><div class="lyrics">{lyrics(c["lyrics"])}</div></details>'
    if c.get("interview_de") or c.get("interview_en"):
        more += (f'<details><summary class="cond">Interview</summary>'
                 f'<div data-l="de">{interview(c.get("interview_de") or c.get("interview_en"))}</div>'
                 f'<div data-l="en">{interview(c.get("interview_en") or c.get("interview_de"))}</div></details>')
    more = f'<section class="sec"><div class="wrap narrow">{more}</div></section>' if more else ""

    others = "".join(
        f'<a class="other" href="../{e(o["slug"])}/"><img src="../{e(o["cover"])}" alt="" loading="lazy" width="300" height="300">'
        f'<span class="cond">{e(o["title"])}</span><small>{e(o["date"][:4])}</small></a>'
        for o in ALL if o["slug"] != slug)

    return f"""<!doctype html>
<html lang="de" data-lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(c['title'])} · SOFTBLECH</title>
<meta name="description" content="{e(desc_de)}">
<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="../img/favicon-32.png">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<meta name="theme-color" content="#ff2f3f">
<link rel="canonical" href="{url}">
<meta property="og:type" content="music.song">
<meta property="og:title" content="SOFTBLECH – {e(c['title'])}">
<meta property="og:description" content="{e(t_de)} · {e(c['date_de'])}. {e(desc_de)}">
<meta property="og:image" content="https://softblech.com/{e(c['cover'])}">
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
  <img class="cover" src="../{e(c['cover'])}" alt="Cover von {e(c['title'])}" width="640" height="640">
  <div class="info">
    <div class="eyebrow">{eyebrow} · {bi(e(c['date_de']), e(c['date_en']))}</div>
    <h1 class="cond">{e(c['title'])}</h1>
    {teaser}
    <div class="btns">{links}<button class="btn ghost" type="button" id="share">{bi("Link teilen", "Share")}</button></div>
    <div class="player" id="player" data-src="https://open.spotify.com/embed/track/{e(c['spotify_track'])}?utm_source=generator&amp;theme=0">
      <button type="button" class="btn solid" id="loadplayer">▶ {bi("Hier anhören", "Listen here")}</button>
      <small>{bi("Lädt den Spotify-Player. Dabei werden Daten an Spotify übertragen.", "Loads the Spotify player, which sends data to Spotify.")} <a href="../datenschutz.html">Datenschutz</a></small>
    </div>
  </div>
</div></section>

{pitch}

<section class="sec on-red"><div class="wrap narrow">
  <h2 class="cond">{bi("Presse", "Press")}</h2>
  <p>{bi("Pressemappe mit Texten und Fotos. Fotos sind zur redaktionellen Nutzung freigegeben, bitte Fotograf*in nennen.", "Press kit with texts and photos. Photos are free for editorial use, please credit the photographer.")}</p>
  <div class="btns">
    <a class="btn solid" href="{e(c['presskit'])}" target="_blank" rel="noopener">{bi("Pressemappe &amp; Fotos", "Press kit &amp; photos")}</a>
    <a class="btn ghost" href="../{e(c['cover'])}" download>{bi("Cover laden", "Download cover")}</a>
  </div>
  {f'<p class="small">{credit_line}</p>' if credit_line else ''}
</div></section>

<section class="sec"><div class="wrap narrow">
  <h2 class="cond">Credits</h2>
  <dl class="credits">
    <dt>{bi("Veröffentlichung", "Release")}</dt><dd>{bi(e(c['date_de']), e(c['date_en']))}</dd>
    <dt>Genre</dt><dd>{e(c.get('genre', 'Post Wave'))}</dd>
    {credits}
  </dl>
</div></section>

{more}

<section class="sec contact"><div class="wrap narrow">
  <h2 class="cond">{bi("Kontakt", "Contact")}</h2>
  <p>{bi("Fragen, Interviews, Konzertanfragen:", "Questions, interviews, bookings:")} <a href="mailto:softblech@gmail.com">softblech@gmail.com</a></p>
</div></section>

<section class="sec"><div class="wrap">
  <h2 class="cond">{bi("Weitere Songs", "More songs")}</h2>
  <div class="others">{others}</div>
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


targets = [r for r in ALL if len(sys.argv) < 2 or r["slug"] in sys.argv[1:]]
for c in targets:
    out = ROOT / c["slug"] / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(build(c), encoding="utf-8")
    print("geschrieben:", out.relative_to(ROOT))
