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
4. Ganz oben im Block **EINSTELLUNGEN** Preis, Versand, Größen und PayPal eintragen.
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

## 5. Excel-Liste herunterladen

In der Tabelle: **Datei > Herunterladen > Microsoft Excel (.xlsx)**.

- Blatt **Bestellungen**: eine Zeile pro Bestellung mit Name, E-Mail, Anzahl pro Größe, Betrag und Adresse.
  Die Spalten **Bezahlt** und **Verschickt / abgeholt** sind Häkchen, die ihr selbst setzt.
- Blatt **Übersicht**: wie viele Shirts pro Größe insgesamt (das braucht ihr für die Bestellung bei der Druckerei),
  wie viel Geld erwartet wird und wie viel schon bezahlt ist.

## Was passiert bei einer Bestellung?

1. Fan füllt das Formular aus und bekommt sofort eine Bestellnummer (z. B. SB-007) und die PayPal-Infos.
2. Die Bestellung steht als neue Zeile in der Tabelle.
3. Der Fan bekommt eine Bestätigungsmail von softblech@gmail.com.
4. Ihr gleicht PayPal-Zahlungen über die Bestellnummer im Verwendungszweck ab und setzt das Häkchen „Bezahlt“.

## Vorbestellung beenden

In `merch/merch.js` `offen: false` setzen oder bei `bis:` ein Datum eintragen. Danach zeigt die Seite
„Die Vorbestellung ist gerade geschlossen“.
