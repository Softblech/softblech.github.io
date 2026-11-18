/* Globale Navigation: rote Leiste ab dem ersten Scrollen, Burger-Menue auf dem Handy */
(function(){
  var t=document.querySelector('.top');if(!t)return;
  var w=t.querySelector('.wrap');
  function solid(){t.classList.toggle('solid',window.scrollY>40)}
  function h(){if(w)document.documentElement.style.setProperty('--nav-h',w.offsetHeight+'px')}
  solid();h();
  window.addEventListener('scroll',solid,{passive:true});
  window.addEventListener('resize',h);window.addEventListener('load',h);
  var b=document.getElementById('burger'),n=document.getElementById('mainnav');
  if(!b||!n)return;
  function set(o){n.classList.toggle('open',o);t.classList.toggle('menu',o);b.setAttribute('aria-expanded',o?'true':'false')}
  b.addEventListener('click',function(){set(!n.classList.contains('open'))});
  n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false)})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
})();
