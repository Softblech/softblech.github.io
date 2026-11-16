/* =====================================================================
   EINSTELLUNGEN FÜR DIE MERCH-VORBESTELLUNG
   Nur diesen Block ändern. Größen, Preis und Versand müssen genauso
   auch oben im Google-Skript (tools/merch/vorbestellung.gs) stehen.
   ===================================================================== */
var MERCH = {
  offen: true,                 // false = Formular aus, Hinweis "geschlossen"
  // Web-App-Adresse aus Google Apps Script (endet auf /exec). Leer = Testmodus.
  endpoint: '',
  titel: 'SOFTBLECH Shirt',
  bild: 'shirt-platzhalter.svg', // später z. B. 'shirt.jpg' in den Ordner merch/ legen
  preis: 25,                   // Euro pro Shirt (PLATZHALTER)
  versand: 5,                  // Euro pro Bestellung bei Versand (PLATZHALTER)
  groessen: ['S', 'M', 'L', 'XL', 'XXL'], // PLATZHALTER
  maxProGroesse: 10,
  bis: '',                     // z. B. '2026-12-15' (leer = ohne Datum)
  paypal: ''                   // z. B. 'https://paypal.me/softblech' oder 'softblech@gmail.com'
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
  function total(n) { return n * MERCH.preis + (n && shipping() ? MERCH.versand : 0); }

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
      ? 'After ordering you will get an order number and the PayPal details. Please pay within 7 days, stating your order number.'
      : 'Nach dem Absenden bekommst du eine Bestellnummer und die PayPal-Daten. Bitte zahl innerhalb von 7 Tagen und gib dabei deine Bestellnummer an.';
  }

  $('shirt-img').src = MERCH.bild;
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
      })
      .catch(function () {
        btn.disabled = false;
        fail(en() ? 'Sorry, that did not work. Please try again in a moment or email us at softblech@gmail.com.'
                  : 'Das hat leider nicht geklappt. Versuch es bitte gleich noch einmal oder schreib uns an softblech@gmail.com.');
      });
  });

  function success(r) {
    form.hidden = true;
    $('d-nr').textContent = r.nr;
    var p = MERCH.paypal || (en() ? '(PayPal address follows)' : '(PayPal-Adresse folgt)');
    $('d-pay').textContent = en()
      ? 'Please send ' + eur(r.summe) + ' via PayPal to ' + p + ' and write ' + r.nr + ' as the reference.'
      : 'Bitte überweise ' + eur(r.summe) + ' per PayPal an ' + p + ' und schreib ' + r.nr + ' in den Verwendungszweck.';
    var u = paypalUrl();
    if (u) { $('d-paypal').href = u.replace(/\/$/, '') + (/paypal\.me\//.test(u) ? '/' + String(r.summe).replace(',', '.') + 'EUR' : ''); $('d-paypal').hidden = false; }
    $('done').hidden = false; $('done').focus();
  }

  var q = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('sb-lang'); } catch (e) {}
  setLang(q === 'en' || q === 'de' ? q : saved || ((navigator.language || 'de').slice(0, 2) === 'de' ? 'de' : 'en'));
})();
