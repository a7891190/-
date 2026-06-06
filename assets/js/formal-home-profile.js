(function(){
  "use strict";
  if (window.__dreamFormalHomeProfile) return;
  window.__dreamFormalHomeProfile = true;
  window.DREAM_FORMAL_HOME_PROFILE_VERSION = "v440-profile-routing";

  const CFG = window.DREAM_CONFIG || {};
  const API_BASE = CFG.API_BASE || window.DREAM_API_URL || "https://api.131rwjuh.com/api.php";
  const UPLOAD_BASE = CFG.UPLOAD_BASE || (() => {
    try { return new URL(API_BASE, location.href).origin; } catch (_) { return ""; }
  })();
  const DEFAULT_AVATARS = {
    member: "assets/default_avatars/member_default.webp",
    companion: "assets/default_avatars/companion_default.webp",
    service: "assets/default_avatars/customer_service_default.webp"
  };
  const BOARDS = ["vip_rank","weekly_charm","monthly_guardian","companion_gift","member_gift","total_recharge"];
  const BOARD_META = {
    vip_rank: { title: "VIP 排行榜", unit: "VIP經驗值" },
    weekly_charm: { title: "本月魅力榜", unit: "魅力值" },
    monthly_guardian: { title: "本月守護榜", unit: "守護值" },
    companion_gift: { title: "陪玩收禮榜", unit: "收禮", suffix: "短陌" },
    member_gift: { title: "會員送禮榜", unit: "送禮", suffix: "短陌" },
    total_recharge: { title: "累計儲值榜", unit: "累計儲值", suffix: "短陌" }
  };
  const state = {
    boards: {},
    recommended: [],
    announcements: [],
    homeBoard: readStore("dream_home_board_key") || "vip_rank",
    rankBoard: readStore("dream_rank_page_key") || "vip_rank",
    innPosts: []
  };

  function esc(value){
    return String(value ?? "").replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }
  function readStore(key){
    try { return localStorage.getItem(key) || ""; } catch (_) { return ""; }
  }
  function writeStore(key, value){
    try { localStorage.setItem(key, value); } catch (_) {}
  }
  function apiUrl(){
    try { return new URL(API_BASE, location.href).toString(); } catch (_) { return API_BASE; }
  }
  async function api(action, payload){
    const body = Object.assign({}, payload || {}, { action });
    if (typeof window.dreamStableApiV389 === "function") {
      return window.dreamStableApiV389(action, payload || {});
    }
    if (typeof window.dreamStableApiV387 === "function") {
      return window.dreamStableApiV387(action, payload || {});
    }
    const res = await fetch(apiUrl(), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.json();
  }
  function roleOf(row, fallback){
    const role = String(row?.role || row?.target_type || row?.author_type || fallback || "member").toLowerCase();
    if (role.includes("companion") || role.includes("playmate")) return "companion";
    if (role.includes("service")) return "service";
    return "member";
  }
  function defaultAvatar(role){
    return DEFAULT_AVATARS[roleOf({ role }, "member")] || DEFAULT_AVATARS.member;
  }
  function mediaUrl(value, role){
    const raw = String(value || "").trim();
    if (!raw) return defaultAvatar(role);
    if (/^(data:|blob:|https?:\/\/)/i.test(raw)) return raw;
    if (/^(assets\/|\.\/assets\/)/i.test(raw)) return raw.replace(/^\.\//, "");
    if (/^\/?uploads\//i.test(raw) && UPLOAD_BASE) {
      return `${UPLOAD_BASE.replace(/\/+$/,"")}/${raw.replace(/^\/+/,"")}`;
    }
    try { return new URL(raw.replace(/^\/+/, ""), `${UPLOAD_BASE || location.origin}/`).toString(); } catch (_) {}
    return raw;
  }
  function avatarImg(row, role, label){
    const resolvedRole = roleOf(row, role);
    const src = mediaUrl(row?.avatar_url || row?.avatarUrl || row?.avatar || row?.photo_url || row?.image_url || "", resolvedRole);
    const fallback = defaultAvatar(resolvedRole);
    const name = label || row?.display_name || row?.name || row?.username || "用戶";
    return `<img src="${esc(src)}" alt="${esc(name)}大頭照" loading="lazy" onerror="this.onerror=null;this.src='${esc(fallback)}';">`;
  }
  function displayName(row, fallback){
    return String(row?.display_name || row?.name || row?.nickname || row?.username || fallback || "用戶");
  }
  function profileId(row){
    return Number(row?.id ?? row?.user_id ?? row?.member_id ?? row?.companion_id ?? row?.author_id ?? row?.target_id ?? 0) || 0;
  }
  function profileAttrs(row, fallbackRole){
    const id = profileId(row);
    const role = roleOf(row, fallbackRole || "member");
    return id > 0 ? ` data-profile-role="${esc(role)}" data-profile-id="${id}" tabindex="0" role="button"` : "";
  }
  function numberText(value){
    return Number(value || 0).toLocaleString("zh-TW");
  }
  function rankValueText(key, row){
    const meta = BOARD_META[key] || BOARD_META.vip_rank;
    const value = row?.value ?? row?.score ?? row?.exp ?? row?.total ?? 0;
    return `${meta.unit ? meta.unit + " " : ""}${numberText(value)}${meta.suffix ? " " + meta.suffix : ""}`.trim();
  }
  function normalizeRows(rows, key){
    return (Array.isArray(rows) ? rows : []).map((row, index) => {
      const value = Number(row?.value ?? row?.score ?? row?.exp ?? row?.total ?? row?.amount ?? 0) || 0;
      return Object.assign({}, row, {
        rank: Number(row?.rank || index + 1) || index + 1,
        value,
        name: displayName(row),
        role: roleOf(row, key === "companion_gift" ? "companion" : "member")
      });
    }).sort((a, b) => Number(a.rank || 0) - Number(b.rank || 0) || Number(b.value || 0) - Number(a.value || 0));
  }
  function sourceRows(snapshot, key){
    const aliases = {
      vip_rank: ["vip_rank","vip","vipRank"],
      weekly_charm: ["weekly_charm","monthly_charm","charm"],
      monthly_guardian: ["monthly_guardian","guardian","guard"],
      companion_gift: ["companion_gift","companionGift"],
      member_gift: ["member_gift","memberGift"],
      total_recharge: ["total_recharge","recharge","totalRecharge"]
    }[key] || [key];
    if (!snapshot) return [];
    if (Array.isArray(snapshot)) return snapshot;
    if (snapshot.boards && !Array.isArray(snapshot.boards)) {
      for (const alias of aliases) if (Array.isArray(snapshot.boards[alias])) return snapshot.boards[alias];
    }
    for (const alias of aliases) if (Array.isArray(snapshot[alias])) return snapshot[alias];
    if (key === "vip_rank" && snapshot.vip && Array.isArray(snapshot.vip.ranking)) return snapshot.vip.ranking;
    return [];
  }
  function setBoards(snapshot){
    BOARDS.forEach(key => { state.boards[key] = normalizeRows(sourceRows(snapshot, key), key); });
    window.DREAM_RANK_BOARDS = Object.assign({}, window.DREAM_RANK_BOARDS || {}, state.boards);
  }

  function injectStyle(){
    if (document.getElementById("formalHomeProfileFormalStyle")) return;
    const style = document.createElement("style");
    style.id = "formalHomeProfileFormalStyle";
    style.textContent = `
#page-home .top3-avatar img,#page-home .rank-avatar img,#page-vip-rank .formal-rank-avatar img,
#homeRecommendCompanions .recommend-avatar img,#page-inn .post-avatar img,#page-inn .inn-comment-avatar img,
#page-profile [data-profile-bind="avatar"] img{width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;border-radius:inherit!important}
#page-home .notice-line{cursor:pointer;position:relative;padding-right:86px}
#page-home .notice-line .notice-history-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);border:1px solid rgba(255,221,235,.32);border-radius:999px;background:rgba(255,255,255,.1);color:#fff1f7;font-size:12px;font-weight:900;padding:6px 10px}
.formal-notice-modal{position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(15,4,12,.72);backdrop-filter:blur(10px)}
.formal-notice-modal.is-open{display:flex}
.formal-notice-dialog{width:min(920px,100%);max-height:min(82vh,720px);display:grid;grid-template-columns:minmax(220px,32%) 1fr;gap:12px;padding:14px;border-radius:18px;background:linear-gradient(180deg,rgba(62,18,44,.97),rgba(26,8,22,.98));border:1px solid rgba(255,210,230,.28);box-shadow:0 22px 60px rgba(0,0,0,.42);color:#fff1f7}
.formal-notice-head{grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;gap:10px}
.formal-notice-head h3{margin:0;font-size:18px}
.formal-notice-close{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,221,235,.32);background:rgba(255,255,255,.08);color:#fff;font-size:20px;cursor:pointer}
.formal-notice-list{display:grid;gap:8px;overflow:auto;max-height:60vh;padding-right:4px}
.formal-notice-item{border:1px solid rgba(255,221,235,.18);border-radius:12px;background:rgba(255,255,255,.06);color:#fff1f7;text-align:left;padding:10px;cursor:pointer}
.formal-notice-item.active{border-color:rgba(255,214,230,.55);background:rgba(255,255,255,.12)}
.formal-notice-item b,.formal-notice-detail h4{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.formal-notice-item span{display:block;margin-top:4px;font-size:11px;color:rgba(255,235,244,.68)}
.formal-notice-detail{overflow:auto;max-height:60vh;border:1px solid rgba(255,221,235,.16);border-radius:14px;background:rgba(255,255,255,.055);padding:16px}
.formal-notice-detail h4{margin:0 0 8px;font-size:20px}
.formal-notice-detail time{display:block;margin-bottom:12px;color:rgba(255,235,244,.68);font-size:12px}
.formal-notice-body{white-space:pre-wrap;line-height:1.75;font-size:16px}
#page-vip-rank .formal-rank-row{grid-template-columns:48px 1fr auto!important}
#page-vip-rank .formal-rank-avatar{width:40px;height:40px;border-radius:50%;overflow:hidden;display:block;position:relative;border:1px solid rgba(255,238,246,.55);box-shadow:0 5px 14px rgba(0,0,0,.24)}
#page-vip-rank .formal-rank-badge{position:absolute;right:-3px;bottom:-3px;min-width:18px;height:18px;border-radius:999px;display:grid;place-items:center;background:#ffd8e9;color:#641d40;border:1px solid rgba(255,255,255,.8);font-size:10px;font-weight:950}
#page-profile.active .profile-bottom-actions{gap:8px!important}
#page-profile.profile-member.active .profile-bottom-actions{grid-template-columns:minmax(112px,1fr) minmax(112px,1fr)!important}
#page-profile.profile-member.active .profile-bottom-actions button[data-action="follow-profile"],
#page-profile.profile-member.active .profile-bottom-actions .reserve-main,
#page-profile.profile-member.active .profile-bottom-actions .service-main{display:none!important}
#page-profile.profile-companion.active .profile-bottom-actions{grid-template-columns:62px 62px 72px minmax(88px,1fr) minmax(88px,1fr)!important}
#page-profile.active .profile-bottom-actions [data-action="gift-profile"]{display:grid!important;grid-template-rows:34px auto!important;place-items:center!important;align-content:center!important;border:0!important;border-radius:0!important;color:#fff!important;background:transparent!important;font-weight:900!important}
#homeRecommendCompanions{display:flex!important;grid-template-columns:none!important;gap:10px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:8px 2px 6px!important;scroll-snap-type:x proximity!important;-webkit-overflow-scrolling:touch!important}
#homeRecommendCompanions .recommend-card{flex:0 0 128px!important;min-width:128px!important;scroll-snap-align:start!important}
#page-companion .companion-newcomer-panel{overflow:hidden!important}
#page-companion .companion-newcomer-list{display:flex!important;grid-template-columns:none!important;gap:10px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:8px 2px 4px!important;scroll-snap-type:x proximity!important;-webkit-overflow-scrolling:touch!important}
#page-companion .companion-newcomer-list .recommend-card{flex:0 0 128px!important;min-width:128px!important;min-height:136px!important;scroll-snap-align:start!important}
#page-companion .companion-newcomer-list .recommend-avatar{width:58px!important;height:58px!important}
#page-companion .companion-newcomer-list .recommend-meta{display:grid!important;gap:2px!important}
/* v414: 首頁恢復六大排行榜切換，完整排行榜保留在 #page-vip-rank */
#page-home .home-top3-card,#page-home .top3-wrapper,#page-vip-rank .v267-rank-page-panel{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
#page-vip-rank .v267-tabs{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;width:100%!important;max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;padding:2px 2px 10px!important;margin:0 0 2px!important;-webkit-overflow-scrolling:touch!important;scroll-snap-type:x proximity!important;touch-action:pan-x!important}
#page-vip-rank .v267-tab{flex:0 0 auto!important;min-width:max-content!important;max-width:none!important;white-space:nowrap!important;scroll-snap-align:start!important}
#page-home .rank-chip,#page-home .rank-scroll .rank-chip{flex:0 0 clamp(146px,43vw,176px)!important;width:clamp(146px,43vw,176px)!important;min-width:146px!important;max-width:176px!important;min-height:62px!important;display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;grid-template-areas:"no title" "no value"!important;align-items:center!important;gap:3px 8px!important;padding:9px 10px!important;box-sizing:border-box!important;scroll-snap-align:start!important}
#page-home .rank-chip .rank-no{grid-area:no!important;width:34px!important;height:34px!important;margin:0!important}
#page-home .rank-chip .rank-title{grid-area:title!important;display:block!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;line-height:1.25!important}
#page-home .rank-chip .rank-value{grid-area:value!important;display:block!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;line-height:1.25!important}
#page-vip-rank .v267-rank-page-panel{overflow:hidden!important;padding:12px!important;border-radius:20px!important}
#page-vip-rank .v267-rank-list{width:100%!important;max-height:none!important;overflow:visible!important;padding-right:0!important;display:grid!important;gap:8px!important}
#page-vip-rank .v267-rank-row,#page-vip-rank .formal-rank-row{width:100%!important;min-width:0!important;display:grid!important;grid-template-columns:44px minmax(0,1fr) minmax(72px,max-content)!important;align-items:center!important;gap:8px!important;box-sizing:border-box!important}
#page-vip-rank .v267-rank-row>div:nth-child(2),#page-vip-rank .formal-rank-row>div:nth-child(2){min-width:0!important;overflow:hidden!important}
#page-vip-rank .v267-rank-name,#page-vip-rank .v267-rank-sub{display:block!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
#page-vip-rank .v267-rank-value{grid-column:auto!important;justify-self:end!important;max-width:34vw!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
@media(max-width:420px){#page-vip-rank .v267-rank-row,#page-vip-rank .formal-rank-row{grid-template-columns:40px minmax(0,1fr) minmax(58px,max-content)!important;gap:7px!important;padding:8px!important}#page-vip-rank .v267-rank-value{max-width:28vw!important;font-size:11px!important}}
@media(max-width:520px){
  .formal-notice-dialog{grid-template-columns:1fr;max-height:86vh}
  .formal-notice-list,.formal-notice-detail{max-height:34vh}
  #page-profile.profile-companion.active .profile-bottom-actions{grid-template-columns:54px 54px 62px minmax(74px,1fr) minmax(74px,1fr)!important;gap:6px!important}
  #page-profile.active .profile-bottom-actions button{font-size:13px!important}
  #page-profile.active .profile-bottom-actions button span{font-size:12px!important}
}`;
    document.head.appendChild(style);
  }

  function renderHomeTop3(key){
    key = BOARD_META[key] ? key : "vip_rank";
    state.homeBoard = key;
    writeStore("dream_home_board_key", key);
    const rows = state.boards[key] || [];
    const meta = BOARD_META[key] || BOARD_META.vip_rank;
    document.querySelectorAll("#page-home [data-board-key]").forEach(btn => btn.classList.toggle("active", btn.dataset.boardKey === key));
    document.querySelectorAll("#page-home [data-current-leaderboard-title]").forEach(el => { el.textContent = meta.title; });
    [["second", rows[1], 2], ["first", rows[0], 1], ["third", rows[2], 3]].forEach(([cls, row, displayRank]) => {
      const avatar = document.querySelector(`#page-home .top3-avatar.${cls}`);
      const text = document.querySelector(`#page-home .top3-text.${cls}`);
      if (avatar) {
        avatar.innerHTML = row ? avatarImg(row, row.role, displayName(row)) : avatarImg({ role: "member" }, "member", "預設用戶");
        if (row && profileId(row) > 0) {
          avatar.dataset.profileRole = roleOf(row, "member");
          avatar.dataset.profileId = String(profileId(row));
          avatar.tabIndex = 0;
          avatar.setAttribute("role", "button");
        } else {
          delete avatar.dataset.profileRole;
          delete avatar.dataset.profileId;
          avatar.removeAttribute("tabindex");
          avatar.removeAttribute("role");
        }
      }
      if (text) {
        const nameEl = text.querySelector(".name");
        const valueEl = text.querySelector(".value");
        if (nameEl) {
          nameEl.textContent = row ? displayName(row) : "尚無資料";
          if (row) {
            nameEl.dataset.rankTop3Board = key;
            nameEl.dataset.rankTop3Rank = String(displayRank);
            nameEl.dataset.rankTop3Name = displayName(row);
            nameEl.dataset.profileRole = roleOf(row, "member");
            nameEl.dataset.profileId = String(profileId(row));
            nameEl.tabIndex = 0;
            nameEl.setAttribute("role", "button");
            text.dataset.profileRole = roleOf(row, "member");
            text.dataset.profileId = String(profileId(row));
          } else {
            delete nameEl.dataset.profileRole;
            delete nameEl.dataset.profileId;
            delete text.dataset.profileRole;
            delete text.dataset.profileId;
          }
        }
        if (valueEl) valueEl.textContent = row ? rankValueText(key, row) : "等待正式排行榜";
      }
    });
    const belowRows = rows.slice(3, 13);
    document.querySelectorAll("#page-home [data-rank-scroll],#page-home .rank-scroll").forEach(el => {
      if (!belowRows.length) {
        el.innerHTML = `<div class="rank-chip"><div class="rank-no">#4</div><div class="rank-title">尚無資料</div><div class="rank-value">等待正式排行榜</div></div>`;
      } else {
        el.innerHTML = belowRows.map((row, i) => {
          const rank = Number(row.rank || i + 4) || (i + 4);
          return `<div class="rank-chip"${profileAttrs(row, row.role || "member")}><div class="rank-no">#${rank}</div><div class="rank-title">${esc(displayName(row))}</div><div class="rank-value">${esc(rankValueText(key, row))}</div></div>`;
        }).join("");
      }
      el.style.display = "flex";
    });
    setTimeout(() => {
      try { window.DREAM_APPLY_RANK_TOP3_GUFENG?.(); } catch (_) {}
      applyDefaultAvatars();
    }, 80);
  }
  function renderRankPage(key){
    key = BOARD_META[key] ? key : "vip_rank";
    state.rankBoard = key;
    writeStore("dream_rank_page_key", key);
    const panel = document.querySelector("#page-vip-rank [data-v267-rank-page]");
    if (!panel) return;
    const rows = state.boards[key] || [];
    const tabs = BOARDS.map(board => `<button type="button" class="v267-tab ${board === key ? "active" : ""}" data-formal-rank-tab="${board}">${esc(BOARD_META[board].title)}</button>`).join("");
    const body = rows.length ? rows.map(row => `
      <div class="v267-rank-row formal-rank-row"${profileAttrs(row, row.role || "member")}>
        <div class="v267-rank-no"><span class="formal-rank-avatar">${avatarImg(row, row.role, displayName(row))}<span class="formal-rank-badge">${Number(row.rank || 0)}</span></span></div>
        <div>
          <div class="v267-rank-name">${esc(displayName(row))}</div>
          <div class="v267-rank-sub">${esc(BOARD_META[key].title)}</div>
        </div>
        <div class="v267-rank-value">${esc(rankValueText(key, row))}</div>
      </div>`).join("") : `<div class="v267-rank-empty">尚無正式排行榜資料，等待後台交易資料產生。</div>`;
    panel.innerHTML = `<div class="v267-tabs">${tabs}</div><div class="v267-rank-title"><strong>${esc(BOARD_META[key].title)}</strong><span>正式交易資料</span></div><div class="v267-rank-list">${body}</div>`;
    applyDefaultAvatars();
  }
  function renderRecommended(){
    const host = document.getElementById("homeRecommendCompanions");
    if (!host) return;
    const rows = (state.recommended || []).slice(0, 5);
    if (!rows.length) {
      host.innerHTML = `<div class="companion-empty">尚無正式接單排行資料</div>`;
      return;
    }
    host.innerHTML = rows.map((row, index) => {
      const name = displayName(row, "陪玩");
      const orders = Number(row.completed_order_count ?? row.total_completed_orders ?? row.orders ?? row.order_count ?? 0) || 0;
      return `<article class="recommend-card" data-open-recommend-profile="${esc(row.companion_id || row.id || "")}" data-profile-role="companion" data-profile-id="${esc(row.companion_id || row.id || "")}" tabindex="0" role="button">
        <div class="recommend-avatar">${avatarImg(row, "companion", name)}</div>
        <div class="recommend-name">${esc(name)}</div>
        <div class="recommend-meta"><span>#${Number(row.rank || index + 1)}</span><span class="recommend-total-score">接單 ${orders} 單</span></div>
      </article>`;
    }).join("");
  }
  function currentPage(){
    return (location.hash || "#home").replace(/^#/, "") || "home";
  }
  function companionOrderCount(row){
    return Number(row?.completed_order_count ?? row?.total_completed_orders ?? row?.completed_orders ?? row?.order_count ?? row?.orders ?? 0) || 0;
  }
  function companionCreatedMs(row){
    const raw = row?.created_at || row?.createdAt || "";
    const ms = raw ? Date.parse(raw) : NaN;
    return Number.isFinite(ms) ? ms : Number(row?.id || row?.companion_id || 0);
  }
  function ensureNewcomerHost(){
    let host = document.getElementById("companionNewcomers");
    const panel = document.querySelector("#page-companion .companion-newcomer-panel") || document.querySelector("#page-companion .info-strip");
    if (!host && panel) {
      host = document.createElement("div");
      host.id = "companionNewcomers";
      host.className = "recommend-list companion-newcomer-list";
      panel.appendChild(host);
    }
    if (panel) {
      const title = panel.querySelector("h2");
      const desc = panel.querySelector("p");
      if (title) title.textContent = "本期五名新人陪玩";
      if (desc) desc.textContent = "本期五名新人陪玩主要顯示新建立、接單數較少的陪玩。";
    }
    return host;
  }
  function renderCompanionNewcomers(rows){
    const host = ensureNewcomerHost();
    if (!host) return;
    const list = (Array.isArray(rows) ? rows : [])
      .filter(row => row && (row.id || row.companion_id))
      .sort((a,b) => companionOrderCount(a) - companionOrderCount(b) || companionCreatedMs(b) - companionCreatedMs(a) || Number(b.id || b.companion_id || 0) - Number(a.id || a.companion_id || 0))
      .slice(0, 5);
    if (!list.length) {
      host.innerHTML = `<div class="companion-empty">目前尚無新人陪玩資料</div>`;
      return;
    }
    host.innerHTML = list.map((row, index) => {
      const name = displayName(row, "陪玩");
      const orders = companionOrderCount(row);
      return `<article class="recommend-card newcomer-card" data-open-recommend-profile="${esc(row.companion_id || row.id || "")}" data-profile-role="companion" data-profile-id="${esc(row.companion_id || row.id || "")}" tabindex="0" role="button">
        <div class="recommend-avatar">${avatarImg(row, "companion", name)}</div>
        <div class="recommend-name">${esc(name)}</div>
        <div class="recommend-meta"><span>新人 #${index + 1}</span><span class="recommend-total-score">接單 ${orders} 單</span></div>
      </article>`;
    }).join("");
    applyDefaultAvatars();
  }
  async function loadCompanionNewcomers(){
    if (currentPage() !== "companion" && currentPage() !== "companion-home") return;
    const host = ensureNewcomerHost();
    if (!host) return;
    if (!host.dataset.loaded) host.innerHTML = `<div class="companion-empty">正在載入新人陪玩...</div>`;
    try {
      const res = await api("companion_front_list", {});
      const rows = res?.companions || res?.items || res?.list || res?.data || [];
      host.dataset.loaded = "1";
      renderCompanionNewcomers(rows);
    } catch (err) {
      host.innerHTML = `<div class="companion-empty">新人陪玩資料載入失敗</div>`;
      console.warn("[companion_newcomers]", err && err.message || err);
    }
  }
  function renderAllRankViews(){
    renderHomeTop3(state.homeBoard || "vip_rank");
    renderRankPage(state.rankBoard || "vip_rank");
    renderRecommended();
  }
  async function loadRankAndRecommend(){
    try {
      const snapshot = await api("front_ranking_snapshot", {});
      if (snapshot && snapshot.ok !== false) {
        setBoards(snapshot);
        const fromSnapshot = snapshot.recommended_companions || snapshot.recommendations || [];
        if (Array.isArray(fromSnapshot) && fromSnapshot.length) state.recommended = fromSnapshot;
      }
    } catch (err) {
      console.warn("[front_ranking_snapshot formal]", err && err.message || err);
    }
    if (!Array.isArray(state.recommended) || !state.recommended.length) {
      try {
        const res = await api("companion_recommendations", { limit: 5 });
        const rows = res?.companions || res?.items || res?.list || res?.data || [];
        if (Array.isArray(rows)) state.recommended = rows;
      } catch (err) {
        console.warn("[companion_recommendations formal]", err && err.message || err);
      }
    }
    renderAllRankViews();
  }

  function ensureNoticeModal(){
    let modal = document.getElementById("formalNoticeModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "formalNoticeModal";
    modal.className = "formal-notice-modal";
    modal.innerHTML = `
      <div class="formal-notice-dialog" role="dialog" aria-modal="true" aria-label="歷史公告">
        <div class="formal-notice-head"><h3>歷史公告</h3><button type="button" class="formal-notice-close" data-formal-notice-close aria-label="關閉">×</button></div>
        <div class="formal-notice-list" data-formal-notice-list></div>
        <article class="formal-notice-detail" data-formal-notice-detail></article>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.closest("[data-formal-notice-close]")) closeNoticeModal();
      const item = event.target.closest("[data-formal-notice-id]");
      if (item) selectNotice(Number(item.dataset.formalNoticeId || 0));
    });
    return modal;
  }
  function compact(value){
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  function renderNoticeLine(){
    const line = document.querySelector("#page-home .notice-line");
    if (!line) return;
    const latest = state.announcements[0] || null;
    line.setAttribute("role", "button");
    line.tabIndex = 0;
    line.innerHTML = latest
      ? `<strong>最新公告</strong><span>${esc(latest.title || "公告")}｜${esc(compact(latest.message || "").slice(0, 60))}</span><button type="button" class="notice-history-btn">歷史公告</button>`
      : `<strong>最新公告</strong><span>目前尚無公告</span><button type="button" class="notice-history-btn">歷史公告</button>`;
  }
  function noticeById(id){
    return state.announcements.find(item => Number(item.id || 0) === Number(id || 0)) || state.announcements[0] || null;
  }
  function selectNotice(id){
    const modal = ensureNoticeModal();
    const notice = noticeById(id);
    modal.querySelectorAll("[data-formal-notice-id]").forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.formalNoticeId || 0) === Number(notice?.id || 0));
    });
    const detail = modal.querySelector("[data-formal-notice-detail]");
    if (!detail) return;
    detail.innerHTML = notice
      ? `<h4>${esc(notice.title || "公告")}</h4><time>${esc(notice.created_at || "")}</time><div class="formal-notice-body">${esc(notice.message || "")}</div>`
      : `<h4>目前尚無公告</h4><div class="formal-notice-body">後台尚未上架公告。</div>`;
  }
  function openNoticeModal(){
    const modal = ensureNoticeModal();
    const list = modal.querySelector("[data-formal-notice-list]");
    if (list) {
      list.innerHTML = state.announcements.length ? state.announcements.map(item => `
        <button type="button" class="formal-notice-item" data-formal-notice-id="${Number(item.id || 0)}">
          <b>${esc(item.title || "公告")}</b>
          <span>${esc(item.created_at || "")}</span>
        </button>`).join("") : `<div class="formal-notice-item active"><b>目前尚無公告</b><span>等待後台上架</span></div>`;
    }
    modal.classList.add("is-open");
    selectNotice(Number(state.announcements[0]?.id || 0));
  }
  function closeNoticeModal(){
    document.getElementById("formalNoticeModal")?.classList.remove("is-open");
  }
  async function loadAnnouncements(){
    try {
      const res = await api("announcement_list", { limit: 50 });
      const rows = res?.announcements || res?.items || [];
      state.announcements = Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.warn("[announcement_list formal]", err && err.message || err);
      state.announcements = [];
    }
    renderNoticeLine();
  }

  function innFilter(){
    return document.querySelector("[data-inn-filter].active")?.dataset.innFilter || "all";
  }
  function innSort(){
    return document.querySelector("[data-inn-sort].active")?.dataset.innSort || "time";
  }
  function timeText(value){
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function renderInnComments(post){
    const comments = Array.isArray(post.comments) ? post.comments : [];
    if (!comments.length) return "";
    return `<div class="inn-comments">${comments.map(comment => {
      const name = comment.author_name || comment.display_name || comment.username || "用戶";
      return `<div class="inn-comment"${profileAttrs(comment, comment.author_type)}>
        <div class="inn-comment-avatar" data-author-type="${esc(roleOf(comment, comment.author_type))}">${avatarImg(comment, roleOf(comment, comment.author_type), name)}</div>
        <div><b>${esc(name)}</b><span>${esc(comment.comment_text || comment.content || "")}</span></div>
      </div>`;
    }).join("")}</div>`;
  }
  function renderInnPosts(){
    const list = document.getElementById("innPostList");
    const empty = document.getElementById("innEmptyState");
    if (!list) return;
    let posts = [...state.innPosts];
    const filter = innFilter();
    const sort = innSort();
    if (filter === "favorites") posts = posts.filter(post => !!post.is_favorited);
    if (filter === "following") posts = posts.filter(post => !!post.is_following_author);
    if (sort === "likes") posts.sort((a,b) => Number(b.like_count || 0) - Number(a.like_count || 0));
    else if (sort === "favorites") posts.sort((a,b) => Number(b.favorite_count || 0) - Number(a.favorite_count || 0));
    else posts.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    if (!posts.length) {
      list.innerHTML = "";
      if (empty) {
        empty.style.display = "block";
        empty.textContent = filter === "favorites" ? "目前尚無收藏資料。" : filter === "following" ? "目前尚無關注動態。" : "目前尚無客棧動態。";
      }
      return;
    }
    if (empty) empty.style.display = "none";
    list.innerHTML = posts.map(post => {
      const id = String(post.id || post.post_id || "");
      const authorName = post.author_name || post.display_name || post.username || "夢競用戶";
      const authorType = roleOf(post, post.author_type || "member");
      const authorId = post.author_id || "";
      const image = mediaUrl(post.image_url || post.post_image_url || "", authorType);
      const hasImage = !!(post.image_url || post.post_image_url);
      return `<article class="panel post-card" data-post-id="${esc(id)}" data-author-role="${esc(authorType)}" data-author-id="${esc(authorId)}">
        <div class="post-head"${profileAttrs({role:authorType,id:authorId}, authorType)}>
          <div class="post-avatar" data-author-type="${esc(authorType)}">${avatarImg(post, authorType, authorName)}</div>
          <div><div class="post-name">${esc(authorName)} <button type="button" data-social-action="follow" data-target-type="${esc(authorType)}" data-target-id="${esc(authorId)}" style="margin-left:8px;border-radius:999px;padding:4px 8px;border:1px solid rgba(255,220,235,.28);background:rgba(255,255,255,.08);color:inherit">${post.is_following_author ? "已關注" : "關注"}</button></div><div class="post-time">${esc(timeText(post.created_at))}</div></div>
        </div>
        <div class="post-text">${esc(post.content || "")}</div>
        ${hasImage ? `<div class="post-image"><img src="${esc(image)}" alt="客棧圖片" loading="lazy" style="width:100%;border-radius:16px;display:block"></div>` : `<div class="post-image" style="display:none"></div>`}
        <div class="post-actions">
          <button type="button" data-social-action="favorite" data-post-id="${esc(id)}">${post.is_favorited ? "★" : "☆"} 收藏 <span data-fav-count>${Number(post.favorite_count || 0)}</span></button>
          <button type="button" data-social-action="comment-open" data-post-id="${esc(id)}">留言 <span>${Number(post.comment_count || 0)}</span></button>
          <button type="button" data-social-action="like" data-post-id="${esc(id)}">${post.is_liked ? "♥" : "♡"} <span data-like-count>${Number(post.like_count || 0)}</span></button>
        </div>
        ${renderInnComments(post)}
        <div style="display:flex;gap:8px;margin-top:10px"><input data-social-comment-input="${esc(id)}" placeholder="留言不能空白" style="flex:1;border-radius:999px;padding:0 12px"><button class="btn" data-social-action="comment" data-post-id="${esc(id)}" type="button">送出</button></div>
      </article>`;
    }).join("");
    applyDefaultAvatars();
  }
  async function loadInnPosts(){
    const innVisible = location.hash === "#inn" || !!document.querySelector("#page-inn.active");
    if (!innVisible) return;
    try {
      const res = await api("inn_post_list", { limit: 50 });
      state.innPosts = res?.posts || res?.list || res?.data || [];
    } catch (err) {
      console.warn("[inn_post_list formal]", err && err.message || err);
      state.innPosts = [];
    }
    renderInnPosts();
  }

  function inferElementRole(el){
    const own = el.getAttribute("data-author-type") || el.getAttribute("data-role") || "";
    if (own) return roleOf({ role: own }, "member");
    const profile = el.closest("#page-profile");
    if (profile) return profile.classList.contains("profile-companion") || profile.dataset.profileRole === "companion" ? "companion" : "member";
    if (el.closest("[data-open-recommend-profile],#page-companion,.companion-card")) return "companion";
    return "member";
  }
  function applyDefaultAvatars(){
    document.querySelectorAll([
      "#page-home .top3-avatar",
      "#page-home .rank-avatar",
      "#page-vip-rank .formal-rank-avatar",
      "#homeRecommendCompanions .recommend-avatar",
      "#companionNewcomers .recommend-avatar",
      "#page-inn .post-avatar",
      "#page-inn .inn-comment-avatar",
      "#page-profile [data-profile-bind='avatar']",
      "[data-bind='member-avatar']",
      "[data-bind='companion-avatar']"
    ].join(",")).forEach(el => {
      const role = inferElementRole(el);
      const fallback = defaultAvatar(role);
      const img = el.querySelector("img");
      if (img) {
        img.onerror = function(){ this.onerror = null; this.src = fallback; };
        if (!String(img.getAttribute("src") || "").trim()) img.src = fallback;
        return;
      }
      if (!el.classList.contains("formal-rank-avatar") || !el.querySelector(".formal-rank-badge")) {
        el.innerHTML = avatarImg({ role }, role, "預設用戶");
      }
    });
  }
  function ensureProfileGiftButtonLayout(){
    const bar = document.querySelector("#page-profile .profile-bottom-actions");
    if (!bar) return;
    let gift = bar.querySelector('[data-action="gift-profile"]');
    if (!gift) {
      gift = document.createElement("button");
      gift.type = "button";
      gift.dataset.action = "gift-profile";
      gift.className = "gift-main";
      gift.innerHTML = '<span class="profile-stat-icon gift" aria-hidden="true">送</span><span>送禮</span>';
    }
    gift.innerHTML = '<span class="profile-stat-icon gift" aria-hidden="true">送</span><span>送禮</span>';
    const recommend = bar.querySelector('[data-action="recommend-profile"]');
    if (recommend && recommend.nextElementSibling !== gift) {
      recommend.insertAdjacentElement("afterend", gift);
    } else if (!gift.parentNode) {
      bar.appendChild(gift);
    }
  }

  function bindEvents(){
    document.addEventListener("click", event => {
      const profileTarget = event.target.closest("[data-profile-role][data-profile-id]");
      if (profileTarget && !window.__dreamPublicProfileRouterV436 && !event.target.closest("button[data-social-action],button[data-action],.reserve-btn,[data-companion-booking-open]")) {
        const role = roleOf({role:profileTarget.dataset.profileRole}, "member");
        const id = Number(profileTarget.dataset.profileId || 0);
        if (id > 0 && typeof window.openDreamPublicProfileV394 === "function") {
          event.preventDefault();
          event.stopPropagation();
          window.openDreamPublicProfileV394(role, id);
          return;
        }
      }
      const notice = event.target.closest("#page-home .notice-line");
      if (notice) { event.preventDefault(); openNoticeModal(); return; }
      const homeRankTab = event.target.closest("#page-home [data-board-key]");
      if (homeRankTab) {
        event.preventDefault();
        renderHomeTop3(homeRankTab.dataset.boardKey || "vip_rank");
        return;
      }
      const rankTab = event.target.closest("[data-formal-rank-tab]");
      if (rankTab) {
        event.preventDefault();
        renderRankPage(rankTab.dataset.formalRankTab || "vip_rank");
      }
      if (event.target.closest("[data-inn-filter],[data-inn-sort]")) {
        setTimeout(renderInnPosts, 40);
      }
      if (event.target.closest("[data-social-action]")) {
        setTimeout(loadInnPosts, 500);
      }
      if (event.target.closest('[data-go="companion"],[data-target="companion"],#page-companion')) {
        setTimeout(loadCompanionNewcomers, 300);
      }
    }, true);
    document.addEventListener("keydown", event => {
      if (!window.__dreamPublicProfileRouterV436 && (event.key === "Enter" || event.key === " ") && event.target.matches?.("[data-profile-role][data-profile-id]")) {
        const id = Number(event.target.dataset.profileId || 0);
        if (id > 0 && typeof window.openDreamPublicProfileV394 === "function") {
          event.preventDefault();
          window.openDreamPublicProfileV394(roleOf({role:event.target.dataset.profileRole}, "member"), id);
          return;
        }
      }
      if (event.key === "Escape") closeNoticeModal();
      if ((event.key === "Enter" || event.key === " ") && event.target.closest?.("#page-home .notice-line")) {
        event.preventDefault();
        openNoticeModal();
      }
    });
    window.addEventListener("hashchange", () => setTimeout(() => {
      renderAllRankViews();
      ensureProfileGiftButtonLayout();
      applyDefaultAvatars();
      loadInnPosts();
      loadCompanionNewcomers();
    }, 160));
    window.addEventListener("dream-auth-updated", () => setTimeout(() => {
      loadRankAndRecommend();
      loadAnnouncements();
      loadInnPosts();
      loadCompanionNewcomers();
      ensureProfileGiftButtonLayout();
      applyDefaultAvatars();
    }, 180));
    const observer = new MutationObserver(() => {
      clearTimeout(observer.timer);
      observer.timer = setTimeout(() => {
        ensureProfileGiftButtonLayout();
        applyDefaultAvatars();
      }, 80);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  function wrapLegacyRankSetter(){
    const previous = window.DREAM_SET_RANK_BOARDS;
    window.DREAM_SET_RANK_BOARDS = function(data){
      if (typeof previous === "function") {
        try { previous(data); } catch (err) { console.warn("[legacy DREAM_SET_RANK_BOARDS]", err && err.message || err); }
      }
      setBoards({ boards: data || {} });
      renderAllRankViews();
    };
  }
  function boot(){
    injectStyle();
    bindEvents();
    wrapLegacyRankSetter();
    ensureProfileGiftButtonLayout();
    renderNoticeLine();
    applyDefaultAvatars();
    loadRankAndRecommend();
    loadAnnouncements();
    loadInnPosts();
    loadCompanionNewcomers();
    setTimeout(() => {
      renderAllRankViews();
      applyDefaultAvatars();
    }, 700);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.DREAM_REFRESH_FORMAL_HOME = function(){
    return Promise.all([loadRankAndRecommend(), loadAnnouncements(), loadInnPosts(), loadCompanionNewcomers()]).then(() => {
      ensureProfileGiftButtonLayout();
      applyDefaultAvatars();
    });
  };
})();
