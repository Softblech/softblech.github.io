/**
 * SOFTBLECH Merch-Vorbestellung
 * Google Apps Script (eigenständiges Projekt, schreibt in die Tabelle TABELLE_ID).
 * Speichert jede Vorbestellung von softblech.com/merch als neue Zeile
 * und schickt eine Bestätigungsmail mit der Bestellnummer.
 * Anleitung: tools/merch/ANLEITUNG.md
 */

// ===== EINSTELLUNGEN (gleich wie in merch/merch.js halten) =====
var GROESSEN = ['XS', 'S', 'M', 'L', 'XL'];
var PREIS = 25;          // Euro pro Shirt
var VERSAND = 4.19;      // Euro pro Bestellung, DHL Päckchen S (Stand 2026)
var MAX_PRO_GROESSE = 10;
var MAX_PRO_MAIL_STUNDE = 3;   // Bestellungen pro E-Mail-Adresse und Stunde
var MAX_PRO_TAG = 40;          // Bestellungen pro Tag insgesamt (schützt das Mail-Limit von Google)
var MAX_FEHLVERSUCHE = 30;     // falsche Codes in 10 Minuten, danach 10 Minuten Pause
// ================================================================
// Alles Weitere (PayPal-Link, Mail-Adressen, Zahlungsfrist, Zusatztexte)
// steht im Tabellenblatt "Einstellungen" und wird dort geändert.
// Dafür muss das Skript NICHT neu eingefügt oder bereitgestellt werden.

var STANDARD = [
  ['Bestellungen offen', 'ja', 'ja oder nein. Nein = Shop sofort zu, auch für direkte Anfragen.'],
  ['Zugangscode', '041226', 'Code für softblech.com/merch. Ändern = der alte Code geht sofort nicht mehr. Lieber 8+ Zeichen.'],
  ['PayPal-Link', 'https://www.paypal.me/henrisoen', 'Steht in der Bestätigungsmail. Leer = "Zahlungsinfos schicken wir persönlich".'],
  ['Hinweis-Mail an', 'softblech@gmail.com', 'Bekommt bei jeder Bestellung eine Mail. Leer = keine. Am besten direkt die Gmail-Adresse.'],
  ['Antworten an', 'hallo@softblech.com', 'Wenn Fans auf die Bestätigung antworten, landet es hier.'],
  ['Zahlungsfrist (Tage)', 7, 'Wird in der Bestätigungsmail genannt.'],
  ['Bestätigungsmail senden', 'ja', 'ja oder nein'],
  ['Zusatztext Mail (DE)', '', 'Optional, steht vor dem Gruß, z. B. "Die Shirts kommen Mitte Dezember."'],
  ['Zusatztext Mail (EN)', '', 'Optional, englische Version für Bestellungen auf Englisch.']
];

/** Liest das Blatt "Einstellungen" (fehlende Werte = Standard). */
function cfg_() {
  var o = {};
  STANDARD.forEach(function (r) { o[r[0]] = r[1]; });
  var sh = tabelle_().getSheetByName('Einstellungen');
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
      if (r[0] !== '' && o.hasOwnProperty(String(r[0]).trim())) o[String(r[0]).trim()] = r[1];
    });
  }
  return {
    offen: !/^(nein|no|false|0)$/i.test(String(o['Bestellungen offen']).trim()),
    code: norm_(o['Zugangscode']),
    paypal: String(o['PayPal-Link'] || '').trim(),
    kopieAn: String(o['Hinweis-Mail an'] || '').trim(),
    antwortAn: String(o['Antworten an'] || '').trim() || 'hallo@softblech.com',
    frist: parseInt(o['Zahlungsfrist (Tage)'], 10) || 7,
    senden: !/^(nein|no|false|0)$/i.test(String(o['Bestätigungsmail senden']).trim()),
    zusatzDe: String(o['Zusatztext Mail (DE)'] || '').trim(),
    zusatzEn: String(o['Zusatztext Mail (EN)'] || '').trim()
  };
}

var BLATT = 'Bestellungen';
// Die Tabelle "Shirt Bestellungen" im Softblech-Drive
var TABELLE_ID = '1xm_5h0RCXv8rXa44IDjITip3Okn9e7MJ5GIrw6QC134';
function tabelle_() { return SpreadsheetApp.openById(TABELLE_ID); }

