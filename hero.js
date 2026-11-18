/* Startbild: genau bis zum unteren Bildschirmrand (Header + Laufband abziehen) */
(function(){var h=document.getElementById('news');if(!h)return;
function f(){var t=h.getBoundingClientRect().top+window.scrollY;document.documentElement.style.setProperty('--hero-top',Math.round(t)+'px');var m=document.querySelector('main .marquee');if(m)document.documentElement.style.setProperty('--mqh',m.offsetHeight+'px')}
f();window.addEventListener('resize',f);window.addEventListener('load',f);})();

/* Desktop: Navigation oben transparent, ab dem ersten Scrollen rot */
(function(){var t=document.querySelector('.top');if(!t)return;
function s(){t.classList.toggle('solid',window.scrollY>40)}
s();window.addEventListener('scroll',s,{passive:true});})();
