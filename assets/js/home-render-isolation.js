/* v381-architecture-complete：首頁渲染隔離 */
(function(){
  if(window.__dreamHomeRenderIsolationV381) return;
  window.__dreamHomeRenderIsolationV381 = true;
  function page(){return (location.hash||"#home").replace(/^#/,"")||"home";}
  function isHome(){const p=page(); return p==="home"||p==="";}
  function clean(){
    if(!isHome()) return;
    const home=document.querySelector("#page-home");
    if(!home) return;
    home.querySelectorAll(".companion-card,[data-companion-id],[data-role='companion-card'],#companionGrid,[data-list='companions']").forEach(el=>{
      if(!el.closest("[data-home-ranking],.rank-scroll,.top3-stage,.top3-board")) el.remove();
    });
  }
  function boot(){clean();}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,80));
  else setTimeout(boot,80);
  window.addEventListener("hashchange",()=>setTimeout(boot,80));
  const mo=new MutationObserver(()=>{clearTimeout(boot._t); boot._t=setTimeout(clean,120);});
  if(document.documentElement) mo.observe(document.documentElement,{childList:true,subtree:true});
  window.DreamHomeRenderIsolationV381={clean};
})();