function kopfzeile_() {
  return ['Eingang', 'Bestellnr.', 'Vorname', 'Nachname', 'E-Mail', 'Lieferung']
    .concat(GROESSEN)
    .concat(['Shirts gesamt', 'Betrag (€)', 'Straße', 'Adresszusatz', 'PLZ', 'Ort', 'Land', 'Nachricht', 'Sprache', 'Bezahlt', 'Verschickt / abgeholt', 'Newsletter']);
}

/** Einmal von Hand ausführen: legt die Blätter "Bestellungen" und "Übersicht" an. */
function einrichten() {
  var ss = tabelle_();
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
  // Formeln ohne Komma/Semikolon und ohne TRUE/WAHR, damit sie in jeder Spracheinstellung funktionieren
  var bez = BLATT + '!' + col('Bezahlt') + '2:' + col('Bezahlt');
  var bet = BLATT + '!' + col('Betrag (€)') + '2:' + col('Betrag (€)');
  rows.push(['Davon bezahlt', '=SUMPRODUCT(' + bez + '*1)']);
  rows.push(['Betrag gesamt (€)', '=SUM(' + BLATT + '!' + col('Betrag (€)') + '2:' + col('Betrag (€)') + ')']);
  rows.push(['Davon bezahlt (€)', '=SUMPRODUCT(' + bez + '*' + bet + ')']);
  rows.push(['Zum Versand', '=SUMPRODUCT(--(' + BLATT + '!F2:F="Versand"))']);
  rows.push(['Zur Abholung', '=SUMPRODUCT(--(' + BLATT + '!F2:F="Abholung"))']);
  // Beschriftungen als Werte, Formeln extra (setFormula versteht immer die englische Schreibweise mit Komma)
  ue.getRange(1, 1, rows.length, 1).setValues(rows.map(function (r) { return [r[0]]; }));
  rows.forEach(function (r, i) {
    var c = ue.getRange(i + 1, 2);
    if (String(r[1]).charAt(0) === '=') c.setFormula(r[1]); else c.setValue(r[1]);
  });
  ue.getRange('A1:B1').setFontWeight('bold').setBackground('#ff2f3f');
  ue.autoResizeColumns(1, 2);

  // Einstellungen: vorhandene Werte bleiben erhalten, fehlende Zeilen werden ergänzt
  var es = ss.getSheetByName('Einstellungen') || ss.insertSheet('Einstellungen');
  var alt = {};
  if (es.getLastRow() > 1) es.getRange(2, 1, es.getLastRow() - 1, 2).getValues().forEach(function (r) { if (r[0] !== '') alt[String(r[0]).trim()] = r[1]; });
  var zeilen = [['Einstellung', 'Wert', 'Erklärung']].concat(STANDARD.map(function (r) {
    return [r[0], alt.hasOwnProperty(r[0]) ? alt[r[0]] : r[1], r[2]];
  }));
  es.clear();
  es.getRange('B:B').setNumberFormat('@'); // Codes wie 041226 als Text speichern
  es.getRange(1, 1, zeilen.length, 3).setValues(zeilen);
  es.getRange('A1:C1').setFontWeight('bold').setBackground('#ff2f3f');
  es.setColumnWidth(1, 200); es.setColumnWidth(2, 320); es.setColumnWidth(3, 480);
}

/** Code und Text vergleichbar machen: Kleinbuchstaben, ohne Leerzeichen */
function norm_(s) {
  var t = String(s == null ? '' : s).toLowerCase().replace(/\s+/g, '');
  return /^\d+$/.test(t) ? t.replace(/^0+(?=\d)/, '') : t; // Tabelle macht aus 041226 die Zahl 41226
}

/** Prüft den Zugangscode. Viele Fehlversuche => 10 Minuten Pause (gegen Durchprobieren). */
function codeOk_(c, code) {
  var cache = CacheService.getScriptCache();
  var fails = parseInt(cache.get('fails') || '0', 10);
  if (fails >= MAX_FEHLVERSUCHE) return 'gesperrt';
  if (!c.code || norm_(code) === c.code) return 'ok';
  cache.put('fails', String(fails + 1), 600);
  return 'falsch';
}

