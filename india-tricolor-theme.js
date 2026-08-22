/* Optional premium India-inspired visual theme. Loaded independently so it can be removed without touching app logic. */
(function(){'use strict';
if(document.getElementById('india-tricolor-theme'))return;
var s=document.createElement('style');s.id='india-tricolor-theme';s.textContent=`
:root{--india-saffron:#FF9933;--india-green:#138808;--india-navy:#000080}
body:before{content:'';position:fixed;top:0;left:0;right:0;height:4px;z-index:9999;background:linear-gradient(90deg,var(--india-saffron) 0 33.33%,#fff 33.33% 66.66%,var(--india-green) 66.66% 100%)}
.top{border-bottom:1px solid rgba(19,136,8,.16);box-shadow:0 1px 0 rgba(255,153,51,.18)}
.top .brand strong,.top .brand b{color:#fff}.top .brand span{color:#b7c8ff}
#nav button.active{background:rgba(255,153,51,.13)!important;border-color:rgba(255,153,51,.28)!important;color:#9a5200!important;box-shadow:inset 0 -2px 0 var(--india-green)}
button.primary,#search{background:linear-gradient(135deg,var(--india-navy),#102a6b)!important;border-color:var(--india-navy)!important}
button.primary:hover,#search:hover{filter:brightness(1.08)}
#state{color:#dff7e5!important}#state:before{background:var(--india-green)!important}
.global-news-language select{border-color:rgba(255,153,51,.55)!important;box-shadow:0 0 0 2px rgba(19,136,8,.05)}
.global-news-language:after{content:'';width:6px;height:6px;border-radius:50%;background:var(--india-green);display:inline-block;order:-1}
.card,.story-card{border-color:rgba(0,0,128,.10)!important}.card:hover,.story-card:hover{border-color:rgba(255,153,51,.38)!important}
.explorer-title,.section-title{color:#172554!important}.chip.active{background:rgba(19,136,8,.10)!important;border-color:rgba(19,136,8,.28)!important;color:#0f6b07!important}
`;
document.head.appendChild(s);
})();