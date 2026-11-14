/* DE | EN Umschalter für die Startseite.
   Übersetzt sichtbare Texte über ein Wörterbuch (DE -> EN), auch nachgeladene Inhalte.
   Neue Texte auf der Seite: hier unten in D ergänzen. */
(function(){
  var D={
    "Menü":"Menu","Musik":"Music","Fotos":"Photos","Presse":"Press","Kontakt":"Contact",
    "I Want To Be With You – die neue Single – out now":"I Want To Be With You – the new single – out now",
    "Post Wave aus Berlin":"Post wave from Berlin",
    "Zum Song":"Listen","Abspielen":"Play","Mehr zum Song":"More about the song","Reinhören":"Listen",
    "Neue Single":"New single","Debütsingle":"Debut single","Debüt":"Debut","2024 · Debüt":"2024 · Debut",
    "Ein Song über die Sehnsucht nach dem, was man nicht hat, selbst wenn man festhält, was man hat. Über Einsamkeit, die nicht verschwindet, nur weil jemand neben einem liegt.":
      "A song about longing for what you don't have, even when you're holding on to what you do. About a loneliness that doesn't go away just because someone is lying next to you.",
    "Nichts verpassen":"Don't miss a thing","Eintragen":"Sign up","Alle Termine":"All dates","Infos":"Info",
    "Freitag, ab 19 Uhr · Eintritt auf Spendenbasis":"Friday, from 7 pm · Pay what you can",
    "Bisher auf der Bühne":"Past shows","Foto:":"Photo:","Fotos:":"Photos:",
    "Valentin Stüberl, Berlin · Release-Show":"Valentin Stüberl, Berlin · Release show",
    "Kantine am Berghain, Berlin":"Berghain Kantine, Berlin",
    "SOFTBLECH sind ein Post-Wave-Duo aus Berlin. Post Wave liegt genau zwischen Post-Punk und Dark Wave: irgendwo zwischen The Cure und Fontaines D.C.":
      "SOFTBLECH are a post wave duo from Berlin. Post wave sits at the intersection of post punk and dark wave: somewhere between The Cure and Fontaines D.C.",
    "Sie schreiben von innen nach außen. Ihre Songs versuchen nicht, schwierige Gefühle zu erklären, sondern ehrlich in ihnen zu bleiben. Trennungen, Zweifel, Liebe, die ihre Form verändert, die Angst, jemanden ein zweites Mal zu verlieren.":
      "They write from the inside out. Their songs don't try to make sense of difficult emotions, they try to stay honest inside them. Breakups, doubt, love that changes shape, the fear of losing someone twice over.",
    "Als Duo ohne Schlagzeuger haben sie aus der Not eine Tugend gemacht: Die Drum Machine ist kein Kompromiss, sondern ihre Handschrift. Seit ihrer Gründung 2024 in Hamburg haben SOFTBLECH eine ganze Reihe von Singles veröffentlicht. Ihre Debütsingle „Love Me Now“ lief im Podcast „Fest & Flauschig“. Ihre Musik wurde mehr als 215.000 Mal gestreamt.":
      "As a duo without a drummer, they turned necessity into a sound: the drum machine is no compromise but their signature. Since forming in Hamburg in 2024, SOFTBLECH have released a steady run of singles. Their debut single \"Love Me Now\" was played on the podcast \"Fest & Flauschig\". So far, their music has been streamed more than 215,000 times.",
    "Bass, Gesang":"Bass, vocals","Gitarre, Gesang":"Guitar, vocals",
    "Mit uns gearbeitet haben":"People we've worked with","Produktion":"Production","Fotos & Cover":"Photos & cover","Stimme":"Voice",
    "@softblech auf Instagram":"@softblech on Instagram",
    "Pressefotos & Presskit":"Press photos & press kit",
    "Stay close. Neue Songs, Konzerttermine und kleine Einblicke hinter die Kulissen. Kein Spam, nur ab und zu eine Mail.":"Stay close. New songs, tour dates and little glimpses behind the scenes. No spam, just an email every now and then.",
    "Presskit":"Press kit",
    "Kurzbio":"Short bio",
    "Lange Bio lesen":"Read the full bio",
    "Presskit & Pressefotos":"Press kit & press photos",
    "Fotos ansehen":"See photos",
    "Für Veranstalter":"For promoters",
    "2 Musiker + DJ (Backing Tracks vom Laptop)":"2 musicians + DJ (backing tracks from a laptop)",
    "Gitarre und Bass über Amp-Modeler direkt ins Pult":"Guitar and bass via amp modelers straight into the desk",
    "2 Gesangsmikrofone, 1 bis 3 Monitore":"2 vocal mics, 1 to 3 monitors",
    "Hoher Tisch mit Strom für den DJ":"High table with power for the DJ",
    "Laptop und Audio-Interface bringen wir selbst mit":"We bring our own laptop and audio interface",
    "Den vollständigen Technical Rider schicken wir gern mit.":"We're happy to send the full technical rider.",
    "Booking anfragen":"Booking request",
    "Hohe Auflösung · Google Drive":"High resolution · Google Drive",
    "PDF · Bio, Fakten, Releases, Presse":"PDF · Bio, facts, releases, press",
    "PDF · Für Veranstalter":"PDF · For promoters",
    "Technical Rider":"Technical rider",
    "Booking & Kontakt":"Booking & contact",
    "Bio, Fakten, Releases, Presse und Kontakte auf zwei Seiten.":"Bio, facts, releases, press and contacts on two pages.",
    "Presskit (PDF)":"Press kit (PDF)",
    "Technical Rider (PDF)":"Technical rider (PDF)",
    "Mehr über uns":"More about us",
    "Pressefotos":"Press photos",
    "Für Presse und alles andere. Wir antworten persönlich.":"For press and everything else. We answer personally.",
    "Ihr wollt uns live erleben, in eurem Club oder auf eurem Festival?":"Want us to play your club or festival?",
    "Booking & Technik":"Booking & tech",
    "Anhören":"Listen",
    "Player schließen":"Close player",
    "SOFTBLECH sind ein Post-Wave-Duo aus Berlin. Zwischen The Cure und Fontaines D.C. schichten Dennis Hörtinger (Bass/Gesang) und Henri Röttger (Gitarre/Gesang) E-Bass und Gitarre über treibende Drum-Machine-Beats und schreiben Songs, die ehrlich in schwierigen Gefühlen bleiben.":"SOFTBLECH are a post wave duo from Berlin. Between The Cure and Fontaines D.C., Dennis Hörtinger (bass/vocals) and Henri Röttger (guitar/vocals) layer electric bass and guitar over driving drum machine beats and write songs that stay honest inside difficult emotions.",
    "SOFTBLECH sind ein Post-Wave-Duo aus Berlin: Dennis Hörtinger (Bass/Gesang) und Henri Röttger (Gitarre/Gesang). Post Wave liegt genau zwischen Post-Punk und Dark Wave: irgendwo zwischen The Cure und Fontaines D.C. Sie schreiben über das, was sie tief bewegt, und schichten E-Bass und Gitarre über treibende Drum-Machine-Beats.":"SOFTBLECH are a post wave duo from Berlin: Dennis Hörtinger (bass/vocals) and Henri Röttger (guitar/vocals). Post wave sits at the intersection of post punk and dark wave: somewhere between The Cure and Fontaines D.C., writing about the things that move them deeply, layering electric bass and guitar over driving drum machine beats.",
    "Sie schreiben von innen nach außen. Ihre Songs versuchen nicht, schwierige Gefühle zu erklären, sondern ehrlich in ihnen zu bleiben. Trennungen, Zweifel, Liebe, die ihre Form verändert, die Angst, jemanden ein zweites Mal zu verlieren. Gefühle, die sich nur schwer in Worte fassen lassen, und genau deshalb versuchen sie es immer wieder.":"They write from the inside out. Their songs don't try to make sense of difficult emotions, they try to stay honest inside them. Breakups, doubt, love that changes shape, the fear of losing someone twice over. The kind of feelings that resist being put into words, which is exactly why they keep trying.",
    "Als Duo ohne Schlagzeuger haben sie aus der Not eine Tugend gemacht: Die Drum Machine ist kein Kompromiss, sondern ihre Handschrift. Seit ihrer Gründung 2024 in Hamburg haben SOFTBLECH eine ganze Reihe von Singles veröffentlicht, produziert mit Leon Kaack, Birk Buttchereyt, Lukas Kurz und Arne Schramm. Ihre Debütsingle „Love Me Now“ lief im Podcast „Fest & Flauschig“. Bisher wurde ihre Musik mehr als 215.000 Mal gestreamt und auf Spotify in über 1.500 Playlists aufgenommen. Sie standen mit Night Tapes (Urban Spree, Berlin), Dews Pegahorn (Lark, Berlin & Hebebühne, Hamburg), WU LYF (Lido, Berlin), Day We Ran (Privatclub, Berlin) und Tauchen auf der Bühne und spielten in der Kantine am Berghain.":"As a duo without a drummer, they turned necessity into a sound: the drum machine is no compromise but their signature. Since forming in Hamburg in 2024, SOFTBLECH have released a steady run of singles, produced together with Leon Kaack, Birk Buttchereyt, Lukas Kurz and Arne Schramm. Their debut single \"Love Me Now\" was played on the podcast \"Fest & Flauschig\". So far, their music has been streamed more than 215,000 times and added to over 1,500 playlists on Spotify. They have shared stages with Night Tapes (Urban Spree, Berlin), Dews Pegahorn (Lark, Berlin & Hebebühne, Hamburg), WU LYF (Lido, Berlin), Day We Ran (Privatclub, Berlin) and Tauchen, and played Berghain Kantine.",
    "Neben diesen Support-Slots haben SOFTBLECH in Berliner Bars mehrere eigene Indie-Abende veranstaltet und als Headliner gespielt, jedes Mal vor vollem Haus. Daraus ist eine kleine, treue Fanbase gewachsen, die die Songs kennt und immer wieder zu ihren Konzerten kommt.":"Alongside these support slots, SOFTBLECH have organised and headlined several indie nights of their own in Berlin bars, each of them playing to a full room. Over time, this has grown into a small, loyal following that knows the songs and keeps coming back to their shows.",
    "E-Mail":"Email","Vorname":"First name","Anmelden":"Subscribe",
    "Ich möchte den Newsletter von SOFTBLECH per E-Mail bekommen. Ich kann mich jederzeit über den Link in jeder Mail wieder abmelden. Mehr dazu in der":
      "I'd like to receive the SOFTBLECH newsletter by email. I can unsubscribe at any time using the link in every email. More in the",
    "Datenschutzerklärung":"privacy policy",
    "Bitte gib eine gültige E-Mail-Adresse ein.":"Please enter a valid email address.",
    "Bitte gib deinen Vornamen ein.":"Please enter your first name.",
    "Bitte setz noch das Häkchen.":"Please tick the box.",
    "Danke! Bitte bestätige die Anmeldung über den Link in der Mail, die wir dir gerade schicken.":"Thank you! Please confirm your subscription via the link in the email we're sending you now.",
    "Für Booking, Presse und alles andere. Wir antworten persönlich.":"For booking, press and everything else. We reply personally.",
    "Mail schreiben":"Write us","Impressum":"Legal notice","Datenschutz":"Privacy","Cookie-Einstellungen":"Cookie settings",
    "Cookies & externe Inhalte":"Cookies & external content",
    "Wir möchten Besuche zählen und Spotify und YouTube direkt hier zeigen. Dabei gehen Daten an Google und Spotify, aber nur, wenn du zustimmst.":
      "We'd like to count visits and show Spotify and YouTube right here. This sends data to Google and Spotify, but only if you agree.",
    "Notwendig":"Necessary","Externe Medien (Spotify, YouTube)":"External media (Spotify, YouTube)","Statistik (Google Analytics)":"Statistics (Google Analytics)",
    "Alle akzeptieren":"Accept all","Nur notwendige":"Necessary only","Auswählen":"Choose","Auswahl speichern":"Save choice",
    "Alle Videos auf YouTube":"All videos on YouTube","Spotify laden":"Load Spotify","YouTube laden":"Load YouTube",
    "du@beispiel.de":"you@example.com"
  };
  var MON={"Januar":"January","Februar":"February","März":"March","April":"April","Mai":"May","Juni":"June","Juli":"July","August":"August","September":"September","Oktober":"October","November":"November","Dezember":"December"};
  var MS={"Jan.":"Jan","Feb.":"Feb","März":"Mar","Apr.":"Apr","Mai":"May","Juni":"Jun","Juli":"Jul","Aug.":"Aug","Sep.":"Sep","Okt.":"Oct","Nov.":"Nov","Dez.":"Dec"};
  var MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var DAY={"Montag":"Monday","Dienstag":"Tuesday","Mittwoch":"Wednesday","Donnerstag":"Thursday","Freitag":"Friday","Samstag":"Saturday","Sonntag":"Sunday"};
  var C={"Deutschland":"Germany","Österreich":"Austria","Schweiz":"Switzerland","Niederlande":"Netherlands","Dänemark":"Denmark","Frankreich":"France","Polen":"Poland","Belgien":"Belgium","Tschechien":"Czech Republic","Großbritannien":"United Kingdom"};
  function rules(t){
    var o=t;
    t=t.replace(/^Neue Single · /,'New single · ').replace(/^Nächstes Konzert · /,'Next show · ');
    t=t.replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/g,function(_,d,m,y){return MN[+m-1]+' '+(+d)+', '+y});
    t=t.replace(/(\d{1,2})\. (Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) (\d{4})/g,function(_,d,m,y){return MON[m]+' '+d+', '+y});
    t=t.replace(/(\d{1,2})\. (Jan\.|Feb\.|März|Apr\.|Mai|Juni|Juli|Aug\.|Sep\.|Okt\.|Nov\.|Dez\.) (\d{4})/g,function(_,d,m,y){return MS[m]+' '+d+', '+y});
    t=t.replace(/^(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)(, (\d\d):(\d\d) Uhr)?$/,function(_,w,x,h,mi){return DAY[w]+(x?', '+h+':'+mi:'')});
    t=t.replace(/ · mit /,' · with ').replace(/^Foto: /,'Photo: ').replace(/^Fotos: /,'Photos: ');
    t=t.replace(/, (Deutschland|Österreich|Schweiz|Niederlande|Dänemark|Frankreich|Polen|Belgien|Tschechien|Großbritannien)$/,function(_,c){return ', '+C[c]});
    t=t.replace(/^Hier wird ein Player von (\w+) angezeigt\. Beim Laden werden Daten an \w+ übertragen\.$/,'This shows a $1 player. Loading it sends data to $1.');
    if(MS[t]) t=MS[t];
    return t===o?null:t;
  }
  function en(t){var k=t.trim(); if(!k) return null; var v=D[k]!=null?D[k]:rules(k); return v==null?null:t.replace(k,v)}
  var lang='de', busy=false;
  function doNode(n){
    if(n.nodeType===3){
      var p=n.parentNode; if(!p||/^(SCRIPT|STYLE)$/.test(p.nodeName)) return;
      if(lang==='en'){ if(n._en!==n.nodeValue){ var v=en(n.nodeValue); if(v!=null){n._de=n.nodeValue;n._en=v;n.nodeValue=v} } }
      else if(n._de!=null && n.nodeValue===n._en){ n.nodeValue=n._de; n._en=null; n._de=null }
    } else if(n.nodeType===1){
      if(n.placeholder){ if(lang==='en'){var v=D[n.placeholder]; if(v){n._dph=n.placeholder;n.placeholder=v}} else if(n._dph){n.placeholder=n._dph;n._dph=null} }
      for(var c=n.firstChild;c;c=c.nextSibling) doNode(c);
    }
  }
  function apply(){busy=true;doNode(document.body);busy=false}
  new MutationObserver(function(ms){ if(busy||lang==='de') return; busy=true;
    ms.forEach(function(m){ if(m.type==='characterData') doNode(m.target); else m.addedNodes.forEach(doNode) }); busy=false;
  }).observe(document.body,{childList:true,subtree:true,characterData:true});
  function setLang(l){
    lang=l; document.documentElement.lang=l; apply();
    document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lang===l))});
    var loc=document.querySelector('#nl-form input[name=locale]'); if(loc) loc.value=l;
    try{localStorage.setItem('sb-lang',l)}catch(e){}
  }
  fetch('data/songs.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(s){
    Object.keys(s||{}).forEach(function(k){ if(s[k].text&&s[k].text_en) D[s[k].text]=s[k].text_en });
    if(lang==='en') apply();
  }).catch(function(){});
  var q=new URLSearchParams(location.search).get('lang'),saved=null;
  try{saved=localStorage.getItem('sb-lang')}catch(e){}
  document.querySelectorAll('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang)})});
  setLang(q==='en'||q==='de'?q:saved||((navigator.language||'de').slice(0,2)==='de'?'de':'en'));
})();
