(function () {
  "use strict";

  const BOARD_EFFECT_PREFIX = {
    vip_rank: "vip_rank",
    weekly_charm: "monthly_charm",
    monthly_guardian: "monthly_guardian",
    companion_gift: "companion_gift",
    member_gift: "member_gift",
    total_recharge: "total_recharge",
    exclusive_guard: "exclusive_guard"
  };

  const BOARD_THEME_CLASS = {
    vip_rank: "vip",
    weekly_charm: "charm",
    monthly_guardian: "guardian",
    companion_gift: "companion",
    member_gift: "member",
    total_recharge: "recharge",
    exclusive_guard: "exclusive"
  };

  const HOME_RANKS = [
    ["first", 1],
    ["second", 2],
    ["third", 3]
  ];

  const BADGE_SLUG = {
    vip_rank: "vip",
    weekly_charm: "charm",
    monthly_guardian: "guard",
    companion_gift: "companion_gift",
    member_gift: "member_gift",
    total_recharge: "recharge"
  };

  const GLOBAL_NAME_SELECTORS = [
    ".recommend-name",
    ".member-name",
    ".profile-click-name",
    ".companion-card h3",
    ".post-name",
    ".inn-comment-name",
    "[data-rank-top3-board][data-rank-top3-rank]",
    "[data-rank-reward-board][data-rank-reward-rank]"
  ];

  const HOLDER_STORAGE_KEY = "dream_rank_top3_prestige_holders_v2";

  const canvases = new Map();
  const holderRewards = new Map();
  let decorateTimer = 0;
  let lastHolderSync = 0;
  let lastHolderSignature = "";
  let innBadgeMeasureCanvas = null;
  let wrapped = false;

  function injectCss() {
    if (document.getElementById("rank-top3-gufeng-css")) return;
    const css = document.createElement("style");
    css.id = "rank-top3-gufeng-css";
    css.textContent = `
.v35-top3 .top3-rank-effect-layer-v171,
.v35-top3 .top3-rank-effect-layer-v172,
.v35-top3 .top3-rank-effect-layer-v175,
.v35-top3 .top3-rank-effect-layer-v176,
.v35-top3 .top3-rank-effect-layer-v177,
.v35-top3 .top3-rank-effect-layer-v191 {
  display: none !important;
  animation: none !important;
}
.rank-name-wrap::before,
.rank-name-wrap::after,
.rank-name-text::before,
.v267-name-text::before {
  display: none !important;
  content: none !important;
  animation: none !important;
}
.rank-top3-gufeng-name {
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 auto !important;
  vertical-align: middle !important;
  width: 13.5em !important;
  aspect-ratio: 3 / 1 !important;
  max-width: min(58vw, 260px) !important;
  line-height: 1 !important;
  overflow: visible !important;
  pointer-events: none !important;
  isolation: isolate !important;
}
.rank-top3-gufeng-canvas {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  pointer-events: none !important;
  mix-blend-mode: normal !important;
  filter: saturate(1.18) contrast(1.06) brightness(1.08) !important;
}
.rank-top3-gufeng-sr {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
.rank-top3-gufeng-badges,
.rank-top3-gufeng-badges img,
.v267-badges,
.rank-name-badges {
  position: relative !important;
  z-index: 3 !important;
}
#page-home .top3-text .rank-top3-gufeng-badges,
#page-home .top3-text .v267-badges,
#page-home .top3-text .rank-name-badges {
  display: none !important;
}
.v267-rank-name,
.full-rank-name,
.v267-demo,
.profile-guardian-name {
  overflow: visible !important;
}
.v267-rank-name .rank-top3-gufeng-name,
.full-rank-name .rank-top3-gufeng-name {
  width: 15.5em !important;
  max-width: min(54vw, 300px) !important;
  margin: -.72em 0 !important;
}
.v267-rank-name .rank-top3-gufeng-badges,
.full-rank-name .rank-top3-gufeng-badges,
.v267-rank-name .v267-badges,
.full-rank-name .rank-name-badges {
  margin-left: -28px !important;
  transform: translateX(-22px) scale(1.18) !important;
  transform-origin: left center !important;
  flex: 0 0 auto !important;
}
.v267-rank-name .rank-top3-gufeng-badges img,
.full-rank-name .rank-top3-gufeng-badges img,
.v267-rank-name .rank-name-badge,
.full-rank-name .rank-name-badge {
  height: 27px !important;
  max-width: 100px !important;
}
.v267-demo .rank-top3-gufeng-name {
  width: min(82vw, 360px) !important;
}
#page-vip-rank .v267-preview-grid {
  grid-template-columns: 1fr !important;
  gap: 14px !important;
}
#page-vip-rank .v267-preview-card {
  min-height: 278px !important;
  padding: 16px 12px 14px !important;
}
#page-vip-rank .v267-preview-card .v267-badge-demo {
  min-height: 150px !important;
  margin-bottom: 13px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
#page-vip-rank .v267-preview-card .v267-badge-demo img {
  width: min(92%, 260px) !important;
  height: auto !important;
  max-width: 260px !important;
  max-height: none !important;
  object-fit: contain !important;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.38)) saturate(1.16) !important;
}
.profile-guardian-name .rank-top3-gufeng-name {
  width: 13.4em !important;
  max-width: 100% !important;
  margin: -.52em 0 -.46em !important;
}
.profile-guardian-podium .profile-guardian-name {
  font-size: 16px !important;
  line-height: 1.1 !important;
  white-space: nowrap !important;
}
.profile-guardian-podium.rank1 .profile-guardian-name {
  font-size: 18px !important;
}
.rank-top3-prestige-host {
  overflow: visible !important;
}
.rank-top3-global-host {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 !important;
  vertical-align: middle !important;
  max-width: 100% !important;
}
.recommend-name.rank-top3-global-host,
.companion-card h3.rank-top3-global-host,
.post-name.rank-top3-global-host,
.inn-comment-name.rank-top3-global-host {
  min-height: 36px !important;
}
.recommend-name .rank-top3-gufeng-name {
  width: 132px !important;
  max-width: 100% !important;
  margin: -.38em 0 !important;
}
.companion-card h3 .rank-top3-gufeng-name,
.post-name .rank-top3-gufeng-name,
.inn-comment-name .rank-top3-gufeng-name {
  width: 156px !important;
  max-width: 100% !important;
  margin: -.48em 0 !important;
}
.inn-comment-name .rank-top3-gufeng-name {
  width: 142px !important;
  margin: -.44em 0 !important;
}
#page-inn .post-head {
  gap: 8px !important;
}
#page-inn .post-head > div:not(.post-avatar) {
  margin-left: 0 !important;
}
#page-inn .post-name,
#page-inn .post-name.rank-top3-global-host {
  font-size: 20px !important;
  line-height: 1.16 !important;
}
#page-inn .inn-comment {
  gap: 8px !important;
  grid-template-columns: 30px minmax(0,1fr) !important;
}
#page-inn .inn-comment-main {
  margin-left: 0 !important;
}
#page-inn .inn-comment-head {
  gap: 4px !important;
}
#page-inn .inn-comment-name,
#page-inn .inn-comment-name.rank-top3-global-host {
  font-size: 18px !important;
  line-height: 1.16 !important;
}
#page-inn .post-name .rank-top3-gufeng-name {
  width: 150px !important;
  margin: -.52em 0 !important;
}
#page-inn .inn-comment-name .rank-top3-gufeng-name {
  width: 136px !important;
  margin: -.48em 0 !important;
}
#page-inn .post-name.rank-top3-global-host .rank-top3-gufeng-badges,
#page-inn .post-name.rank-top3-global-host .rank-name-badges,
#page-inn .post-name.rank-top3-global-host .v267-badges {
  margin-left: var(--rank-inn-badge-offset, -105px) !important;
  transform: none !important;
}
#page-inn .inn-comment-name.rank-top3-global-host .rank-top3-gufeng-badges,
#page-inn .inn-comment-name.rank-top3-global-host .rank-name-badges,
#page-inn .inn-comment-name.rank-top3-global-host .v267-badges {
  margin-left: var(--rank-inn-badge-offset, -98px) !important;
  transform: none !important;
}
.member-name .rank-top3-gufeng-name,
.profile-click-name .rank-top3-gufeng-name {
  width: min(68vw, 260px) !important;
  max-width: 100% !important;
  margin: -.48em 0 !important;
}
.rank-chip .rank-title .rank-top3-gufeng-name {
  width: 124px !important;
  max-width: 100% !important;
  margin: -.42em 0 !important;
}
.rank-top3-global-host .rank-top3-gufeng-badges {
  margin-left: -12px !important;
  transform: translateX(-7px) scale(1.05) !important;
  transform-origin: left center !important;
}
.rank-top3-global-host .rank-name-badge {
  height: 22px !important;
  max-width: 84px !important;
}

/* v294: 首頁本期前三名只套用正確 gufeng 名字特效，不在這裡調整任何 top/left/框架位置 */
#page-home .v35-top3 .top3-text .name .rank-top3-gufeng-name{
  width:100% !important;
  max-width:100% !important;
  height:100% !important;
  aspect-ratio:auto !important;
  margin:0 !important;
}
#page-home .v35-top3 .top3-text .name .rank-top3-gufeng-canvas{
  inset:0 !important;
  width:100% !important;
  height:100% !important;
}
#page-home .top3-text .rank-top3-gufeng-badges,
#page-home .top3-text .rank-name-badges,
#page-home .top3-text .v267-badges{
  display:none !important;
}
`;
    document.head.appendChild(css);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, match => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[match]));
  }

  function activeHomeBoard() {
    const active = document.querySelector("#page-home .leaderboard-tab.active[data-board-key]");
    return (active && active.dataset.boardKey) || localStorage.getItem("dream_home_board_key") || "vip_rank";
  }

  function activeRankBoard() {
    const v267 = document.querySelector("#page-vip-rank .v267-tab.active[data-v267-key]");
    if (v267 && v267.dataset.v267Key) return v267.dataset.v267Key;
    const active = document.querySelector("#page-vip-rank .leaderboard-tab.active[data-board-key]");
    if (active && active.dataset.boardKey) return active.dataset.boardKey;
    return localStorage.getItem("dream_rank_page_key") || localStorage.getItem("dream_home_board_key") || "vip_rank";
  }

  function effectId(board, rank) {
    const prefix = BOARD_EFFECT_PREFIX[board] || BOARD_EFFECT_PREFIX.vip_rank;
    return `${prefix}_${String(rank).padStart(2, "0")}`;
  }

  function makeEffect(board, rank, name) {
    const id = effectId(board, rank);
    const base = (window.RANK_TOP3_EFFECTS || []).find(item => item.id === id);
    if (!base) return null;
    return Object.assign({}, base, {
      id: `${id}_${String(name || "").length}`,
      displayName: name || "-"
    });
  }

  function normalizedName(value) {
    return String(value == null ? "" : value).replace(/\s+/g, "").trim();
  }

  function loadStoredHolders() {
    try {
      const saved = JSON.parse(localStorage.getItem(HOLDER_STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return;
      saved.forEach(item => {
        if (!item || !item.name || !item.board || !item.rank) return;
        const key = normalizedName(item.name);
        if (key) holderRewards.set(key, { name: item.name, board: item.board, rank: Number(item.rank) });
      });
    } catch (_) {}
  }

  function saveStoredHolders() {
    try {
      const payload = Array.from(holderRewards.values()).slice(-80);
      localStorage.setItem(HOLDER_STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  function registerHolder(name, board, rank) {
    const key = normalizedName(name);
    const rankNo = Number(rank);
    if (!key || !BOARD_EFFECT_PREFIX[board] || rankNo < 1 || rankNo > 3) return;
    holderRewards.set(key, { name, board, rank: rankNo });
    saveStoredHolders();
  }

  function pruneBoardHolders(board, activeNames) {
    if (!BOARD_EFFECT_PREFIX[board] || !activeNames || !activeNames.size) return;
    let changed = false;
    holderRewards.forEach((reward, key) => {
      if (reward.board === board && !activeNames.has(key)) {
        holderRewards.delete(key);
        changed = true;
      }
    });
    if (changed) saveStoredHolders();
  }

  function setBoardHolders(board, entries) {
    if (!BOARD_EFFECT_PREFIX[board] || !entries || !entries.length) return;
    holderRewards.forEach((reward, key) => {
      if (reward.board === board) holderRewards.delete(key);
    });
    entries.forEach(entry => {
      const key = normalizedName(entry.name);
      const rankNo = Number(entry.rank);
      if (!key || rankNo < 1 || rankNo > 3) return;
      holderRewards.set(key, { name: entry.name, board, rank: rankNo });
    });
    saveStoredHolders();
  }

  function badgePath(board, rank) {
    const slug = BADGE_SLUG[board];
    if (!slug || rank < 1 || rank > 3) return "";
    return `assets/rank_rewards/badges/rank_badge_${slug}_0${rank}_name.webp`;
  }

  function createGeneratedBadge(board, rank) {
    const src = badgePath(board, rank);
    if (!src) return null;
    const badge = document.createElement("span");
    badge.className = "rank-top3-gufeng-badges rank-name-badges rank-top3-generated-badge";
    const img = document.createElement("img");
    img.className = "rank-name-badge";
    img.src = src;
    img.alt = "排行榜前三名徽章";
    img.loading = "lazy";
    badge.appendChild(img);
    return badge;
  }

  function textFromHost(host) {
    if (!host) return "";
    const existing = host.querySelector(".rank-top3-gufeng-name");
    if (existing && existing.dataset.rankName) return existing.dataset.rankName;
    const direct = host.querySelector(".v267-name-text,.rank-name-text");
    if (direct && direct.textContent.trim()) return direct.textContent.trim();
    const clone = host.cloneNode(true);
    clone.querySelectorAll("img,canvas,.rank-top3-gufeng-sr,.rank-top3-gufeng-badges,.v267-badges,.rank-name-badges").forEach(node => node.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  function cloneBadges(host, board, rank, options) {
    const existing = Array.from(host.querySelectorAll(".v267-badges,.rank-name-badges,.rank-top3-gufeng-badges"))
      .map(node => {
        const clone = node.cloneNode(true);
        clone.classList.add("rank-top3-gufeng-badges");
        return clone;
      });
    if (existing.length) return existing;
    if (options && options.generatedBadge === false) return [];
    const generated = createGeneratedBadge(board, rank);
    return generated ? [generated] : [];
  }

  function syncInnBadgeOffset(host) {
    if (!host || !host.closest || !host.closest("#page-inn")) return;
    const wrap = host.querySelector(".rank-top3-gufeng-name");
    const badge = host.querySelector(".rank-top3-gufeng-badges,.rank-name-badges,.v267-badges");
    const canvas = wrap && wrap.querySelector("canvas");
    if (!wrap || !badge || !canvas) return;
    const cssWidth = wrap.getBoundingClientRect().width || parseFloat(getComputedStyle(wrap).width) || 0;
    if (!cssWidth) return;
    const name = wrap.dataset.rankName || textFromHost(host);
    if (!name) return;
    if (!innBadgeMeasureCanvas) innBadgeMeasureCanvas = document.createElement("canvas");
    const ctx = innBadgeMeasureCanvas.getContext("2d");
    const isPostName = host.matches(".post-name");
    const maxSize = isPostName ? 128 : 116;
    const leftPadding = isPostName ? 8 : 7;
    ctx.font = `900 ${maxSize}px "Microsoft JhengHei","Noto Serif TC","KaiTi",serif`;
    const scale = cssWidth / (canvas.width || 960);
    const textRight = (leftPadding + ctx.measureText(name).width) * scale;
    const desiredLeft = Math.min(cssWidth - 12, Math.max(34, textRight + 8));
    const computed = getComputedStyle(host);
    const flexGap = parseFloat(computed.columnGap) || parseFloat(computed.gap) || 0;
    const offset = Math.round(desiredLeft - cssWidth - flexGap);
    host.style.setProperty("--rank-inn-badge-offset", `${offset}px`);
  }

  function syncAllInnBadgeOffsets() {
    document.querySelectorAll("#page-inn .post-name.rank-top3-global-host,#page-inn .inn-comment-name.rank-top3-global-host")
      .forEach(syncInnBadgeOffset);
  }

  function createCanvasName(name, board, rank, compact) {
    const wrap = document.createElement("span");
    const theme = BOARD_THEME_CLASS[board] || "vip";
    wrap.className = `rank-top3-gufeng-name rank-top3-gufeng-${theme} rank-${rank}`;
    wrap.dataset.rankName = name;
    wrap.dataset.rankBoard = board;
    wrap.dataset.rank = String(rank);
    if (compact) wrap.dataset.compact = "1";

    const canvas = document.createElement("canvas");
    canvas.className = "rank-top3-gufeng-canvas";
    canvas.width = 960;
    canvas.height = 320;
    canvas.setAttribute("aria-hidden", "true");

    const sr = document.createElement("span");
    sr.className = "rank-top3-gufeng-sr";
    sr.textContent = name;

    wrap.appendChild(canvas);
    wrap.appendChild(sr);

    const effect = makeEffect(board, rank, name);
    if (effect) {
      canvases.set(canvas, {
        effect,
        phase: (rank - 1) * 0.31 + Object.keys(BOARD_EFFECT_PREFIX).indexOf(board) * 0.17
      });
    }
    return wrap;
  }

  function replaceHost(host, board, rank, compact, options) {
    options = options || {};
    if (!host || !BOARD_EFFECT_PREFIX[board] || rank < 1 || rank > 3) return;
    const name = textFromHost(host);
    if (!name) return;
    const current = host.querySelector(".rank-top3-gufeng-name");
    if (
      current &&
      current.dataset.rankName === name &&
      current.dataset.rankBoard === board &&
      current.dataset.rank === String(rank)
    ) {
      if (options.holder !== false) registerHolder(name, board, rank);
      return name;
    }

    if (options.holder !== false) registerHolder(name, board, rank);
    const badges = options.badge === false ? [] : cloneBadges(host, board, rank, options);
    host.innerHTML = "";
    host.classList.add("rank-top3-prestige-host");
    if (options.global) host.classList.add("rank-top3-global-host");
    host.appendChild(createCanvasName(name, board, rank, compact));
    badges.forEach(badge => host.appendChild(badge));
    requestAnimationFrame(() => syncInnBadgeOffset(host));
    return name;
  }

  function decorateHome() {
    const board = activeHomeBoard();
    const activeNames = new Set();
    const entries = [];
    HOME_RANKS.forEach(([cls, rank]) => {
      const host = document.querySelector(`#page-home .top3-text.${cls} .name`);
      const sourceName = textFromHost(host);
      if (sourceName) entries.push({ name: sourceName, rank });
      const name = replaceHost(host, board, rank, false, { badge: false });
      const key = normalizedName(name || sourceName);
      if (key) activeNames.add(key);
    });
    setBoardHolders(board, entries);
    pruneBoardHolders(board, activeNames);
  }

  function decorateRankPage() {
    const board = activeRankBoard();
    const activeNames = new Set();
    const entryByRank = new Map();
    document.querySelectorAll("#page-vip-rank .v267-rank-row.has-top3").forEach(row => {
      const rankText = row.querySelector(".v267-rank-no")?.textContent || "";
      const rank = Number(rankText.match(/\d+/)?.[0] || 0);
      const host = row.querySelector(".v267-rank-name");
      const sourceName = textFromHost(host);
      if (sourceName && rank >= 1 && rank <= 3) entryByRank.set(rank, { name: sourceName, rank });
      const name = replaceHost(host, board, rank, false, { holder: false });
      const key = normalizedName(name);
      if (key) activeNames.add(key);
    });
    [1, 2, 3].forEach(rank => {
      document.querySelectorAll(`#page-vip-rank .full-rank-row:nth-child(${rank}) .full-rank-name`).forEach(host => {
        const sourceName = textFromHost(host);
        if (sourceName) entryByRank.set(rank, { name: sourceName, rank });
        const name = replaceHost(host, board, rank, false, { holder: false });
        const key = normalizedName(name);
        if (key) activeNames.add(key);
      });
    });
    setBoardHolders(board, Array.from(entryByRank.values()));
    pruneBoardHolders(board, activeNames);
    document.querySelectorAll("#page-vip-rank .v267-preview-card").forEach(card => {
      const match = Array.from(card.classList).join(" ").match(/rank-(\d+)/);
      const rank = Number(match && match[1]);
      replaceHost(card.querySelector(".v267-demo"), board, rank, false, { holder: false, badge: false });
    });
  }

  function decorateGuardian() {
    document.querySelectorAll(".profile-guardian-podium").forEach(card => {
      const rank = card.classList.contains("rank1") ? 1 : card.classList.contains("rank2") ? 2 : card.classList.contains("rank3") ? 3 : 0;
      replaceHost(card.querySelector(".profile-guardian-name"), "exclusive_guard", rank, true);
    });
  }

  function decorateDataTaggedHolders() {
    document.querySelectorAll("[data-rank-top3-board][data-rank-top3-rank],[data-rank-reward-board][data-rank-reward-rank]").forEach(host => {
      if (host.closest("#page-vip-rank .v267-rank-list,#page-vip-rank .full-rank-list,#page-home [data-rank-scroll]")) return;
      const board = host.dataset.rankTop3Board || host.dataset.rankRewardBoard;
      const rank = Number(host.dataset.rankTop3Rank || host.dataset.rankRewardRank || 0);
      const explicitName = host.dataset.rankTop3Name || host.dataset.rankRewardName;
      if (explicitName && !host.querySelector(".rank-top3-gufeng-name")) host.textContent = explicitName;
      replaceHost(host, board, rank, false, { global: true });
    });
  }

  function restorePlainHost(host) {
    if (!host) return;
    const name = textFromHost(host);
    if (!name || !host.querySelector(".rank-top3-gufeng-name,.rank-top3-gufeng-badges,.v267-badges,.rank-name-badges")) return;
    host.textContent = name;
    host.classList.remove("rank-top3-prestige-host", "rank-top3-global-host");
  }

  function cleanupNonTop3RankRewards() {
    document.querySelectorAll("#page-home [data-rank-scroll] .rank-title").forEach(restorePlainHost);
    document.querySelectorAll("#page-vip-rank .v267-rank-row:not(.has-top3) .v267-rank-name").forEach(restorePlainHost);
    document.querySelectorAll("#page-vip-rank .full-rank-row:nth-child(n+4) .full-rank-name").forEach(restorePlainHost);
  }

  function decorateKnownHolderNames() {
    if (!holderRewards.size) return;
    document.querySelectorAll(GLOBAL_NAME_SELECTORS.join(",")).forEach(host => {
      if (!host || !host.isConnected) return;
      if (host.matches("[data-rank-top3-board][data-rank-top3-rank],[data-rank-reward-board][data-rank-reward-rank]")) return;
      if (host.closest("#page-home .top3-text")) return;
      if (host.closest("#page-vip-rank .v267-preview-card")) return;
      if (host.closest("#page-vip-rank .v267-rank-list,#page-vip-rank .full-rank-list,#page-home [data-rank-scroll]")) return;
      if (host.closest(".profile-guardian-podium")) return;
      const name = textFromHost(host);
      const reward = holderRewards.get(normalizedName(name));
      if (!reward) return;
      replaceHost(host, reward.board, reward.rank, false, { holder: false, global: true });
    });
  }

  function syncVisibleHomeHolders() {
    const board = activeHomeBoard();
    const entries = [];
    HOME_RANKS.forEach(([cls, rank]) => {
      const name = textFromHost(document.querySelector(`#page-home .top3-text.${cls} .name`));
      if (name) entries.push({ name, rank });
    });
    if (entries.length < 3) return;
    const signature = `${board}:${entries.map(entry => `${entry.rank}:${normalizedName(entry.name)}`).join("|")}`;
    if (signature === lastHolderSignature) return;
    lastHolderSignature = signature;
    setBoardHolders(board, entries);
    decorateKnownHolderNames();
  }

  function decorateAll() {
    injectCss();
    if (typeof window.drawRankTop3EffectFrame !== "function") return;
    decorateHome();
    decorateRankPage();
    decorateGuardian();
    decorateDataTaggedHolders();
    decorateKnownHolderNames();
    cleanupNonTop3RankRewards();
    syncAllInnBadgeOffsets();
    requestAnimationFrame(syncAllInnBadgeOffsets);
  }

  function scheduleDecorate() {
    clearTimeout(decorateTimer);
    decorateTimer = setTimeout(decorateAll, 35);
  }

  function wrapRenderers() {
    if (wrapped) return;
    wrapped = true;
    ["renderDreamHomeLeaderboard", "DREAM_RENDER_RANK_PAGE_V267", "renderDreamProfilePage"].forEach(name => {
      const original = window[name];
      if (typeof original !== "function" || original.__rankGufengWrapped) return;
      const wrappedFn = function () {
        try {
          return original.apply(this, arguments);
        } finally {
          scheduleDecorate();
          setTimeout(scheduleDecorate, 120);
        }
      };
      wrappedFn.__rankGufengWrapped = true;
      window[name] = wrappedFn;
    });
  }

  function renderLoop(now) {
    if (document.visibilityState !== "hidden" && typeof window.drawRankTop3EffectFrame === "function") {
      if (now - lastHolderSync > 1000) {
        lastHolderSync = now;
        syncVisibleHomeHolders();
      }
      canvases.forEach((entry, canvas) => {
        if (!canvas.isConnected) {
          canvases.delete(canvas);
          return;
        }
        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0 || rect.bottom < -80 || rect.top > window.innerHeight + 80) return;
        const homeTop3 = canvas.closest("#page-home .v35-top3 .top3-text");
        const guardianPodium = canvas.closest(".profile-guardian-podium");
        const innPostName = canvas.closest("#page-inn .post-name");
        const innCommentName = canvas.closest("#page-inn .inn-comment-name");
        const rank = Number(canvas.closest(".rank-top3-gufeng-name")?.dataset.rank || entry.effect.rank || 0);
        const codeEffectOptions = homeTop3
          ? {
              transparent: true,
              effectScaleX: rank === 1 ? 1.02 : 0.96,
              effectScaleY: rank === 1 ? 0.72 : 0.68,
              nameAuraScale: rank === 1 ? 0.88 : 0.80,
              nameFontMax: rank === 1 ? 132 : 122,
              nameTextWidthFactor: rank === 1 ? 0.96 : 0.92,
              textYOffset: rank === 1 ? -27 : -32
            }
          : guardianPodium
            ? {
                transparent: true,
                effectScaleX: rank === 1 ? 0.66 : 0.62,
                effectScaleY: rank === 1 ? 0.50 : 0.48,
                nameAuraScale: rank === 1 ? 0.68 : 0.62,
                textYOffset: rank === 1 ? -22 : -24
              }
            : innPostName || innCommentName
              ? {
                  transparent: true,
                  nameLeftPadding: innPostName ? 8 : 7,
                  nameTextWidthFactor: 0.90,
                  nameFontMax: innPostName ? 128 : 116,
                  nameAuraScale: 0.82,
                  effectAnchorToName: true
                }
              : { transparent: true };
        window.drawRankTop3EffectFrame(canvas, entry.effect, now / 1000 + entry.phase, codeEffectOptions);
      });
    }
    requestAnimationFrame(renderLoop);
  }

  function init() {
    injectCss();
    loadStoredHolders();
    wrapRenderers();
    scheduleDecorate();
    setTimeout(scheduleDecorate, 250);
    setTimeout(scheduleDecorate, 900);
    const observer = new MutationObserver(scheduleDecorate);
    observer.observe(document.body, { childList: true, subtree: true });
    requestAnimationFrame(renderLoop);
  }

  document.addEventListener("click", event => {
    if (event.target.closest("[data-board-key],[data-v267-key],[data-go='vip-rank']")) {
      setTimeout(scheduleDecorate, 80);
      setTimeout(scheduleDecorate, 260);
    }
  }, true);

  window.DREAM_RANK_TOP3_PRESTIGE = {
    apply: scheduleDecorate,
    register(name, board, rank) {
      registerHolder(name, board, rank);
      scheduleDecorate();
    },
    holders: holderRewards
  };
  window.DREAM_APPLY_RANK_TOP3_GUFENG = scheduleDecorate;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
