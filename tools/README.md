# Release-Seiten

Jede Veröffentlichung bekommt eine eigene Seite unter softblech.com/<slug>.

1. `tools/releases/i-want-to-be-with-you.json` kopieren, umbenennen (z. B. `neuer-song.json`) und Texte, Cover, Spotify-ID, Credits austauschen.
2. `python3 tools/make_release.py neuer-song`
3. Neue News oben in `data/news.json` eintragen (erscheint im Karussell auf der Startseite).
