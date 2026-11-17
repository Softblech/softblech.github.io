/* =====================================================================
   EINSTELLUNGEN FÜR DIE MERCH-VORBESTELLUNG
   Nur diesen Block ändern. Größen, Preis und Versand müssen genauso
   auch oben im Google-Skript (tools/merch/vorbestellung.gs) stehen.
   ===================================================================== */
var MERCH = {
  offen: true,                 // false = Formular aus, Hinweis "geschlossen"
  // Web-App-Adresse aus Google Apps Script (endet auf /exec). Leer = Testmodus.
  endpoint: 'https://script.google.com/macros/s/AKfycbyDGxcsI9g2Wr1Pr-fyA2FmWhAnjRMlLy1juPrJn0NavL8r07UcXUy1oMe5WlSAWJNwTQ/exec',
  titel: 'SOFTBLECH Shirt',
  preis: 25,                   // Euro pro Shirt
  versand: 4.19,               // Euro pro Bestellung, DHL Päckchen S (Stand 2026)
  groessen: ['XS', 'S', 'M', 'L', 'XL'],
  maxProGroesse: 10,
  bis: '',                     // z. B. '2026-12-15' (leer = ohne Datum)
  // Brevo-Formularadresse (gleich wie SB.newsletterAction in index.html)
  newsletter: 'https://4a6dbfd6.sibforms.com/serve/MUIFAMwR_m5h8o1wltsYbSCL7N-QMkxqJUoEVb_HBoeFtIwxgZZst1DJeTa-DguGFJctrygaBhK5eTaY9OMlEblkh8J50NXY2i4jN8-niLvTT9qEuoETD_KrCktzgieUgJNxSoE3nzt0x5q3pnvh9-7T5rGj5rN5tNrGP_zIDFhjXlRyv7Ma3OdJQnfqodpfR2hNcHu-zTpUljvZAg==',
  // Zugangscode: nur der SHA-256-Fingerabdruck steht hier, nicht der Code selbst.
  // Neuen Code setzen: Claude fragen, oder in der Browser-Konsole den Fingerabdruck des Codes in Kleinbuchstaben ohne Leerzeichen erzeugen.
  codeHash: 'f41076623d336839144a33a7b55afff848ed35c0b1bc6420e29f49f62e0e1041', // leer = Seite ohne Code
  paypal: ''                   // leer = Zahlungsinfos schickt ihr persönlich (so gewünscht, 16.11.)
};
/* ===================================================================== */

