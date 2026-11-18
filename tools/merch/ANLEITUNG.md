# Merch-Vorbestellung: so richtest du sie ein

Die Seite **softblech.com/merch** zeigt das Bestellformular. Die Bestellungen landen in einer
**Google-Tabelle** im Softblech-Google-Konto (softblech@gmail.com). Daraus lädst du jederzeit
eine Excel-Datei herunter.

Dauer: ca. 10 Minuten, einmalig.

## 1. Google-Tabelle anlegen

1. Mit softblech@gmail.com bei Google anmelden und auf <https://sheets.new> gehen.
2. Die Tabelle oben links umbenennen, z. B. **Merch-Vorbestellungen**.

## 2. Das Skript einfügen

1. Im Menü **Erweiterungen > Apps Script** klicken. Ein neuer Tab öffnet sich.
2. Dort steht schon etwas Code (`function myFunction() …`). Alles markieren und löschen.
3. Den kompletten Inhalt der Datei `tools/merch/vorbestellung.gs` hineinkopieren.
4. Ganz oben im Block **EINSTELLUNGEN** stehen Preis, Versand und Größen (alles andere später im Blatt „Einstellungen“).
5. Speichern (Disketten-Symbol oder Cmd+S).

## 3. Tabelle vorbereiten

1. Oben in der Leiste neben „Ausführen“ im Auswahlfeld **einrichten** wählen und auf **Ausführen** klicken.
2. Google fragt nach Berechtigungen: **Berechtigungen prüfen** > Konto wählen >
   „Erweitert“ > „Zu … wechseln (unsicher)“ > **Zulassen**.
   (Das ist normal bei eigenen Skripten. Das Skript darf deine Tabelle bearbeiten und Bestätigungsmails verschicken.)
3. In der Tabelle gibt es jetzt die Blätter **Bestellungen** und **Übersicht**.

## 4. Als Web-App veröffentlichen

1. Rechts oben **Bereitstellen > Neue Bereitstellung**.
2. Beim Zahnrad „Typ auswählen“ **Web-App** wählen.
3. Ausführen als: **Ich (softblech@gmail.com)**. Zugriff: **Jeder**.
4. **Bereitstellen** klicken und die **Web-App-URL** kopieren (endet auf `/exec`).
5. Diese Adresse an Claude schicken, oder selbst in `merch/merch.js` bei `endpoint:` eintragen.

Wichtig: Wenn du später etwas am Skript änderst, unter **Bereitstellen > Bereitstellungen verwalten >
Bearbeiten (Stift) > Version: Neue Version** neu bereitstellen. Die Adresse bleibt dann gleich.

## Einstellungen ändern (ohne Code)

Im Blatt **Einstellungen** der Tabelle stehen PayPal-Link, die Adresse für die Hinweis-Mail, die Antwort-Adresse,
die Zahlungsfrist, ob Bestätigungsmails rausgehen, und optionale Zusatztexte für die Mail.
Einfach den Wert in Spalte B ändern. Das gilt sofort für die nächste Bestellung, ohne neues Bereitstellen.
Nur Preis, Versand und Größen stehen im Code, weil sie auch auf der Website (merch/merch.js) stehen müssen.

**Zugangscode** und **Bestellungen offen** stehen ebenfalls dort (seit 18.11.2026):
- *Zugangscode*: Den prüft das Skript, nicht mehr die Website. Neuer Code = der alte geht sofort nicht mehr.
  Am besten 8 oder mehr Zeichen (z. B. Wort + Zahl), dann ist er nicht durchprobierbar.
- *Bestellungen offen*: `nein` macht den Shop sofort zu, auch für Anfragen, die direkt an das Skript gehen.

Eingebauter Schutz (Werte oben im Skript): höchstens 3 Bestellungen pro E-Mail-Adresse und Stunde,
höchstens 40 Bestellungen pro Tag, nach 30 falschen Codes in 10 Minuten 10 Minuten Pause,
doppelt abgeschickte Bestellungen (gleiche Mail, gleiche Shirts, 10 Minuten) werden nur einmal gespeichert.

## Skript aktualisieren (neue Version einspielen)

1. Tabelle öffnen > **Erweiterungen > Apps Script**.
2. In `Code.gs` alles markieren (Cmd+A), löschen und den kompletten Inhalt von `tools/merch/vorbestellung.gs` einfügen. Speichern (Cmd+S).
3. Oben in der Funktionsauswahl **einrichten** wählen und **Ausführen**. Das ergänzt neue Zeilen im Blatt Einstellungen, vorhandene Werte bleiben.
4. **Bereitstellen > Bereitstellungen verwalten** > Stift-Symbol > bei Version **Neue Version** wählen > **Bereitstellen**.
   Wichtig: NICHT „Neue Bereitstellung“, sonst ändert sich die Adresse und die Website findet das Skript nicht mehr.

## 5. Excel-Liste herunterladen

In der Tabelle: **Datei > Herunterladen > Microsoft Excel (.xlsx)**.

- Blatt **Bestellungen**: eine Zeile pro Bestellung mit Name, E-Mail, Anzahl pro Größe, Betrag und Adresse.
  Die Spalten **Bezahlt** und **Verschickt / abgeholt** sind Häkchen, die ihr selbst setzt.
- Blatt **Übersicht**: wie viele Shirts pro Größe insgesamt (das braucht ihr für die Bestellung bei der Druckerei),
  wie viel Geld erwartet wird und wie viel schon bezahlt ist.

## Was passiert bei einer Bestellung?

1. Fan füllt das Formular aus und bekommt sofort eine Bestellnummer (z. B. SB-007).
2. Die Bestellung steht als neue Zeile in der Tabelle.
3. Der Fan bekommt eine Bestätigungsmail (Absender softblech@gmail.com, Antworten gehen an hallo@softblech.com).
4. Ihr schickt jedem persönlich die PayPal-Infos (Bestellnummer als Verwendungszweck), gleicht die Zahlungen ab und setzt das Häkchen „Bezahlt“.

## Vorbestellung beenden

Am schnellsten: im Blatt **Einstellungen** bei *Bestellungen offen* `nein` eintragen (wirkt sofort, auch serverseitig).
Zusätzlich kann in `merch/merch.js` `offen: false` oder bei `bis:` ein Datum stehen. Dann zeigt die Seite
„Die Vorbestellung ist gerade geschlossen“ schon vor der Code-Eingabe.
