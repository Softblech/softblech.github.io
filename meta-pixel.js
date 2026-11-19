/* ===== META PIXEL – nur hier die Pixel-ID eintragen ===== */
/* Zu finden im Meta Events Manager unter "Datenquellen": die lange Zahl (15–16 Ziffern). */
var SB_META_PIXEL_ID = "29551118357818193";   /* z. B. "1234567890123456" – leer = Pixel ist aus */
/* ======================================================== */

/* Der Pixel lädt NUR, wenn im Cookie-Banner "Marketing" erlaubt wurde. */
window.sbMetaPixel = (function(){
  var loaded = false;
  function load(){
    if (loaded || !/^\d{8,20}$/.test(SB_META_PIXEL_ID)) return;
    loaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', SB_META_PIXEL_ID);
    fbq('track', 'PageView');
  }
  return {
    /* consent = gespeicherte Auswahl aus dem Cookie-Banner */
    apply: function(consent){
      if (consent && consent.marketing) load();
      else if (loaded) location.reload();   /* Zustimmung zurückgenommen: Pixel sofort entfernen */
    },
    /* Ereignis melden (passiert nur, wenn der Pixel geladen ist) */
    track: function(name, data, custom){
      if (!loaded || !window.fbq) return;
      fbq(custom ? 'trackCustom' : 'track', name, data || {});
    }
  };
})();
