/* v424-badge-name-effect-split */
(function(){
  if(window.__dreamHomeRenderIsolationV384)return;window.__dreamHomeRenderIsolationV384=true;
  function page(){return(location.hash||"#home").replace(/^#/,"")||"home";}
  function clean(){const p=page();if(p!=="home"&&p!=="")return;const home=document.querySelector("#page-home");if(!home)return;const allowed=document.querySelector("#homeRecommendCompanions");home.querySelectorAll(".companion-card,[data-companion-id],[data-role='companion-card'],#companionGrid,[data-list='companions']").forEach(el=>{if(!allowed||!allowed.contains(el))el.remove();});}
  function boot(){clean();}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,80));else setTimeout(boot,80);window.addEventListener("hashchange",()=>setTimeout(boot,80));const mo=new MutationObserver(()=>{clearTimeout(boot._t);boot._t=setTimeout(clean,120);});if(document.documentElement)mo.observe(document.documentElement,{childList:true,subtree:true});window.DreamHomeRenderIsolationV384={clean};
})();


