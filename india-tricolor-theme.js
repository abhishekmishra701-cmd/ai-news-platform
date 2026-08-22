/* Premium India-inspired visual experiment — intentionally visible but not overpowering. */
(function(){'use strict';
var id='india-tricolor-theme';
var old=document.getElementById(id); if(old) old.remove();
var s=document.createElement('style');s.id=id;s.textContent=`
:root{--india-saffron:#FF9933;--india-green:#138808;--india-navy:#0A1F44;--india-white:#FFFDF8}
html{background:var(--india-white)!important}
body{background:linear-gradient(180deg,#fffdf8 0%,#f7f9fc 58%,#f3f7f2 100%)!important}
body:before{content:'';position:fixed;top:0;left:0;right:0;height:6px;z-index:2147483647;background:linear-gradient(90deg,var(--india-saffron) 0 33.333%,#fff 33.333% 66.666%,var(--india-green) 66.666% 100%);box-shadow:0 1px 5px rgba(10,31,68,.22)}
.top{background:linear-gradient(90deg,#071a38 0%,var(--india-navy) 52%,#071a38 100%)!important;border-bottom:3px solid transparent!important;border-image:linear-gradient(90deg,var(--india-saffron),#fff,var(--india-green)) 1!important;box-shadow:0 3px 16px rgba(10,31,68,.18)!important}
.top .brand strong,.top .brand b{color:#fff!important}.top .brand span{color:#ffd7aa!important}
#nav{background:rgba(255,255,255,.94)!important;border-bottom:1px solid rgba(10,31,68,.10)!important}
#nav button.active{background:linear-gradient(135deg,rgba(255,153,51,.18),rgba(19,136,8,.12))!important;border-color:rgba(255,153,51,.38)!important;color:var(--india-navy)!important;box-shadow:inset 0 -3px 0 var(--india-green)!important}
#nav button:hover{border-color:rgba(255,153,51,.45)!important}
button.primary,#search{background:linear-gradient(135deg,var(--india-navy),#153b79)!important;border-color:var(--india-navy)!important}
#state{color:#dff7e5!important}#state:before{background:var(--india-green)!important}
.global-news-language select{background:#fff!important;border:2px solid var(--india-saffron)!important;box-shadow:0 0 0 3px rgba(19,136,8,.08)!important}
.global-news-language{padding-left:10px;border-left:3px solid var(--india-green)!important}
.card,.story-card{border-color:rgba(10,31,68,.13)!important}.card:hover,.story-card:hover{border-color:var(--india-saffron)!important;box-shadow:0 10px 24px rgba(10,31,68,.08)!important}
.explorer-title,.section-title{color:var(--india-navy)!important}.chip.active{background:rgba(19,136,8,.12)!important;border-color:rgba(19,136,8,.38)!important;color:#0d6506!important}
`;
document.head.appendChild(s);
})();