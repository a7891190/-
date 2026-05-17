/* v379-formal-login-helper-fix */
(function(){
  if(window.__dreamFrontApiStabilizerV375) return;
  window.__dreamFrontApiStabilizerV375 = true;

  const CACHE_TTL = {
    session: 30000,
    companion_session: 30000,
    vip_ranking: 300000,
    front_ranking_snapshot: 300000,
    inn_post_list: 60000,
    bullet_event_list: 60000,
    shop_list: 300000,
    companion_front_list: 120000,
    recharge_request_history: 60000,
    gift_history: 60000,
    exchange_history: 60000
  };

  const BACKGROUND_ACTIONS = new Set([
    "vip_ranking","front_ranking_snapshot","inn_post_list","bullet_event_list",
    "shop_list","companion_front_list","recharge_request_history","gift_history",
    "exchange_history","session","companion_session"
  ]);

  const PRIVATE_ACTIONS = new Set([
    "recharge_request_history","gift_history","exchange_history","member_profile",
    "support_messages","notification_list","front_event_notifications_list"
  ]);

  const inFlight = new Map();
  const memoryCache = new Map();

  function apiUrl(){
    try{return (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php";}catch(e){return "https://api.131rwjuh.com/api.php";}
  }

  function isLoggedIn(){
    try{
      const keep = localStorage.getItem("dream_login_keep") === "1" || localStorage.getItem("dream_permanent_login") === "1";
      const user = localStorage.getItem("dream_persist_user");
      if(keep && user && user !== "null" && user !== "{}") return true;
    }catch(e){}
    try{return document.body.classList.contains("dream-authenticated") && !document.body.classList.contains("dream-guest");}catch(e){}
    return false;
  }

  function cacheKey(action, payload){
    const p = Object.assign({}, payload || {});
    delete p._t;
    delete p.nonce;
    return action + ":" + JSON.stringify(p);
  }

  function cached(action, key){
    const ttl = CACHE_TTL[action] || 0;
    if(!ttl) return null;
    const item = memoryCache.get(key);
    if(item && Date.now() - item.time < ttl) return item.data;
    try{
      const raw = sessionStorage.getItem("dream_api_cache_" + key);
      if(raw){
        const parsed = JSON.parse(raw);
        if(parsed && Date.now() - parsed.time < ttl) return parsed.data;
      }
    }catch(e){}
    return null;
  }

  function setCache(action, key, data){
    const ttl = CACHE_TTL[action] || 0;
    if(!ttl || !data || data.ok === false) return;
    const item = {time: Date.now(), data};
    memoryCache.set(key, item);
    try{sessionStorage.setItem("dream_api_cache_" + key, JSON.stringify(item));}catch(e){}
  }

  function fallback(action, message){
    if(action === "session" || action === "companion_session"){
      return {ok:true, logged_in:isLoggedIn(), offline:true, message:message || "背景連線暫時失敗"};
    }
    if(action === "vip_ranking") return {ok:true, ranking:[], list:[], data:[], offline:true};
    if(action === "front_ranking_snapshot") return {ok:true, activity:{items:[]}, vip:{ranking:[]}, offline:true};
    if(action === "inn_post_list") return {ok:true, posts:[], list:[], data:[], offline:true};
    if(action === "bullet_event_list") return {ok:true, events:[], offline:true};
    if(action === "shop_list") return {ok:true, items:[], products:[], list:[], data:[], offline:true};
    if(action === "companion_front_list") return {ok:true, companions:[], list:[], data:[], offline:true};
    if(action === "recharge_request_history" || action === "gift_history" || action === "exchange_history") return {ok:true, records:[], history:[], list:[], data:[], offline:true};
    return {ok:false, message:message || "連線暫時失敗", offline:true};
  }

  async function stableApi(action, payload){
    payload = payload || {};
    if(PRIVATE_ACTIONS.has(action) && !isLoggedIn()){
      return fallback(action, "尚未登入，不載入私人資料");
    }

    const key = cacheKey(action, payload);
    const hit = cached(action, key);
    if(hit) return hit;

    if(inFlight.has(key)) return inFlight.get(key);

    const controller = new AbortController();
    const timeoutMs = BACKGROUND_ACTIONS.has(action) ? 12000 : 18000;
    const timer = setTimeout(()=>controller.abort(), timeoutMs);

    const p = fetch(apiUrl(), {
      method:"POST",
      credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(Object.assign({action}, payload)),
      signal:controller.signal
    }).then(async res=>{
      clearTimeout(timer);
      const text = await res.text();
      let data;
      try{ data = JSON.parse(text || "{}"); }
      catch(e){ data = {ok:false, message:"API 回傳格式錯誤：" + text.slice(0,120), status:res.status}; }
      if(!res.ok && (!data || data.ok !== true)){
        data = Object.assign({ok:false, status:res.status}, data || {});
      }
      setCache(action, key, data);
      return data;
    }).catch(err=>{
      clearTimeout(timer);
      const msg = err && err.name === "AbortError" ? "背景資料載入逾時，已先顯示空狀態" : (err.message || "連線失敗");
      if(BACKGROUND_ACTIONS.has(action)){
        if(window.DREAM_API_DEBUG) console.warn("[DreamAPI stable]", action, msg);
        return fallback(action, msg);
      }
      throw err;
    }).finally(()=>inFlight.delete(key));

    inFlight.set(key, p);
    return p;
  }


  // v376：給 api-client.js 內部 api() 直接呼叫，避免繞過穩定器。
  window.DreamStableFetchV377 = window.DreamStableFetchV376 = async function(action, payload){
    return stableApi(action, payload || {});
  };

  window.DreamStableAPI = {api:stableApi, cache:memoryCache, isLoggedIn};

  // 攔截 DreamAPI.api，讓原本呼叫自動變穩定，不需要到處改函式。
  function install(){
    if(!window.DreamAPI || typeof window.DreamAPI.api !== "function" || window.DreamAPI.__stableV375) return false;
    const original = window.DreamAPI.api.bind(window.DreamAPI);
    window.DreamAPI.api = function(action, payload){
      if(BACKGROUND_ACTIONS.has(action) || PRIVATE_ACTIONS.has(action)){
        return stableApi(action, payload);
      }
      return original(action, payload);
    };
    window.DreamAPI.__stableV375 = true;
    return true;
  }

  if(!install()){
    const t = setInterval(()=>{ if(install()) clearInterval(t); }, 50);
    setTimeout(()=>clearInterval(t), 5000);
  }

  // 404 圖片保底
  document.addEventListener("error", function(e){
    const img = e.target;
    if(!img || img.tagName !== "IMG") return;
    if(img.dataset.v375Fallback) return;
    const src = img.getAttribute("src") || "";
    if(/companion_|avatar|uploads/i.test(src)){
      img.dataset.v375Fallback = "1";
      img.src = "assets/default-avatar.webp";
    }
  }, true);
})();

window.DreamStableFetchV378 = window.DreamStableFetchV377 || window.DreamStableFetchV376;
