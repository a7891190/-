(function(){
  "use strict";
  const APP_NAME = (window.DREAM_CONFIG && window.DREAM_CONFIG.APP_NAME) || "夢競陪玩";
  const API_RE = /api\.php|upload_avatar\.php|support_upload\.php/i;
  const isHttpUrl = (u)=>/^https?:/i.test(String(u||""));
  function getUrl(input){
    try{ return typeof input === "string" ? input : (input && input.url) || ""; }catch(_){ return ""; }
  }
  function safeToast(msg){
    try{
      if(typeof window.toast === "function") return window.toast(msg);
      let el = document.getElementById("dreamSafeToast");
      if(!el){
        el = document.createElement("div");
        el.id = "dreamSafeToast";
        el.setAttribute("role", "status");
        el.style.cssText = "position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,360px);padding:12px 14px;border-radius:14px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.94);color:#fff1f6;text-align:center;font-size:13px;z-index:99999;box-shadow:0 14px 28px rgba(0,0,0,.4);opacity:0;transition:.2s;pointer-events:none";
        document.body.appendChild(el);
      }
      el.textContent = String(msg || "");
      el.style.opacity = "1";
      clearTimeout(safeToast.timer);
      safeToast.timer = setTimeout(()=>{ el.style.opacity = "0"; }, 1900);
    }catch(_){}
  }
  window.DreamSafe = Object.assign(window.DreamSafe || {}, {toast:safeToast});

  // API / upload timeout：避免弱網或 500 造成畫面一直等待。只加逾時，不更動既有資料格式與畫面樣式。
  if(window.fetch && !window.fetch.__dreamSafeWrapped){
    const rawFetch = window.fetch.bind(window);
    const wrapped = function(input, init){
      const url = getUrl(input);
      const cfg = init ? Object.assign({}, init) : {};
      const timeout = Number(cfg.timeout || (API_RE.test(url) ? 18000 : 28000));
      if(!navigator.onLine && isHttpUrl(url)) return Promise.reject(new Error("目前網路離線，請恢復連線後再試"));
      if(typeof AbortController === "undefined" || cfg.signal) return rawFetch(input, cfg);
      const controller = new AbortController();
      cfg.signal = controller.signal;
      const timer = setTimeout(()=>controller.abort(), timeout);
      return rawFetch(input, cfg).finally(()=>clearTimeout(timer)).catch(err=>{
        if(err && err.name === "AbortError") throw new Error("連線逾時，請稍後再試");
        throw err;
      });
    };
    wrapped.__dreamSafeWrapped = true;
    window.fetch = wrapped;
  }

  function isGuardedAction(btn){
    if(!btn || btn.dataset.dreamNoGuard === "1") return false;
    if(btn.matches('[data-transfer-confirm],[data-exchange-submit],[data-exchange-confirm],[data-v26-action],[data-cart-id],[data-companion-action],[data-companion-btn],[data-order-action],#front_login_btn,#front_register_btn,#legalConsentAccept')) return true;
    if(btn.closest('form')) return true;
    const txt=(btn.textContent||"").trim();
    return /送出|確認|完成|登入|註冊|購買|兌換|上傳|發布|加入購物車|接手|不接受|打卡|轉單|留言|簽到/.test(txt);
  }
  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest && e.target.closest('button,a[role="button"],.btn');
    if(!isGuardedAction(btn)) return;
    const now = Date.now();
    const last = Number(btn.dataset.dreamLastClick || 0);
    if(now - last < 900){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeToast('操作處理中，請勿重複點擊');
      return false;
    }
    btn.dataset.dreamLastClick = String(now);
  }, true);

  // 表單與檔案基本防錯：不改 UI，只阻擋明顯錯誤資料。
  document.addEventListener('submit', function(e){
    const form = e.target;
    if(!form || !form.querySelectorAll) return;
    const required = Array.from(form.querySelectorAll('[required]'));
    const bad = required.find(el => !String(el.value || '').trim());
    if(bad){
      e.preventDefault();
      safeToast('請先填寫必填欄位');
      try{ bad.focus(); }catch(_){}
    }
  }, true);
  document.addEventListener('change', function(e){
    const input = e.target;
    if(!input || input.type !== 'file' || !input.files || !input.files[0]) return;
    const file = input.files[0];
    const key = [input.id,input.name,input.dataset.bind,input.dataset.v26Input,input.accept].join(' ').toLowerCase();
    const limit = /avatar|大頭|頭像/.test(key) ? 5 * 1024 * 1024 : 8 * 1024 * 1024;
    if(file.size > limit){
      input.value = '';
      safeToast(/avatar|大頭|頭像/.test(key) ? '頭像圖片請小於 5MB' : '圖片檔案請小於 8MB');
    }
  }, true);

  function updateNetworkBanner(){
    let bar = document.getElementById('dreamNetworkBanner');
    if(navigator.onLine){ if(bar) bar.remove(); return; }
    if(!bar){
      bar = document.createElement('div');
      bar.id='dreamNetworkBanner';
      bar.setAttribute('role','status');
      bar.textContent = APP_NAME + '：目前網路離線，部分功能會暫停同步';
      bar.style.cssText='position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top));transform:translateX(-50%);width:min(92%,390px);padding:10px 12px;border-radius:999px;background:rgba(42,16,31,.94);border:1px solid rgba(255,221,190,.45);color:#fff2f6;text-align:center;font-size:12px;z-index:100000;box-shadow:0 10px 22px rgba(0,0,0,.34);pointer-events:none';
      document.body.appendChild(bar);
    }
  }
  window.addEventListener('online', ()=>{ updateNetworkBanner(); safeToast('網路已恢復'); });
  window.addEventListener('offline', updateNetworkBanner);
  window.addEventListener('error', function(e){
    console.warn('[夢競陪玩] 前端錯誤', e.message || e.error || e);
  });
  window.addEventListener('unhandledrejection', function(e){
    const msg = e.reason && (e.reason.message || String(e.reason));
    console.warn('[夢競陪玩] 非同步錯誤', msg || e.reason);
    if(/逾時|離線|Failed to fetch|NetworkError/i.test(msg||'')) safeToast(msg || '連線失敗，請稍後再試');
  });
  document.addEventListener('DOMContentLoaded', function(){
    updateNetworkBanner();
    document.querySelectorAll('img:not([loading])').forEach((img,idx)=>{
      if(idx > 3) img.loading = 'lazy';
      img.decoding = 'async';
    });
    document.querySelectorAll('.nav-link[data-go]').forEach(a=>{
      if(!a.getAttribute('aria-label')) a.setAttribute('aria-label', (a.querySelector('img')?.alt || a.dataset.go || '頁面'));
    });
  });
})();


