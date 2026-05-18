/* v389-formal-version-cleanup */
(function(){
  if(window.__dreamProfileServiceSyncV388) return;
  window.__dreamProfileServiceSyncV388 = true;
  console.info("[Dream v388] profile service sync controller loaded");

  const $ = (s,r=document)=>r.querySelector(s);
  const $all = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const API_BASE = () => {
    try{return (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || "https://api.131rwjuh.com/api.php";}catch(e){return "https://api.131rwjuh.com/api.php";}
  };

  let current = {role:null, user:null, profile:null, loadedAt:0};

  function page(){ return (location.hash || "#home").replace(/^#/,"") || "home"; }
  function isLoggedIn(){
    try{
      const u = localStorage.getItem("dream_persist_user");
      return !!(u && u !== "null" && u !== "{}");
    }catch(e){ return false; }
  }
  function normalizeRoleValue(value){
    const v = String(value || "").toLowerCase();
    if(v.includes("companion") || v.includes("playmate") || v.includes("player") || v.includes("staff") || v.includes("陪玩")) return "companion";
    if(v.includes("member") || v.includes("user") || v.includes("customer") || v.includes("會員")) return "member";
    return "";
  }
  function getRole(){
    try{
      if(typeof window.getDreamLoginRole === "function"){
        const r = normalizeRoleValue(window.getDreamLoginRole());
        if(r) return r;
      }
    }catch(e){}
    try{
      const auth = window.__dreamFrontAuth || {};
      const user = auth.user || {};
      const r = normalizeRoleValue(auth.role || auth.type || user.role || user.type || user.identity || "");
      if(r) return r;
    }catch(e){}
    try{
      const r = normalizeRoleValue(localStorage.getItem("dream_persist_login_type") || "");
      if(r) return r;
    }catch(e){}
    return "member";
  }
  function profileIdFor(role){ return role === "companion" ? "companion-self" : "member-self"; }
  function getPersistUser(){
    try{ return JSON.parse(localStorage.getItem("dream_persist_user") || "{}"); }catch(e){ return {}; }
  }
  function toast(msg, sticky){
    let el = $("#dreamProfileSyncToastV388");
    if(!el){
      el = document.createElement("div");
      el.id = "dreamProfileSyncToastV388";
      el.style.cssText = "position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,390px);padding:12px 15px;border-radius:16px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.96);color:#fff;text-align:center;font-size:14px;font-weight:900;z-index:2147483647;box-shadow:0 14px 28px rgba(0,0,0,.45);opacity:1;transition:.2s";
      document.body.appendChild(el);
    }
    el.textContent = String(msg || "");
    el.style.opacity = "1";
    clearTimeout(el._t);
    if(!sticky) el._t = setTimeout(()=>{el.style.opacity="0";}, 2200);
  }
  function escapeHtml(v){
    return String(v ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function firstValue(){
    for(const v of arguments){
      if(v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return "";
  }
  function asArray(v){
    if(Array.isArray(v)) return v.filter(x => String(x ?? "").trim() !== "");
    if(typeof v === "string"){
      const s = v.trim();
      if(!s) return [];
      try{
        const parsed = JSON.parse(s);
        if(Array.isArray(parsed)) return parsed.filter(x => String(x ?? "").trim() !== "");
      }catch(e){}
      return s.split(/[,\u3001/|]/).map(x => x.trim()).filter(Boolean);
    }
    return [];
  }
  function numberText(v, fallback){
    const n = Number(v);
    return Number.isFinite(n) ? String(n) : String(fallback ?? 0);
  }
  function starsHtml(value){
    const n = Math.max(0, Math.min(5, Math.round(Number(value || 0))));
    return Array.from({length:5}, (_, i) => i < n ? "&#9733;" : "&#9734;").join("");
  }
  function profileName(role, profile){
    return String(firstValue(profile.display_name, profile.name, profile.username, profile.nickname, role === "companion" ? "\u5922\u7af6\u966a\u73a9" : "\u5922\u7af6\u6703\u54e1"));
  }
  async function api(action, payload){
    const res = await fetch(API_BASE(), {
      method:"POST",
      credentials:"include",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(Object.assign({action}, payload || {}))
    });
    const text = await res.text();
    let data;
    try{ data = JSON.parse(text || "{}"); }
    catch(e){ data = {ok:false, message:"API 回傳格式錯誤：" + text.slice(0,120), status:res.status}; }
    if(!res.ok && data.ok !== true){ data.ok = false; data.status = res.status; }
    return data;
  }
  function go(p){
    try{ if(typeof window.showPage === "function"){ window.showPage(p); return; } }catch(e){}
    location.hash = "#" + p;
  }

  function normalizeProfile(role, res){
    const local = getPersistUser();
    const data = res && (res.profile || res.user || res.companion || res.data) || {};
    return Object.assign({}, local || {}, data || {}, {role});
  }

  async function loadProfile(force, roleOverride){
    const role = normalizeRoleValue(roleOverride) || getRole();
    if(!isLoggedIn()) return null;
    if(!force && current.role === role && current.profile && Date.now() - current.loadedAt < 15000) return current.profile;

    let res;
    if(role === "companion"){
      res = await api("companion_profile");
      if(!res || !res.ok) res = await api("companion_session");
    }else{
      res = await api("member_profile");
      if(!res || !res.ok) res = await api("session");
    }

    if(!res || !res.ok){
      console.warn("[Dream v388 profile]", res);
      current = {role, user:getPersistUser(), profile:getPersistUser(), loadedAt:Date.now()};
      return current.profile;
    }

    const profile = normalizeProfile(role, res);
    current = {role, user:profile, profile, loadedAt:Date.now()};
    try{
      localStorage.setItem("dream_persist_login_type", role);
      localStorage.setItem("dream_persist_user", JSON.stringify(profile || {}));
      window.__dreamFrontAuth = {type:role, user:profile};
    }catch(e){}
    return profile;
  }

  function profileTitle(role){
    return role === "companion" ? "陪玩資料" : "個人資料";
  }

  function buildProfilePanel(role, profile){
    const name = profile.display_name || profile.name || profile.username || profile.nickname || "";
    const email = profile.email || "";
    const phone = profile.phone || profile.mobile || "";
    const intro = profile.intro || profile.bio || profile.description || profile.self_intro || "";
    const gender = profile.gender || profile.sex || "";
    const avatar = profile.avatar_url || profile.avatar || "";
    const game = profile.game || profile.game_name || profile.category || "";
    const price = profile.price || profile.hourly_price || profile.unit_price || "";
    const status = profile.status || profile.work_status || "";

    const companionExtra = role === "companion" ? `
      <label class="dream-profile-field"><span>服務遊戲 / 分類</span><input id="dreamV388Game" value="${escapeHtml(game)}" placeholder="例如：LOL、傳說、原神"></label>
      <label class="dream-profile-field"><span>服務價格</span><input id="dreamV388Price" value="${escapeHtml(price)}" placeholder="例如：300/小時"></label>
      <label class="dream-profile-field"><span>目前狀態</span><input id="dreamV388Status" value="${escapeHtml(status)}" placeholder="例如：上班中、休息中"></label>
    ` : "";

    return `
      <section class="panel dream-profile-panel-v388" id="dreamProfilePanelV388" data-profile-role="${escapeHtml(role)}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
          <div>
            <h2 style="margin:0;font-size:20px">${profileTitle(role)}</h2>
            <div style="font-size:12px;opacity:.75;margin-top:4px">資料會同步目前登入的${role === "companion" ? "陪玩" : "會員"}帳號</div>
          </div>
          <button type="button" class="btn small-btn" data-v388-profile-refresh>重新整理</button>
        </div>
        <div class="dream-profile-grid-v388">
          <div class="dream-profile-avatar-v388">
            ${avatar ? `<img src="${escapeHtml(avatar)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:22px">` : `<span>${escapeHtml((name || "夢").slice(0,1))}</span>`}
          </div>
          <div class="dream-profile-form-v388">
            <label class="dream-profile-field"><span>顯示名稱</span><input id="dreamV388DisplayName" value="${escapeHtml(name)}" placeholder="輸入顯示名稱"></label>
            <label class="dream-profile-field"><span>Email</span><input id="dreamV388Email" value="${escapeHtml(email)}" placeholder="Email"></label>
            <label class="dream-profile-field"><span>手機 / 聯絡方式</span><input id="dreamV388Phone" value="${escapeHtml(phone)}" placeholder="聯絡方式"></label>
            <label class="dream-profile-field"><span>性別</span><input id="dreamV388Gender" value="${escapeHtml(gender)}" placeholder="男 / 女 / 不公開"></label>
            <label class="dream-profile-field"><span>大頭照網址</span><input id="dreamV388Avatar" value="${escapeHtml(avatar)}" placeholder="https://..."></label>
            ${companionExtra}
            <label class="dream-profile-field full"><span>簡介</span><textarea id="dreamV388Intro" placeholder="介紹自己">${escapeHtml(intro)}</textarea></label>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
          <button type="button" class="btn" data-v388-profile-save>儲存資料</button>
          <button type="button" class="btn ghost" data-v388-profile-back>返回</button>
        </div>
      </section>`;
  }

  function ensureStyle(){
    if($("#dreamProfileStyleV388")) return;
    const st = document.createElement("style");
    st.id = "dreamProfileStyleV388";
    st.textContent = `
      .dream-profile-panel-v388{margin:12px 0;padding:16px;border-radius:22px}
      .dream-profile-grid-v388{display:grid;grid-template-columns:120px 1fr;gap:16px;align-items:start}
      .dream-profile-avatar-v388{width:120px;height:120px;border-radius:24px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;border:1px solid rgba(255,221,235,.22);overflow:hidden}
      .dream-profile-form-v388{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .dream-profile-field{display:flex;flex-direction:column;gap:6px;font-size:13px}
      .dream-profile-field span{opacity:.75}
      .dream-profile-field input,.dream-profile-field textarea{border-radius:14px;border:1px solid rgba(255,221,235,.22);background:rgba(255,255,255,.08);color:inherit;padding:10px 12px;outline:none}
      .dream-profile-field textarea{min-height:96px;resize:vertical}
      .dream-profile-field.full{grid-column:1/-1}
      @media(max-width:680px){.dream-profile-grid-v388{grid-template-columns:1fr}.dream-profile-form-v388{grid-template-columns:1fr}.dream-profile-avatar-v388{width:96px;height:96px}}
    `;
    document.head.appendChild(st);
  }

  function setProfileBind(pageEl, name, value, html){
    if(!pageEl) return;
    pageEl.querySelectorAll(`[data-profile-bind="${name}"]`).forEach(el=>{
      if(html) el.innerHTML = value == null ? "" : String(value);
      else el.textContent = value == null ? "" : String(value);
    });
  }
  function genderLabel(value){
    const s = String(value || "").toLowerCase();
    if(s.includes("female") || s.includes("girl") || s.includes("女")) return "\u2640";
    if(s.includes("male") || s.includes("boy") || s.includes("男")) return "\u2642";
    return "\u25c7";
  }
  function listHtml(items, className, fallback){
    const list = asArray(items).map(item => {
      if(item && typeof item === "object") return firstValue(item.name, item.title, item.label, item.text, item.badge_name);
      return item;
    }).filter(x => String(x || "").trim() !== "").slice(0, 10);
    if(!list.length && fallback) list.push(fallback);
    return list.map(item => `<span class="${className}">${escapeHtml(item)}</span>`).join("");
  }
  function achievementHtml(items){
    const list = asArray(items).map(item => {
      if(item && typeof item === "object") return firstValue(item.name, item.title, item.label, item.badge_name);
      return item;
    }).filter(x => String(x || "").trim() !== "").slice(0, 5);
    while(list.length < 5) list.push("");
    return list.map(item => item
      ? `<div class="achievement-slot"><span class="icon">&#9733;</span><span>${escapeHtml(item)}</span></div>`
      : `<div class="achievement-slot is-empty">\u5c1a\u672a\u8a2d\u5b9a</div>`
    ).join("");
  }
  function syncProfileSettingMenu(pageEl, role){
    if(!pageEl) return;
    const key = "profile-self";
    pageEl.querySelectorAll(".profile-info-setting-wrap [data-setting-toggle]").forEach(btn=>{
      btn.dataset.settingToggle = key;
      btn.setAttribute("aria-label", "\u500b\u4eba\u7c21\u4ecb\u8a2d\u5b9a");
    });
    pageEl.querySelectorAll(".profile-info-setting-menu,[data-setting-menu='profile-companion'],[data-setting-menu='profile-self']").forEach(menu=>{
      menu.dataset.settingMenu = key;
      if(!menu.querySelector('[data-setting-action="edit-profile-info"]')){
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.settingAction = "edit-profile-info";
        btn.dataset.settingScope = role;
        btn.textContent = "\u7de8\u8f2f\u500b\u4eba\u7c21\u4ecb";
        menu.insertBefore(btn, menu.firstChild);
      }
      menu.querySelectorAll("[data-setting-scope]").forEach(btn=>{ btn.dataset.settingScope = role; });
    });
  }
  function renderCenterCard(role, profile){
    const root = document.querySelector(role === "companion" ? "#page-companion-home" : "#page-member");
    if(!root) return;
    const name = profileName(role, profile || {});
    const avatar = firstValue(profile?.avatar_url, profile?.avatar);
    root.querySelectorAll("[data-bind='member-name']").forEach(el=>{ el.textContent = name; });
    root.querySelectorAll("[data-bind='member-gender-icon']").forEach(el=>{ el.textContent = genderLabel(firstValue(profile?.gender, profile?.sex)); });
    root.querySelectorAll("[data-bind='member-avatar']").forEach(el=>{
      if(avatar) el.innerHTML = `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      else el.textContent = name.slice(0,1) || (role === "companion" ? "\u966a" : "\u6703");
    });
  }
  function renderProfilePage(role, profile){
    role = normalizeRoleValue(role) || getRole();
    profile = Object.assign({}, profile || getPersistUser() || {}, {role});
    current = {role, user:profile, profile, loadedAt:Date.now()};
    const pageEl = document.getElementById("page-profile");
    if(!pageEl) return;
    const isCompanion = role === "companion";
    const name = profileName(role, profile);
    const avatar = firstValue(profile.avatar_url, profile.avatar);
    const rating = Number(firstValue(profile.avg_rating, profile.rating, profile.score, 0)) || 0;
    const intro = firstValue(profile.intro, profile.bio, profile.description, profile.self_intro, "\u9019\u4f4d\u4f7f\u7528\u8005\u9084\u6c92\u6709\u586b\u5beb\u500b\u4eba\u7c21\u4ecb\u3002");
    const orders = firstValue(profile.total_completed_orders, profile.total_order_count, profile.orders, profile.order_count, 0);
    const recommend = firstValue(profile.recommend_count, profile.recommend, profile.likes, profile.like_count, 0);
    const level = isCompanion
      ? firstValue(profile.level, profile.grade, profile.status, "\u767b\u5165\u8eab\u5206\uff1a\u966a\u73a9")
      : firstValue(profile.vip_name, profile.vip_title, profile.vip_level_name, profile.vip_level ? ("VIP\u7b49\u7d1a\uff1a" + profile.vip_level) : "", "VIP\u7b49\u7d1a\uff1a\u7121VIP\u6703\u54e1");
    pageEl.classList.toggle("profile-companion", isCompanion);
    pageEl.classList.toggle("profile-member", !isCompanion);
    pageEl.dataset.profileRole = role;
    try{
      localStorage.setItem("dream_active_profile_id", profileIdFor(role));
      localStorage.setItem("dream_persist_login_type", role);
      localStorage.setItem("dream_persist_user", JSON.stringify(profile || {}));
      window.__dreamFrontAuth = {type:role, role, user:profile};
    }catch(e){}
    setProfileBind(pageEl, "title", isCompanion ? "\u966a\u73a9\u4e3b\u9801" : "\u6703\u54e1\u4e3b\u9801");
    setProfileBind(pageEl, "avatar", avatar ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" loading="lazy">` : escapeHtml(name.slice(0,1) || (isCompanion ? "\u966a" : "\u6703")), !!avatar);
    setProfileBind(pageEl, "name", name);
    setProfileBind(pageEl, "gender", genderLabel(firstValue(profile.gender, profile.sex)));
    setProfileBind(pageEl, "rating", rating.toFixed(1));
    setProfileBind(pageEl, "stars", starsHtml(rating), true);
    setProfileBind(pageEl, "level", level);
    setProfileBind(pageEl, "status", firstValue(profile.work_status, profile.status, "\u5728\u7dda"));
    setProfileBind(pageEl, "recommend", numberText(recommend, 0));
    setProfileBind(pageEl, "orders", numberText(orders, 0));
    setProfileBind(pageEl, "bio", intro);
    setProfileBind(pageEl, "tags", listHtml(firstValue(profile.tags, profile.tag_list, profile.personality_tags), "profile-tag", isCompanion ? "\u966a\u73a9" : "\u6703\u54e1"), true);
    setProfileBind(pageEl, "games", listHtml(firstValue(profile.games, profile.game_list, profile.game, profile.game_name, profile.category), "game-tag", isCompanion ? "\u53ef\u9810\u7d04" : "\u81ea\u7531\u586b\u5beb"), true);
    setProfileBind(pageEl, "achievement-slots", achievementHtml(firstValue(profile.achievement_slots, profile.achievements, profile.badges, profile.badge_names)), true);
    setProfileBind(pageEl, "gift-count", "\u5df2\u9ede\u4eae 0 / 50");
    setProfileBind(pageEl, "posts", `<div class="companion-empty">\u5c1a\u672a\u767c\u5e03\u52d5\u614b</div>`, true);
    pageEl.querySelectorAll(".profile-back,#page-profile [data-profile-back]").forEach(back=>{
      const target = isCompanion ? "companion-home" : "member";
      back.dataset.go = target;
      back.setAttribute("data-go", target);
    });
    syncProfileSettingMenu(pageEl, role);
    renderCenterCard(role, profile);
  }
  function showProfileEditor(role, profile){
    role = normalizeRoleValue(role) || getRole();
    ensureStyle();
    try{ localStorage.setItem("dream_active_profile_id", profileIdFor(role)); }catch(e){}
    if(page() !== "profile") go("profile");
    const host = document.getElementById("page-profile") || findProfileHost(role);
    if(!host) return;
    $all("#dreamProfilePanelV388").forEach(el=>el.remove());
    const anchor = host.querySelector(".profile-info-panel");
    if(anchor) anchor.insertAdjacentHTML("afterend", buildProfilePanel(role, profile || current.profile || {}));
    else host.insertAdjacentHTML("afterbegin", buildProfilePanel(role, profile || current.profile || {}));
    const panel = $("#dreamProfilePanelV388");
    if(panel) setTimeout(()=>panel.scrollIntoView({behavior:"smooth", block:"start"}), 30);
  }
  function renderDreamProfilePage(){
    const role = getRole();
    const cached = current.role === role && current.profile ? current.profile : getPersistUser();
    renderProfilePage(role, cached || {});
    loadProfile(true, role).then(profile=>{ if(profile) renderProfilePage(role, profile); }).catch(()=>{});
  }

  function findProfileHost(role){
    const selectors = role === "companion"
      ? ["#page-companion-profile", "#page-companion-data", "#page-profile", "[data-page='companion-profile']", "#page-companion-home .sub-panel", "#page-companion-home", "#page-member"]
      : ["#page-member-profile", "#page-profile", "[data-page='member-profile']", "#page-member .sub-panel", "#page-member"];
    for(const sel of selectors){
      const el = document.querySelector(sel);
      if(el) return el;
    }
    let pageEl = document.querySelector("#page-profile");
    if(!pageEl){
      pageEl = document.createElement("section");
      pageEl.id = "page-profile";
      pageEl.className = "page";
      document.body.appendChild(pageEl);
    }
    return pageEl;
  }

  async function openProfile(role, options){
    role = normalizeRoleValue(role) || getRole();
    options = options || {};
    if(!isLoggedIn()){
      toast("請先登入後再使用");
      go("login");
      return;
    }
    ensureStyle();
    toast("正在載入資料...", true);
    try{ localStorage.setItem("dream_active_profile_id", profileIdFor(role)); }catch(e){}
    if(page() !== "profile") go("profile");
    const profile = await loadProfile(true, role);
    renderProfilePage(role, profile || {});
    if(options.editor) showProfileEditor(role, profile || {});
    if(window.DreamHideLoginToastV387) try{ window.DreamHideLoginToastV387(); }catch(e){}
    toast("\u8cc7\u6599\u5df2\u8f09\u5165");
    return;
  }
  /*
    const host = {id:"", querySelector(){ return null; }, insertAdjacentHTML(){}};
    if(!host){
      toast("找不到資料頁容器");
      return;
    }
    const old = host.querySelector("#dreamProfilePanelV388");
    if(old) old.remove();
    host.insertAdjacentHTML("afterbegin", buildProfilePanel(role, profile || {}));
    if(window.DreamHideLoginToastV387) try{ window.DreamHideLoginToastV387(); }catch(e){}
    toast("資料已載入");
    if(host.id && host.id.startsWith("page-")){
      const p = host.id.replace(/^page-/,"");
      if(p && p !== page()) go(p);
    }
  }

  */

  async function saveProfile(){
    const role = normalizeRoleValue($("#dreamProfilePanelV388")?.dataset?.profileRole) || getRole();
    const payload = {
      display_name: ($("#dreamV388DisplayName")?.value || "").trim(),
      email: ($("#dreamV388Email")?.value || "").trim(),
      phone: ($("#dreamV388Phone")?.value || "").trim(),
      gender: ($("#dreamV388Gender")?.value || "").trim(),
      avatar_url: ($("#dreamV388Avatar")?.value || "").trim(),
      intro: ($("#dreamV388Intro")?.value || "").trim(),
      game: ($("#dreamV388Game")?.value || "").trim(),
      price: ($("#dreamV388Price")?.value || "").trim(),
      status: ($("#dreamV388Status")?.value || "").trim()
    };
    toast("正在儲存資料...", true);
    let res;
    if(role === "companion"){
      res = await api("companion_profile_update", payload);
      if(!res || !res.ok) res = await api("companion_update_profile", payload);
    }else{
      res = await api("member_profile_update", payload);
      if(!res || !res.ok) res = await api("profile_update", payload);
    }
    window.DreamProfileDebugV388 = {role, payload, response:res};
    if(!res || !res.ok){
      toast((res && (res.message || res.error)) || "儲存失敗");
      return;
    }
    const updated = normalizeProfile(role, res);
    current.profile = Object.assign({}, current.profile || {}, payload, updated || {});
    current.loadedAt = Date.now();
    try{ localStorage.setItem("dream_persist_user", JSON.stringify(current.profile || {})); }catch(e){}
    toast("資料已儲存");
    await openProfile(role, {editor:true});
  }

  function markServiceButtons(){
    const role = getRole();
    const texts = role === "companion" ? ["陪玩資料","個人資料","資料"] : ["個人資料","會員資料","我的資料"];
    $all("button,a,.btn,[role='button'],.service-card,.feature-card,.menu-item").forEach(el=>{
      const txt = (el.textContent || "").replace(/\s+/g,"");
      if(!txt) return;
      if(texts.some(t => txt.includes(t))){
        el.dataset.v388ProfileEntry = role;
        if(!el.title) el.title = role === "companion" ? "進入陪玩資料" : "進入個人資料";
      }
    });
  }

  function syncServiceVisibility(){
    const role = getRole();
    document.body.dataset.dreamRole = role;
    $all("[data-role-only]").forEach(el=>{
      const only = String(el.dataset.roleOnly || "").trim();
      el.style.display = !only || only === role ? "" : "none";
    });
    markServiceButtons();
  }

  function bind(){
    document.addEventListener("click", function(e){
      const selfProfile = e.target.closest && e.target.closest("[data-open-profile='self'],[data-open-companion-self]");
      if(selfProfile){
        const role = selfProfile.closest("#page-companion-home") || selfProfile.hasAttribute("data-open-companion-self") ? "companion" : "member";
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        openProfile(role);
        return false;
      }
      const settingAction = e.target.closest && e.target.closest("#page-profile [data-setting-action]");
      if(settingAction){
        const action = settingAction.dataset.settingAction || "";
        if(action === "edit-profile-info" || action === "edit-name" || action === "edit-avatar"){
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
          const role = normalizeRoleValue(settingAction.dataset.settingScope) || getRole();
          document.querySelectorAll("[data-setting-menu]").forEach(menu=>menu.classList.remove("open"));
          openProfile(role, {editor:true});
          return false;
        }
      }
      const profileBtn = e.target.closest && e.target.closest("[data-v388-profile-entry]");
      if(profileBtn){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        openProfile(profileBtn.dataset.v388ProfileEntry || getRole());
        return false;
      }
      const saveBtn = e.target.closest && e.target.closest("[data-v388-profile-save]");
      if(saveBtn){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        saveProfile();
        return false;
      }
      const refreshBtn = e.target.closest && e.target.closest("[data-v388-profile-refresh]");
      if(refreshBtn){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        openProfile(getRole());
        return false;
      }
      const backBtn = e.target.closest && e.target.closest("[data-v388-profile-back]");
      if(backBtn){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        try{ if(window.DreamArchitectureV384) window.DreamArchitectureV384.go(getRole()==="companion"?"companion-home":"member"); else go(getRole()==="companion"?"companion-home":"member"); }catch(err){ go("member"); }
        return false;
      }

      const svc = e.target.closest && e.target.closest("button,a,.btn,[role='button'],.service-card,.feature-card,.menu-item");
      if(svc){
        const txt = (svc.textContent || "").replace(/\s+/g,"");
        const role = getRole();
        if((role === "companion" && txt.includes("陪玩資料")) || (role !== "companion" && (txt.includes("個人資料") || txt.includes("會員資料")))){
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
          openProfile(role);
          return false;
        }
      }
    }, true);

    window.addEventListener("hashchange", ()=>setTimeout(()=>{syncServiceVisibility(); if(page()==="profile") renderDreamProfilePage();}, 120));
    window.addEventListener("dream-auth-updated", ()=>setTimeout(()=>{loadProfile(true);syncServiceVisibility(); if(page()==="profile") renderDreamProfilePage();}, 180));
    setInterval(syncServiceVisibility, 1200);
    syncServiceVisibility();
    if(isLoggedIn()) loadProfile(false).catch(()=>{});
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  window.renderDreamProfilePage = renderDreamProfilePage;
  window.openDreamProfile = openProfile;
  window.goProfile = openProfile;
  window.DreamProfileServiceSyncV388 = {loadProfile, openProfile, saveProfile, syncServiceVisibility, renderProfilePage, renderDreamProfilePage, showProfileEditor};
})();