/** Merch-Seite fragt hier, ob der Code stimmt: ?code=... */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.code === undefined) return ContentService.createTextOutput('SOFTBLECH Merch-Vorbestellung läuft.');
  var c = cfg_();
  if (!c.offen) return json_({ ok: false, error: 'geschlossen' });
  var r = codeOk_(c, p.code);
  return json_(r === 'ok' ? { ok: true } : { ok: false, error: r });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var p = (e && e.parameter) || {};
    if (p.website) return json_({ ok: true, nr: 'SB-000', summe: 0 }); // Spam-Falle
    var c = cfg_();
    if (!c.offen) return json_({ ok: false, error: 'geschlossen' });
    var cr = codeOk_(c, p.code);
    if (cr !== 'ok') return json_({ ok: false, error: cr === 'gesperrt' ? 'gesperrt' : 'code' });

    var t = function (k, max) { return String(p[k] || '').trim().slice(0, max || 120); };
    var lieferung = p.lieferung === 'Abholung' ? 'Abholung' : 'Versand';
    // Mengen streng prüfen: nur ganze Zahlen 0 bis MAX_PRO_GROESSE, sonst Fehler (nichts wird still geändert)
    var falsch = false;
    var anzahl = GROESSEN.map(function (g) {
      var v = String(p['g_' + g] == null ? '' : p['g_' + g]).trim();
      if (v === '') return 0;
      if (!/^\d{1,2}$/.test(v) || +v > MAX_PRO_GROESSE) { falsch = true; return 0; }
      return +v;
    });
    if (falsch) return json_({ ok: false, error: 'Menge' });
    var summeShirts = anzahl.reduce(function (a, b) { return a + b; }, 0);
    var email = t('email');

    if (!summeShirts) return json_({ ok: false, error: 'keine Shirts' });
    if (!t('vorname') || !t('nachname') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ ok: false, error: 'Pflichtfelder' });
    if (lieferung === 'Versand' && (!t('strasse') || !t('plz') || !t('ort') || !t('land'))) return json_({ ok: false, error: 'Adresse' });

    var betrag = Math.round((summeShirts * PREIS + (lieferung === 'Versand' ? VERSAND : 0)) * 100) / 100;

    lock.waitLock(20000);
    var cache = CacheService.getScriptCache();
    var mailKey = 'm:' + email.toLowerCase();
    // Doppelte Bestellung (gleiche Mail, gleiche Shirts, gleiche Lieferung in 10 Minuten): alte Nummer zurückgeben, nichts neu speichern
    var dupKey = 'd:' + Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email.toLowerCase() + '|' + anzahl.join(',') + '|' + lieferung));
    var dup = cache.get(dupKey);
    if (dup) { lock.releaseLock(); return json_({ ok: true, nr: dup, summe: betrag, doppelt: true }); }
    // Limits: pro E-Mail und Stunde, pro Tag insgesamt
    var proMail = parseInt(cache.get(mailKey) || '0', 10);
    if (proMail >= MAX_PRO_MAIL_STUNDE) { lock.releaseLock(); return json_({ ok: false, error: 'limit' }); }
    var props = PropertiesService.getScriptProperties();
    var heute = Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MM-dd');
    var tag = String(props.getProperty('tag') || '').split('|');
    var proTag = tag[0] === heute ? parseInt(tag[1] || '0', 10) : 0;
    if (proTag >= MAX_PRO_TAG) { lock.releaseLock(); return json_({ ok: false, error: 'limit' }); }

    var sh = tabelle_().getSheetByName(BLATT);
    // Fortlaufende Nummer, bleibt eindeutig, auch wenn Zeilen gelöscht werden (ab 1000 einfach vierstellig)
    var zaehler = parseInt(props.getProperty('zaehler') || '0', 10) + 1;
    props.setProperty('zaehler', String(zaehler));
    props.setProperty('tag', heute + '|' + (proTag + 1));
    cache.put(mailKey, String(proMail + 1), 3600);
    var nr = 'SB-' + (zaehler < 1000 ? ('00' + zaehler).slice(-3) : String(zaehler));
    cache.put(dupKey, nr, 600);
    var zeile = [new Date(), nr, safe_(t('vorname', 80)), safe_(t('nachname', 80)), safe_(email), lieferung]
      .concat(anzahl)
      .concat([summeShirts, betrag, safe_(t('strasse')), safe_(t('zusatz')), safe_(t('plz', 12)), safe_(t('ort', 80)), safe_(t('land', 60)), safe_(t('nachricht', 500)), p.sprache === 'en' ? 'en' : 'de', false, false, p.newsletter === 'ja' ? 'ja' : '']);
    sh.appendRow(zeile);
    var r = sh.getLastRow(), kopf = kopfzeile_();
    sh.getRange(r, kopf.indexOf('Bezahlt') + 1, 1, 2).insertCheckboxes();
    SpreadsheetApp.flush();
    lock.releaseLock();

    if (c.senden) {
      try { mail_(c, p.sprache === 'en', email, t('vorname', 80), nr, anzahl, lieferung, betrag); } catch (err) { console.error(err); }
    }
    if (c.kopieAn) {
      try {
        var groessen = GROESSEN.map(function (g, i) { return anzahl[i] ? anzahl[i] + ' × ' + g : ''; }).filter(String).join(', ');
        var adresse = lieferung === 'Versand' ? [t('strasse'), t('zusatz'), t('plz') + ' ' + t('ort'), t('land')].filter(String).join('\n') : 'Abholung bei einem Konzert';
        MailApp.sendEmail({
          to: c.kopieAn,
          subject: 'Neue Shirt-Bestellung ' + nr + ': ' + groessen,
          body: 'Neue Vorbestellung über softblech.com/merch\n\n' +
            'Bestellnummer: ' + nr + '\nName: ' + t('vorname') + ' ' + t('nachname') + '\nE-Mail: ' + email +
            '\nShirts: ' + groessen + '\nBetrag: ' + betrag.toFixed(2).replace('.', ',') + ' €' +
            '\n\nLieferung:\n' + adresse +
            (t('nachricht', 500) ? '\n\nNachricht: ' + t('nachricht', 500) : '') +
            '\nNewsletter: ' + (p.newsletter === 'ja' ? 'ja' : 'nein') +
            (c.paypal ? '\n\nDer Link ' + c.paypal + ' steht in der Bestätigungsmail. Zahlung mit ' + nr + ' abgleichen und "Bezahlt" abhaken.\n' : '\n\nNächster Schritt: PayPal-Infos an ' + email + ' schicken (Verwendungszweck ' + nr + ').\n') +
            'Tabelle: https://docs.google.com/spreadsheets/d/' + TABELLE_ID + '/edit',
          name: 'SOFTBLECH Merch',
          replyTo: email
        });
      } catch (err) { console.error(err); }
    }
    return json_({ ok: true, nr: nr, summe: betrag });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Serverfehler' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function mail_(c, en, an, vorname, nr, anzahl, lieferung, betrag) {
  var liste = GROESSEN.map(function (g, i) { return anzahl[i] ? anzahl[i] + ' × ' + g : ''; }).filter(String).join(', ');
  var euro = betrag.toFixed(2).replace('.', en ? '.' : ',') + ' €';
  var PAYPAL = c.paypal, ZAHLEN_IN_TAGEN = c.frist;
  var zahlEn = PAYPAL
    ? 'Please send ' + euro + ' via PayPal within ' + ZAHLEN_IN_TAGEN + ' days:\n' + PAYPAL + '\nPlease add your order number ' + nr + ' as a note.'
    : 'We will send you the PayPal payment details personally in the next few days.';
  var zahlDe = PAYPAL
    ? 'Bitte überweise ' + euro + ' innerhalb von ' + ZAHLEN_IN_TAGEN + ' Tagen per PayPal:\n' + PAYPAL + '\nSchreib bitte deine Bestellnummer ' + nr + ' in die Mitteilung.'
    : 'Die PayPal-Zahlungsinfos schicken wir dir in den nächsten Tagen persönlich.';
  var text = en
    ? 'Hi ' + vorname + ',\n\nthanks for pre-ordering our shirt!\n\nOrder number: ' + nr + '\nShirts: ' + liste + '\n' +
      (lieferung === 'Versand' ? 'Delivery: DHL' : 'Delivery: pick-up at a show') + '\nTotal: ' + euro + '\n\n' + zahlEn + '\n\n' +
      (c.zusatzEn ? c.zusatzEn + '\n\n' : '') + 'We will let you know as soon as the shirts are printed.\n\nLove,\nDennis & Henri\nSOFTBLECH\nsoftblech.com'
    : 'Hey ' + vorname + ',\n\ndanke für deine Vorbestellung!\n\nBestellnummer: ' + nr + '\nShirts: ' + liste + '\n' +
      (lieferung === 'Versand' ? 'Lieferung: Versand mit DHL' : 'Lieferung: Abholung bei einem Konzert') + '\nBetrag: ' + euro + '\n\n' + zahlDe + '\n\n' +
      (c.zusatzDe ? c.zusatzDe + '\n\n' : '') + 'Sobald die Shirts gedruckt sind, melden wir uns.\n\nLiebe Grüße\nDennis & Henri\nSOFTBLECH\nsoftblech.com';
  MailApp.sendEmail({ to: an, subject: (en ? 'Your SOFTBLECH pre-order ' : 'Deine SOFTBLECH-Vorbestellung ') + nr, body: text, name: 'SOFTBLECH', replyTo: c.antwortAn });
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
