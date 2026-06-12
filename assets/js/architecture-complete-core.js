/* v443-route-integrity */
(function(){
  if(window.__dreamArchitectureCoreV443) return;
  window.__dreamArchitectureCoreV443 = true;

  function page(){
    return (location.hash || "#home").replace(/^#/, "") || "home";
  }

  function isLoginPage(){
    const current = page();
    return current === "login" || current === "register" || current === "forgot";
  }

  function isLoggedIn(){
    try{
      if(window.__dreamFrontAuth && window.__dreamFrontAuth.user) return true;
    }catch(e){}
    return document.body.classList.contains("dream-authenticated") &&
      !document.body.classList.contains("dream-guest");
  }

  function go(target){
    try{
      if(typeof window.showPage === "function"){
        window.showPage(target);
        return;
      }
    }catch(e){}
    location.hash = "#" + target;
  }

  function toast(message){
    let el = document.getElementById("dreamArchToastV443");
    if(!el){
      el = document.createElement("div");
      el.id = "dreamArchToastV443";
      el.style.cssText = "position:fixed;left:50%;bottom:112px;transform:translateX(-50%);z-index:2147483600;max-width:88%;padding:12px 16px;border-radius:16px;background:rgba(72,28,50,.96);color:#fff;font-size:14px;font-weight:900;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.38);";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = "1";
    clearTimeout(el._t);
    el._t = setTimeout(()=>el.style.opacity="0", 1800);
  }

  function ownCenter(){
    let role = "";
    try{
      const auth = window.__dreamFrontAuth || {};
      const user = auth.user || {};
      role = String(
        auth.type || auth.role || user.role || user.type ||
        localStorage.getItem("dream_persist_login_type") || ""
      ).toLowerCase();
    }catch(e){}
    return role.includes("companion") || role.includes("playmate") ? "companion-home" : "member";
  }

  function backTarget(back){
    const current = page();
    if(current === "profile"){
      const profile = document.getElementById("page-profile");
      if(profile && profile.dataset.publicProfile === "1"){
        return profile.dataset.publicProfileReturn || back.dataset.go || "home";
      }
      return ownCenter();
    }

    if(current === "forgot" && !isLoggedIn()) return "login";

    const explicit = String(back.dataset.go || "").replace(/^#/, "");
    if(explicit) return explicit;

    try{
      const serviceOrigin = sessionStorage.getItem("dream_service_origin_" + current);
      if(serviceOrigin === "member" || serviceOrigin === "companion-home") return serviceOrigin;
      const previous = sessionStorage.getItem("dream_prev_page");
      if(previous && previous !== current) return previous;
    }catch(e){}

    return "home";
  }

  document.addEventListener("click", function(e){
    const back = e.target.closest && e.target.closest(".back-btn,[data-back],[data-action='back']");
    if(back){
      const target = backTarget(back);
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if(page() === "profile"){
        try{
          const close = window.DreamClosePublicProfileV443;
          if(typeof close === "function") close();
        }catch(err){}
      }

      go(target);
      return false;
    }

    const logout = e.target.closest && e.target.closest("[data-action='logout'],[data-logout],.logout-btn");
    if(logout){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      logout.textContent = "正在登出...";
      const action = localStorage.getItem("dream_persist_login_type") === "companion" ? "companion_logout" : "logout";
      fetch((window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php", {
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action})
      }).catch(()=>{}).finally(()=>{
        ["dream_persist_user","dream_persist_login_type","dream_login_keep","dream_permanent_login"].forEach(key=>{
          try{ localStorage.removeItem(key); }catch(e){}
        });
        document.body.classList.remove("dream-authenticated");
        document.body.classList.add("dream-guest");
        logout.textContent = "登出";
        toast("已登出");
        go("login");
      });
      return false;
    }
  }, true);

  const PUBLIC = new Set(["home","login","register","forgot","companion","inn","market","market-rules"]);

  function isolate(){
    const current = page();
    const home = document.querySelector("#page-home");
    if(home){
      home.querySelectorAll(".companion-card,[data-companion-id],[data-role='companion-card'],#companionGrid,[data-list='companions']").forEach(el=>{
        if(!el.closest("[data-home-ranking],.top3-stage,.rank-scroll,.top3-board")) el.remove();
      });
    }
    document.body.classList.toggle("dream-login-page", isLoginPage());
    if(!PUBLIC.has(current) && !isLoggedIn()){
      toast("請先登入後再使用");
      go("login");
    }
  }

  function boot(){
    isolate();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", ()=>setTimeout(boot, 80));
  else setTimeout(boot, 80);
  window.addEventListener("hashchange", ()=>setTimeout(boot, 80));
  const observer = new MutationObserver(()=>{
    clearTimeout(boot._t);
    boot._t = setTimeout(isolate, 120);
  });
  if(document.documentElement) observer.observe(document.documentElement, {childList:true,subtree:true});
  window.DreamArchitectureV443 = {page,isLoginPage,isLoggedIn,go,isolate,backTarget};
  window.DreamArchitectureV384 = window.DreamArchitectureV443;
})();
