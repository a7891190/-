window.DREAM_CONFIG = {
  APP_NAME: "夢競陪玩",
  // 已依照目前上架中的前台 index(51).html 帶入正式 API
  API_BASE: "https://api.131rwjuh.com/api.php",
  AVATAR_UPLOAD_URL: "https://api.131rwjuh.com/upload_avatar.php",
  SUPPORT_UPLOAD_URL: "https://api.131rwjuh.com/support_upload.php",
  POST_IMAGE_UPLOAD_URL: "https://api.131rwjuh.com/support_upload.php",

  LINE_CUSTOMER_SERVICE_URL: "https://lin.ee/64EK1Iu",

  // 若後台回傳 /uploads/... 或完整網址，前台會自動處理
  UPLOAD_BASE: "https://api.131rwjuh.com",

  VERSION: "v389-formal-version-cleanup"
};

(function(){
  if(window.__dreamCsrfFetchV396 || typeof window.fetch !== "function") return;
  window.__dreamCsrfFetchV396 = true;
  const originalFetch = window.fetch.bind(window);
  let tokenPromise = null;
  function apiBase(){
    try{return (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php";}catch(_){return "https://api.131rwjuh.com/api.php";}
  }
  function isProtectedUrl(input){
    const raw = typeof input === "string" ? input : (input && input.url) || "";
    if(!raw) return false;
    try{
      const url = new URL(raw, location.href);
      const api = new URL(apiBase(), location.href);
      return url.origin === api.origin && /\/(api\.php|upload_avatar\.php|support_upload\.php)$/i.test(url.pathname);
    }catch(_){
      return /api\.php|upload_avatar\.php|support_upload\.php/i.test(raw);
    }
  }
  async function csrfToken(){
    if(tokenPromise) return tokenPromise;
    tokenPromise = originalFetch(apiBase(),{
      method:"POST",
      credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"csrf_token"})
    }).then(r=>r.json()).then(d=>d && d.csrf_token ? d.csrf_token : "").catch(()=>"");
    return tokenPromise;
  }
  window.dreamRefreshCsrfToken = function(){ tokenPromise = null; return csrfToken(); };
  window.fetch = async function(input, init){
    const opts = Object.assign({}, init || {});
    const method = String(opts.method || (input && input.method) || "GET").toUpperCase();
    if(method === "POST" && isProtectedUrl(input)){
      const token = await csrfToken();
      if(token){
        const headers = new Headers(opts.headers || (input && input.headers) || {});
        headers.set("X-CSRF-Token", token);
        opts.headers = headers;
      }
    }
    return originalFetch(input, opts);
  };
})();
