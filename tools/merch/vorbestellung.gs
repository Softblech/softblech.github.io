/**
 * SOFTBLECH Merch-Vorbestellung
 * Google Apps Script, gehört in eine Google-Tabelle (Erweiterungen > Apps Script).
 * Speichert jede Vorbestellung von softblech.com/merch als neue Zeile
 * und schickt eine Bestätigungsmail mit den PayPal-Infos.
 * Anleitung: tools/merch/ANLEITUNG.md
 */

// ===== EINSTELLUNGEN (gleich wie in merch/merch.js halten) =====
var GROESSEN = ['S', 'M', 'L', 'XL', 'XXL'];
var PREIS = 25;          // Euro pro Shirt
var VERSAND = 5;         // Euro pro Bestellung bei Versand
var MAX_PRO_GROESSE = 10;
var PAYPAL = '';         // z. B. 'https://paypal.me/softblech' oder 'softblech@gmail.com'
var ZAHLEN_IN_TAGEN = 7;
var BESTAETIGUNG_SENDEN = true;
var KOPIE_AN = '';       // z. B. 'softblech@gmail.com' für eine Info bei jeder Bestellung (leer = keine)
// ================================================================

var BLATT = 'Bestellungen';

function kopfzeile_() {
  return ['Eingang', 'Bestellnr.', 'Vorname', 'Nachname', 'E-Mail', 'Lieferung']
    .concat(GROESSEN)
    .concat(['Shirts gesamt', 'Betrag (€)', 'Straße', 'Adresszusatz', 'PLZ', 'Ort', 'Land', 'Nachricht', 'Sprache', 'Bezahlt', 'Verschickt / abgeholt']);
}

/** Einmal von Hand ausführen: legt die Blätter "Bestellungen" und "Übersicht" an. */
function einrichten() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(BLATT) || ss.insertSheet(BLATT);
  var kopf = kopfzeile_();
  sh.getRange(1, 1, 1, kopf.length).setValues([kopf]).setFontWeight('bold').setBackground('#ff2f3f');
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('dd.mm.yyyy hh:mm');

  var ue = ss.getSheetByName('Übersicht') || ss.insertSheet('Übersicht');
  ue.clear();
  var col = function (name) { return colLetter_(kopf.indexOf(name) + 1); };
  var rows = [['Größe', 'Anzahl Shirts']];
  GROESSEN.forEach(function (g) { rows.push([g, '=SUM(' + BLATT + '!' + col(g) + '2:' + col(g) + ')']); });
  rows.push(['Shirts gesamt', '=SUM(B2:B' + (GROESSEN.length + 1) + ')']);
  rows.push(['', '']);
  rows.push(['Bestellungen', '=COUNTA(' + BLATT + '!B2:B)']);
  rows.push(['Davon bezahlt', '=COUNTIF(' + BLATT + '!' + col('Bezahlt') + '2:' + col('Bezahlt') + ',TRUE)']);
  rows.push(['Betrag gesamt (€)', '=SUM(' + BLATT + '!' + col('Betrag (€)') + '2:' + col('Betrag (€)') + ')']);
  rows.push(['Davon bezahlt (€)', '=SUMIF(' + BLATT + '!' + col('Bezahlt') + '2:' + col('Bezahlt') + ',TRUE,' + BLATT + '!' + col('Betrag (€)') + '2:' + col('Betrag (€)') + ')']);
  rows.push(['Zum Versand', '=COUNTIF(' + BLATT + '!F2:F,"Versand")']);
  rows.push(['Zur Abholung', '=COUNTIF(' + BLATT + '!F2:F,"Abholung")']);
  ue.getRange(1, 1, rows.length, 2).setValues(rows);
  ue.getRange('A1:B1').setFontWeight('bold').setBackground('#ff2f3f');
  ue.autoResizeColumns(1, 2);
}

