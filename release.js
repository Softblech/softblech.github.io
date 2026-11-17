(function(){
  var root=document.documentElement;
  function setLang(l){root.dataset.lang=l;root.lang=l;
    document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.lang===l)});
    try{localStorage.setItem('sb-lang',l)}catch(e){}}
  var q=new URLSearchParams(location.search).get('lang'),saved=null;
  try{saved=localStorage.getItem('sb-lang')}catch(e){}
  setLang(q==='en'||q==='de'?q:saved||((navigator.language||'de').slice(0,2)==='de'?'de':'en'));
  document.querySelectorAll('.lang button').forEach(function(b){b.onclick=function(){setLang(b.dataset.lang)}});

  var p=document.getElementById('player');
  function load(){p.innerHTML='<iframe src="'+p.dataset.src+'" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Spotify"></iframe>'}
  /* Cookie-Banner (gleiche Auswahl wie auf der Startseite, Schlüssel sb-consent-v1) */
  var KEY='sb-consent-v1',consent=null,bar=null;
  try{consent=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  function apply(){
    if(consent&&consent.media) load(); else document.getElementById('loadplayer').onclick=load;
    if(window.sbMetaPixel) sbMetaPixel.apply(consent);
  }
  function save(c){consent=c;try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){} if(bar){bar.remove();bar=null} apply()}
  function openBar(choose){
    if(bar) return;
    bar=document.createElement('div');bar.className='cookie';bar.setAttribute('role','dialog');bar.setAttribute('aria-label','Cookies');
    bar.innerHTML='<div class="wrap"><div class="txt"><b><span data-l="de">Cookies &amp; externe Inhalte</span><span data-l="en">Cookies &amp; external content</span></b>'+
      '<p><span data-l="de">Wir möchten Spotify direkt hier zeigen und mit dem Meta Pixel messen, ob unsere Instagram- und Facebook-Werbung ankommt. Dabei gehen Daten an Spotify und Meta, aber nur, wenn du zustimmst.</span><span data-l="en">We would like to show Spotify right here and use the Meta Pixel to see whether our Instagram and Facebook ads work. This sends data to Spotify and Meta, but only if you agree.</span> <a href="../datenschutz.html">Datenschutz</a></p>'+
      '<div class="opts"'+(choose?'':' hidden')+'><label><input type="checkbox" checked disabled> <span data-l="de">Notwendig</span><span data-l="en">Necessary</span></label>'+
      '<label><input type="checkbox" class="c-media"> <span data-l="de">Externe Medien (Spotify)</span><span data-l="en">External media (Spotify)</span></label>'+
      '<label><input type="checkbox" class="c-mkt"> Marketing (Meta Pixel)</label></div></div>'+
      '<div class="btns"><button class="btn solid" type="button" data-c="all"><span data-l="de">Alle akzeptieren</span><span data-l="en">Accept all</span></button>'+
      '<button class="btn ghost" type="button" data-c="none"><span data-l="de">Nur notwendige</span><span data-l="en">Necessary only</span></button>'+
      '<button class="btn ghost" type="button" data-c="choose"'+(choose?' hidden':'')+'><span data-l="de">Auswählen</span><span data-l="en">Choose</span></button>'+
      '<button class="btn ghost" type="button" data-c="save"'+(choose?'':' hidden')+'><span data-l="de">Auswahl speichern</span><span data-l="en">Save choice</span></button></div></div>';
    var cM=bar.querySelector('.c-media'),cK=bar.querySelector('.c-mkt'),st=consent?!!consent.stats:false;
    if(consent){cM.checked=!!consent.media;cK.checked=!!consent.marketing}
    bar.querySelector('[data-c=all]').onclick=function(){save({media:true,stats:st,marketing:true})};
    bar.querySelector('[data-c=none]').onclick=function(){save({media:false,stats:false,marketing:false})};
    bar.querySelector('[data-c=choose]').onclick=function(){bar.querySelector('.opts').hidden=false;this.hidden=true;bar.querySelector('[data-c=save]').hidden=false};
    bar.querySelector('[data-c=save]').onclick=function(){save({media:cM.checked,stats:st,marketing:cK.checked})};
    document.body.appendChild(bar);
  }
  apply();
  if(!consent||!('marketing' in consent)) openBar(false);
  document.querySelectorAll('[data-open-cookies]').forEach(function(b){b.onclick=function(){openBar(true)}});

  /* Klicks auf Spotify / Apple Music / YouTube an den Meta Pixel melden (nur mit Zustimmung) */
  document.querySelectorAll('.rhero a[href^="https://"]').forEach(function(a){
    a.addEventListener('click',function(){
      var h=a.hostname.replace(/^www\./,''),pf=/spotify/.test(h)?'Spotify':/apple/.test(h)?'Apple Music':/youtube/.test(h)?'YouTube':h;
      if(window.sbMetaPixel) sbMetaPixel.track('StreamingKlick',{plattform:pf,song:document.title.split(' · ')[0]},true);
    });
  });

  function toast(t){var d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},2200)}
  document.getElementById('share').onclick=function(){
    var u=location.origin+location.pathname;
    if(navigator.share){navigator.share({title:document.title,url:u}).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){toast(root.dataset.lang==='en'?'Link copied':'Link kopiert')})}
  };
})();
