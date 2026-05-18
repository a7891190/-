
window.dreamFormalIsLoginPageV387 = window.dreamFormalIsLoginPageV387 || function(){
  const p=(location.hash||"#home").replace(/^#/,"")||"home";
  return p==="login" || p==="register" || p==="forgot";
};
window.dreamFormalIsLoginPageV378 = window.dreamFormalIsLoginPageV387;
window.dreamFormalIsLoginPageV379 = window.dreamFormalIsLoginPageV387;
window.dreamFormalIsLoginPageV381 = window.dreamFormalIsLoginPageV387;
window.dreamFormalIsLoginPageV384 = window.dreamFormalIsLoginPageV387;
window.dreamFormalIsLoginPageV386 = window.dreamFormalIsLoginPageV387;


/* v388-profile-service-sync */
window.dreamStableApiV387 = window.dreamStableApiV387 || async function(action, payload){
  const fn = window.DreamStableFetchV387 ||
             window.dreamStableApiV387 ||
             window.dreamStableApiV387;
  if(typeof fn === "function") return await fn(action, payload || {});
  const apiBase = (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php";
  const res = await fetch(apiBase, {
    method:"POST",
    credentials:"include",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(Object.assign({action}, payload || {}))
  });
  const text = await res.text();
  try{ return JSON.parse(text || "{}"); }
  catch(e){ return {ok:false, message:"API 回傳格式錯誤：" + text.slice(0,120)}; }
};
window.dreamStableApiV387 = window.dreamStableApiV387;

/* v387-full-bundle-maintenance */

window.dreamFormalIsLoginPageV386 = window.dreamFormalIsLoginPageV386 || function(){
  const p=(location.hash||"#home").replace(/^#/,"")||"home";
  return p==="login" || p==="register" || p==="forgot";
};
window.dreamFormalIsLoginPageV378 = window.dreamFormalIsLoginPageV386;
window.dreamFormalIsLoginPageV379 = window.dreamFormalIsLoginPageV386;
window.dreamFormalIsLoginPageV381 = window.dreamFormalIsLoginPageV386;
window.dreamFormalIsLoginPageV384 = window.dreamFormalIsLoginPageV386;


/* v387-full-bundle-maintenance */
window.dreamStableApiV387 = window.dreamStableApiV387 || async function(action, payload){
  const fn = window.dreamStableApiV387 ||
             window.dreamStableApiV387;
  if(typeof fn === "function") return await fn(action, payload || {});
  const apiBase = (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php";
  const res = await fetch(apiBase, {
    method:"POST",
    credentials:"include",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(Object.assign({action}, payload || {}))
  });
  return await res.json();
};


/* v386-cleanup-rank-bullet */
window.dreamFormalIsLoginPageV384 = window.dreamFormalIsLoginPageV384 || function(){
  const p=(location.hash||"#home").replace(/^#/,"")||"home";
  return p==="login" || p==="register" || p==="forgot";
};
window.dreamFormalIsLoginPageV378 = window.dreamFormalIsLoginPageV384;
window.dreamFormalIsLoginPageV379 = window.dreamFormalIsLoginPageV384;
window.dreamFormalIsLoginPageV381 = window.dreamFormalIsLoginPageV384;


/* v384-full-current-login-architecture */
window.dreamFormalIsLoginPageV381 = window.dreamFormalIsLoginPageV381 || function(){
  const p=(location.hash||"#home").replace(/^#/,"")||"home";
  return p==="login" || p==="register" || p==="forgot";
};
window.dreamFormalIsLoginPageV378 = window.dreamFormalIsLoginPageV381;
window.dreamFormalIsLoginPageV379 = window.dreamFormalIsLoginPageV381;

/* v381-architecture-complete */


/* v379：全域登入頁判斷，給 formal-front-core.js 所有獨立區塊共用 */
window.dreamFormalIsLoginPageV379 = window.dreamFormalIsLoginPageV379 || function(){
  try{
    const p = (location.hash || "#home").replace(/^#/,"") || "home";
    return p === "login" || p === "register" || p === "forgot";
  }catch(e){
    return false;
  }
};
window.dreamFormalIsLoginPageV378 = window.dreamFormalIsLoginPageV379;

(function(){
  function dreamFormalIsLoginPageV378(){
    const p = (location.hash || "#home").replace(/^#/,"") || "home";
    return p === "login" || p === "register" || p === "forgot";
  }
  if(window.__dreamFormalCoreCleanV369) return;
  window.__dreamFormalCoreCleanV369 = true;

  const API_BASE = () => {
    try{ return (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php"; }
    catch(e){ return "https://api.131rwjuh.com/api.php"; }
  };

  const DEMO_RE = /雲歌|浮光|夜笙|青衫|九璃|阿黎|阿梨|小白|蒼岑|夜璃|墨染|花間醉|長歌|測試|假資料|Demo|DEMO|收藏的動態貼文|短陌儲值\s*2026|評分\s*4\./;

  function toast(msg, sticky){
    let el = document.getElementById("dreamCleanToast");
    if(!el){
      el = document.createElement("div");
      el.id = "dreamCleanToast";
      el.style.cssText = "position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:2147483647;max-width:88%;padding:12px 16px;border-radius:16px;background:rgba(72,28,50,.96);color:#fff;font-size:14px;font-weight:900;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.38);";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(el._t);
    if(!sticky) el._t = setTimeout(()=>el.style.display="none", 1800);
  }

  function pageName(){
    return (location.hash || "#home").replace(/^#/,"") || "home";
  }

  function show(page){
    try{ if(typeof window.showPage === "function"){ window.showPage(page); return; } }catch(e){}
    location.hash = "#" + page;
  }

  // 返回鍵：只記錄入口，不讓回上一頁時又被覆蓋。
  let internalBack = false;
  const originalShowPage = typeof window.showPage === "function" ? window.showPage : null;
  if(originalShowPage && !window.__dreamCleanShowPageWrappedV369){
    window.__dreamCleanShowPageWrappedV369 = true;
    window.showPage = function(page){
      try{
        const cur = pageName();
        if(!internalBack && page && page !== cur){
          sessionStorage.setItem("dream_prev_page_clean", cur);
        }
      }catch(e){}
      return originalShowPage.apply(this, arguments);
    };
  }

  document.addEventListener("click", function(e){
    const back = e.target.closest && e.target.closest(".back-btn,[data-back],[data-action='back']");
    if(back){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const prev = sessionStorage.getItem("dream_prev_page_clean") || "home";
      internalBack = true;
      show(prev);
      setTimeout(()=>internalBack=false, 80);
      return false;
    }

    const go = e.target.closest && e.target.closest("[data-go]");
    if(go){
      const target = go.getAttribute("data-go");
      const cur = pageName();
      if(target && target !== cur) sessionStorage.setItem("dream_prev_page_clean", cur);
    }
  }, true);

  async function logout(role){
    toast("正在登出，請稍候...", true);
    const action = role === "companion" ? "companion_logout" : "logout";
    try{
      await fetch(API_BASE(), {method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});
    }catch(e){}
    try{
      localStorage.removeItem("dream_persist_user");
      localStorage.removeItem("dream_persist_login_type");
      localStorage.removeItem("dream_login_keep");
      localStorage.removeItem("dream_permanent_login");
    }catch(e){}
    show("login");
  }

  document.addEventListener("click", function(e){
    const btn = e.target.closest && e.target.closest("[data-v366-companion-logout], [data-action='logout'], [data-logout], .logout-btn");
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    btn.dataset.oldText = btn.textContent || "登出";
    btn.textContent = "正在登出...";
    btn.disabled = true;
    btn.style.pointerEvents = "none";
    btn.style.opacity = ".72";
    let role = "member";
    try{ role = localStorage.getItem("dream_persist_login_type") || "member"; }catch(e){}
    logout(role);
    return false;
  }, true);

  // 登出按鈕：複製重新整理樣式
  function findCompanionRoot(){
    return document.querySelector("#page-companion-home") || document.querySelector("[data-page='companion-home']");
  }
  function isCompanionHome(){
    return location.hash === "#companion-home" || !!document.querySelector("#page-companion-home.active, #page-companion-home:not(.hidden)");
  }
  function findRefreshCard(root){
    if(!root) return null;
    return Array.from(root.querySelectorAll("button,a,.service-card,.feature-card,.menu-card,[role='button'],.card,.item")).find(el=>{
      const txt=(el.textContent||"").replace(/\s+/g,"");
      return txt.includes("重新整理") || txt.includes("刷新");
    }) || null;
  }
  function setLogoutCard(card){
    card.setAttribute("data-v366-companion-logout","1");
    card.setAttribute("aria-label","登出");
    card.removeAttribute("id");
    const nodes = Array.from(card.querySelectorAll("*")).filter(el=>(el.textContent||"").trim());
    let icon=false, label=false;
    nodes.forEach(el=>{
      const txt=(el.textContent||"").replace(/\s+/g,"");
      if(!icon && (txt==="整" || txt==="刷" || txt.length<=2)){ el.textContent="出"; icon=true; return; }
      if(!label && (txt.includes("重新整理") || txt.includes("刷新"))){ el.textContent="登出"; label=true; }
    });
    if(!label){
      card.textContent="";
      const a=document.createElement("div"); a.textContent="出";
      const b=document.createElement("div"); b.textContent="登出";
      card.appendChild(a); card.appendChild(b);
    }
    return card;
  }
  function placeCompanionLogout(){
    if(!isCompanionHome()) return;
    const root = findCompanionRoot();
    const refresh = findRefreshCard(root);
    if(!root || !refresh || !refresh.parentElement) return;
    document.querySelectorAll("[data-v357-companion-logout],[data-v358-companion-logout],[data-v363-companion-logout],[data-v366-companion-logout]").forEach(el=>el.remove());
    const clone = refresh.cloneNode(true);
    setLogoutCard(clone);
    refresh.parentElement.insertBefore(clone, refresh.nextSibling);
  }

  // 清除展示假資料，不碰真 API 回來的資料，除非命中特定展示假名字。
  function removeDemoNodes(){
    document.querySelectorAll("[data-demo-only],.demo-only,.fake-data,.mock-data").forEach(el=>el.remove());
    document.querySelectorAll(".post-card,.companion-card,.row").forEach(el=>{
      const txt=(el.textContent||"").replace(/\s+/g," ");
      if(DEMO_RE.test(txt)) el.remove();
    });
    const inn=document.getElementById("innPostList");
    const innEmpty=document.getElementById("innEmptyState");
    if(inn && !inn.children.length && innEmpty){ innEmpty.style.display="block"; innEmpty.textContent="目前尚無客棧動態。"; }
    const comp=document.getElementById("companionGrid");
    if(comp && !comp.querySelector(".companion-card") && !comp.querySelector(".companion-empty")) comp.innerHTML='<div class="companion-empty">目前尚無陪玩資料</div>';
  }

  const RANK_CACHE_KEY = "dream_front_rank_cache_clean_v369";
  const RANK_TIME_KEY = "dream_front_rank_cache_time_clean_v369";
  const RANK_TTL = 5 * 60 * 1000;

  async function getRanking(force){
    const now=Date.now();
    if(!force){
      try{
        const ts=Number(sessionStorage.getItem(RANK_TIME_KEY)||"0");
        const raw=sessionStorage.getItem(RANK_CACHE_KEY);
        if(raw && ts && now-ts<RANK_TTL) return JSON.parse(raw);
      }catch(e){}
    }
    const data = await window.dreamStableApiV387("front_ranking_snapshot", {});
    if(data && data.ok){
      try{ sessionStorage.setItem(RANK_CACHE_KEY, JSON.stringify(data)); sessionStorage.setItem(RANK_TIME_KEY, String(now)); }catch(e){}
    }
    return data;
  }
  function rankItems(data){
    let items = [];
    if(data && data.activity && Array.isArray(data.activity.items)) items = data.activity.items;
    if(!items.length && data && data.vip && Array.isArray(data.vip.ranking)) items = data.vip.ranking;
    return items.map((x,i)=>({rank:Number(x.rank||i+1), name:x.display_name||x.name||x.username||x.companion_name||"未命名", score:x.score??x.total??x.completed_orders??x.order_count??x.exp??"", avatar:x.avatar_url||""}));
  }
  function ensureRankStyle(){
    if(document.getElementById("dreamCleanRankStyle")) return;
    const style=document.createElement("style"); style.id="dreamCleanRankStyle";
    style.textContent='.dream-clean-rank-wrap{display:grid;gap:10px;margin:10px 0}.dream-clean-rank-card{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,220,235,.25);background:rgba(255,255,255,.06);border-radius:16px;padding:10px;color:inherit}.dream-clean-rank-no{font-weight:900;min-width:38px;color:#ffd8ea}.dream-clean-rank-avatar{width:38px;height:38px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(255,221,235,.16);border:1px solid rgba(255,221,235,.3);font-weight:900;overflow:hidden}.dream-clean-rank-avatar img{width:100%;height:100%;object-fit:cover}.dream-clean-rank-info{display:flex;flex-direction:column;gap:2px;min-width:0}.dream-clean-rank-info b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dream-clean-rank-info span{font-size:12px;opacity:.8}';
    document.head.appendChild(style);
  }
  function card(x){
    const first=String(x.name||"夢").slice(0,1);
    return `<div class="dream-clean-rank-card"><div class="dream-clean-rank-no">#${x.rank}</div><div class="dream-clean-rank-avatar">${x.avatar?`<img src="${x.avatar}" alt="">`:first}</div><div class="dream-clean-rank-info"><b>${x.name}</b><span>${x.score!==""?x.score:"目前在榜"}</span></div></div>`;
  }
  function sectionsByText(list){
    const out=[];
    document.querySelectorAll("section,.panel,.card,div").forEach(el=>{
      const t=(el.textContent||"").replace(/\s+/g,"");
      if(list.some(x=>t.includes(x)) && el.offsetParent!==null) out.push(el);
    });
    return out;
  }
  function renderRanking(data){
    if(window.DreamHomeRenderIsolationV377 && typeof window.DreamHomeRenderIsolationV377.renderHomeRanking === "function"){ window.DreamHomeRenderIsolationV377.renderHomeRanking(data); return; }
    const items=rankItems(data);
    if(!items.length) return;
    ensureRankStyle();
    sectionsByText(["本期前三名","前三名"]).slice(0,2).forEach(sec=>{
      let box=sec.querySelector("[data-clean-top3]");
      if(!box){ box=document.createElement("div"); box.className="dream-clean-rank-wrap"; box.setAttribute("data-clean-top3","1"); sec.appendChild(box); }
      box.innerHTML=items.slice(0,3).map(card).join("");
    });
    sectionsByText(["後10名","後十名","排行榜"]).slice(0,4).forEach(sec=>{
      if(sec.querySelector("[data-clean-top3]")) return;
      let box=sec.querySelector("[data-clean-rank-list]");
      if(!box){ box=document.createElement("div"); box.className="dream-clean-rank-wrap"; box.setAttribute("data-clean-rank-list","1"); sec.appendChild(box); }
      box.innerHTML=(items.slice(3,13).length?items.slice(3,13):items.slice(0,10)).map(card).join("");
    });
  }
  async function loadRanking(force){
    if(window.dreamFormalIsLoginPageV379 && window.dreamFormalIsLoginPageV379()) return; try{ renderRanking(await getRanking(force)); }catch(e){ console.warn("[front_ranking_snapshot]", e.message||e); } }

  function boot(){
    removeDemoNodes();
    placeCompanionLogout();
    loadRanking(false);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,100));
  else setTimeout(boot,100);
  window.addEventListener("hashchange",()=>setTimeout(boot,120));
  const mo=new MutationObserver(()=>{ clearTimeout(boot._t); boot._t=setTimeout(()=>{removeDemoNodes(); placeCompanionLogout();},180); });
  if(document.documentElement) mo.observe(document.documentElement,{childList:true,subtree:true});

  window.DreamCleanFormalV369 = {removeDemoNodes, placeCompanionLogout, loadRanking};
})();



/* v370：正式彈幕特效前台顯示 */
(function(){
  if(window.__dreamBulletFormalV370) return;
  window.__dreamBulletFormalV370 = true;

  const SEEN_KEY = "dream_seen_bullet_events_v370";
  const POLL_MS = 30000;

  function apiBase(){
    try{return (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php";}catch(e){return "https://api.131rwjuh.com/api.php";}
  }

  function seenSet(){
    try{return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]"));}catch(e){return new Set();}
  }

  function saveSeen(set){
    try{sessionStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(set).slice(-120)));}catch(e){}
  }

  function esc(s){
    return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function ensureLayer(){
    let layer = document.getElementById("dreamBulletLayer");
    if(layer) return layer;

    const style = document.createElement("style");
    style.id = "dreamBulletStyleV370";
    style.textContent = `
      #dreamBulletLayer{
        pointer-events:none;
        position:fixed;
        left:0;
        right:0;
        top:74px;
        height:42vh;
        z-index:2147483500;
        overflow:hidden;
      }
      .dream-bullet-item{
        position:absolute;
        right:-120%;
        min-width:max-content;
        max-width:88vw;
        display:flex;
        align-items:center;
        gap:8px;
        padding:8px 14px;
        border-radius:999px;
        background:rgba(55,24,45,.86);
        color:#fff;
        border:1px solid rgba(255,221,235,.32);
        box-shadow:0 12px 28px rgba(0,0,0,.28);
        font-size:14px;
        font-weight:900;
        white-space:nowrap;
        animation:dreamBulletMoveV370 var(--dur,12s) linear forwards;
        backdrop-filter:blur(8px);
      }
      .dream-bullet-item.gift{
        background:linear-gradient(90deg,rgba(116,42,70,.92),rgba(211,119,83,.88));
        border-color:rgba(255,225,170,.46);
      }
      .dream-bullet-item.notice{
        background:linear-gradient(90deg,rgba(45,44,88,.92),rgba(116,42,100,.88));
      }
      .dream-bullet-item.gold{
        background:linear-gradient(90deg,rgba(106,75,22,.94),rgba(211,151,59,.9));
        border-color:rgba(255,230,160,.6);
      }
      .dream-bullet-badge{
        display:inline-flex;
        width:28px;
        height:28px;
        border-radius:11px;
        align-items:center;
        justify-content:center;
        background:rgba(255,255,255,.16);
        border:1px solid rgba(255,255,255,.24);
      }
      @keyframes dreamBulletMoveV370{
        from{transform:translateX(0);}
        to{transform:translateX(calc(-100vw - 140%));}
      }
    `;
    document.head.appendChild(style);

    layer = document.createElement("div");
    layer.id = "dreamBulletLayer";
    document.body.appendChild(layer);
    return layer;
  }

  function showBullet(ev, index){
    const layer = ensureLayer();
    const item = document.createElement("div");
    const effect = String(ev.effect_key || "normal").toLowerCase();
    item.className = "dream-bullet-item " + effect;
    item.style.top = ((index % 7) * 44) + "px";
    item.style.setProperty("--dur", (11 + (index % 4)) + "s");

    const badge = effect === "gift" ? "禮" : effect === "notice" ? "告" : effect === "gold" ? "賞" : "訊";
    const title = ev.title ? `<b>${esc(ev.title)}</b>` : "";
    const name = ev.display_name ? `<span>${esc(ev.display_name)}</span>` : "";
    const msg = `<span>${esc(ev.message || "")}</span>`;

    item.innerHTML = `<span class="dream-bullet-badge">${badge}</span>${title}${name}${msg}`;
    layer.appendChild(item);
    item.addEventListener("animationend", ()=>item.remove());
  }

  async function loadBullets(){
    if(window.dreamFormalIsLoginPageV379 && window.dreamFormalIsLoginPageV379()) return;
    let data = null;
    try{
      data = await window.dreamStableApiV387("bullet_event_list", {limit:20});
    }catch(e){
      console.warn("[bullet_event_list]", e.message || e);
      return;
    }

    if(!data || !data.ok) return;
    const events = Array.isArray(data.events) ? data.events.slice().reverse() : [];
    const seen = seenSet();
    let count = 0;

    events.forEach(ev=>{
      const id = String(ev.id || "");
      if(!id || seen.has(id)) return;
      seen.add(id);
      showBullet(ev, count++);
    });

    saveSeen(seen);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ()=>setTimeout(loadBullets, 800));
  }else{
    setTimeout(loadBullets, 800);
  }

  setInterval(loadBullets, POLL_MS);
  window.DreamBulletFormalV370 = {load: loadBullets};
})();

