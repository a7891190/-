
(function(){
  const DEFAULT_BASE = "assets/barrage/";
  const LOCAL_ASSET_MAP = {"common":["assets/barrage/common/common_01_pink_gold_fantasy.webp","assets/barrage/common/common_02_pastel.webp","assets/barrage/common/common_03_ornamental.webp","assets/barrage/common/common_04_koi_cloud.webp","assets/barrage/common/common_05_fantasy_banner.webp","assets/barrage/common/common_06_rose_gold.webp"],"gift":{"fan":["assets/barrage/gift/fan/gift_fan_01_floral_round.webp","assets/barrage/gift/fan/gift_fan_02_floral_banner.webp","assets/barrage/gift/fan/gift_fan_03_floral_stage.webp"],"lantern":["assets/barrage/gift/lantern/gift_lantern_01_pink_gold.webp","assets/barrage/gift/lantern/gift_lantern_02_starlight.webp","assets/barrage/gift/lantern/gift_lantern_03_celestial.webp"],"music":["assets/barrage/gift/music/gift_music_01_floral_notes.webp","assets/barrage/gift/music/gift_music_02_bamboo_flute.webp","assets/barrage/gift/music/gift_music_03_bamboo_blossom.webp"],"special":["assets/barrage/gift/special/gift_special_01_koi.webp","assets/barrage/gift/special/gift_special_02_crane.webp","assets/barrage/gift/special/gift_special_03_rabbit.webp"],"token":["assets/barrage/gift/token/gift_token_01_lotus_pearl.webp","assets/barrage/gift/token/gift_token_02_sakura_jade.webp","assets/barrage/gift/token/gift_token_03_butterfly_ribbon.webp","assets/barrage/gift/token/gift_token_04_rose_ribbon.webp"],"byGiftName":{"翠竹簫":"assets/barrage/gift/music/gift_music_02_bamboo_flute.webp","瑞鶴笛":"assets/barrage/gift/music/gift_music_03_bamboo_blossom.webp","朝露琴":"assets/barrage/gift/music/gift_music_01_floral_notes.webp","星河燈":"assets/barrage/gift/lantern/gift_lantern_02_starlight.webp","結夢燈":"assets/barrage/gift/lantern/gift_lantern_03_celestial.webp","如意結":"assets/barrage/gift/token/gift_token_02_sakura_jade.webp","合歡簪":"assets/barrage/gift/token/gift_token_04_rose_ribbon.webp","流蘇結":"assets/barrage/gift/token/gift_token_03_butterfly_ribbon.webp","祥雲佩":"assets/barrage/gift/token/gift_token_01_lotus_pearl.webp","牡丹扇":"assets/barrage/gift/fan/gift_fan_01_floral_round.webp","竹影扇":"assets/barrage/gift/fan/gift_fan_02_floral_banner.webp"}},"order":{"lv1":["assets/barrage/order/lv1/order_lv1_01_pink_banner.webp","assets/barrage/order/lv1/order_lv1_02_simple_frame.webp"],"lv2":["assets/barrage/order/lv2/order_lv2_01_tassel_gold.webp","assets/barrage/order/lv2/order_lv2_02_ui_banner.webp"],"lv3":["assets/barrage/order/lv3/order_lv3_01_sakura_scroll.webp","assets/barrage/order/lv3/order_lv3_02_decorative_scroll.webp"],"lv4":["assets/barrage/order/lv4/order_lv4_01_luxury_scroll.webp","assets/barrage/order/lv4/order_lv4_02_east_asian_banner.webp"]},"recharge":{"lv1":["assets/barrage/recharge/lv1/recharge_lv1_01_simple.webp","assets/barrage/recharge/lv1/recharge_lv1_02_regal.webp"],"lv2":["assets/barrage/recharge/lv2/recharge_lv2_01_gold_pink.webp","assets/barrage/recharge/lv2/recharge_lv2_02_game.webp"],"lv3":["assets/barrage/recharge/lv3/recharge_lv3_01_treasure_glow.webp","assets/barrage/recharge/lv3/recharge_lv3_02_medallion.webp"],"lv4":["assets/barrage/recharge/lv4/recharge_lv4_01_treasure_frame.webp","assets/barrage/recharge/lv4/recharge_lv4_02_lavish.webp"]},"ranking":{"rank_1":["assets/barrage/ranking/rank_1/ranking_rank1_01_crown.webp","assets/barrage/ranking/rank_1/ranking_rank1_02_black_gold.webp"],"rank_2":["assets/barrage/ranking/rank_2/ranking_rank2_01_crown_banner.webp"],"rank_3":["assets/barrage/ranking/rank_3/ranking_rank3_01_crest.webp"],"rank_4_10":["assets/barrage/ranking/rank_4_10/ranking_rank4_10_01_emblem.webp","assets/barrage/ranking/rank_4_10/ranking_rank4_10_02_regal_banner.webp"]}};
  const LOCAL_RULES = {"version":"v114-effects-r4","display":{"lv1Seconds":6,"lv2Seconds":8,"lv3Seconds":12,"lv4Seconds":16,"desktopMaxParticles":48,"mobileMaxParticles":20},"thresholds":{"gift":[{"min":0,"max":499,"level":0},{"min":500,"max":1999,"level":1},{"min":2000,"max":4999,"level":2},{"min":5000,"max":19999,"level":3},{"min":20000,"level":4}],"order":[{"min":0,"max":999,"level":0},{"min":1000,"max":2999,"level":1},{"min":3000,"max":9999,"level":2},{"min":10000,"max":29999,"level":3},{"min":30000,"level":4}],"recharge":[{"min":0,"max":499,"level":0},{"min":500,"max":1999,"level":1},{"min":2000,"max":9999,"level":2},{"min":10000,"max":49999,"level":3},{"min":50000,"level":4}],"ranking":[{"rankMin":6,"rankMax":10,"level":1},{"rankMin":4,"rankMax":5,"level":2},{"rankMin":3,"rankMax":3,"level":3},{"rankMin":2,"rankMax":2,"level":3},{"rankMin":1,"rankMax":1,"level":4}]},"dynamicEffects":{"rankingNoEffectFromRank":5,"fullscreenMinLevel":3,"particleCountByLevel":[0,8,14,22,34],"borderOrbitCountByLevel":[0,1,2,3,4],"fullscreenSymbolCountByLevel":[0,0,0,16,26]},"effects":{"gift":{"music":"notes","lantern":"stars","token":"redThread","fan":"petals","special":"festival"},"order":"scroll","recharge":"gold","ranking":"crown"}};
  const FRAME_INDEX = {"assets/barrage/gift/fan/gift_fan_01_floral_round.webp":1,"assets/barrage/gift/fan/gift_fan_02_floral_banner.webp":2,"assets/barrage/gift/fan/gift_fan_03_floral_stage.webp":3,"assets/barrage/gift/lantern/gift_lantern_01_pink_gold.webp":4,"assets/barrage/gift/lantern/gift_lantern_02_starlight.webp":5,"assets/barrage/gift/lantern/gift_lantern_03_celestial.webp":6,"assets/barrage/gift/music/gift_music_01_floral_notes.webp":7,"assets/barrage/gift/music/gift_music_02_bamboo_flute.webp":8,"assets/barrage/gift/music/gift_music_03_bamboo_blossom.webp":9,"assets/barrage/gift/special/gift_special_01_koi.webp":10,"assets/barrage/gift/special/gift_special_02_crane.webp":11,"assets/barrage/gift/special/gift_special_03_rabbit.webp":12,"assets/barrage/gift/token/gift_token_01_lotus_pearl.webp":13,"assets/barrage/gift/token/gift_token_02_sakura_jade.webp":14,"assets/barrage/gift/token/gift_token_03_butterfly_ribbon.webp":15,"assets/barrage/gift/token/gift_token_04_rose_ribbon.webp":16,"assets/barrage/order/lv1/order_lv1_01_pink_banner.webp":17,"assets/barrage/order/lv1/order_lv1_02_simple_frame.webp":18,"assets/barrage/order/lv2/order_lv2_01_tassel_gold.webp":19,"assets/barrage/order/lv2/order_lv2_02_ui_banner.webp":20,"assets/barrage/order/lv3/order_lv3_01_sakura_scroll.webp":21,"assets/barrage/order/lv3/order_lv3_02_decorative_scroll.webp":22,"assets/barrage/order/lv4/order_lv4_01_luxury_scroll.webp":23,"assets/barrage/order/lv4/order_lv4_02_east_asian_banner.webp":24,"assets/barrage/recharge/lv1/recharge_lv1_01_simple.webp":25,"assets/barrage/recharge/lv1/recharge_lv1_02_regal.webp":26,"assets/barrage/recharge/lv2/recharge_lv2_01_gold_pink.webp":27,"assets/barrage/recharge/lv2/recharge_lv2_02_game.webp":28,"assets/barrage/recharge/lv3/recharge_lv3_01_treasure_glow.webp":29,"assets/barrage/recharge/lv3/recharge_lv3_02_medallion.webp":30,"assets/barrage/recharge/lv4/recharge_lv4_01_treasure_frame.webp":31,"assets/barrage/recharge/lv4/recharge_lv4_02_lavish.webp":32,"assets/barrage/ranking/rank_1/ranking_rank1_01_crown.webp":33,"assets/barrage/ranking/rank_1/ranking_rank1_02_black_gold.webp":34,"assets/barrage/ranking/rank_2/ranking_rank2_01_crown_banner.webp":35,"assets/barrage/ranking/rank_3/ranking_rank3_01_crest.webp":36,"assets/barrage/ranking/rank_4_10/ranking_rank4_10_01_emblem.webp":37,"assets/barrage/ranking/rank_4_10/ranking_rank4_10_02_regal_banner.webp":38,"assets/barrage/common/common_01_pink_gold_fantasy.webp":39,"assets/barrage/common/common_02_pastel.webp":40,"assets/barrage/common/common_03_ornamental.webp":41,"assets/barrage/common/common_04_koi_cloud.webp":42,"assets/barrage/common/common_05_fantasy_banner.webp":43,"assets/barrage/common/common_06_rose_gold.webp":44};
  const LOCAL_LAYOUT = {"1":{"mode":"round","sw":1254,"sh":1254,"rw":180,"rh":180,"avatar":{"x":83,"y":42,"size":58},"text":{"x":55,"y":106,"w":108,"h":42},"titleSize":10,"subSize":7,"align":"center"},"2":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":52,"y":43,"size":66},"text":{"x":140,"y":42,"w":282,"h":62},"titleSize":14,"subSize":10,"align":"left"},"3":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":50,"y":46,"size":54},"text":{"x":110,"y":42,"w":214,"h":62},"titleSize":14,"subSize":10,"align":"left"},"4":{"mode":"plain","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":99,"y":50,"size":44},"text":{"x":140,"y":42,"w":290,"h":62},"titleSize":14,"subSize":10,"align":"left"},"5":{"mode":"circle","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":37,"y":41,"size":66},"text":{"x":110,"y":42,"w":220,"h":62},"titleSize":14,"subSize":10,"align":"left","titleColor":"#6a2447","subColor":"rgba(106,36,71,.78)"},"6":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":48,"y":41,"size":62},"text":{"x":118,"y":42,"w":305,"h":62},"titleSize":14,"subSize":10,"align":"left","titleColor":"#fff2d8","subColor":"#ffe4f4"},"7":{"mode":"plain","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":98,"y":54,"size":40},"text":{"x":140,"y":42,"w":278,"h":62},"titleSize":14,"subSize":10,"align":"left"},"8":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":32,"y":35,"size":64},"text":{"x":126,"y":42,"w":300,"h":62},"titleSize":14,"subSize":10,"align":"left"},"9":{"mode":"circle","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":35,"y":31,"size":71},"text":{"x":124,"y":42,"w":206,"h":62},"titleSize":12,"subSize":9,"align":"left"},"10":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":38,"y":46,"size":58},"text":{"x":98,"y":42,"w":208,"h":62},"titleSize":12,"subSize":9,"align":"left"},"11":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":72,"y":52,"size":42},"text":{"x":112,"y":42,"w":202,"h":62},"titleSize":12,"subSize":9,"align":"left"},"12":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":70,"y":48,"size":46},"text":{"x":112,"y":42,"w":202,"h":62},"titleSize":12,"subSize":9,"align":"left"},"13":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":32,"y":37,"size":70},"text":{"x":116,"y":42,"w":304,"h":62},"titleSize":14,"subSize":10,"align":"left"},"14":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":38,"y":28,"size":76},"text":{"x":122,"y":42,"w":310,"h":62},"titleSize":14,"subSize":10,"align":"left"},"15":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":32,"y":28,"size":82},"text":{"x":132,"y":42,"w":296,"h":62},"titleSize":14,"subSize":10,"align":"left"},"16":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":27,"y":30,"size":84},"text":{"x":124,"y":42,"w":305,"h":62},"titleSize":14,"subSize":10,"align":"left"},"17":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":32,"y":46,"size":58},"text":{"x":96,"y":42,"w":198,"h":62},"titleSize":11,"subSize":8,"align":"left"},"18":{"mode":"circle","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":52,"y":26,"size":68},"text":{"x":122,"y":38,"w":206,"h":62},"titleSize":10,"subSize":7,"align":"left"},"19":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":38,"y":19,"size":72},"text":{"x":140,"y":33,"w":282,"h":62},"titleSize":12,"subSize":9,"align":"left"},"20":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":52,"y":48,"size":50},"text":{"x":104,"y":42,"w":208,"h":62},"titleSize":11,"subSize":8,"align":"left"},"21":{"mode":"icon","sw":1254,"sh":1254,"rw":452,"rh":124,"icon":{"x":20,"y":22,"w":90,"h":90},"banner":{"x":118,"y":38,"w":268,"h":58},"avatar":{"x":134,"y":47,"size":36},"text":{"x":176,"y":44,"w":186,"h":36},"titleSize":11,"subSize":7,"align":"left"},"22":{"mode":"plain","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":76,"y":45,"size":48},"text":{"x":128,"y":42,"w":280,"h":62},"titleSize":12,"subSize":9,"align":"left"},"23":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":70,"y":52,"size":44},"text":{"x":114,"y":42,"w":190,"h":62},"titleSize":10,"subSize":7,"align":"left"},"24":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":39,"y":34,"size":72},"text":{"x":116,"y":42,"w":308,"h":62},"titleSize":14,"subSize":10,"align":"left"},"25":{"mode":"plain","sw":2508,"sh":627,"rw":600,"rh":150,"avatar":{"x":130,"y":49,"size":46},"text":{"x":188,"y":45,"w":310,"h":54},"titleSize":12,"subSize":9,"align":"left"},"26":{"mode":"plain","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":84,"y":67,"size":44},"text":{"x":132,"y":58,"w":240,"h":54},"titleSize":12,"subSize":9,"align":"left"},"27":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":50,"y":29,"size":80},"text":{"x":152,"y":44,"w":272,"h":58},"titleSize":13,"subSize":10,"align":"left"},"28":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":75,"y":55,"size":42},"text":{"x":114,"y":42,"w":190,"h":62},"titleSize":10,"subSize":7,"align":"left"},"29":{"mode":"icon","sw":1254,"sh":1254,"rw":452,"rh":108,"icon":{"x":10,"y":16,"w":96,"h":96},"banner":{"x":118,"y":40,"w":268,"h":44},"avatar":{"x":140,"y":43,"size":34},"text":{"x":184,"y":41,"w":186,"h":30},"titleSize":9,"subSize":6,"align":"left"},"30":{"mode":"icon","sw":1254,"sh":1254,"rw":452,"rh":108,"icon":{"x":20,"y":18,"w":90,"h":90},"banner":{"x":118,"y":40,"w":268,"h":44},"avatar":{"x":140,"y":43,"size":34},"text":{"x":184,"y":41,"w":186,"h":30},"titleSize":9,"subSize":6,"align":"left"},"31":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":68,"y":58,"size":46},"text":{"x":118,"y":54,"w":198,"h":56},"titleSize":11,"subSize":8,"align":"left"},"32":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":57,"y":67,"size":40},"text":{"x":104,"y":70,"w":196,"h":48},"titleSize":10,"subSize":7,"align":"left"},"33":{"mode":"icon","sw":1254,"sh":1254,"rw":452,"rh":108,"icon":{"x":14,"y":18,"w":90,"h":90},"banner":{"x":118,"y":40,"w":268,"h":44},"avatar":{"x":140,"y":43,"size":30},"text":{"x":176,"y":41,"w":186,"h":30},"titleSize":9,"subSize":6,"align":"left"},"34":{"mode":"plain","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":66,"y":68,"size":40},"text":{"x":104,"y":58,"w":204,"h":52},"titleSize":11,"subSize":8,"align":"left","titleColor":"#fff2d8","subColor":"#f5d8e7"},"35":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":34,"y":40,"size":78},"text":{"x":132,"y":54,"w":294,"h":54},"titleSize":12,"subSize":9,"align":"left"},"36":{"mode":"icon","sw":1254,"sh":1254,"rw":452,"rh":108,"icon":{"x":20,"y":18,"w":90,"h":90},"banner":{"x":118,"y":40,"w":268,"h":44},"avatar":{"x":134,"y":43,"size":34},"text":{"x":172,"y":41,"w":186,"h":30},"titleSize":9,"subSize":6,"align":"left"},"37":{"mode":"icon","sw":1254,"sh":1254,"rw":452,"rh":108,"icon":{"x":20,"y":18,"w":90,"h":90},"banner":{"x":118,"y":40,"w":268,"h":44},"avatar":{"x":140,"y":43,"size":32},"text":{"x":176,"y":41,"w":186,"h":30},"titleSize":9,"subSize":6,"align":"left"},"38":{"mode":"plain","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":88,"y":66,"size":42},"text":{"x":134,"y":74,"w":276,"h":50},"titleSize":12,"subSize":9,"align":"left"},"39":{"mode":"plain","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":100,"y":54,"size":46},"text":{"x":142,"y":42,"w":288,"h":62},"titleSize":12,"subSize":8,"align":"left"},"40":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":39,"y":24,"size":80},"text":{"x":132,"y":42,"w":294,"h":62},"titleSize":14,"subSize":10,"align":"left"},"41":{"mode":"circle","sw":1916,"sh":821,"rw":350,"rh":150,"avatar":{"x":28,"y":24,"size":74},"text":{"x":120,"y":36,"w":216,"h":62},"titleSize":14,"subSize":10,"align":"left"},"42":{"mode":"circle","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":25,"y":36,"size":70},"text":{"x":119,"y":42,"w":315,"h":62},"titleSize":14,"subSize":10,"align":"left"},"43":{"mode":"plain","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":80,"y":51,"size":54},"text":{"x":142,"y":42,"w":280,"h":62},"titleSize":15,"subSize":11,"align":"left"},"44":{"mode":"plain","sw":2172,"sh":724,"rw":450,"rh":150,"avatar":{"x":82,"y":48,"size":46},"text":{"x":138,"y":42,"w":292,"h":62},"titleSize":14,"subSize":10,"align":"left"}};

  function choice(arr) {
    return Array.isArray(arr) && arr.length ? arr[Math.floor(Math.random() * arr.length)] : "";
  }

  async function loadJson(path, fallback) {
    try {
      if (location.protocol === "file:") return fallback;
      const r = await fetch(path, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch(e) {
      return fallback;
    }
  }

  function amountLevel(thresholds, amount) {
    amount = Number(amount || 0);
    for (const t of thresholds || []) {
      if (amount >= t.min && (t.max == null || amount <= t.max)) return Number(t.level || 0);
    }
    return 0;
  }

  function rankLevel(thresholds, rank) {
    rank = Number(rank || 999);
    for (const t of thresholds || []) {
      if (rank >= t.rankMin && rank <= t.rankMax) return Number(t.level || 0);
    }
    return 0;
  }

  function eventAmount(event) {
    return Number(event.amount || event.value || event.price || event.coin || event.total || 0);
  }

  function cleanEffectName(name) {
    return String(name || "spark").replace(/[^a-zA-Z0-9_-]/g, "") || "spark";
  }

  function rect(el, r) {
    if (!r) return;
    const host = el.closest ? el.closest(".dream-barrage-slide") : null;
    const s = host ? Number(host.dataset.scale || 1) : 1;
    if (r.x != null) el.style.left = Math.round(r.x * s) + "px";
    if (r.y != null) el.style.top = Math.round(r.y * s) + "px";
    if (r.w != null) el.style.width = Math.round(r.w * s) + "px";
    if (r.h != null) el.style.height = Math.round(r.h * s) + "px";
    if (r.size != null) {
      el.style.width = Math.round(r.size * s) + "px";
      el.style.height = Math.round(r.size * s) + "px";
    }
  }

  function fitOneLine(el, min) {
    let size = parseFloat(getComputedStyle(el).fontSize) || 13;
    while (size > min && el.scrollWidth > el.clientWidth) {
      size -= 1;
      el.style.fontSize = size + "px";
    }
  }

  function avatarNode(event) {
    const box = document.createElement("span");
    box.className = "dream-barrage-avatar";
    if (event.avatarUrl) {
      const img = document.createElement("img");
      img.src = event.avatarUrl;
      img.alt = "";
      box.appendChild(img);
    } else {
      box.textContent = String(event.avatarText || event.userName || "夢").trim().charAt(0) || "夢";
    }
    return box;
  }

  const DreamBarrage = {
    map: null,
    rules: null,
    layout: null,
    root: null,
    lane: null,
    basePath: DEFAULT_BASE,
    slotCounter: 0,

    nextTop(h) {
      const safeTop = 96;
      const gap = 16;
      const maxTop = Math.max(safeTop + 10, window.innerHeight - h - 120);
      const lanes = [safeTop, safeTop + h + gap, safeTop + (h + gap) * 2].filter(v => v < maxTop);
      const arr = lanes.length ? lanes : [safeTop];
      const top = arr[this.slotCounter % arr.length];
      this.slotCounter += 1;
      return top + "px";
    },

    async init(options = {}) {
      this.basePath = options.basePath || DEFAULT_BASE;
      this.map = options.map || await loadJson(this.basePath + "barrage_asset_map.json", LOCAL_ASSET_MAP);
      this.rules = options.rules || await loadJson(this.basePath + "barrage_rules_config.json", LOCAL_RULES);
      const loaded = await loadJson(this.basePath + "barrage_layout_v114.json", { layout: LOCAL_LAYOUT });
      this.layout = options.layout || loaded.layout || LOCAL_LAYOUT;

      if (this.root && document.body.contains(this.root)) return this;

      this.root = document.createElement("div");
      this.root.className = "dream-barrage-root";
      this.lane = document.createElement("div");
      this.lane.className = "dream-barrage-lane";
      this.root.appendChild(this.lane);
      document.body.appendChild(this.root);
      return this;
    },

    getGiftCategory(name = "") {
      if (["翠竹簫", "瑞鶴笛", "朝露琴"].includes(name)) return "music";
      if (["星河燈", "結夢燈"].includes(name)) return "lantern";
      if (["牡丹扇", "竹影扇"].includes(name)) return "fan";
      if (["如意結", "合歡簪", "流蘇結", "祥雲佩"].includes(name)) return "token";
      return "special";
    },

    level(event) {
      if (event.level) return Number(event.level);
      const t = (this.rules || LOCAL_RULES).thresholds || {};
      if (event.type === "ranking") return rankLevel(t.ranking, event.rank);
      return amountLevel(t[event.type], eventAmount(event));
    },

    frame(event, level) {
      if (event.framePath) return event.framePath;
      const m = this.map || LOCAL_ASSET_MAP;
      if (event.type === "gift") {
        const cat = event.giftType || this.getGiftCategory(event.giftName);
        return choice(m.gift && m.gift[cat]) || choice(m.common);
      }
      if (event.type === "order") return choice(m.order && m.order["lv" + Math.max(1, level)]) || choice(m.common);
      if (event.type === "recharge") return choice(m.recharge && m.recharge["lv" + Math.max(1, level)]) || choice(m.common);
      if (event.type === "ranking") {
        const r = Number(event.rank || 999);
        if (r === 1) return choice(m.ranking && m.ranking.rank_1) || choice(m.common);
        if (r === 2) return choice(m.ranking && m.ranking.rank_2) || choice(m.common);
        if (r === 3) return choice(m.ranking && m.ranking.rank_3) || choice(m.common);
        return choice(m.ranking && m.ranking.rank_4_10) || choice(m.common);
      }
      return choice(m.common);
    },

    title(event, level) {
      if (event.title) return event.title;
      const name = event.userName || "會員";
      const amount = Number(event.amount || 0).toLocaleString("zh-TW");
      if (event.type === "gift") return `【${level >= 4 ? "夢境獻禮" : level >= 3 ? "豪華送禮" : "送禮"}】${name} 送出 ${event.giftName || "禮物"}`;
      if (event.type === "order") return `【${level >= 3 ? "豪氣下單" : "下單"}】${name} 下單 ${amount} 短陌`;
      if (event.type === "recharge") return `【${level >= 3 ? "金光儲值" : "儲值"}】${name} 儲值 ${amount} 短陌`;
      if (event.type === "ranking") return `【${level >= 4 ? "榮耀加冕" : "排行提升"}】${name} 升上排行榜第 ${event.rank} 名`;
      return "系統彈幕";
    },

    sub(event, level) {
      return event.sub || (level >= 3 ? "夢競客棧・全服焦點" : "夢競客棧・即時動態");
    },

    effectType(event) {
      const rules = this.rules || LOCAL_RULES;
      const effects = rules.effects || {};
      if (event.type === "gift") {
        const cat = event.giftType || this.getGiftCategory(event.giftName);
        return cleanEffectName((effects.gift || {})[cat] || "festival");
      }
      return cleanEffectName(effects[event.type] || "spark");
    },

    dynamicLevel(event, level) {
      const rules = this.rules || LOCAL_RULES;
      const cfg = rules.dynamicEffects || {};
      const lv = Math.max(0, Number(level || 0));
      if (event.type === "ranking") {
        const rank = Number(event.rank || 999);
        const cutoff = Number(cfg.rankingNoEffectFromRank || 5);
        return rank >= cutoff ? 0 : lv;
      }
      return lv;
    },

    effectVariant(event, frameIndex, type) {
      if (event.effectVariant) return cleanEffectName(event.effectVariant);
      const maxByType = {
        petals: 4,
        stars: 4,
        notes: 4,
        redThread: 3,
        festival: 4,
        scroll: 3,
        gold: 3,
        crown: 3,
        spark: 3
      };
      const max = maxByType[type] || 3;
      const seed = Number(frameIndex || 0) + Number(event.rank || 0) + Math.floor(eventAmount(event) / 500);
      return "variant-" + (((seed % max) + max) % max + 1);
    },

    effectPlan(event, level, frameIndex) {
      const rules = this.rules || LOCAL_RULES;
      const cfg = rules.dynamicEffects || {};
      const display = rules.display || {};
      const lv = this.dynamicLevel(event, level);
      if (lv <= 0) {
        return { active: false, fullscreen: false, level: 0, particles: 0, type: "none", variant: "variant-0", borderCount: 0, fullscreenSymbols: 0 };
      }

      const counts = cfg.particleCountByLevel || [0, 8, 14, 22, 34];
      const borderCounts = cfg.borderOrbitCountByLevel || [0, 1, 2, 3, 4];
      const fullscreenCounts = cfg.fullscreenSymbolCountByLevel || [0, 0, 0, 16, 26];
      const maxParticles = window.innerWidth < 768
        ? Number(display.mobileMaxParticles || 20)
        : Number(display.desktopMaxParticles || 48);
      const maxFullscreenSymbols = window.innerWidth < 768 ? 18 : 30;
      const rank = Number(event.rank || 999);
      const fullscreenMin = Number(cfg.fullscreenMinLevel || 3);
      const fullscreen = lv >= fullscreenMin || (event.type === "ranking" && rank <= 3);
      const type = this.effectType(event);
      const variant = this.effectVariant(event, frameIndex, type);

      return {
        active: true,
        fullscreen,
        level: lv,
        borderCount: Math.min(4, Number(borderCounts[lv] || borderCounts[borderCounts.length - 1] || lv)),
        fullscreenSymbols: fullscreen ? Math.min(maxFullscreenSymbols, Number(fullscreenCounts[lv] || 16)) : 0,
        particles: Math.min(maxParticles, Number(counts[lv] || counts[counts.length - 1] || 12)),
        type,
        variant
      };
    },

    particleMarks(type) {
      const map = {
        petals: ["\u273f", "\u2740", "\u273d"],
        stars: ["\u2726", "\u2727", "\u2606"],
        notes: ["\u266a", "\u266b", "\u266c"],
        redThread: ["\u2571", "\u2572", "\u221e"],
        festival: ["\u2726", "\u273f", "\u25c6"],
        scroll: ["\u2727", "\u2501", "\u27f6"],
        gold: ["\u25c6", "\u2726", "\u2727"],
        crown: ["\u2655", "\u2726", "\u25c6"],
        spark: ["\u2726", "\u2727", "\u25c6"]
      };
      return map[type] || map.spark;
    },

    fullscreenMarks(plan) {
      const map = {
        petals: {
          "variant-1": ["\u2740", "\u273f", "\u273d"],
          "variant-2": ["\u273f", "\u2766", "\u2740"],
          "variant-3": ["\u273d", "\u2740", "\u2767"],
          "variant-4": ["\u2740", "\u2726", "\u273f"]
        },
        stars: {
          "variant-1": ["\u2726", "\u2727", "\u2606"],
          "variant-2": ["\u2727", "\u25c7", "\u2726"],
          "variant-3": ["\u2606", "\u2726", "\u22c6"],
          "variant-4": ["\u2726", "\u2737", "\u2727"]
        },
        notes: {
          "variant-1": ["\u266a", "\u266b", "\u266c"],
          "variant-2": ["\u266b", "\u2726", "\u266a"],
          "variant-3": ["\u266c", "\u266a", "\u2737"],
          "variant-4": ["\u266a", "\u266b", "\u2727"]
        },
        redThread: {
          "variant-1": ["\u2571", "\u2572", "\u221e"],
          "variant-2": ["\u221e", "\u2766", "\u2571"],
          "variant-3": ["\u2572", "\u2726", "\u221e"]
        },
        festival: {
          "variant-1": ["\u2726", "\u25c6", "\u273f"],
          "variant-2": ["\u2727", "\u25c7", "\u2726"],
          "variant-3": ["\u2737", "\u2726", "\u25c6"],
          "variant-4": ["\u2726", "\u273f", "\u2727"]
        },
        scroll: {
          "variant-1": ["\u27f6", "\u203a", "\u2501"],
          "variant-2": ["\u203a", "\u27f6", "\u2501"],
          "variant-3": ["\u2501", "\u27f6", "\u203a"]
        },
        gold: {
          "variant-1": ["\u25c6", "\u2726", "\u2727"],
          "variant-2": ["\u2726", "\u25c7", "\u2727"],
          "variant-3": ["\u25c6", "\u2737", "\u2726"]
        },
        crown: {
          "variant-1": ["\u2655", "\u2726", "\u25c6"],
          "variant-2": ["\u2726", "\u2655", "\u2727"],
          "variant-3": ["\u2655", "\u2737", "\u25c7"]
        }
      };
      const group = map[plan.type] || map.festival;
      return group[plan.variant] || group["variant-1"];
    },

    borderMarks(plan) {
      const map = {
        petals: ["\u2740", "\u273f", "\u273d", "\u2766"],
        stars: ["\u2726", "\u2727", "\u25cc", "\u2606"],
        notes: ["\u266a", "\u266b", "\u266c", "\u2726"],
        redThread: ["\u2571", "\u2572", "\u221e", "\u2766"],
        festival: ["\u25cc", "\u25c7", "\u2737", "\u2726"],
        scroll: ["\u27f6", "\u203a", "\u223f", "\u2501"],
        gold: ["\u25c6", "\u25ce", "\u25cb", "\u2726"],
        crown: ["\u2655", "\u2726", "\u25c6", "\u2737"],
        spark: ["\u2726", "\u2727", "\u25c7", "\u25cc"]
      };
      return map[plan.type] || map.spark;
    },

    addBorderEffects(plan, item) {
      if (!item || !plan.active || plan.borderCount <= 0) return;
      const overlay = item.querySelector(".dream-barrage-overlay");
      const marks = this.borderMarks(plan);
      const charmCount = Math.min(10, plan.level * 2 + plan.borderCount);
      for (let i = 0; i < charmCount; i++) {
        const charm = document.createElement("span");
        charm.className = "dream-barrage-border-charm effect-" + plan.type + " effect-level-" + plan.level + " charm-" + (i % 4 + 1) + " " + plan.variant;
        charm.textContent = marks[i % marks.length];
        charm.style.setProperty("--charm-delay", (-(i * 0.72)) + "s");
        charm.style.setProperty("--charm-speed", Math.max(5.4, 10.6 - plan.level * 0.55 + (i % 3) * 0.42) + "s");
        charm.style.setProperty("--charm-size", (10 + plan.level * 2 + (i % 3)) + "px");
        charm.style.setProperty("--charm-offset", (8 + (i % 3) * 4) + "px");
        item.insertBefore(charm, overlay || null);
      }
    },

    addCompanion(plan, item) {
      if (!item || plan.type !== "scroll" || plan.level < 3) return;
      const car = document.createElement("span");
      car.className = "dream-barrage-speed-companion effect-level-" + plan.level + " " + plan.variant;
      const tow = document.createElement("em");
      car.appendChild(tow);
      for (let i = 0; i < 2; i++) {
        const wheel = document.createElement("b");
        wheel.style.setProperty("--wheel-x", (i === 0 ? 22 : 68) + "px");
        car.appendChild(wheel);
      }
      for (let i = 0; i < 3; i++) {
        const line = document.createElement("i");
        line.style.setProperty("--line-delay", (i * 0.12) + "s");
        car.appendChild(line);
      }
      item.appendChild(car);
    },

    dynamicParticles(plan) {
      if (!this.root || !plan.active || plan.particles <= 0) return;
      const marks = this.particleMarks(plan.type);
      for (let i = 0; i < plan.particles; i++) {
        const p = document.createElement("span");
        p.className = "dream-barrage-particle effect-" + plan.type + " effect-level-" + plan.level;
        p.textContent = marks[Math.floor(Math.random() * marks.length)];
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = (4 + Math.random() * 30) + "vh";
        p.style.animationDuration = (4.8 + Math.random() * 4.8) + "s";
        p.style.animationDelay = (Math.random() * 1.1) + "s";
        p.style.setProperty("--drift", (-80 + Math.random() * 160) + "px");
        p.style.setProperty("--spin", (120 + Math.random() * 260) + "deg");
        this.root.appendChild(p);
        setTimeout(() => p.remove(), 11000);
      }
    },

    fullscreen(plan, seconds) {
      if (!this.root || !plan.fullscreen) return;
      const life = Math.max(2.4, Number(seconds || 8));
      const fx = document.createElement("div");
      fx.className = "dream-barrage-fullscreen-effect effect-" + plan.type + " effect-level-" + plan.level + " " + plan.variant;
      fx.style.setProperty("--fullscreen-duration", (life + 0.25) + "s");
      const waveCount = plan.level >= 4 ? 4 : 3;
      for (let i = 0; i < waveCount; i++) {
        const wave = document.createElement("span");
        wave.className = "dream-barrage-wave";
        wave.style.setProperty("--wave-delay", (i * Math.max(0.28, life / (waveCount + 2))) + "s");
        fx.appendChild(wave);
      }
      const marks = this.fullscreenMarks(plan);
      for (let i = 0; i < plan.fullscreenSymbols; i++) {
        const symbol = document.createElement("i");
        symbol.className = "dream-barrage-fullscreen-symbol effect-" + plan.type + " " + plan.variant;
        symbol.textContent = marks[Math.floor(Math.random() * marks.length)];
        symbol.style.setProperty("--symbol-x", (Math.random() * 100) + "vw");
        symbol.style.setProperty("--symbol-y", (-8 + Math.random() * 88) + "vh");
        symbol.style.setProperty("--symbol-drift", (-90 + Math.random() * 180) + "px");
        symbol.style.setProperty("--symbol-delay", (Math.random() * life * 0.74) + "s");
        symbol.style.setProperty("--symbol-duration", (Math.max(1.8, life * (0.28 + Math.random() * 0.26))) + "s");
        symbol.style.setProperty("--symbol-spin", (120 + Math.random() * 420) + "deg");
        fx.appendChild(symbol);
      }
      this.root.appendChild(fx);
      setTimeout(() => fx.remove(), life * 1000 + 700);
    },

    runEffects(plan, item, seconds) {
      if (!plan.active) return;
      if (item) {
        item.style.setProperty("--effect-strength", String(Math.max(1, plan.level)));
      }
      this.addBorderEffects(plan, item);
      this.addCompanion(plan, item);
      this.dynamicParticles(plan);
      this.fullscreen(plan, seconds);
    },

    particles(level) {
      if (!this.root) return;
      const count = level >= 4 ? 20 : 10;
      const marks = ["✦", "✧", "❀", "✿"];
      for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        p.className = "dream-barrage-particle";
        p.textContent = marks[Math.floor(Math.random() * marks.length)];
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = (4 + Math.random() * 22) + "vh";
        p.style.animationDuration = (5 + Math.random() * 5) + "s";
        p.style.animationDelay = (Math.random() * 1.2) + "s";
        p.style.setProperty("--drift", (-60 + Math.random() * 120) + "px");
        this.root.appendChild(p);
        setTimeout(() => p.remove(), 12000);
      }
    },

    async play(event) {
      if (!this.root) await this.init({ basePath: this.basePath || DEFAULT_BASE });

      const lv = Math.max(0, this.level(event));

      const frame = this.frame(event, lv);
      const idx = Number(event.previewIndex || FRAME_INDEX[frame] || 0);
      let cfg = (this.layout || LOCAL_LAYOUT)[String(idx)] || (this.layout || LOCAL_LAYOUT)[idx] || LOCAL_LAYOUT["3"];
      if (idx === 1) {
        cfg = {
          ...cfg,
          mode: "round",
          rw: 180,
          rh: 180,
          avatar: { x: 89, y: 42, size: 58 },
          text: { x: 62, y: 106, w: 108, h: 42 },
          titleSize: 10,
          subSize: 7,
          align: "center"
        };
      }
      const plan = this.effectPlan(event, lv, idx);
      const seconds = event.seconds || (((this.rules || LOCAL_RULES).display || {})["lv" + lv + "Seconds"] || 8);

      const maxW = Math.max(280, window.innerWidth * 0.94);
      const scale = Math.min(1, maxW / cfg.rw);
      const renderW = Math.round(cfg.rw * scale);
      const renderH = Math.round(cfg.rh * scale);

      const item = document.createElement("div");
      item.className = "dream-barrage-slide mode-" + cfg.mode + " idx-" + idx + " effect-" + plan.type + " effect-level-" + plan.level + " " + plan.variant + (plan.active ? " has-dynamic-effect" : " no-dynamic-effect") + (plan.fullscreen ? " has-fullscreen-effect" : "");
      item.style.width = renderW + "px";
      item.style.height = renderH + "px";
      item.style.setProperty("--duration", seconds + "s");
      item.style.setProperty("--travel", `calc(-100vw - ${renderW + 220}px)`);
      item.style.setProperty("--slide-top", this.nextTop(renderH));
      item.dataset.scale = String(scale);

      if (cfg.mode === "icon") {
        const banner = document.createElement("div");
        banner.className = "dream-barrage-generated-banner";
        rect(banner, cfg.banner);
        item.appendChild(banner);

        const icon = document.createElement("img");
        icon.className = "dream-barrage-side-icon";
        icon.src = frame;
        icon.alt = "";
        rect(icon, cfg.icon);
        item.appendChild(icon);
      } else {
        const img = document.createElement("img");
        img.className = "dream-barrage-frame";
        img.src = frame;
        img.alt = "";
        item.appendChild(img);
      }

      if (cfg.mode === "plain-white" && cfg.panel) {
        const panel = document.createElement("div");
        panel.className = "dream-barrage-white-panel";
        rect(panel, cfg.panel);
        item.appendChild(panel);
      }

      const overlay = document.createElement("div");
      overlay.className = "dream-barrage-overlay";

      const avatarSlot = document.createElement("div");
      avatarSlot.className = "dream-barrage-avatar-slot";
      rect(avatarSlot, cfg.avatar);
      avatarSlot.appendChild(avatarNode(event));

      const textSlot = document.createElement("div");
      textSlot.className = "dream-barrage-text-slot";
      rect(textSlot, cfg.text);
      if (cfg.align) textSlot.style.textAlign = cfg.align;
      if (cfg.titleColor) textSlot.style.setProperty("--title-color", cfg.titleColor);
      if (cfg.subColor) textSlot.style.setProperty("--sub-color", cfg.subColor);
      textSlot.style.setProperty("--title-size", Math.max(9, Math.round((cfg.titleSize || 13) * scale)) + "px");
      textSlot.style.setProperty("--sub-size", Math.max(7, Math.round((cfg.subSize || 9) * scale)) + "px");

      const title = document.createElement("div");
      title.className = "dream-barrage-title";
      title.textContent = this.title(event, lv);

      const sub = document.createElement("div");
      sub.className = "dream-barrage-sub";
      sub.textContent = this.sub(event, lv);

      textSlot.appendChild(title);
      textSlot.appendChild(sub);
      overlay.appendChild(avatarSlot);
      overlay.appendChild(textSlot);
      item.appendChild(overlay);
      this.lane.appendChild(item);

      fitOneLine(title, 9);
      fitOneLine(sub, 7);
      this.runEffects(plan, item, seconds);

      setTimeout(() => item.remove(), seconds * 1000 + 500);
      return true;
    },

    push(event) {
      return this.play(event);
    }
  };

  window.DreamBarrage = DreamBarrage;
  window.addEventListener("DOMContentLoaded", () => DreamBarrage.init().catch(() => {}));
})();
