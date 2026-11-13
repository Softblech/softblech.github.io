/* Startbild: genau bis zum unteren Bildschirmrand (Header + Laufband abziehen) */
(function(){var h=document.getElementById('news');if(!h)return;
function f(){var t=h.getBoundingClientRect().top+window.scrollY;document.documentElement.style.setProperty('--hero-top',Math.round(t)+'px')}
f();window.addEventListener('resize',f);window.addEventListener('load',f);})();
