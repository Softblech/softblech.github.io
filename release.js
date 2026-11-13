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
  var ok=false;try{ok=(JSON.parse(localStorage.getItem('sb-consent-v1'))||{}).media}catch(e){}
  if(ok) load(); else document.getElementById('loadplayer').onclick=load;

  function toast(t){var d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},2200)}
  document.getElementById('share').onclick=function(){
    var u=location.origin+location.pathname;
    if(navigator.share){navigator.share({title:document.title,url:u}).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){toast(root.dataset.lang==='en'?'Link copied':'Link kopiert')})}
  };
})();