/* v385-login-toast-auto-hide */
(function(){
  if(window.__dreamHardeningTimeoutV376) return;
  window.__dreamHardeningTimeoutV376 = true;

  window.addEventListener("unhandledrejection", function(e){
    const msg = e && e.reason && (e.reason.message || String(e.reason));
    if(msg && msg.includes("連線逾時")){
      console.warn("[DreamHardening] 背景 API 逾時已降級處理，不中斷前台");
      e.preventDefault();
    }
  });

  window.addEventListener("error", function(e){
    const msg = e && e.message;
    if(msg && msg.includes("連線逾時")){
      e.preventDefault();
    }
  }, true);
})();


/* v377：背景逾時不丟未捕捉錯誤 */
(function(){
  if(window.__dreamHardeningTimeoutV377) return;
  window.__dreamHardeningTimeoutV377 = true;
  window.addEventListener('unhandledrejection', function(e){
    const msg = e && e.reason && (e.reason.message || String(e.reason));
    if(msg && msg.includes('連線逾時')){ console.warn('[DreamHardening] 背景 API 逾時已降級處理，不中斷前台'); e.preventDefault(); }
  });
})();


/* v378：登入頁背景逾時降噪 */
(function(){
  if(window.__dreamLoginQuietV378) return;
  window.__dreamLoginQuietV378 = true;
  window.addEventListener("unhandledrejection", function(e){
    const msg = e && e.reason && (e.reason.message || String(e.reason));
    if(msg && msg.includes("連線逾時")){
      e.preventDefault();
      if(window.DREAM_API_DEBUG) console.warn("[DreamQuiet]", msg);
    }
  });
})();


/* v381：背景錯誤降噪 */
(function(){
  if(window.__dreamHardeningV381) return;
  window.__dreamHardeningV381 = true;
  window.addEventListener("unhandledrejection", function(e){
    const msg=e && e.reason && (e.reason.message || String(e.reason));
    if(msg && (msg.includes("連線逾時") || msg.includes("dreamFormalIsLoginPage"))){
      e.preventDefault();
      if(window.DREAM_API_DEBUG) console.warn("[DreamHardening]", msg);
    }
  });
})();


/* v384：背景錯誤降噪 */
(function(){
  if(window.__dreamHardeningV384)return;window.__dreamHardeningV384=true;
  window.addEventListener("unhandledrejection",function(e){
    const msg=e&&e.reason&&(e.reason.message||String(e.reason));
    if(msg&&(msg.includes("連線逾時")||msg.includes("dreamFormalIsLoginPage"))){e.preventDefault();if(window.DREAM_API_DEBUG)console.warn("[DreamHardening]",msg);}
  });
})();
