/* v379-formal-login-helper-fix */
window.DREAM_API_CLIENT_VERSION = "v379-formal-login-helper-fix";





function dreamCurrentPageV378(){ return (location.hash || "#home").replace(/^#/,"") || "home"; }
function dreamIsLoginPageV378(){ const p = dreamCurrentPageV378(); return p === "login" || p === "register" || p === "forgot"; }
function dreamIsMarketPageV378(){ const p = dreamCurrentPageV378(); return p === "market" || p === "shop" || p === "mall"; }
function dreamIsInnPageV378(){ return dreamCurrentPageV378() === "inn"; }
window.DreamLoginDebug = window.DreamLoginDebug || null;
/* v353-global-authuser-guard */
var authUser = window.authUser || null;
var authType = window.authType || null;
window.__dreamAuthSafe = window.__dreamAuthSafe || {};
window.__dreamAuthSafe.isLoggedIn = function(){
  try{
    if(window.__dreamFrontAuth && window.__dreamFrontAuth.user) return true;
  }catch(e){}
  try{
    if(window.authUser || window.authType) return true;
  }catch(e){}
  try{
    return document.body.classList.contains("dream-authenticated") && !document.body.classList.contains("dream-guest");
  }catch(e){}
  return false;
};

/* v352-loadall-no-authuser */
/* v351-authuser-loadall-final-fix */
/* v350-authuser-not-defined-fix */
/* v349-live-data-private-api-guard */
/* v348-registered-login-combined-fix */
/* v347-private-records-401-fix */
/* v346-api-missing-actions-guard-fix */
/* login-connect-compat-front */

(function(){
  const cfg = window.DREAM_CONFIG || {};
  const API_BASE = cfg.API_BASE || "https://api.131rwjuh.com/api.php";
  const AVATAR_UPLOAD_URL = cfg.AVATAR_UPLOAD_URL || "https://api.131rwjuh.com/upload_avatar.php";
  const SUPPORT_UPLOAD_URL = cfg.SUPPORT_UPLOAD_URL || "https://api.131rwjuh.com/support_upload.php";
  const UPLOAD_BASE = cfg.UPLOAD_BASE || "";

  const state = {
    user: null,
    shopItems: [],
    ranking: [],
    activeMarketCat: "全部",
    rechargePresets: [200,500,1000,2000,3000,5000,8000,10000,12000,15000,20000,30000],
    currentBuyItem: null,
    initialized: false
  };


  function dreamIsLoggedInSafeV352(){
    try{
      if(window.__dreamFrontAuth && window.__dreamFrontAuth.user) return true;
    }catch(e){}
    try{
      if(document.body.classList.contains("dream-authenticated") && !document.body.classList.contains("dream-guest")) return true;
    }catch(e){}
    try{
      const raw = localStorage.getItem("dream_persist_user") || localStorage.getItem("dream_user") || "";
      if(raw && raw !== "null" && raw !== "{}") return true;
    }catch(e){}
    return false;
  }

  window.dreamIsLoggedInSafeV352 = window.dreamIsLoggedInSafeV352 || dreamIsLoggedInSafeV352;

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function money(n){ return Number(n || 0).toLocaleString("zh-TW"); }
  function safeText(v, fallback=""){ return (v === undefined || v === null || v === "") ? fallback : String(v); }
  function escapeHtml(str){
    return String(str ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
  function normalizeImage(src){
    src = String(src || "").trim();
    if(!src) return "";
    if(/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
    if(src.startsWith("/")) return UPLOAD_BASE ? (UPLOAD_BASE.replace(/\/$/,"") + src) : src;
    return UPLOAD_BASE ? (UPLOAD_BASE.replace(/\/$/,"") + "/" + src.replace(/^\//,"")) : src;
  }
  function toast(msg){
    if(typeof window.toast === "function"){
      try{ window.toast(msg); return; }catch(e){}
    }
    let el = $("#v44Toast");
    if(!el){
      el = document.createElement("div");
      el.id = "v44Toast";
      el.style.cssText = "position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,360px);padding:12px 14px;border-radius:14px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.94);color:#fff1f6;text-align:center;font-size:13px;z-index:99999;box-shadow:0 14px 28px rgba(0,0,0,.4);opacity:0;transition:.2s";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(()=>el.style.opacity="0", 1900);
  }

  async function api(action, payload = {}) {
    // v376：背景/公開資料改走穩定器，避免重複請求與未捕捉逾時。
    const stableActionsV376 = new Set([
      "vip_ranking","front_ranking_snapshot","inn_post_list","bullet_event_list",
      "shop_list","companion_front_list","recharge_request_history","gift_history",
      "exchange_history","session","companion_session"
    ]);
    if(window.DreamStableFetchV376 && stableActionsV376.has(action)){
      return window.DreamStableFetchV376(action, payload || {});
    }
    const res = await fetch(API_BASE, {
      method: "POST",
      credentials: "include",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({action, ...payload})
    });
    const text = await res.text();
    let data;
    try{ data = JSON.parse(text); }
    catch(e){ throw new Error("API 回傳不是 JSON：" + text.slice(0,120)); }
    if(!data.ok && data.message){
      const guestPrivateActions = ["recharge_request_history","gift_history"];
      if(!(data.message === "請先登入" && guestPrivateActions.includes(action))){
        console.warn("[DreamAPI]", action, data.message);
      }
    }
    return data;
  }

  async function uploadFile(url, field, file){
    const fd = new FormData();
    fd.append(field, file);
    const res = await fetch(url, {method:"POST", credentials:"include", body:fd});
    const data = await res.json();
    if(!data.ok) throw new Error(data.message || "上傳失敗");
    return data;
  }

  function setBind(name, value){
    $all(`[data-bind="${name}"]`).forEach(el=>{
      if(el.tagName === "IMG") el.src = value;
      else el.textContent = value;
    });
  }

  function vipClass(level){
    level = Number(level || 0);
    if(level <= 0) return "svip";
    return "vip" + level;
  }

  function inferVipLevelFromName(vipName){
    const map = {"客官":0,"雅客":1,"太學博士":2,"四征將軍":3,"中郎將":4,"驃騎將軍":5,"尚書令":6,"御史大夫":7,"太子太傅":8,"攝政王":9,"絕代風華":10};
    return Object.prototype.hasOwnProperty.call(map, String(vipName || "").trim()) ? map[String(vipName || "").trim()] : 0;
  }
  function cleanVipTitle(title, code){
    return String(title || "")
      .replace("VIP等級：","")
      .replace(/[（）()]/g," ")
      .replace(/\bSVIP\b/ig," ")
      .replace(/\bVIP\s*(10|[1-9])\b/ig," ")
      .replace(String(code || "")," ")
      .replace(/\s+/g," ")
      .trim();
  }
  function formatVipLevel(code, title){
    const cleaned = cleanVipTitle(title, code);
    return "VIP等級：" + code + (cleaned ? " " + cleaned : "");
  }

  function getUserPayload(res){
    return res?.user || res?.data?.user || res?.data || null;
  }

  function formatMinute(value){
    const raw = String(value ?? "").trim();
    if(!raw) return "";
    const normalized = raw.replace("T"," ").replace(/\.\d+$/,"");
    if(!/[+-]\d{2}:\d{2}$|Z$/.test(normalized)){
      return normalized.length >= 16 ? normalized.slice(0,16) : normalized;
    }
    const dt = new Date(normalized.replace(" ","T"));
    if(Number.isNaN(dt.getTime())) return normalized.length >= 16 ? normalized.slice(0,16) : normalized;
    return new Intl.DateTimeFormat("zh-TW", {timeZone:"Asia/Taipei", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false}).format(dt);
  }

  function updateMemberUI(user){
    state.user = user || null;
    if(!user){
      setBind("member-id", "");
      setBind("member-name", "點擊登入");
      setBind("vip-level", "");
      setBind("vip-exp", "");
      setBind("member-gender-icon", "◇");
      setBind("member-profile-tip", "登入後可查看個人中心");
      setBind("coin", "0");
      setBind("vip-total", "0");
      setBind("normal-total", "普通累計儲值：0");
      setBind("vip-status-main", "鎖定");
      setBind("vip-status", "VIP權益：（鎖定）");
      setBind("vip-expire", "到期：尚未開通");
      const av = $("[data-bind='member-avatar']");
      if(av) av.textContent = "夢";
      return;
    }
    const username = safeText(user.display_name || user.username, "夢競會員");
    const uid = safeText(user.member_id || user.user_code || user.id || user.user_id, "00000000");
    const exp = Number(user.exp || user.vip_exp || 0);
    const nextExp = Number(user.next_exp || 298888);
    const vipName = safeText(user.vip_name || user.vip_title || user.vip_level_name, "客官");
    const vipLevel = Number.isFinite(Number(user.vip_level)) ? Number(user.vip_level) : inferVipLevelFromName(vipName);
    const expire = safeText(user.member_expire || user.expire_at || user.vip_expire, "未開通");
    const opened = (expire && expire !== "未開通") ? "開通" : safeText(user.vip_status || user.member_status, "鎖定");

    setBind("member-id", "會員 ID：" + uid);
    setBind("member-name", username);
    const vipCode = (user.svip || String(vipName).toUpperCase().includes("SVIP") || vipLevel <= 0) ? "SVIP" : ("VIP" + vipLevel);
    setBind("vip-level", formatVipLevel(vipCode, vipName));
    setBind("vip-exp", "VIP經驗值：" + money(exp) + " / " + money(nextExp));
    setBind("member-gender-icon", String(user.gender || user.sex || "").toLowerCase().includes("female") || String(user.gender || user.sex || "").includes("女") ? "♀" : (String(user.gender || user.sex || "").toLowerCase().includes("male") || String(user.gender || user.sex || "").includes("男") ? "♂" : "◇"));
    setBind("member-profile-tip", "登入後可編輯性別圖示、簡介與成就展示");
    setBind("coin", money(user.coin || user.short_coin || 0));
    setBind("vip-total", money(user.vip_total_recharge_coin || user.vip_total_recharge || 0));
    setBind("normal-total", "普通累計儲值：" + money(user.normal_total_recharge_coin || user.normal_total_recharge || 0));
    setBind("vip-status-main", opened);
    setBind("vip-status", "VIP權益：（" + opened + "）");
    setBind("vip-expire", "到期：" + expire);

    const av = $("[data-bind='member-avatar']");
    const avatar = normalizeImage(user.avatar_url || user.avatar || "");
    if(av){
      if(avatar){
        av.innerHTML = `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(username)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      }else{
        av.textContent = username.slice(0,1);
      }
    }
  }

  async function refreshSession(){
    try{
      const res = await api("session");
      if(res.ok && res.logged_in && res.user){
        updateMemberUI(res.user);
        return true;
      }
      updateMemberUI(null);
      return false;
    }catch(err){
      console.warn("[session]", err.message);
      updateMemberUI(null);
      return false;
    }
  }

  function normalizeRanking(list){
    return (Array.isArray(list) ? list : []).map((item, index)=>{
      const rank = Number(item.display_rank || item.rank || index + 1);
      const vipName = item.vip_name || item.vip_title || item.vip_level_name || "";
      const vipLevel = Number.isFinite(Number(item.vip_level)) ? Number(item.vip_level) : inferVipLevelFromName(vipName);
      return {
        ...item,
        display_rank: rank,
        username: item.username || item.display_name || item.member_username || "會員",
        exp: Number(item.exp || item.vip_exp || item.total_exp || 0),
        vip_name: vipName,
        vip_level: vipLevel,
        avatar_url: normalizeImage(item.avatar_url || item.avatar || "")
      };
    }).sort((a,b)=>Number(a.display_rank)-Number(b.display_rank));
  }

  function renderTop3(ranking){
    const top = ranking.slice(0,3);
    const positions = [
      {cls:"first", item: top[0], fallback:"醉"},
      {cls:"second", item: top[1], fallback:"染"},
      {cls:"third", item: top[2], fallback:"歌"}
    ];
    for(const p of positions){
      const avatar = $(`.top3-avatar.${p.cls}`);
      const text = $(`.top3-text.${p.cls}`);
      const item = p.item;
      if(avatar){
        if(item?.avatar_url){
          avatar.innerHTML = `<img src="${escapeHtml(item.avatar_url)}" alt="${escapeHtml(item.username)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }else{
          avatar.textContent = item ? String(item.username || p.fallback).slice(0,1) : p.fallback;
        }
      }
      if(text && item){
        const name = text.querySelector(".name");
        const value = text.querySelector(".value");
        if(name) name.textContent = item.username;
        if(value) value.textContent = "VIP經驗值 " + money(item.exp);
      }
    }
  }

  function renderVipRankList(ranking){
    const host = $("[data-list='vip-rank']");
    if(!host) return;
    if(!ranking.length){
      host.innerHTML = `<div class="row"><div class="badge">!</div><div><div class="row-title">目前沒有排行榜資料</div><div class="row-sub">等待後台資料帶入</div></div></div>`;
      return;
    }
    host.innerHTML = ranking.slice(0,100).map(item => `
      <div class="row">
        <div class="badge">${item.display_rank}</div>
        <div class="row-main">
          <div class="row-title">${escapeHtml(item.username)}</div>
          <div class="row-sub"><span class="${vipClass(item.vip_level)}">${escapeHtml(item.vip_name || "-")}</span>｜VIP經驗值：${money(item.exp)}</div>
        </div>
        <div class="row-right">${item.avatar_url ? `<img src="${escapeHtml(item.avatar_url)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;">` : "第"+item.display_rank+"名"}</div>
      </div>
    `).join("");
  }

  async function loadVipRank(){
    // v378 guard loadVipRank
    if(typeof dreamIsLoginPageV378==="function" && dreamIsLoginPageV378()) return;
    const host = $("[data-list='vip-rank']");
    if(host && !host.innerHTML.trim()) host.innerHTML = `<div class="row"><div class="badge">…</div><div>載入中...</div></div>`;
    try{
      const res = await api("vip_ranking");
      const ranking = normalizeRanking(res.ranking || res.items || res.data || []);
      state.ranking = ranking;
      renderTop3(ranking);
      renderVipRankList(ranking);
    }catch(err){
      console.warn("[vip_ranking]", err.message);
    }
  }

  function normalizeShopItems(res){
    const arr = Array.isArray(res?.items) ? res.items : Array.isArray(res?.shop_items) ? res.shop_items : Array.isArray(res?.data) ? res.data : [];
    return arr.map((item, index)=>({
      id: item.id ?? item.item_id ?? index + 1,
      name: item.name ?? item.title ?? "未命名商品",
      category: item.category ?? item.type ?? "未分類",
      scope: item.market_scope ?? item.scope ?? item.game_scope ?? item.game_type ?? item.game ?? item.game_name ?? "",
      cost: Number(item.cost ?? item.coin ?? item.price ?? 0),
      desc: item.desc ?? item.description ?? "",
      image_url: normalizeImage(item.image_url || item.image || item.cover || ""),
      sold_count: Number(item.sold_count || item.sold || item.exchange_count || 0)
    }));
  }

  function renderMarketItems(){
    const host = $("[data-list='market-items']");
    if(!host) return;
    const keyword = ($("#marketSearch")?.value || "").trim().toLowerCase();
    let list = [...state.shopItems];
    if(state.activeMarketCat && state.activeMarketCat !== "全部"){
      list = list.filter(x => String(x.category) === state.activeMarketCat);
    }
    if(keyword){
      list = list.filter(x => String(x.name).toLowerCase().includes(keyword) || String(x.category).toLowerCase().includes(keyword) || String(x.desc).toLowerCase().includes(keyword));
    }
    if(!list.length){
      host.innerHTML = `<div class="empty-card">目前沒有符合的商品</div>`;
      return;
    }
    host.innerHTML = list.map(item => `
      <article class="product-card" data-market-scope="${escapeHtml(item.scope)}" data-category="${escapeHtml(item.category)}" data-name="${escapeHtml(item.name)}" data-id="${escapeHtml(item.id)}">
        <div class="product-art">
          <div class="product-tag">${escapeHtml(item.category || "商品")}</div>
          ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" style="width:100%;height:100%;object-fit:cover;">` : `<div class="product-symbol">禮</div>`}
        </div>
        <div class="product-body">
          <div class="product-name">${escapeHtml(item.name)}</div>
          <div class="product-meta"><span>${money(item.cost)} 短陌</span><span>已兌 ${money(item.sold_count)}</span></div>
          <div class="product-actions"><button class="exchange-btn" type="button" data-buy-id="${escapeHtml(item.id)}">點擊兌換</button></div>
        </div>
      </article>
    `).join("");
  }

  async function loadMarketItems(){
    // v378 guard loadMarketItems
    if(typeof dreamIsMarketPageV378==="function" && !dreamIsMarketPageV378()) return;
    const host = $("[data-list='market-items']");
    if(!host) return;
    // v242：保留 index.html 內建商品作為保底，不再因 API 失敗覆蓋成「商品載入失敗」
    const fallbackHtml = host.dataset.localFallbackHtml || host.innerHTML;
    host.dataset.localFallbackHtml = fallbackHtml;
    try{
      const res = await api("shop_list");
      const items = normalizeShopItems(res);
      if(items.length){
        state.shopItems = items;
        renderMarketItems();
        window.applyDreamMarketFilter?.();
      }else{
        host.innerHTML = fallbackHtml;
        window.applyDreamMarketFilter?.();
      }
    }catch(err){
      console.warn("[shop_list]", err.message);
      host.innerHTML = fallbackHtml;
      window.applyDreamMarketFilter?.();
    }
  }

  async function loadCompanions(){
    // v377：陪玩列表只允許在陪玩頁渲染，避免塞到首頁。
    const currentHashV377 = (location.hash || "#home").replace(/^#/,"") || "home";
    if(currentHashV377 !== "companion" && currentHashV377 !== "companion-home"){ return; }
    const host = $("[data-list='companions']");
    if(!host) return;
    try{
      const res = await api("companion_front_list");
      const items = res.items || res.companions || res.data || [];
      if(!Array.isArray(items) || !items.length) return;
      host.innerHTML = items.map((c, idx)=>{
        const name = c.display_name || c.name || c.username || "陪玩";
        const role = c.category || c.role || c.type || "名將陪玩";
        const avatar = normalizeImage(c.avatar_url || c.avatar || "");
        return `
          <article class="companion-card" data-role="${escapeHtml(role)}" data-name="${escapeHtml(name)}" data-tags="${escapeHtml(c.status || "")}">
            <div class="art-panel theme-${["a","b","c","d","e","f","g","h"][idx % 8]}">
              ${avatar ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" style="width:100%;height:100%;object-fit:cover;">` : `<div class="avatar-mark">${escapeHtml(name.slice(0,1))}</div>`}
            </div>
            <div class="card-body"><div class="card-top"><div class="name-block"><h3>${escapeHtml(name)}</h3><span>${escapeHtml(role)}</span></div><button class="reserve-btn" type="button" data-companion-id="${escapeHtml(c.id || "")}">預約</button></div></div>
          </article>
        `;
      }).join("");
    }catch(err){
      console.warn("[companion_front_list]", err.message);
    }
  }

  function renderRecords(records){
    const host = $("#page-exchange-record .list");
    if(!host) return;
    if(!records?.length){
      host.innerHTML = `<div class="row"><div class="badge">兌</div><div><div class="row-title">目前沒有兌換紀錄</div><div class="row-sub">完成兌換後會顯示在這裡</div></div></div>`;
      return;
    }
    host.innerHTML = records.map(r => `
      <div class="row">
        <div class="badge">兌</div>
        <div class="row-main"><div class="row-title">${escapeHtml(r.item_name || r.name || r.product_name || "兌換商品")}</div><div class="row-sub">${formatMinute(r.created_at || r.buy_time || r.created_time)}｜${escapeHtml(r.status_text || r.status || "已送出")}</div></div>
        <div class="row-right">${money(r.cost || r.coin || r.price || 0)}短陌</div>
      </div>
    `).join("");
  }

  async function loadExchangeRecords(){
    if(state.user?.buy_records) renderRecords(state.user.buy_records);
    else renderRecords([]);
  }

  function renderRechargeRecords(records, giftRecords=[]){
    const host = $("[data-list='recharge-records']");
    if(!host) return;
    const rows = [];
    for(const r of records || []){
      rows.push(`<div class="row"><div class="badge">儲</div><div class="row-main"><div class="row-title">${escapeHtml(r.method || "短陌儲值")}</div><div class="row-sub">${formatMinute(r.created_at)}｜${escapeHtml(r.status_text || r.status || "審核中")}</div></div><div class="row-right">+${money(r.amount || r.coin || 0)}</div></div>`);
    }
    for(const r of giftRecords || []){
      const delta = Number(r.coin_delta || r.amount || 0);
      rows.push(`<div class="row"><div class="badge">贈</div><div class="row-main"><div class="row-title">${escapeHtml(r.mode_text || r.item || "贈送紀錄")}</div><div class="row-sub">${formatMinute(r.created_at)}｜${escapeHtml(r.note || "")}</div></div><div class="row-right">${delta>=0?"+":""}${money(delta)}</div></div>`);
    }
    host.innerHTML = rows.length ? rows.join("") : `<div class="row"><div class="badge">儲</div><div><div class="row-title">目前沒有儲值紀錄</div><div class="row-sub">送出儲值申請後會顯示在這裡</div></div></div>`;
  }

  async function loadRechargeRecords(){
    // v378 guard loadRechargeRecords
    if(typeof dreamIsLoginPageV378==="function" && dreamIsLoginPageV378()) return; if(window.DreamStableAPI && !window.DreamStableAPI.isLoggedIn()) return;
    if(window.DreamStableAPI && !window.DreamStableAPI.isLoggedIn()) return;
    // v362：未登入不呼叫儲值紀錄，避免 helper 缺失與 401。
    if(!window.dreamIsLoggedInSafeV352()) return;

    // v352：未登入不呼叫儲值紀錄 API，避免 401。
    if(!window.dreamIsLoggedInSafeV352()){
      return;
    }

    // v349：未登入 / session 尚未確認 / guest 狀態下，不呼叫私人紀錄 API。
    if(!window.dreamIsLoggedInSafeV352()){
      return;
    }
    if(document.body.classList.contains("dream-guest") && !document.body.classList.contains("dream-authenticated")){
      return;
    }

    // v347：未登入或 session 尚未確認前，不呼叫私人紀錄 API，避免 401。
    if(!window.dreamIsLoggedInSafeV352()){
      return;
    }

    try{
      const a = await api("recharge_request_history");
      let gifts = [];
      try{
        const b = await api("gift_history");
        gifts = b.records || b.items || [];
      }catch(e){}
      renderRechargeRecords(a.records || a.items || [], gifts);
    }catch(err){
      console.warn("[recharge records]", err.message);
    }
  }

  function buildRechargePage(){
    const panel = $("#page-recharge .sub-panel");
    if(!panel || panel.dataset.liveBuilt === "1") return;
    panel.dataset.liveBuilt = "1";
    panel.innerHTML = `
      <div class="form-stack">
        <div class="text-block">短陌 : NT$ = 1 : 1。固定面額可直接點選，也可自訂金額。</div>
        <div class="recharge-presets" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;"></div>
        <input id="v44_recharge_amount" type="number" min="500" step="100" placeholder="自訂儲值金額">
        <select id="v44_recharge_method"><option value="一般銀行轉帳">一般銀行轉帳</option><option value="無卡匯款">無卡匯款</option></select>
        <input id="v44_recharge_name" placeholder="匯款人姓名">
        <input id="v44_recharge_last5" maxlength="5" inputmode="numeric" placeholder="匯款帳號末 5 碼（無卡匯款可免填）">
        <input id="v44_recharge_time" type="datetime-local">
        <input id="v44_recharge_proof" type="file" accept=".jpg,.jpeg,.webp,.webp,.pdf">
        <textarea id="v44_recharge_note" placeholder="備註"></textarea>
        <button class="btn" id="v44_submit_recharge" type="button">送出儲值申請</button>
      </div>
      <div class="text-block" style="margin-top:12px">付款資料：中國信託 822｜戶名：林x翰｜帳號：901560800917</div>
    `;
    const grid = $(".recharge-presets", panel);
    grid.innerHTML = state.rechargePresets.map(v=>`<button class="small-btn" type="button" data-preset="${v}">${v}</button>`).join("");
  }

  async function submitRechargeRequest(){
    const amount = Number($("#v44_recharge_amount")?.value || 0);
    const method = $("#v44_recharge_method")?.value || "一般銀行轉帳";
    const payerName = $("#v44_recharge_name")?.value.trim() || "";
    const last5 = $("#v44_recharge_last5")?.value.trim() || "";
    const transferTime = $("#v44_recharge_time")?.value || "";
    const note = $("#v44_recharge_note")?.value.trim() || "";
    const proofFile = $("#v44_recharge_proof")?.files?.[0] || null;
    const isPreset = state.rechargePresets.includes(amount);
    if(amount <= 0) return toast("請先選擇或輸入儲值金額");
    if(!isPreset && amount < 500) return toast("自訂儲值金額最低為 500");
    if(!isPreset && amount % 100 !== 0) return toast("自訂金額需以 100 為單位");
    if(!payerName) return toast("請填寫匯款人姓名");
    if(!transferTime) return toast("請填寫匯款時間");
    if(method !== "無卡匯款" && !last5) return toast("請填寫匯款帳號末 5 碼");
    if(!proofFile) return toast("請上傳匯款截圖或交易明細");
    try{
      toast("匯款截圖上傳中...");
      const up = await uploadFile(SUPPORT_UPLOAD_URL, "image", proofFile);
      const imageUrl = up.image_url || up.url || "";
      toast("儲值申請送出中...");
      const res = await api("recharge_request_submit", {amount, method, payer_name:payerName, last5: method === "無卡匯款" ? "" : last5, transfer_time: transferTime.replace("T"," "), note, image_url:imageUrl});
      if(res.ok){
        toast(res.message || "儲值申請已送出");
        $("#v44_recharge_amount").value = "";
        $("#v44_recharge_name").value = "";
        $("#v44_recharge_last5").value = "";
        $("#v44_recharge_time").value = "";
        $("#v44_recharge_note").value = "";
        $("#v44_recharge_proof").value = "";
        loadRechargeRecords();
      }else toast(res.message || "送出失敗");
    }catch(err){ toast(err.message || "送出失敗"); }
  }

  function ensureModal(){
    let modal = $("#v44Modal");
    if(modal) return modal;
    modal = document.createElement("div");
    modal.id = "v44Modal";
    modal.innerHTML = `<div class="v44-dialog"><button class="v44-close" type="button">×</button><div class="v44-content"></div></div>`;
    document.body.appendChild(modal);
    if(!$("#v44ModalStyle")){
      const style = document.createElement("style");
      style.id = "v44ModalStyle";
      style.textContent = `
        #v44Modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:99998;align-items:center;justify-content:center;padding:18px}
        #v44Modal.show{display:flex}
        #v44Modal .v44-dialog{width:min(92vw,390px);max-height:86svh;overflow:auto;border-radius:18px;border:1px solid rgba(255,221,190,.36);background:linear-gradient(180deg,rgba(86,34,58,.96),rgba(32,12,25,.96));box-shadow:0 20px 60px rgba(0,0,0,.55);padding:18px;position:relative;color:#fff1f6}
        #v44Modal .v44-close{position:absolute;right:12px;top:10px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer}
        #v44Modal h3{margin:0 30px 14px 0;font-size:20px}
        #v44Modal input,#v44Modal select,#v44Modal textarea{width:100%;margin:7px 0;padding:11px;border-radius:12px;border:1px solid rgba(255,221,190,.28);background:rgba(0,0,0,.28);color:#fff}
        #v44Modal textarea{min-height:82px;resize:vertical}
        #v44Modal .btn{width:100%;margin-top:10px}
        #v44Modal .linkline{display:flex;gap:12px;justify-content:center;margin-top:12px;font-size:13px}
        #v44Modal .linkline button{border:0;background:transparent;color:#ffd1e2;cursor:pointer}
      `;
      document.head.appendChild(style);
    }
    modal.addEventListener("click", e=>{ if(e.target === modal || e.target.closest(".v44-close")) modal.classList.remove("show"); });
    return modal;
  }

  function openModal(html){
    const modal = ensureModal();
    $(".v44-content", modal).innerHTML = html;
    modal.classList.add("show");
    return modal;
  }

  function openLoginModal(){
    openModal(`
      <h3>會員登入</h3>
      <input id="v44_login_user" placeholder="請輸入帳號">
      <input id="v44_login_pwd" type="password" placeholder="請輸入密碼">
      <button class="btn" id="v44_login_btn" type="button">登入</button>
      <div class="linkline"><button type="button" id="v44_open_register">註冊會員</button><button type="button" data-go="forgot">忘記密碼</button></div>
    `);
  }

  function openRegisterModal(){
    openModal(`
      <h3>會員註冊</h3>
      <input id="v44_reg_user" placeholder="設定帳號（6碼以上）">
      <input id="v44_reg_pwd" type="password" placeholder="設定密碼（8碼以上）">
      <input id="v44_reg_pwd2" type="password" placeholder="確認密碼">
      <input id="v44_reg_email" placeholder="Gmail 信箱">
      <input id="v44_reg_code" placeholder="會員碼（選填）">
      <button class="btn" id="v44_register_btn" type="button">註冊</button>
      <div class="linkline"><button type="button" id="v44_back_login">返回登入</button></div>
    `);
  }

  async function doLogin(){
    const username = $("#v44_login_user")?.value.trim() || "";
    const password = $("#v44_login_pwd")?.value || "";
    if(!username || !password) return toast("請輸入帳號與密碼");
    if(!$("#front_login_terms")?.checked || !$("#front_login_privacy")?.checked) return toast("請先分別勾選服務條款與隱私權政策");
    try{
      const res = await api("login", {username, password});
      if(res.ok){
        updateMemberUI(res.user || getUserPayload(res));
        $("#v44Modal")?.classList.remove("show");
        toast(res.message || "登入成功");
        loadAllLiveData();
      }else toast(res.message || "登入失敗");
    }catch(err){ toast(err.message); }
  }

  async function doRegister(){
    const username = $("#v44_reg_user")?.value.trim() || "";
    const password = $("#v44_reg_pwd")?.value.trim() || "";
    const confirm_password = $("#v44_reg_pwd2")?.value.trim() || "";
    const email = $("#v44_reg_email")?.value.trim() || "";
    const code = $("#v44_reg_code")?.value.trim() || "";
    if(password !== confirm_password) return toast("確認密碼必須相同");
    if(!$("#front_reg_terms")?.checked || !$("#front_reg_privacy")?.checked) return toast("請先分別勾選服務條款與隱私權政策");
    try{
      const res = await api("register", {username, password, confirm_password, email, code});
      toast(res.message || (res.ok ? "註冊成功" : "註冊失敗"));
      if(res.ok) openLoginModal();
    }catch(err){ toast(err.message); }
  }

  async function doRenew(){
    const username = $("[data-v26-input='renew-username']")?.value.trim() || $("#renew_user")?.value.trim() || "";
    const code = $("[data-v26-input='renew-code']")?.value.trim() || $("#renew_code")?.value.trim() || "";
    if(!username || !code) return toast("請輸入帳號與會員碼");
    try{
      const res = await api("renew", {username, code});
      toast(res.message || (res.ok ? "會員已開通 30 天" : "續期失敗"));
      if(res.ok) refreshSession();
    }catch(err){ toast(err.message); }
  }

  async function doForgot(){
    const email = $("#page-forgot input")?.value.trim() || "";
    if(!email) return toast("請先輸入註冊信箱");
    try{
      const res = await api("request_reset", {email});
      toast((res.message || "已送出") + (res.ok ? "，請確認信箱" : ""));
    }catch(err){ toast(err.message); }
  }

  function openBuyModal(itemId){
    const item = state.shopItems.find(x => String(x.id) === String(itemId)) || {id:itemId, name:"兌換商品"};
    state.currentBuyItem = item;
    openModal(`
      <h3>兌換：${escapeHtml(item.name)}</h3>
      <input id="v44_buy_game" placeholder="遊戲名稱">
      <input id="v44_buy_server" placeholder="伺服器">
      <input id="v44_buy_role" placeholder="角色名稱">
      <input id="v44_buy_uid" placeholder="角色 UID">
      <input id="v44_buy_time" type="datetime-local">
      <select id="v44_buy_assign"><option value="auto">自動派單</option><option value="customer_service">客服協助</option></select>
      <textarea id="v44_buy_note" placeholder="備註"></textarea>
      <button class="btn" id="v44_submit_buy" type="button">確認兌換</button>
    `);
  }

  async function submitBuy(){
    if(!state.currentBuyItem) return;
    const game_name = $("#v44_buy_game")?.value.trim() || "";
    const server_name = $("#v44_buy_server")?.value.trim() || "";
    const role_name = $("#v44_buy_role")?.value.trim() || "";
    const role_uid = $("#v44_buy_uid")?.value.trim() || "";
    const reserve_time = $("#v44_buy_time")?.value || "";
    const assign_type = $("#v44_buy_assign")?.value || "auto";
    const note = $("#v44_buy_note")?.value.trim() || "";
    if(!game_name || !server_name || !role_name || !role_uid || !reserve_time) return toast("請完整填寫必填資料");
    try{
      const res = await api("buy", {item_id: state.currentBuyItem.id, game_name, server_name, role_name, role_uid, reserve_time: reserve_time.replace("T"," "), assign_type, note});
      toast(res.message || (res.ok ? "兌換成功" : "兌換失敗"));
      if(res.ok){
        $("#v44Modal")?.classList.remove("show");
        refreshSession();
        loadExchangeRecords();
      }
    }catch(err){ toast(err.message); }
  }

  async function uploadAvatar(){
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.webp,.webp";
    input.onchange = async ()=>{
      const file = input.files?.[0];
      if(!file) return;
      try{
        toast("大頭照上傳中...");
        const data = await uploadFile(AVATAR_UPLOAD_URL, "avatar", file);
        toast(data.message || "大頭照已更新");
        refreshSession();
        loadVipRank();
      }catch(err){ toast(err.message); }
    };
    input.click();
  }

  async function loadAllLiveData(){
    // v355：舊版 live data 只呼叫同作用域內存在的函式，避免 loadShop is not defined。
    try{ await loadVipRank(); }catch(e){ console.warn("[loadVipRank]", e.message || e); }
    try{ await loadMarketItems(); }catch(e){ console.warn("[loadMarketItems]", e.message || e); }
    try{ await loadCompanions(); }catch(e){ console.warn("[loadCompanions]", e.message || e); }

    if(!state.user){
      return;
    }

    try{ await loadExchangeRecords(); }catch(e){ console.warn("[loadExchangeRecords]", e.message || e); }
    try{ await loadRechargeRecords(); }catch(e){ console.warn("[loadRechargeRecords]", e.message || e); }
  }

  function wireEvents(){
    document.addEventListener("click", async e=>{
      if(e.target.closest("[data-bind='member-avatar']") || e.target.closest("[data-bind='member-name']")){
        if(!state.user){ e.preventDefault(); openLoginModal(); }
      }

      const cat = e.target.closest("#marketCats .category-chip");
      if(cat){
        state.activeMarketCat = cat.dataset.category || "全部";
        $all("#marketCats .category-chip").forEach(x=>x.classList.toggle("active", x === cat));
        renderMarketItems();
      }

      if(e.target.closest("[data-preset]")){
        const val = e.target.closest("[data-preset]").dataset.preset;
        const input = $("#v44_recharge_amount");
        if(input) input.value = val;
      }

      if(e.target.closest("#v44_submit_recharge")) submitRechargeRequest();
      if(e.target.closest("#v44_login_btn")) doLogin();
      if(e.target.closest("#v44_register_btn")) doRegister();
      if(e.target.closest("#v44_open_register")) openRegisterModal();
      if(e.target.closest("#v44_back_login")) openLoginModal();
      if(e.target.closest("#v44_submit_buy")) submitBuy();

      const buyBtn = e.target.closest("#productGrid [data-buy-id], #productGrid .exchange-btn");
      if(buyBtn){
        const card = buyBtn.closest(".product-card");
        const id = buyBtn.dataset.buyId || card?.dataset.productId || card?.dataset.id || "";
        if(window.openMarketProduct && card){ e.preventDefault(); e.stopPropagation(); window.openMarketProduct(id, card); return; }
      }

      const cartBtn = e.target.closest("#productGrid [data-cart-id]");
      if(cartBtn){
        const card = cartBtn.closest(".product-card");
        const id = cartBtn.dataset.cartId || card?.dataset.productId || card?.dataset.id || "";
        if(window.openMarketProduct && card){ e.preventDefault(); e.stopPropagation(); window.openMarketProduct(id, card); return; }
      }

      if(e.target.closest("[data-v26-action='renew-code']")) doRenew();

      if(e.target.closest("#page-forgot .btn")) doForgot();

      const setting = e.target.closest("#settingMenu button");
      if(setting){
        const t = setting.textContent.trim();
        if(t.includes("編輯大頭照")) uploadAvatar();
        if(t.includes("開啟手機推播")) toast("手機推播會依瀏覽器權限開啟");
      }
    });

    $("#marketSearch")?.addEventListener("input", renderMarketItems);
  }

  function init(){
    if(state.initialized) return;
    state.initialized = true;
    buildRechargePage();
    wireEvents();
    loadAllLiveData();
  }

  window.DreamAPI = {
    api,
    refreshSession,
    loadMemberProfile: refreshSession,
    loadVipRank,
    loadMarketItems,
    loadCompanions,
    loadRechargeRecords,
    loadExchangeRecords,
    uploadAvatar,
    buildRechargePage,
    openLoginModal
  };

  document.addEventListener("DOMContentLoaded", init);
})();



/* v45：刪除假資料、登入守門、陪玩帳號登入前台 */
(function(){
  const cfg = window.DREAM_CONFIG || {};
  const API_BASE = cfg.API_BASE || "https://api.131rwjuh.com/api.php";
  const AVATAR_UPLOAD_URL = cfg.AVATAR_UPLOAD_URL || "https://api.131rwjuh.com/upload_avatar.php";
  const SUPPORT_UPLOAD_URL = cfg.SUPPORT_UPLOAD_URL || "https://api.131rwjuh.com/support_upload.php";
  const UPLOAD_BASE = cfg.UPLOAD_BASE || "https://api.131rwjuh.com";

  const PUBLIC_PAGES = new Set(["home","login","register","forgot","companion","inn","market","market-rules"]);
  let loginType = "member";
  let authUser = null;
  let authType = null;

  
  function dreamIsLoggedInSafeV352(){
    try{
      if(typeof authUser !== "undefined" && authUser) return true;
      if(typeof authType !== "undefined" && authType) return true;
    }catch(e){}
    try{
      return document.body.classList.contains("dream-authenticated") && !document.body.classList.contains("dream-guest");
    }catch(e){}
    return false;
  }
function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function money(n){ return Number(n || 0).toLocaleString("zh-TW"); }
  function htmlEscape(s){ return String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
  function imgUrl(src){
    src = String(src || "").trim();
    if(!src) return "";
    if(/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
    if(src.startsWith("/")) return UPLOAD_BASE.replace(/\/$/,"") + src;
    return UPLOAD_BASE.replace(/\/$/,"") + "/" + src.replace(/^\//,"");
  }
  function toast(msg){
    let el = $("#v45Toast");
    if(!el){
      el = document.createElement("div");
      el.id = "v45Toast";
      el.style.cssText = "position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,360px);padding:12px 14px;border-radius:14px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.95);color:#fff1f6;text-align:center;font-size:13px;z-index:999999;box-shadow:0 14px 28px rgba(0,0,0,.4);opacity:0;transition:.2s";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toast.t);
    toast.t = setTimeout(()=>el.style.opacity="0", 1900);
  }
  async function api(action, payload={}){
    const res = await fetch(API_BASE, {
      method:"POST",
      credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action, ...payload})
    });
    const text = await res.text();
    try{
      const parsed = JSON.parse(text);
      if(["login","companion_login"].includes(action)){
        window.DreamLoginDebug = {action, payload, response: parsed, status: res.status};
      }
      return parsed;
    }
    catch(e){return {ok:false,message:"API 回傳格式錯誤：" + text.slice(0,80)};}
  }
  async function apiTry(actions, payload={}){
    let last = null;
    for(const action of actions){
      try{
        const res = await api(action, payload);
        last = res;
        if(res && res.ok) return res;
      }catch(e){ last = {ok:false,message:e.message}; }
    }
    return last || {ok:false,message:"操作失敗"};
  }
  function pageNameFromHash(){
    const h = (location.hash || "#home").slice(1);
    return h || "home";
  }
  function goLogin(msg){
    if(msg) toast(msg);
    if(typeof window.showPage === "function") window.showPage("login");
    else location.hash = "#login";
  }
  function requireAuth(pageOrMsg){
    if(authUser || authType) return true;
    goLogin(typeof pageOrMsg === "string" ? pageOrMsg : "請先登入");
    return false;
  }
  function isProtectedPage(page){ return !PUBLIC_PAGES.has(page); }
  function guardCurrentPage(){
    const page = pageNameFromHash();
    if(isProtectedPage(page) && !authUser && !authType){ goLogin("請先登入後再使用"); return false; }
    return true;
  }

  function cleanVipTitleV45(title, code){
    return String(title || "")
      .replace("VIP等級：","")
      .replace(/[（）()]/g," ")
      .replace(/\bSVIP\b/ig," ")
      .replace(/\bVIP\s*(10|[1-9])\b/ig," ")
      .replace(String(code || "")," ")
      .replace(/\s+/g," ")
      .trim();
  }
  function formatVipLevelV45(code, title){
    const cleaned = cleanVipTitleV45(title, code);
    return "VIP等級：" + code + (cleaned ? " " + cleaned : "");
  }
  function vipLevelLabel(user, type){
    if(type === "companion") return "登入身分：陪玩";
    if(!user) return "VIP等級：無VIP會員";
    if(user.svip || String(user.vip_level || user.vip_rank || "").toUpperCase() === "SVIP") return formatVipLevelV45("SVIP", user.vip_name || user.vip_title || "客官");
    const raw = user.vip_level ?? user.vip_rank ?? user.vip ?? user.member_vip_level ?? "";
    const str = String(raw).toUpperCase().trim();
    const matched = str.match(/VIP\s*([1-9]|10)/);
    if(matched) return formatVipLevelV45("VIP" + matched[1], user.vip_name || user.vip_title || "");
    const num = Number(raw);
    if(num >= 1 && num <= 10) return formatVipLevelV45("VIP" + num, user.vip_name || user.vip_title || "");
    const expire = user.member_expire || user.expire_at || user.vip_expire || "";
    if(!expire || expire === "未開通") return "VIP等級：無VIP會員";
    return "VIP等級：無VIP會員";
  }

  function setMemberUI(user, type="member"){
    authUser = user || null;
    authType = user ? type : null;
    window.authUser = authUser;
    window.authType = authType;
    document.body.classList.toggle("dream-guest", !user);
    document.body.classList.toggle("dream-authenticated", !!user);
    const name = user ? (user.display_name || user.username || user.name || (type === "companion" ? "陪玩帳號" : "會員")) : "點擊登入";
    const id = user ? (user.member_id || user.user_code || user.id || user.user_id || user.companion_id || "00000000") : "";
    const coin = user ? (user.coin || user.short_coin || 0) : 0;
    const exp = user ? (user.exp || user.vip_exp || 0) : 0;
    const vipName = user ? (user.vip_name || user.vip_title || user.vip_level_name || (type === "companion" ? "陪玩帳號" : "客官")) : "未登入";
    const expire = user ? (user.member_expire || user.expire_at || user.vip_expire || (type === "companion" ? "陪玩登入" : "未開通")) : "尚未開通";
    const vipOpen = user ? ((expire && expire !== "未開通") || type === "companion" ? "開通" : "鎖定") : "鎖定";
    const avatar = imgUrl(user?.avatar_url || user?.avatar || "");

    $all("[data-bind='member-id']").forEach(el=>el.textContent = user ? ((type === "companion" ? "陪玩 ID：" : "會員 ID：") + id) : "");
    $all("[data-bind='member-name']").forEach(el=>el.textContent = name);
    $all("[data-bind='vip-level']").forEach(el=>el.textContent = vipLevelLabel(user, type));
    $all("[data-bind='vip-exp']").forEach(el=>el.textContent = user ? ("VIP經驗值：" + money(exp) + " / 298888") : "");
    $all("[data-bind='member-gender-icon']").forEach(el=>{ const g=String(user?.gender || user?.sex || '').toLowerCase(); el.textContent = g.includes('female') || g.includes('女') ? '♀' : (g.includes('male') || g.includes('男') ? '♂' : '◇'); });
    $all("[data-bind='member-profile-tip']").forEach(el=>el.textContent = user ? (type === "companion" ? "陪玩個人中心" : "登入後可編輯性別圖示、簡介與成就展示") : "登入後可查看個人中心");
    $all("[data-bind='coin']").forEach(el=>el.textContent = money(coin));
    $all("[data-bind='limited-coin']").forEach(el=>el.textContent = money(user?.limited_coin || user?.limited_short_coin || user?.limited_balance || 0));
    $all("[data-bind='vip-total']").forEach(el=>el.textContent = money(user?.vip_total_recharge_coin || 0));
    $all("[data-bind='normal-total']").forEach(el=>el.textContent = "普通累計儲值：" + money(user?.normal_total_recharge_coin || 0));
    $all("[data-bind='vip-status-main']").forEach(el=>el.textContent = vipOpen);
    $all("[data-bind='vip-status']").forEach(el=>el.textContent = "VIP權益：（" + vipOpen + "）");
    $all("[data-bind='vip-expire']").forEach(el=>el.textContent = "到期：" + expire);
    window.__dreamFrontAuth = { user: authUser || null, type: authType || null, exclusive: !!(type === "companion" || vipOpen === "開通") };
    try{ window.dispatchEvent(new CustomEvent("dream-auth-updated", {detail: window.__dreamFrontAuth})); }catch(e){}
    $all("[data-bind='member-avatar']").forEach(el=>{
      if(avatar) el.innerHTML = `<img src="${htmlEscape(avatar)}" alt="${htmlEscape(name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      else el.textContent = name.slice(0,1) || "夢";
    });
  }
  function clearFakeTop3(){
    ["first","second","third"].forEach(cls=>{
      const a = $(`.top3-avatar.${cls}`);
      const t = $(`.top3-text.${cls}`);
      if(a) a.textContent = "?";
      if(t) t.innerHTML = `<span class="name">載入中</span><span class="value">VIP經驗值 0</span>`;
    });
  }
  function renderTop3(ranking){
    const pos = [{cls:"first",item:ranking[0]},{cls:"second",item:ranking[1]},{cls:"third",item:ranking[2]}];
    for(const p of pos){
      const a = $(`.top3-avatar.${p.cls}`);
      const t = $(`.top3-text.${p.cls}`);
      if(!p.item){
        if(a) a.textContent = "?";
        if(t) t.innerHTML = `<span class="name">暫無資料</span><span class="value">VIP經驗值 0</span>`;
        continue;
      }
      const name = p.item.username || p.item.display_name || "會員";
      const av = imgUrl(p.item.avatar_url || p.item.avatar || "");
      const exp = Number(p.item.exp || p.item.vip_exp || 0);
      if(a) a.innerHTML = av ? `<img src="${htmlEscape(av)}" alt="${htmlEscape(name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : htmlEscape(name.slice(0,1));
      if(t) t.innerHTML = `<span class="name">${htmlEscape(name)}</span><span class="value">VIP經驗值 ${money(exp)}</span>`;
    }
    const scroll = $(".rank-scroll");
    if(scroll){
      const rest = ranking.slice(3,13);
      scroll.innerHTML = rest.length ? rest.map((x,i)=>`<div class="rank-chip"><span class="rank-no">${i+4}</span><span class="rank-title">${htmlEscape(x.username || x.display_name || "會員")}</span><span class="rank-value">VIP經驗值 ${money(x.exp || x.vip_exp || 0)}</span></div>`).join("") : `<div class="rank-chip"><span class="rank-no">…</span><span class="rank-title">暫無資料</span><span class="rank-value">VIP經驗值 0</span></div>`;
    }
  }
  async function loadRanking(){
    // v378 guard loadRanking
    if(typeof dreamIsLoginPageV378==="function" && dreamIsLoginPageV378()) return;
    if(window.__loadRankingRunningV376) return;
    window.__loadRankingRunningV376 = true;
    try {
    const res = await api("vip_ranking");
    const rows = (res.ranking || res.items || res.data || []).map((x,i)=>({
      ...x,
      username:x.username || x.display_name || x.member_username || "會員",
      exp:Number(x.exp || x.vip_exp || x.total_exp || 0),
      avatar_url:x.avatar_url || x.avatar || "",
      rank:Number(x.display_rank || x.rank || i+1)
    })).sort((a,b)=>a.rank-b.rank);
    renderTop3(rows);
    const host = $("[data-list='vip-rank']");
    if(host){
      host.innerHTML = rows.length ? rows.slice(0,100).map(x=>`<div class="row"><div class="badge">${x.rank}</div><div class="row-main"><div class="row-title">${htmlEscape(x.username)}</div><div class="row-sub">VIP經驗值：${money(x.exp)}</div></div><div class="row-right">第 ${x.rank} 名</div></div>`).join("") : `<div class="row"><div class="badge">榜</div><div><div class="row-title">目前沒有排行榜資料</div><div class="row-sub">等待後台帶入</div></div></div>`;
    }
    } catch(e){ console.warn("[loadRanking]", e.message || e); }
    finally{ window.__loadRankingRunningV376 = false; }
  }

  async function loadShop(){
    // v378 guard loadShop
    if(typeof dreamIsMarketPageV378==="function" && !dreamIsMarketPageV378()) return;
    const host = $("[data-list='market-items']");
    if(!host) return;
    const fallbackHtml = host.dataset.localFallbackHtml || host.innerHTML;
    host.dataset.localFallbackHtml = fallbackHtml;
    let res = {};
    try{ res = await api("shop_list"); }
    catch(err){ console.warn("[shop_list]", err.message); host.innerHTML = fallbackHtml; window.applyDreamMarketFilter?.(); return; }
    const items = res.items || res.shop_items || res.data || [];
    if(!Array.isArray(items) || !items.length){
      host.innerHTML = fallbackHtml;
      window.applyDreamMarketFilter?.();
      return;
    }
    host.innerHTML = items.map((item,idx)=>{
      const id = item.id || item.item_id || idx+1;
      const name = item.name || item.title || "未命名商品";
      const cat = item.category || item.type || "未分類";
      const price = Number(item.cost || item.coin || item.price || 0);
      const im = imgUrl(item.image_url || item.image || item.cover || "");
      return `<article class="product-card" data-category="${htmlEscape(cat)}" data-name="${htmlEscape(name)}" data-id="${id}">
        <div class="product-art"><div class="product-tag">${htmlEscape(cat)}</div>${im ? `<img src="${htmlEscape(im)}" alt="${htmlEscape(name)}" style="width:100%;height:100%;object-fit:cover;">` : `<div class="product-symbol">禮</div>`}</div>
        <div class="product-body"><div class="product-name">${htmlEscape(name)}</div><div class="product-meta"><span>${money(price)} 短陌</span><span>已兌 ${money(item.sold_count || 0)}</span></div><div class="product-actions"><button class="exchange-btn" type="button" data-buy-id="${id}">點擊兌換</button></div></div>
      </article>`;
    }).join("");
  }
  async function loadCompanions(){
    const host = $("[data-list='companions']");
    if(host) host.innerHTML = `<div class="empty-card">陪玩資料載入中...</div>`;
    const res = await apiTry(["companion_front_list","companion_status"]);
    const items = res.items || res.companions || res.data || [];
    if(!host) return;
    if(!Array.isArray(items) || !items.length){
      host.innerHTML = `<div class="empty-card">目前沒有陪玩資料</div>`;
      return;
    }
    host.innerHTML = items.map((c,idx)=>{
      const name = c.display_name || c.name || c.username || "陪玩";
      const role = c.category || c.role || c.type || "名將陪玩";
      const av = imgUrl(c.avatar_url || c.avatar || "");
      return `<article class="companion-card" data-role="${htmlEscape(role)}" data-name="${htmlEscape(name)}"><div class="art-panel">${av ? `<img src="${htmlEscape(av)}" alt="${htmlEscape(name)}" style="width:100%;height:100%;object-fit:cover;">` : `<div class="avatar-mark">${htmlEscape(name.slice(0,1))}</div>`}</div><div class="card-body"><div class="card-top"><div class="name-block"><h3>${htmlEscape(name)}</h3></div><button class="reserve-btn" type="button" data-companion-id="${c.id||""}">預約</button></div></div></article>`;
    }).join("");
  }
  async function loadRecords(){
    if(window.DreamStableAPI && !window.DreamStableAPI.isLoggedIn()) return;
    // v362：未登入不呼叫禮物/購買紀錄，避免 helper 缺失與 401。
    if(!window.dreamIsLoggedInSafeV352()) return;

    // v352：未登入不呼叫禮物/購買紀錄 API，避免 401。
    if(!window.dreamIsLoggedInSafeV352()){
      return;
    }

    // v349：未登入 / session 尚未確認 / guest 狀態下，不呼叫私人禮物/購買紀錄 API。
    if(!window.dreamIsLoggedInSafeV352()){
      return;
    }
    if(document.body.classList.contains("dream-guest") && !document.body.classList.contains("dream-authenticated")){
      return;
    }

    // v347：未登入或 session 尚未確認前，不呼叫私人禮物/購買紀錄 API，避免 401。
    if(!window.dreamIsLoggedInSafeV352()){
      return;
    }

    const records = authUser?.buy_records || [];
    const host = $("#page-exchange-record .list");
    if(!host) return;
    host.innerHTML = records.length ? records.map(r=>`<div class="row"><div class="badge">兌</div><div class="row-main"><div class="row-title">${htmlEscape(r.item_name || r.name || "兌換商品")}</div><div class="row-sub">${htmlEscape(r.created_at || r.buy_time || "")}｜${htmlEscape(r.status_text || r.status || "已送出")}</div></div><div class="row-right">${money(r.cost || r.coin || 0)}短陌</div></div>`).join("") : `<div class="row"><div class="badge">兌</div><div><div class="row-title">目前沒有兌換紀錄</div><div class="row-sub">完成兌換後會顯示在這裡</div></div></div>`;
  }
  async function loadRechargeRecords(){
    const host = $("[data-list='recharge-records']");
    if(!host) return;
    const a = await api("recharge_request_history");
    const b = await api("gift_history");
    const rows = [];
    for(const r of (a.records || [])) rows.push(`<div class="row"><div class="badge">儲</div><div class="row-main"><div class="row-title">${htmlEscape(r.method || "短陌儲值")}</div><div class="row-sub">${htmlEscape(r.created_at || "")}｜${htmlEscape(r.status_text || r.status || "審核中")}</div></div><div class="row-right">+${money(r.amount || r.coin || 0)}</div></div>`);
    for(const r of (b.records || [])) rows.push(`<div class="row"><div class="badge">贈</div><div class="row-main"><div class="row-title">${htmlEscape(r.mode_text || r.item || "贈送紀錄")}</div><div class="row-sub">${htmlEscape(r.created_at || "")}｜${htmlEscape(r.note || "")}</div></div><div class="row-right">${money(r.coin_delta || r.amount || 0)}</div></div>`);
    host.innerHTML = rows.length ? rows.join("") : `<div class="row"><div class="badge">儲</div><div><div class="row-title">目前沒有儲值紀錄</div><div class="row-sub">送出儲值申請後會顯示在這裡</div></div></div>`;
  }
  async function refreshSession(){
    const res = await api("session");
    if(res.ok && res.logged_in && res.user){
      setMemberUI(res.user, "member");
      return true;
    }
    // 陪玩登入前台時，後台若有獨立 session action 可由 companion_session 回傳
    const cres = await apiTry(["companion_session","companion_profile"], {});
    if(cres.ok && (cres.companion || cres.user || cres.data)){
      setMemberUI(cres.companion || cres.user || cres.data, "companion");
      return true;
    }
    setMemberUI(null);
    return false;
  }
  async function login(){
    const username = $("#front_login_user")?.value.trim() || "";
    const password = $("#front_login_pwd")?.value || "";
    if(!username || !password) return toast("請輸入帳號與密碼");

    const payload = { username, password, account: username, email: username };
    const action = loginType === "companion" ? "companion_login" : "login";

    let res;
    try{
      res = await api(action, payload);
    }catch(e){
      res = {ok:false, message:e.message || "連線失敗"};
    }

    window.DreamLoginDebug = { action, payload, response: res, status: res && res.ok ? 200 : 0 };

    if(!res || !res.ok){
      const msg = (res && (res.message || res.error)) ? (res.message || res.error) : "登入失敗";
      console.warn("[DreamLoginFail]", action, res);
      toast(msg);
      return;
    }

    const user = res.user || res.companion || res.data || {username};
    const role = action === "companion_login" ? "companion" : "member";

    try{ setMemberUI(user, role); }catch(e){ console.warn("[DreamLogin setMemberUI]", e.message || e); }

    try{
      localStorage.setItem("dream_persist_login_type", role);
      localStorage.setItem("dream_persist_user", JSON.stringify(user));
      if($("#front_login_remember")?.checked) localStorage.setItem("dream_remember_username", username);
    }catch(e){}

    toast(res.message || (role === "companion" ? "陪玩登入成功" : "登入成功"));

    const targetPage = role === "companion" ? "companion-home" : "member";
    setTimeout(function(){
      try{
        if(typeof window.showPage === "function") window.showPage(targetPage);
        else location.hash = "#" + targetPage;
      }catch(e){ location.hash = "#" + targetPage; }
    }, 120);

    setTimeout(function(){
      try{ refreshSession(); }catch(e){}
      try{ loadProtectedData(); }catch(e){}
    }, 350);
  }
  async function register(){
    const username = $("#front_reg_user")?.value.trim() || "";
    const password = $("#front_reg_pwd")?.value.trim() || "";
    const confirm_password = $("#front_reg_pwd2")?.value.trim() || "";
    const email = $("#front_reg_email")?.value.trim() || "";
    const code = $("#front_reg_code")?.value.trim() || "";
    if(password !== confirm_password) return toast("確認密碼必須相同");
    const res = await api("register", {username,password,confirm_password,email,code});
    toast(res.message || (res.ok ? "註冊成功" : "註冊失敗"));
    if(res.ok && typeof window.showPage === "function") window.showPage("login");
  }
  async function renew(){
    /* no auth limit */
    const username = $("[data-v26-input='renew-username']")?.value.trim() || "";
    const code = $("[data-v26-input='renew-code']")?.value.trim() || "";
    if(!username || !code) return toast("請輸入帳號與會員碼");
    const res = await api("renew", {username, code});
    toast(res.message || (res.ok ? "會員已開通 30 天" : "續期失敗"));
    if(res.ok) refreshSession();
  }
  async function forgot(){
    const email = $("#page-forgot input")?.value.trim() || "";
    if(!email) return toast("請先輸入註冊信箱");
    const res = await api("request_reset", {email});
    toast(res.message || (res.ok ? "已送出" : "送出失敗"));
  }

  function normalizeCompanionListV346(res){
    if(!res || !res.ok) return [];
    const list = res.companions || res.list || res.data || res.items || [];
    return Array.isArray(list) ? list : [];
  }

  function loadProtectedData(){
    // v362：loadProtectedData 私人紀錄必須登入才載入。

    // v347：公開資料可載入；私人紀錄必須登入後才載入。
    loadShop();
    loadCompanions();
    if(!window.__dreamAuthSafe.isLoggedIn()) return;
    if(window.dreamIsLoggedInSafeV352()) loadRecords();
    if(window.dreamIsLoggedInSafeV352()) loadRechargeRecords();
  }
  function wire(){
    document.addEventListener("click", async e=>{
      const tab = e.target.closest("[data-login-tab]");
      if(tab){
        e.preventDefault();
        loginType = tab.dataset.loginTab === "companion" ? "companion" : "member";
        $all("[data-login-tab]").forEach(b=>b.classList.toggle("active", b === tab));
        $all("[data-member-only-forgot]").forEach(el=>el.style.display = loginType === "companion" ? "none" : "inline-block");
        return;
      }
      const switcher = e.target.closest("[data-login-form-switch]");
      if(switcher){
        e.preventDefault();
        const target = switcher.dataset.loginFormSwitch;
        $all("[data-login-form]").forEach(form=>form.classList.toggle("active", form.dataset.loginForm === target));
        return;
      }
      if(e.target.closest("#front_login_btn")){ e.preventDefault(); await login(); return; }
      if(e.target.closest("#front_reg_btn")){ e.preventDefault(); await register(); return; }
      if(e.target.closest("#page-forgot .btn")){ e.preventDefault(); await forgot(); return; }
    }, true);
    window.addEventListener("hashchange", guardCurrentPage);
  }
  async function init(){
    clearFakeTop3();
    wire();
    const savedUser = localStorage.getItem("dream_persist_user");
    const savedType = localStorage.getItem("dream_persist_login_type");
    if(savedUser && savedType){ try{ setMemberUI(JSON.parse(savedUser), savedType); }catch(e){} }
    try{ await refreshSession(); }catch(e){ console.warn('[refreshSession]', e.message || e); }
    loadRanking(); // 排行榜可公開顯示
    guardCurrentPage();
    if(window.__dreamAuthSafe.isLoggedIn()) loadProtectedData();
  }
  window.DreamAuthGuard = {requireAuth, refreshSession, loadRanking, loadShop, loadCompanions};
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();






/* v361-formal-blank-no-fake-1778907686 remove remaining demo UI */
(function(){
  if(window.__dreamFormalBlankNoFakeV361) return;
  window.__dreamFormalBlankNoFakeV361 = true;

  const DEMO_RE = /測試|假資料|Demo|DEMO|小白|蒼岑|夜璃|雲歌|墨染|夜色客棧|短陌儲值\s*2026|收藏的動態貼文|天策陪玩｜已關注/;

  function removeDemoNodes(){
    document.querySelectorAll("[data-demo-only],.demo-only,.fake-data,.mock-data").forEach(el=>el.remove());

    document.querySelectorAll(".row,.post-card,.companion-card").forEach(el=>{
      const txt = (el.textContent || "").replace(/\s+/g," ");
      if(DEMO_RE.test(txt)) el.remove();
    });

    const grids = [
      [document.querySelector("#companionGrid"), "目前尚無陪玩資料"],
      [document.querySelector("[data-list='recharge-records']"), "目前尚無儲值紀錄"],
      [document.querySelector("#innPostList"), ""]
    ];
    grids.forEach(([root,msg])=>{
      if(root && !root.children.length && msg){
        root.innerHTML = `<div class="companion-empty">${msg}</div>`;
      }
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", ()=>setTimeout(removeDemoNodes,80));
  else setTimeout(removeDemoNodes,80);

  window.addEventListener("hashchange", ()=>setTimeout(removeDemoNodes,100));
  const mo = new MutationObserver(()=>{ clearTimeout(removeDemoNodes._t); removeDemoNodes._t=setTimeout(removeDemoNodes,120); });
  if(document.documentElement) mo.observe(document.documentElement, {childList:true, subtree:true});
})();





/* v369-clean helper: only defines missing login checker, no DOM scanning */
(function(){
  if(window.__dreamCleanHelperV369) return;
  window.__dreamCleanHelperV369 = true;
  window.dreamIsLoggedInSafeV352 = window.dreamIsLoggedInSafeV352 || function(){
    try{
      const user = localStorage.getItem("dream_persist_user");
      const keep = localStorage.getItem("dream_login_keep")==="1" || localStorage.getItem("dream_permanent_login")==="1";
      if(keep && user && user !== "null" && user !== "{}") return true;
    }catch(e){}
    try{return document.body.classList.contains("dream-authenticated") && !document.body.classList.contains("dream-guest");}catch(e){}
    return false;
  };
})();