(function () {
  var root = document.documentElement, $ = function (id) { return document.getElementById(id); };
  function en() { return root.dataset.lang === 'en'; }

  // Sprache (wie auf den Release-Seiten)
  function setLang(l) {
    root.dataset.lang = l; root.lang = l;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === l); });
    try { localStorage.setItem('sb-lang', l); } catch (e) {}
    render();
  }
  document.querySelectorAll('.lang button').forEach(function (b) { b.onclick = function () { setLang(b.dataset.lang); }; });

  function eur(n) {
    return new Intl.NumberFormat(en() ? 'en-GB' : 'de-DE', { style: 'currency', currency: 'EUR' }).format(n);
  }
  function date(iso) {
    var d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(en() ? 'en-GB' : 'de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function paypalUrl() {
    var p = MERCH.paypal || '';
    return /^https:\/\//.test(p) ? p : '';
  }

  // Größen-Felder bauen
  var sizes = $('sizes');
  MERCH.groessen.forEach(function (g) {
    var box = document.createElement('div'); box.className = 'size';
    box.innerHTML = '<b>' + g + '</b><div class="step"><button type="button" data-d="-1" aria-label="weniger ' + g + '">–</button>' +
      '<input type="number" inputmode="numeric" min="0" max="' + MERCH.maxProGroesse + '" value="0" name="g_' + g + '" aria-label="Anzahl ' + g + '">' +
      '<button type="button" data-d="1" aria-label="mehr ' + g + '">+</button></div>';
    sizes.appendChild(box);
  });
  sizes.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]'); if (!b) return;
    var i = b.parentNode.querySelector('input');
    i.value = Math.max(0, Math.min(MERCH.maxProGroesse, (parseInt(i.value, 10) || 0) + +b.dataset.d));
    render();
  });
  sizes.addEventListener('input', render);

  var form = $('order');
  form.addEventListener('change', render);

  function counts() {
    var c = {}, n = 0;
    MERCH.groessen.forEach(function (g) {
      var v = Math.max(0, Math.min(MERCH.maxProGroesse, parseInt(form['g_' + g].value, 10) || 0));
      c[g] = v; n += v;
    });
    return { c: c, n: n };
  }
  function shipping() { return form.lieferung.value === 'Versand'; }
  function total(n) { return Math.round((n * MERCH.preis + (n && shipping() ? MERCH.versand : 0)) * 100) / 100; }

  function render() {
    var k = counts();
    document.querySelectorAll('.size').forEach(function (b) { b.classList.toggle('on', +b.querySelector('input').value > 0); });
    $('sum').textContent = k.n ? (en() ? k.n + (k.n === 1 ? ' shirt' : ' shirts') + ', total ' : k.n + ' Shirt' + (k.n === 1 ? '' : 's') + ', zusammen ') + eur(total(k.n)) + (shipping() ? (en() ? ' incl. shipping' : ' inkl. Versand') : '') : '';
    $('address').hidden = !shipping();
    $('m-title').textContent = MERCH.titel;
    $('m-price').textContent = eur(MERCH.preis);
    $('m-ship').textContent = MERCH.versand ? eur(MERCH.versand) + (en() ? ' per order (or free pick-up at a show)' : ' pro Bestellung (oder kostenlos beim Konzert abholen)') : (en() ? 'free' : 'kostenlos');
    $('m-ship-small').textContent = MERCH.versand ? '(+ ' + eur(MERCH.versand) + ')' : '';
    $('m-deadline-dt').hidden = $('m-deadline').hidden = !MERCH.bis;
    if (MERCH.bis) $('m-deadline').textContent = date(MERCH.bis);
    $('m-pay-note').textContent = en()
      ? 'After ordering you get an order number by email. You pay via PayPal (Friends & Family), we will send you the details personally.'
      : 'Nach dem Absenden bekommst du eine Bestellnummer per Mail. Bezahlt wird per PayPal (Freunde & Familie), die Infos schicken wir dir persönlich.';
  }

  // Bilder-Karussell: wischen, Pfeile oder Punkte
  (function () {
    var track = $('track'), imgs = track.querySelectorAll('img'), dots = $('c-dots'), btns = [];
    var idx = function () { return Math.round(track.scrollLeft / (track.clientWidth || 1)); };
    var go = function (i) { i = (i + imgs.length) % imgs.length; track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' }); };
    Array.prototype.forEach.call(imgs, function (im, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Bild ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      dots.appendChild(b); btns.push(b);
    });
    var mark = function () { var i = idx(); btns.forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); }); };
    track.addEventListener('scroll', function () { window.requestAnimationFrame(mark); }, { passive: true });
    $('c-prev').addEventListener('click', function () { go(idx() - 1); });
    $('c-next').addEventListener('click', function () { go(idx() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx() - 1); }
    });
    mark();
  })();
  var expired = MERCH.bis && new Date() > new Date(MERCH.bis + 'T23:59:59');
  if (!MERCH.offen || expired) { form.hidden = true; $('m-closed').hidden = false; }

  function fail(msg, field) {
    var e = $('err'); e.textContent = msg; e.hidden = false;
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); } else e.scrollIntoView({ block: 'center' });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    $('err').hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(function (f) { f.removeAttribute('aria-invalid'); });
    var k = counts();
    if (!k.n) return fail(en() ? 'Please choose at least one shirt.' : 'Bitte wähl mindestens ein Shirt aus.');
    var need = ['vorname', 'nachname', 'email'].concat(shipping() ? ['strasse', 'plz', 'ort', 'land'] : []);
    for (var i = 0; i < need.length; i++) {
      var f = form[need[i]];
      if (!f.value.trim()) return fail(en() ? 'Please fill in all required fields.' : 'Bitte füll alle Pflichtfelder aus.', f);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) return fail(en() ? 'Please check your email address.' : 'Bitte prüf deine E-Mail-Adresse.', form.email);

    var data = new URLSearchParams();
    ['vorname', 'nachname', 'email', 'lieferung', 'strasse', 'zusatz', 'plz', 'ort', 'land', 'nachricht', 'website'].forEach(function (n) {
      data.append(n, (form[n].value || '').trim());
    });
    if (!shipping()) ['strasse', 'zusatz', 'plz', 'ort', 'land'].forEach(function (n) { data.set(n, ''); });
    MERCH.groessen.forEach(function (g) { data.append('g_' + g, k.c[g]); });
    data.append('sprache', en() ? 'en' : 'de');
    var nl = form.newsletter.checked;
    data.append('newsletter', nl ? 'ja' : '');

    if (!MERCH.endpoint) {
      // Testmodus: nichts wird gespeichert
      console.log('[Merch] Testmodus, es wurde nichts gespeichert:', Object.fromEntries(data));
      return success({ nr: 'SB-TEST', summe: total(k.n) });
    }

    var btn = $('submit'); btn.disabled = true;
    fetch(MERCH.endpoint, { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.error || 'Fehler');
        success(r);
        if (nl) newsletter();
      })
      .catch(function () {
        btn.disabled = false;
        fail(en() ? 'Sorry, that did not work. Please try again in a moment or email us at softblech@gmail.com.'
                  : 'Das hat leider nicht geklappt. Versuch es bitte gleich noch einmal oder schreib uns an softblech@gmail.com.');
      });
  });

  // Newsletter-Anmeldung bei Brevo (Double-Opt-in: Brevo schickt eine Bestätigungsmail)
  function newsletter() {
    if (!MERCH.newsletter) return;
    var d = new URLSearchParams();
    d.append('EMAIL', form.email.value.trim());
    d.append('VORNAME', form.vorname.value.trim());
    d.append('OPT_IN', '1');
    d.append('email_address_check', '');
    d.append('locale', en() ? 'en' : 'de');
    fetch(MERCH.newsletter, { method: 'POST', mode: 'no-cors', body: d }).catch(function () {});
  }

  function success(r) {
    form.hidden = true;
    $('d-nr').textContent = r.nr;
    $('d-pay').textContent = MERCH.paypal
      ? (en() ? 'Please send ' + eur(r.summe) + ' via PayPal to ' + MERCH.paypal + ' and write ' + r.nr + ' as the reference.'
              : 'Bitte überweise ' + eur(r.summe) + ' per PayPal an ' + MERCH.paypal + ' und schreib ' + r.nr + ' in den Verwendungszweck.')
      : (en() ? 'Total: ' + eur(r.summe) + '. We will send you the PayPal payment details personally in the next few days.'
              : 'Betrag: ' + eur(r.summe) + '. Die PayPal-Zahlungsinfos schicken wir dir in den nächsten Tagen persönlich.');
    var u = paypalUrl();
    if (u) { $('d-paypal').href = u; $('d-paypal').hidden = false; }
    $('done').hidden = false; $('done').focus();
  }

  // Zugangscode-Abfrage (?code=... im Link schaltet direkt frei)
  function sha(t) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(t.toLowerCase().replace(/\s+/g, ''))).then(function (b) {
      return Array.from(new Uint8Array(b)).map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function unlock() {
    $('gate').hidden = true; $('content').hidden = false;
    try { sessionStorage.setItem('sb-merch', MERCH.codeHash); } catch (e) {}
  }
  var ok = !MERCH.codeHash;
  try { ok = ok || sessionStorage.getItem('sb-merch') === MERCH.codeHash; } catch (e) {}
  if (ok) unlock();
  else {
    var c = new URLSearchParams(location.search).get('code');
    if (c) sha(c).then(function (h) { if (h === MERCH.codeHash) unlock(); else $('gate-form').code.value = c; });
    $('gate-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      sha($('gate-form').code.value).then(function (h) {
        if (h === MERCH.codeHash) unlock(); else { $('gate-err').hidden = false; $('gate-form').code.select(); }
      });
    });
  }

  var q = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('sb-lang'); } catch (e) {}
  setLang(q === 'en' || q === 'de' ? q : saved || ((navigator.language || 'de').slice(0, 2) === 'de' ? 'de' : 'en'));
})();
