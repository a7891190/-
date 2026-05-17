/* v381-architecture-complete：API 穩定器 */
(function(){
  if(window.__dreamFrontApiStabilizerV381) return;
  window.__dreamFrontApiStabilizerV381 = true;

  const CACHE_TTL = {
    session:30000, companion_session:30000,
    vip_ranking:300000, front_ranking_snapshot:300000,
    inn_post_list:60000, bullet_event_list:60000,
    shop_list:300000, companion_front_list:120000,
    recharge_request_history:60000, gift_history:60000, exchange_history:60000
  };
  const BACKGROUND_ACTIONS = new Set(Object.keys(CACHE_TTL));
  const PRIVATE_ACTIONS = new Set(["recharge_request_history","gift_history","exchange_history","member_profile","support_messages","notification_list","front_event_notifications_list"]);
  const inFlight = new Map();
  const memoryCache = new Map();

  function apiUrl(){try{return (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php";}catch(e){return "https://api.131rwjuh.com/api.php";}}
  function currentPage(){return (location.hash || "#home").replace(/^#/,"") || "home";}
  function isLoginPage(){const p=currentPage(); return p==="login" || p==="register" || p==="forgot";}
  function isLoggedIn(){
    try{
      const keep = localStorage.getItem("dream_login_keep")==="1" || localStorage.getItem("dream_permanent_login")==="1";
      const user = localStorage.getItem("dream_persist_user");
      if(keep && user && user !== "null" && user !== "{}") return true;
    }catch(e){}
    try{return document.body.classList.contains("dream-authenticated") && !document.body.classList.contains("dream-guest");}catch(e){}
    return false;
  }
  function shouldDefer(action){
    if(isLoginPage() && !["login","member_login","companion_login","register","request_reset","renew","session","companion_session"].includes(action)) return true;
    if(PRIVATE_ACTIONS.has(action) && !isLoggedIn()) return true;
    const p=currentPage();
    if(action==="inn_post_list" && p!=="inn") return true;
    if(action==="shop_list" && !["market","shop","mall"].includes(p)) return true;
    return false;
  }
  function empty(action,msg){
    if(action==="session" || action==="companion_session") return {ok:true, logged_in:isLoggedIn(), offline:true, message:msg||""};
    if(action==="vip_ranking") return {ok:true, ranking:[], list:[], data:[], offline:true};
    if(action==="front_ranking_snapshot") return {ok:true, activity:{items:[]}, vip:{ranking:[]}, offline:true};
    if(action==="inn_post_list") return {ok:true, posts:[], list:[], data:[], offline:true};
    if(action==="bullet_event_list") return {ok:true, events:[], offline:true};
    if(action==="shop_list") return {ok:true, items:[], products:[], list:[], data:[], offline:true};
    if(action==="companion_front_list") return {ok:true, companions:[], list:[], data:[], offline:true};
    if(action==="recharge_request_history" || action==="gift_history" || action==="exchange_history") return {ok:true, records:[], history:[], list:[], data:[], offline:true};
    return {ok:false, message:msg||"連線暫時失敗", offline:true};
  }
  function key(action,payload){const p=Object.assign({},payload||{}); delete p._t; delete p.nonce; return action+":"+JSON.stringify(p);}
  function getCache(action,k){
    const ttl=CACHE_TTL[action]||0; if(!ttl) return null;
    const mem=memoryCache.get(k); if(mem && Date.now()-mem.time<ttl) return mem.data;
    try{const raw=sessionStorage.getItem("dream_api_cache_v381_"+k); if(raw){const obj=JSON.parse(raw); if(obj && Date.now()-obj.time<ttl) return obj.data;}}catch(e){}
    return null;
  }
  function setCache(action,k,data){
    const ttl=CACHE_TTL[action]||0; if(!ttl || !data || data.ok===false) return;
    const item={time:Date.now(),data}; memoryCache.set(k,item);
    try{sessionStorage.setItem("dream_api_cache_v381_"+k, JSON.stringify(item));}catch(e){}
  }

  async function stableApi(action,payload){
    payload=payload||{};
    if(shouldDefer(action)) return empty(action,"延後到對應頁面再載入");
    const k=key(action,payload);
    const hit=getCache(action,k); if(hit) return hit;
    if(inFlight.has(k)) return inFlight.get(k);

    const controller = new AbortController();
    const timeout = BACKGROUND_ACTIONS.has(action) ? 12000 : 18000;
    const timer = setTimeout(()=>controller.abort(), timeout);
    const p = fetch(apiUrl(), {
      method:"POST", credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(Object.assign({action}, payload)),
      signal:controller.signal
    }).then(async res=>{
      clearTimeout(timer);
      const text=await res.text();
      let data;
      try{data=JSON.parse(text||"{}");}
      catch(e){data={ok:false,message:"API 回傳格式錯誤："+text.slice(0,120),status:res.status};}
      if(!res.ok && data.ok!==true){data.ok=false; data.status=res.status;}
      setCache(action,k,data);
      return data;
    }).catch(err=>{
      clearTimeout(timer);
      const msg = err && err.name==="AbortError" ? "背景資料載入逾時，已先顯示空狀態" : (err.message||"連線失敗");
      if(BACKGROUND_ACTIONS.has(action)){
        if(window.DREAM_API_DEBUG) console.warn("[DreamAPI stable]", action, msg);
        return empty(action,msg);
      }
      throw err;
    }).finally(()=>inFlight.delete(k));
    inFlight.set(k,p);
    return p;
  }

  window.DreamStableFetchV381 = stableApi;
  window.DreamStableFetchV380 = stableApi;
  window.DreamStableFetchV379 = stableApi;
  window.DreamStableFetchV378 = stableApi;
  window.DreamStableFetchV377 = stableApi;
  window.DreamStableFetchV376 = stableApi;
  window.DreamStableAPI = {api:stableApi, isLoggedIn, currentPage, cache:memoryCache};

  function install(){
    if(!window.DreamAPI || typeof window.DreamAPI.api!=="function" || window.DreamAPI.__stableV381) return false;
    const raw = window.DreamAPI.api.bind(window.DreamAPI);
    window.DreamAPI.api = function(action,payload){
      if(BACKGROUND_ACTIONS.has(action) || PRIVATE_ACTIONS.has(action)) return stableApi(action,payload);
      return raw(action,payload);
    };
    window.DreamAPI.__stableV381 = true;
    return true;
  }
  if(!install()){
    const t=setInterval(()=>{if(install()) clearInterval(t);},50);
    setTimeout(()=>clearInterval(t),5000);
  }

  document.addEventListener("error", function(e){
    const img=e.target;
    if(!img || img.tagName!=="IMG" || img.dataset.v381Fallback) return;
    const src=img.getAttribute("src")||"";
    if(/companion_|avatar|uploads/i.test(src)){img.dataset.v381Fallback="1"; img.src="assets/default-avatar.webp";}
  }, true);
})();
