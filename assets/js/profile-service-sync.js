/* v388-profile-service-sync：會員/陪玩資料與功能服務同步 */
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
  function getRole(){
    try{
      const r = localStorage.getItem("dream_persist_login_type");
      if(r === "companion") return "companion";
    }catch(e){}
    return "member";
  }
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

  async function loadProfile(force){
    const role = getRole();
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
      <section class="panel dream-profile-panel-v388" id="dreamProfilePanelV388">
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

  async function openProfile(role){
    role = role || getRole();
    if(!isLoggedIn()){
      toast("請先登入後再使用");
      go("login");
      return;
    }
    ensureStyle();
    toast("正在載入資料...", true);
    const profile = await loadProfile(true);
    const host = findProfileHost(role);
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

  async function saveProfile(){
    const role = getRole();
    const payload = {
      display_name: ($("#dreamV388DisplayName")?.value || "").trim(),
      email: ($("#dreamV388Email")?.value || "").trim(),
      phone: ($("#dreamV388Phone")?.value || "").trim(),
      gender: ($("#dreamV388Gender")?.value || "").trim(),
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
    await openProfile(role);
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

    window.addEventListener("hashchange", ()=>setTimeout(syncServiceVisibility, 120));
    window.addEventListener("dream-auth-updated", ()=>setTimeout(()=>{loadProfile(true);syncServiceVisibility();}, 180));
    setInterval(syncServiceVisibility, 1200);
    syncServiceVisibility();
    if(isLoggedIn()) loadProfile(false).catch(()=>{});
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  window.DreamProfileServiceSyncV388 = {loadProfile, openProfile, saveProfile, syncServiceVisibility};
})();