function doGet() {
  return ContentService.createTextOutput('SOFTBLECH Merch-Vorbestellung läuft.');
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var p = (e && e.parameter) || {};
    if (p.website) return json_({ ok: true, nr: 'SB-000', summe: 0 }); // Spam-Falle

    var t = function (k, max) { return String(p[k] || '').trim().slice(0, max || 120); };
    var lieferung = p.lieferung === 'Abholung' ? 'Abholung' : 'Versand';
    var anzahl = GROESSEN.map(function (g) {
      var n = parseInt(p['g_' + g], 10);
      return isNaN(n) ? 0 : Math.max(0, Math.min(MAX_PRO_GROESSE, n));
    });
    var summeShirts = anzahl.reduce(function (a, b) { return a + b; }, 0);
    var email = t('email');

    if (!summeShirts) return json_({ ok: false, error: 'keine Shirts' });
    if (!t('vorname') || !t('nachname') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ ok: false, error: 'Pflichtfelder' });
    if (lieferung === 'Versand' && (!t('strasse') || !t('plz') || !t('ort') || !t('land'))) return json_({ ok: false, error: 'Adresse' });

    var betrag = summeShirts * PREIS + (lieferung === 'Versand' ? VERSAND : 0);

    lock.waitLock(20000);
    var sh = SpreadsheetApp.getActive().getSheetByName(BLATT);
    // Fortlaufende Nummer, bleibt eindeutig, auch wenn Zeilen gelöscht werden
    var props = PropertiesService.getScriptProperties();
    var zaehler = parseInt(props.getProperty('zaehler') || '0', 10) + 1;
    props.setProperty('zaehler', String(zaehler));
    var nr = 'SB-' + ('00' + zaehler).slice(-3);
    var zeile = [new Date(), nr, safe_(t('vorname', 80)), safe_(t('nachname', 80)), safe_(email), lieferung]
      .concat(anzahl)
      .concat([summeShirts, betrag, safe_(t('strasse')), safe_(t('zusatz')), safe_(t('plz', 12)), safe_(t('ort', 80)), safe_(t('land', 60)), safe_(t('nachricht', 500)), p.sprache === 'en' ? 'en' : 'de', false, false]);
    sh.appendRow(zeile);
    var r = sh.getLastRow(), kopf = kopfzeile_();
    sh.getRange(r, kopf.indexOf('Bezahlt') + 1, 1, 2).insertCheckboxes();
    SpreadsheetApp.flush();
    lock.releaseLock();

    if (BESTAETIGUNG_SENDEN) {
      try { mail_(p.sprache === 'en', email, t('vorname', 80), nr, anzahl, lieferung, betrag); } catch (err) { console.error(err); }
    }
    if (KOPIE_AN) {
      try { MailApp.sendEmail(KOPIE_AN, 'Neue Merch-Vorbestellung ' + nr, t('vorname') + ' ' + t('nachname') + ': ' + summeShirts + ' Shirt(s), ' + betrag + ' €, ' + lieferung); } catch (err) { console.error(err); }
    }
    return json_({ ok: true, nr: nr, summe: betrag });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Serverfehler' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function mail_(en, an, vorname, nr, anzahl, lieferung, betrag) {
  var liste = GROESSEN.map(function (g, i) { return anzahl[i] ? anzahl[i] + ' × ' + g : ''; }).filter(String).join(', ');
  var euro = betrag.toFixed(2).replace('.', en ? '.' : ',') + ' €';
  var paypal = PAYPAL || (en ? '(we will send you the PayPal address shortly)' : '(die PayPal-Adresse schicken wir dir gleich noch)');
  var text = en
    ? 'Hi ' + vorname + ',\n\nthanks for pre-ordering our shirt!\n\nOrder number: ' + nr + '\nShirts: ' + liste + '\n' +
      (lieferung === 'Versand' ? 'Delivery: by post' : 'Delivery: pick-up at a show') + '\nTotal: ' + euro + '\n\n' +
      'Please send ' + euro + ' via PayPal to ' + paypal + ' within ' + ZAHLEN_IN_TAGEN + ' days and use ' + nr + ' as the reference.\n\n' +
      'We will let you know as soon as the shirts are printed.\n\nLove,\nDennis & Henri\nSOFTBLECH\nsoftblech.com'
    : 'Hey ' + vorname + ',\n\ndanke für deine Vorbestellung!\n\nBestellnummer: ' + nr + '\nShirts: ' + liste + '\n' +
      (lieferung === 'Versand' ? 'Lieferung: per Post' : 'Lieferung: Abholung bei einem Konzert') + '\nBetrag: ' + euro + '\n\n' +
      'Bitte überweise ' + euro + ' innerhalb von ' + ZAHLEN_IN_TAGEN + ' Tagen per PayPal an ' + paypal + ' und schreib ' + nr + ' in den Verwendungszweck.\n\n' +
      'Sobald die Shirts gedruckt sind, melden wir uns.\n\nLiebe Grüße\nDennis & Henri\nSOFTBLECH\nsoftblech.com';
  MailApp.sendEmail({ to: an, subject: (en ? 'Your SOFTBLECH pre-order ' : 'Deine SOFTBLECH-Vorbestellung ') + nr, body: text, name: 'SOFTBLECH', replyTo: 'softblech@gmail.com' });
}

// Verhindert, dass Eingaben wie "=..." als Formel in der Tabelle landen
function safe_(s) { return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; }

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function colLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
