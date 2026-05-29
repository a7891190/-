/* v419-formal-closeout */
(function(){
  if(window.__dreamProfileServiceSyncV407) return;
  window.__dreamProfileServiceSyncV407 = true;
  

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
    let el = $("#dreamProfileSyncToastV407");
    if(!el){
      el = document.createElement("div");
      el.id = "dreamProfileSyncToastV407";
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
  function uploadAvatarEndpoint(){
    try{ return new URL("upload_avatar.php", API_BASE()).toString(); }
    catch(e){ return String(API_BASE()).replace(/api\.php(?:\?.*)?$/i, "upload_avatar.php"); }
  }
  function fileToDataUrl(file){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onload = ()=>resolve(String(reader.result || ""));
      reader.onerror = ()=>reject(reader.error || new Error("avatar read failed"));
      reader.readAsDataURL(file);
    });
  }
  async function uploadMemberAvatar(file){
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch(uploadAvatarEndpoint(), {
      method:"POST",
      credentials:"include",
      body:form
    });
    const text = await res.text();
    let data;
    try{ data = JSON.parse(text || "{}"); }
    catch(e){ data = {ok:false, message:"頭像上傳回傳格式錯誤"}; }
    if(!res.ok && data.ok !== true){ data.ok = false; data.status = res.status; }
    return data;
  }
  async function uploadAvatar(role, file){
    if(!file) return {ok:false, message:"請先選擇大頭照圖片"};
    if(!/^image\/(jpeg|png|webp)$/i.test(file.type || "")) return {ok:false, message:"僅支援 JPG、PNG、WEBP 圖片"};
    if(Number(file.size || 0) > 5 * 1024 * 1024) return {ok:false, message:"圖片不可超過 5MB"};
    if(role === "companion"){
      const avatar_data = await fileToDataUrl(file);
      return api("companion_update_avatar", {avatar_data});
    }
    return uploadMemberAvatar(file);
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
    if(!window.__dreamServerSessionReady) return current.profile || getPersistUser() || null;
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
      if(window.DREAM_API_DEBUG) console.warn("[Dream v419 profile]", res);
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

  const PERSONALITY_TAGS = {
    member: ["新手會員","活躍會員","收藏控","聊天派","競技派","休閒派","夜貓子","暖心支持","任務控","VIP養成"],
    companion: ["穩定上分","氣氛帶動","耐心教學","聲音陪伴","戰術指揮","娛樂陪玩","新手友善","高配合度","深夜在線","溫柔陪聊"]
  };

  function tagOptions(role){
    return PERSONALITY_TAGS[role === "companion" ? "companion" : "member"];
  }

  function selectedTags(profile){
    return asArray(firstValue(profile?.personality_tags, profile?.tags, profile?.tag_list)).map(x => String(x || "").trim()).filter(Boolean);
  }

  function profileEditorModeLabel(mode){
    if(mode === "name") return "編輯名稱";
    if(mode === "avatar") return "更換大頭照";
    if(mode === "tags") return "新增個性標籤";
    return "編輯個人簡介";
  }
  function buildFocusedProfilePanel(role, profile, mode){
    mode = mode === "name" || mode === "avatar" || mode === "tags" ? mode : "bio";
    const name = profileName(role, profile || {});
    const intro = firstValue(profile?.intro, profile?.bio, profile?.description, profile?.self_intro);
    const avatar = firstValue(profile?.avatar_url, profile?.avatar);
    const selected = new Set(selectedTags(profile || {}));
    const body = mode === "name" ? `
      <label class="dream-profile-field full">
        <span>用戶名稱</span>
        <input id="dreamProfileDisplayName" maxlength="40" value="${escapeHtml(name)}" placeholder="輸入要顯示給其他用戶看的名稱">
      </label>
      <div class="dream-profile-editor-note">此名稱會作為你的公開用戶名稱，在會員中心、主頁、排行、留言與其他公開位置顯示。</div>
    ` : mode === "avatar" ? `
      <div class="dream-profile-avatar-editor">
        <div class="dream-profile-avatar" data-profile-avatar-preview>${avatar ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}">` : `<span>${escapeHtml(name.slice(0,1) || "夢")}</span>`}</div>
        <label class="dream-profile-file">
          <input id="dreamProfileAvatarFile" data-profile-avatar-file type="file" accept="image/jpeg,image/png,image/webp">
          <span>選擇圖片</span>
        </label>
      </div>
      <div class="dream-profile-editor-note">僅能上傳 JPG、PNG、WEBP 圖片，最多 5MB；不提供手填圖片網址。</div>
    ` : mode === "tags" ? `
      <div class="dream-profile-tag-picker" role="group" aria-label="個性標籤">
        ${tagOptions(role).map(tag => `
          <label class="dream-profile-tag-option">
            <input type="checkbox" value="${escapeHtml(tag)}" ${selected.has(tag) ? "checked" : ""}>
            <span>${escapeHtml(tag)}</span>
          </label>
        `).join("")}
      </div>
      <div class="dream-profile-editor-note">可複選適合你的公開個性標籤，會員與陪玩會使用各自不同的標籤列表。</div>
    ` : `
      <label class="dream-profile-field full">
        <span>個人簡介</span>
        <textarea id="dreamProfileIntro" maxlength="500" placeholder="填寫你的基本介紹說明">${escapeHtml(intro)}</textarea>
      </label>
      <div class="dream-profile-editor-note">這裡只會更新主頁上的個人簡介，不會更動其他帳號資料。</div>
    `;
    return `
      <section class="panel dream-profile-panel dream-profile-editor" id="dreamProfilePanel" data-profile-role="${escapeHtml(role)}" data-profile-mode="${escapeHtml(mode)}">
        <div class="dream-profile-editor-head">
          <div>
            <h2>${profileEditorModeLabel(mode)}</h2>
            <p>${role === "companion" ? "陪玩" : "會員"}公開主頁設定</p>
          </div>
          <button type="button" class="btn ghost small-btn" data-profile-cancel>取消</button>
        </div>
        <div class="dream-profile-form">${body}</div>
        <div class="dream-profile-editor-actions">
          <button type="button" class="btn" data-profile-save>儲存</button>
        </div>
      </section>`;
  }

  function buildProfilePanel(role, profile, mode){
    return buildFocusedProfilePanel(role, profile, mode);
    const name = profile.display_name || profile.name || profile.username || profile.nickname || "";
    const phone = profile.phone || profile.mobile || "";
    const intro = profile.intro || profile.bio || profile.description || profile.self_intro || "";
    const gender = profile.gender || profile.sex || "";
    const avatar = profile.avatar_url || profile.avatar || "";
    const game = profile.game || profile.game_name || profile.category || "";
    const price = profile.price || profile.hourly_price || profile.unit_price || "";
    const status = profile.status || profile.work_status || "";

    const companionExtra = role === "companion" ? `
      <label class="dream-profile-field"><span>服務遊戲 / 分類</span><input id="dreamProfileGame" value="${escapeHtml(game)}" placeholder="例如：LOL、傳說、原神"></label>
      <label class="dream-profile-field"><span>服務價格</span><input id="dreamProfilePrice" value="${escapeHtml(price)}" placeholder="例如：300/小時"></label>
      <label class="dream-profile-field"><span>目前狀態</span><input id="dreamProfileStatus" value="${escapeHtml(status)}" placeholder="例如：上班中、休息中"></label>
    ` : "";

    return `
      <section class="panel dream-profile-panel" id="dreamProfilePanel" data-profile-role="${escapeHtml(role)}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
          <div>
            <h2 style="margin:0;font-size:20px">${profileTitle(role)}</h2>
            <div style="font-size:12px;opacity:.75;margin-top:4px">資料會同步目前登入的${role === "companion" ? "陪玩" : "會員"}帳號</div>
          </div>
          <button type="button" class="btn small-btn" data-profile-refresh>重新整理</button>
        </div>
        <div class="dream-profile-grid">
          <div class="dream-profile-avatar">
            ${avatar ? `<img src="${escapeHtml(avatar)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:22px">` : `<span>${escapeHtml((name || "夢").slice(0,1))}</span>`}
          </div>
          <div class="dream-profile-form">
            <label class="dream-profile-field"><span>顯示名稱</span><input id="dreamProfileDisplayName" value="${escapeHtml(name)}" placeholder="輸入顯示名稱"></label>
            <label class="dream-profile-field"><span>手機 / 聯絡方式</span><input id="dreamProfilePhone" value="${escapeHtml(phone)}" placeholder="聯絡方式"></label>
            <label class="dream-profile-field"><span>性別</span><input id="dreamProfileGender" value="${escapeHtml(gender)}" placeholder="男 / 女 / 不公開"></label>
            ${companionExtra}
            <label class="dream-profile-field full"><span>簡介</span><textarea id="dreamProfileIntro" placeholder="介紹自己">${escapeHtml(intro)}</textarea></label>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
          <button type="button" class="btn" data-profile-save>儲存資料</button>
          <button type="button" class="btn ghost" data-profile-back>返回</button>
        </div>
      </section>`;
  }

  function ensureStyle(){
    if($("#dreamProfileStyleV407")) return;
    const st = document.createElement("style");
    st.id = "dreamProfileStyleV407";
    st.textContent = `
      .dream-profile-panel{margin:12px 0;padding:16px;border-radius:22px}
      .dream-profile-grid{display:grid;grid-template-columns:120px 1fr;gap:16px;align-items:start}
      .dream-profile-avatar{width:120px;height:120px;border-radius:24px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;border:1px solid rgba(255,221,235,.22);overflow:hidden}
      .dream-profile-avatar img{width:100%;height:100%;object-fit:cover;border-radius:22px;display:block}
      .dream-profile-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .dream-profile-field{display:flex;flex-direction:column;gap:6px;font-size:13px}
      .dream-profile-field span{opacity:.75}
      .dream-profile-field input,.dream-profile-field textarea{border-radius:14px;border:1px solid rgba(255,221,235,.22);background:rgba(255,255,255,.08);color:inherit;padding:10px 12px;outline:none}
      .dream-profile-field textarea{min-height:96px;resize:vertical}
      .dream-profile-field.full{grid-column:1/-1}
      .dream-profile-editor{max-width:560px;margin:12px auto;padding:16px}
      .dream-profile-editor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
      .dream-profile-editor-head h2{margin:0;font-size:18px;color:#ffeaf3}
      .dream-profile-editor-head p,.dream-profile-editor-note{margin:4px 0 0;font-size:12px;line-height:1.55;color:rgba(255,238,246,.70)}
      .dream-profile-editor-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}
      .dream-profile-avatar-editor{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
      .dream-profile-file input{position:absolute;opacity:0;pointer-events:none}
      .dream-profile-file span{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border-radius:14px;background:linear-gradient(180deg,#ffe1ef,#ff9bc8);color:#682342;font-weight:950;cursor:pointer}
      .dream-profile-tag-picker{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      .dream-profile-tag-option{min-height:42px;display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:14px;border:1px solid rgba(255,221,235,.22);background:rgba(255,255,255,.08);font-size:13px;font-weight:900;color:#fff2f7;cursor:pointer}
      .dream-profile-tag-option input{width:16px;height:16px;accent-color:#ff9bc8}
      .dream-profile-tag-option:has(input:checked){border-color:rgba(255,221,235,.58);background:rgba(255,155,200,.20)}
      @media(max-width:680px){.dream-profile-grid{grid-template-columns:1fr}.dream-profile-form{grid-template-columns:1fr}.dream-profile-avatar{width:96px;height:96px}}
      @media(max-width:520px){.dream-profile-tag-picker{grid-template-columns:1fr}}
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
  function activeAsset(profile, slot){
    const list = Array.isArray(profile?.active_assets) ? profile.active_assets : [];
    return list.find(item => item && item.slot === slot && !item.expired) || null;
  }
  function profileLevelHtml(role, profile, fallbackLevel){
    const title = activeAsset(profile, "title");
    const vipLevel = firstValue(profile?.vip_level, profile?.vipLevel, profile?.member_level, profile?.level_no, "0");
    const vipName = role === "companion"
      ? firstValue(profile?.vip_name, profile?.vip_title, profile?.vip_level_name, profile?.level, profile?.grade, profile?.status, fallbackLevel, "\u966a\u73a9")
      : firstValue(profile?.vip_name, profile?.vip_title, profile?.vip_level_name, fallbackLevel, "\u7121VIP\u6703\u54e1");
    const charm = numberText(firstValue(profile?.charm_value, profile?.charm, 0), 0);
    const guardian = numberText(firstValue(profile?.guardian_value, profile?.guardian, 0), 0);
    const titleName = title ? firstValue(title.item_name, title.name, title.title) : "";
    return [
      `<span class="profile-vip-line"><b>VIP ${escapeHtml(vipLevel)}</b><span>${escapeHtml(vipName)}</span></span>`,
      titleName ? `<span class="profile-equipped-title">\u7a31\u865f\uff1a${escapeHtml(titleName)}</span>` : `<span class="profile-equipped-title is-empty">\u7a31\u865f\uff1a\u5c1a\u672a\u8a2d\u5b9a</span>`,
      `<span class="profile-value-line">\u9b45\u529b\u503c ${escapeHtml(charm)} \uff5c \u5b88\u8b77\u503c ${escapeHtml(guardian)}</span>`
    ].join("");
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
      if(!menu.querySelector('[data-setting-action="edit-personality-tags"]')){
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.settingAction = "edit-personality-tags";
        btn.dataset.settingScope = role;
        btn.textContent = "\u500b\u6027\u6a19\u7c64";
        const anchor = menu.querySelector('[data-setting-action="edit-bio-achievements"],[data-setting-action="change-gender"]');
        if(anchor) anchor.insertAdjacentElement("afterend", btn);
        else menu.appendChild(btn);
      }
      const duplicateBadge = menu.querySelector('[data-setting-action="edit-achievement-badges"]');
      if(duplicateBadge) duplicateBadge.remove();
      const badgeBtn = menu.querySelector('[data-setting-action="edit-bio-achievements"]');
      if(badgeBtn) badgeBtn.textContent = "\u66f4\u63db\u6210\u5c31\u5fbd\u7ae0";
      if(!menu.querySelector('[data-setting-action="change-title"]')){
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.settingAction = "change-title";
        btn.dataset.settingScope = role;
        btn.textContent = "\u66f4\u63db\u7a31\u865f";
        const anchor = menu.querySelector('[data-setting-action="edit-bio-achievements"],[data-setting-action="change-profile-effect"]');
        if(anchor) anchor.insertAdjacentElement("afterend", btn);
        else menu.appendChild(btn);
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
    pageEl.dataset.profileId = String(firstValue(profile.id, profile.user_id, profile.companion_id, profile.member_id, "") || "");
    pageEl.dataset.publicProfile = "0";
    pageEl.querySelectorAll("[data-setting-toggle],.profile-info-setting-menu").forEach(el=>{ el.style.display = ""; });
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
    setProfileBind(pageEl, "level", profileLevelHtml(role, profile, level), true);
    setProfileBind(pageEl, "status", firstValue(profile.work_status, profile.status, "\u5728\u7dda"));
    setProfileBind(pageEl, "recommend", numberText(recommend, 0));
    setProfileBind(pageEl, "orders", numberText(orders, 0));
    setProfileBind(pageEl, "bio", intro);
    setProfileBind(pageEl, "tags", listHtml(firstValue(profile.personality_tags, profile.tags, profile.tag_list), "profile-tag", isCompanion ? "\u966a\u73a9" : "\u6703\u54e1"), true);
    const activeBadge = activeAsset(profile, "badge");
    const achievementSource = activeBadge ? [activeBadge] : firstValue(profile.achievement_slots, profile.achievements, profile.badges, profile.badge_names);
    setProfileBind(pageEl, "achievement-slots", achievementHtml(achievementSource), true);
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
  function showProfileEditor(role, profile, mode){
    role = normalizeRoleValue(role) || getRole();
    mode = mode === "name" || mode === "avatar" || mode === "tags" ? mode : "bio";
    ensureStyle();
    try{ localStorage.setItem("dream_active_profile_id", profileIdFor(role)); }catch(e){}
    if(page() !== "profile") go("profile");
    const host = document.getElementById("page-profile") || findProfileHost(role);
    if(!host) return;
    $all("#dreamProfilePanel").forEach(el=>el.remove());
    const anchor = host.querySelector(".profile-info-panel");
    if(anchor) anchor.insertAdjacentHTML("afterend", buildProfilePanel(role, profile || current.profile || {}, mode));
    else host.insertAdjacentHTML("afterbegin", buildProfilePanel(role, profile || current.profile || {}, mode));
    const panel = $("#dreamProfilePanel");
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
    if(options.editor) showProfileEditor(role, profile || {}, options.action);
    if(window.DreamHideLoginToast) try{ window.DreamHideLoginToast(); }catch(e){}
    toast("\u8cc7\u6599\u5df2\u8f09\u5165");
    return;
  }
  /*
    const host = {id:"", querySelector(){ return null; }, insertAdjacentHTML(){}};
    if(!host){
      toast("找不到資料頁容器");
      return;
    }
    const old = host.querySelector("#dreamProfilePanel");
    if(old) old.remove();
    host.insertAdjacentHTML("afterbegin", buildProfilePanel(role, profile || {}));
    if(window.DreamHideLoginToast) try{ window.DreamHideLoginToast(); }catch(e){}
    toast("資料已載入");
    if(host.id && host.id.startsWith("page-")){
      const p = host.id.replace(/^page-/,"");
      if(p && p !== page()) go(p);
    }
  }

  */

  async function saveProfile(){
    const role = normalizeRoleValue($("#dreamProfilePanel")?.dataset?.profileRole) || getRole();
    const panel = $("#dreamProfilePanel");
    const mode = panel?.dataset?.profileMode || "bio";
    if(mode === "avatar"){
      const file = $("#dreamProfileAvatarFile")?.files?.[0];
      toast("正在上傳大頭照...", true);
      let res;
      try{ res = await uploadAvatar(role, file); }
      catch(e){ res = {ok:false, message:e.message || "大頭照上傳失敗"}; }
      window.DreamProfileDebugV407 = {role, mode, response:res};
      if(!res || !res.ok){
        toast((res && (res.message || res.error)) || "大頭照上傳失敗");
        return;
      }
      const updated = normalizeProfile(role, res);
      const avatarUrl = res.avatar_url || updated.avatar_url || updated.avatar || "";
      current.profile = Object.assign({}, current.profile || {}, updated || {}, avatarUrl ? {avatar_url:avatarUrl} : {});
      current.loadedAt = Date.now();
      try{ localStorage.setItem("dream_persist_user", JSON.stringify(current.profile || {})); }catch(e){}
      renderProfilePage(role, current.profile || {});
      panel?.remove();
      toast("大頭照已更新");
      return;
    }
    const payload = mode === "tags" ? {
      personality_tags: JSON.stringify($all("#dreamProfilePanel .dream-profile-tag-option input:checked").map(input => input.value).filter(Boolean))
    } : {
      display_name: mode === "name" ? ($("#dreamProfileDisplayName")?.value || "").trim() : undefined,
      intro: mode === "bio" ? ($("#dreamProfileIntro")?.value || "").trim() : undefined
    };
    Object.keys(payload).forEach(key=>payload[key] === undefined && delete payload[key]);
    if(mode === "name" && !payload.display_name){
      toast("用戶名稱不可空白");
      return;
    }
    toast("正在儲存資料...", true);
    let res;
    if(role === "companion"){
      res = await api("companion_profile_update", payload);
      if(!res || !res.ok) res = await api("companion_update_profile", payload);
    }else{
      res = await api("member_profile_update", payload);
      if(!res || !res.ok) res = await api("profile_update", payload);
    }
    window.DreamProfileDebugV407 = {role, payload, response:res};
    if(!res || !res.ok){
      toast((res && (res.message || res.error)) || "儲存失敗");
      return;
    }
    const updated = normalizeProfile(role, res);
    current.profile = Object.assign({}, current.profile || {}, payload, updated || {});
    current.loadedAt = Date.now();
    try{ localStorage.setItem("dream_persist_user", JSON.stringify(current.profile || {})); }catch(e){}
    renderProfilePage(role, current.profile || {});
    panel?.remove();
    toast(mode === "name" ? "用戶名稱已更新" : (mode === "tags" ? "個性標籤已更新" : "個人簡介已更新"));
  }

  function markServiceButtons(){
    const role = getRole();
    const texts = role === "companion" ? ["陪玩資料","個人資料","資料"] : ["個人資料","會員資料","我的資料"];
    $all("button,a,.btn,[role='button'],.service-card,.feature-card,.menu-item").forEach(el=>{
      const txt = (el.textContent || "").replace(/\s+/g,"");
      if(!txt) return;
      if(texts.some(t => txt.includes(t))){
        el.dataset.profileEntry = role;
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
        if(action === "edit-profile-info" || action === "edit-name" || action === "edit-avatar" || action === "edit-personality-tags"){
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
          const role = normalizeRoleValue(settingAction.dataset.settingScope) || getRole();
          const mode = action === "edit-name" ? "name" : (action === "edit-avatar" ? "avatar" : (action === "edit-personality-tags" ? "tags" : "bio"));
          document.querySelectorAll("[data-setting-menu]").forEach(menu=>menu.classList.remove("open"));
          openProfile(role, {editor:true, action:mode});
          return false;
        }
      }
      const profileBtn = e.target.closest && e.target.closest("[data-profile-entry]");
      if(profileBtn){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        openProfile(profileBtn.dataset.profileEntry || getRole());
        return false;
      }
      const cancelBtn = e.target.closest && e.target.closest("[data-profile-cancel]");
      if(cancelBtn){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        $("#dreamProfilePanel")?.remove();
        return false;
      }
      const saveBtn = e.target.closest && e.target.closest("[data-profile-save]");
      if(saveBtn){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        saveProfile();
        return false;
      }
      const refreshBtn = e.target.closest && e.target.closest("[data-profile-refresh]");
      if(refreshBtn){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        openProfile(getRole());
        return false;
      }
      const backBtn = e.target.closest && e.target.closest("[data-profile-back]");
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

    document.addEventListener("change", function(e){
      const input = e.target.closest && e.target.closest("[data-profile-avatar-file]");
      if(!input) return;
      const file = input.files && input.files[0];
      const preview = $("[data-profile-avatar-preview]");
      if(!file || !preview) return;
      if(!/^image\/(jpeg|png|webp)$/i.test(file.type || "")){
        toast("僅支援 JPG、PNG、WEBP 圖片");
        input.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${escapeHtml(url)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:22px">`;
      setTimeout(()=>URL.revokeObjectURL(url), 1200);
    }, true);

    window.addEventListener("hashchange", ()=>setTimeout(()=>{syncServiceVisibility(); if(page()==="profile") renderDreamProfilePage();}, 120));
    window.addEventListener("dream-auth-updated", ()=>setTimeout(()=>{if(window.__dreamServerSessionReady) loadProfile(true); syncServiceVisibility(); if(page()==="profile") renderDreamProfilePage();}, 180));
    setInterval(syncServiceVisibility, 1200);
    syncServiceVisibility();
    if(isLoggedIn() && window.__dreamServerSessionReady) loadProfile(false).catch(()=>{});
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  window.renderDreamProfilePage = renderDreamProfilePage;
  window.openDreamProfile = openProfile;
  window.goProfile = openProfile;
  window.DreamProfileServiceSync = {loadProfile, openProfile, saveProfile, syncServiceVisibility, renderProfilePage, renderDreamProfilePage, showProfileEditor};
})();




