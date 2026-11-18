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
  // Zugangscode: steht NICHT mehr hier, sondern nur im Google-Blatt "Einstellungen" (Zeile "Zugangscode").
  // Das Skript prüft ihn bei der Eingabe und bei jeder Bestellung.
  paypal: ''                   // leer = PayPal-Link steht nur in der Bestätigungsmail (Dennis 17.11.)
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
    ['strasse', 'plz', 'ort', 'land'].forEach(function (n) { form[n].required = shipping(); });
    $('m-title').textContent = MERCH.titel;
    $('m-price').textContent = eur(MERCH.preis);
    $('m-ship').textContent = MERCH.versand ? eur(MERCH.versand) + (en() ? ' per order (or free pick-up at a show)' : ' pro Bestellung (oder kostenlos beim Konzert abholen)') : (en() ? 'free' : 'kostenlos');
    $('m-ship-small').textContent = MERCH.versand ? '(+ ' + eur(MERCH.versand) + ')' : '';
    $('m-deadline-dt').hidden = $('m-deadline').hidden = !MERCH.bis;
    if (MERCH.bis) $('m-deadline').textContent = date(MERCH.bis);
    $('m-pay-note').textContent = en()
      ? 'After ordering you get an order number and the payment details by email. You pay via PayPal.'
      : 'Nach dem Absenden bekommst du deine Bestellnummer und die Zahlungsdetails per Mail. Bezahlt wird per PayPal.';
  }

  // Bilder-Karussell: wischen, auf das Bild tippen oder den roten Balken anklicken
  (function () {
    var track = $('track'), imgs = track.querySelectorAll('img'), bar = $('c-bar'), thumb = $('c-thumb'), n = imgs.length;
    var w = function () { return track.getBoundingClientRect().width || 1; };
    var idx = function () { return Math.round(track.scrollLeft / w()); };
    var go = function (i) { i = (i + n) % n; track.scrollTo({ left: imgs[i].offsetLeft - track.offsetLeft, behavior: 'smooth' }); };
    thumb.style.width = (100 / n) + '%';
    var move = function () {
      var max = track.scrollWidth - track.clientWidth, f = max > 0 ? track.scrollLeft / max : 0;
      thumb.style.transform = 'translateX(' + (f * (n - 1) * 100) + '%)';
      bar.setAttribute('aria-valuenow', idx() + 1);
    };
    bar.setAttribute('aria-valuemax', n);
    track.addEventListener('scroll', function () { window.requestAnimationFrame(move); }, { passive: true });
    track.addEventListener('click', function () { go(idx() + 1); });
    bar.addEventListener('click', function (e) { var r = bar.getBoundingClientRect(); go(Math.min(n - 1, Math.floor((e.clientX - r.left) / r.width * n))); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx() - 1); }
    });
    move();
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
    var leer = need.map(function (n) { return form[n]; }).filter(function (f) { return !f.value.trim(); });
    if (leer.length) {
      leer.forEach(function (f) { f.setAttribute('aria-invalid', 'true'); });
      return fail(en() ? 'Please fill in all fields marked with *. We need your address to send you the shirt.' : 'Bitte füll alle Felder mit * aus. Ohne Adresse können wir dir das Shirt nicht schicken.', leer[0]);
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
    data.append('code', code);

    if (!MERCH.endpoint) {
      // Testmodus: nichts wird gespeichert
      console.log('[Merch] Testmodus, es wurde nichts gespeichert:', Object.fromEntries(data));
      return success({ nr: 'SB-TEST', summe: total(k.n) });
    }

    var btn = $('submit'); btn.disabled = true;
    fetch(MERCH.endpoint, { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r.ok) { var x = new Error(r.error || 'Fehler'); x.code = r.error; throw x; }
        success(r);
        if (nl && !r.doppelt) newsletter();
      })
      .catch(function (err) {
        btn.disabled = false;
        var c = err && err.code;
        if (c === 'code' || c === 'gesperrt') return lock(c === 'gesperrt' ? 'gesperrt' : 'falsch');
        if (c === 'geschlossen') { form.hidden = true; $('m-closed').hidden = false; return; }
        if (c === 'limit') return fail(en() ? 'Too many orders right now. Please try again later or email us at hallo@softblech.com.'
                                            : 'Gerade kommen zu viele Bestellungen an. Versuch es bitte später noch einmal oder schreib uns an hallo@softblech.com.');
        fail(en() ? 'Sorry, that did not work. Please try again in a moment or email us at hallo@softblech.com.'
                  : 'Das hat leider nicht geklappt. Versuch es bitte gleich noch einmal oder schreib uns an hallo@softblech.com.');
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
      : (en() ? 'Total: ' + eur(r.summe) + '. You will find the payment details in your confirmation email.'
              : 'Betrag: ' + eur(r.summe) + '. Die Zahlungsdetails findest du in deiner Bestätigungsmail.');
    var u = paypalUrl();
    if (u) { $('d-paypal').href = u; $('d-paypal').hidden = false; }
    $('done').hidden = false; $('done').focus();
  }

  // Zugangscode-Abfrage: das Google-Skript prüft den Code (?code=... im Link schaltet direkt frei)
  var code = '';
  function unlock(c) {
    code = c; $('gate').hidden = true; $('content').hidden = false;
    try { sessionStorage.setItem('sb-merch-code', c); } catch (e) {}
  }
  function lock(why) {
    code = ''; try { sessionStorage.removeItem('sb-merch-code'); } catch (e) {}
    $('content').hidden = true; $('gate').hidden = false;
    var msg = {
      falsch: en() ? 'Sorry, that code is not right.' : 'Der Code stimmt leider nicht.',
      gesperrt: en() ? 'Too many wrong attempts. Please wait 10 minutes.' : 'Zu viele falsche Versuche. Bitte warte 10 Minuten.',
      geschlossen: en() ? 'Pre-orders are closed right now.' : 'Die Vorbestellung ist gerade geschlossen.',
      fehler: en() ? 'We could not check the code. Please try again in a moment.' : 'Der Code konnte gerade nicht geprüft werden. Versuch es bitte gleich noch einmal.'
    }[why];
    if (msg) { $('gate-err').textContent = msg; $('gate-err').hidden = false; }
  }
  function check(c) {
    c = String(c || '').trim();
    if (!c) return;
    if (!MERCH.endpoint) return unlock(c); // Testmodus
    var b = $('gate-form').querySelector('button'); b.disabled = true;
    fetch(MERCH.endpoint + '?code=' + encodeURIComponent(c))
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r.ok) unlock(c); else { lock(r.error === 'gesperrt' || r.error === 'geschlossen' ? r.error : 'falsch'); $('gate-form').code.value = c; $('gate-form').code.select(); } })
      .catch(function () { lock('fehler'); })
      .then(function () { b.disabled = false; });
  }
  var saved0 = null;
  try { saved0 = sessionStorage.getItem('sb-merch-code'); } catch (e) {}
  if (saved0) unlock(saved0);
  else {
    var c0 = new URLSearchParams(location.search).get('code');
    if (c0) check(c0);
  }
  $('gate-form').addEventListener('submit', function (ev) { ev.preventDefault(); check($('gate-form').code.value); });

  var q = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('sb-lang'); } catch (e) {}
  setLang(q === 'en' || q === 'de' ? q : saved || ((navigator.language || 'de').slice(0, 2) === 'de' ? 'de' : 'en'));
})();
