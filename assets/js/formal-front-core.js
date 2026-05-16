/* v368-one-shot-formal-1778913533 formal front core */
(function(){
  if(window.__dreamFormalCoreV368) return;
  window.__dreamFormalCoreV368 = true;
  window.DREAM_FORMAL_CORE_VERSION = "v368-one-shot-formal-1778913533";

  const API_BASE = () => {
    try{ return (window.DREAM_CONFIG && window.DREAM_CONFIG.API_BASE) || 'https://api.131rwjuh.com/api.php'; }catch(e){ return 'https://api.131rwjuh.com/api.php'; }
  };
  const RANK_CACHE_KEY = 'dream_front_rank_cache_v368';
  const RANK_TIME_KEY = 'dream_front_rank_cache_time_v368';
  const RANK_TTL = 5 * 60 * 1000;
  const DEMO_RE = /雲歌|浮光|夜笙|青衫|九璃|阿黎|阿梨|小白|蒼岑|夜璃|墨染|測試|假資料|Demo|DEMO|rank-showcase|OWNER_REWARDS|DEFAULT_COMMENTS|評分\s*4\./;

  function api(action, payload={}){
    return fetch(API_BASE(), {method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(Object.assign({action}, payload))})
      .then(async r=>{ const t=await r.text(); try{ return JSON.parse(t||'{}'); }catch(e){ return {ok:false,message:'API 回傳格式錯誤：'+t.slice(0,120),status:r.status}; } });
  }
  function toast(msg, sticky){
    let el=document.getElementById('formalToastV368');
    if(!el){ el=document.createElement('div'); el.id='formalToastV368'; el.style.cssText='position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:2147483647;max-width:88%;padding:12px 16px;border-radius:16px;background:rgba(72,28,50,.96);color:#fff;font-size:14px;font-weight:900;text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.38);'; document.body.appendChild(el); }
    el.textContent=msg; el.style.display='block'; clearTimeout(el._t); if(!sticky) el._t=setTimeout(()=>el.style.display='none',2200);
  }
  function hideToast(){ const el=document.getElementById('formalToastV368'); if(el) el.style.display='none'; }
  function currentPage(){ return (location.hash||'#home').replace(/^#/,'') || 'home'; }
  function goPage(page){ try{ if(typeof window.showPage==='function') window.showPage(page); else location.hash='#'+page; }catch(e){ location.hash='#'+page; } }

  // 全站返回：記錄點入口前的頁面，返回就回那裡。
  const originalShowPage = typeof window.showPage === 'function' ? window.showPage : null;
  if(originalShowPage && !window.__dreamHistoryWrappedV368){
    window.__dreamHistoryWrappedV368 = true;
    window.showPage = function(page){
      try{ const cur=currentPage(); if(page && page!==cur) sessionStorage.setItem('dream_prev_page_v368', cur); }catch(e){}
      return originalShowPage.apply(this, arguments);
    };
  }
  document.addEventListener('click', function(e){
    const nav = e.target.closest && e.target.closest('[data-go], [data-page-link], [data-open-page]');
    if(nav){ try{ sessionStorage.setItem('dream_prev_page_v368', currentPage()); }catch(_e){} }
    const back = e.target.closest && e.target.closest('.back-btn,[data-back],[data-action="back"]');
    if(back){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); goPage(sessionStorage.getItem('dream_prev_page_v368') || 'home'); return false; }
  }, true);

  // 登出處理中提示。
  async function logout(role){
    toast('正在登出，請稍候...', true);
    document.querySelectorAll('[data-v366-companion-logout],[data-v363-companion-logout],[data-v358-companion-logout],[data-v357-companion-logout],[data-action="logout"],[data-logout],.logout-btn').forEach(btn=>{ btn.dataset.oldText=btn.textContent||'登出'; btn.textContent='正在登出...'; btn.disabled=true; btn.style.pointerEvents='none'; btn.style.opacity='.72'; });
    const action = role === 'companion' ? 'companion_logout' : 'logout';
    try{ await api(action); }catch(e){}
    try{ ['dream_persist_user','dream_persist_login_type','dream_login_keep','dream_permanent_login'].forEach(k=>localStorage.removeItem(k)); }catch(e){}
    hideToast(); goPage('login');
  }
  document.addEventListener('click', function(e){
    const btn=e.target.closest && e.target.closest('[data-v366-companion-logout],[data-v363-companion-logout],[data-v358-companion-logout],[data-v357-companion-logout],[data-action="logout"],[data-logout],.logout-btn');
    if(!btn) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    let role='member'; try{ role=localStorage.getItem('dream_persist_login_type')||'member'; }catch(e){}
    logout(role); return false;
  }, true);

  // 清除所有殘留展示假資料，不只是隱藏客棧。
  function removeDemoNodes(){
    document.querySelectorAll('[data-demo-only],.demo-only,.fake-data,.mock-data,.inn-reward-showcase-post').forEach(el=>el.remove());
    document.querySelectorAll('.post-card,.inn-comment,.companion-card,.recommend-card,.row').forEach(el=>{ const txt=(el.textContent||'').replace(/\s+/g,' '); if(DEMO_RE.test(txt)) el.remove(); });
    const inn=document.getElementById('innPostList'), empty=document.getElementById('innEmptyState');
    if(inn && !inn.children.length && empty){ empty.style.display='block'; empty.textContent='目前尚無客棧動態。'; }
    const comp=document.getElementById('companionGrid');
    if(comp && !comp.querySelector('.companion-card') && !comp.querySelector('.companion-empty')) comp.innerHTML='<div class="companion-empty">目前尚無陪玩資料</div>';
  }

  // 排行榜 5 分鐘快取。
  async function getRanking(force){
    const now=Date.now();
    if(!force){ try{ const ts=Number(sessionStorage.getItem(RANK_TIME_KEY)||'0'); const raw=sessionStorage.getItem(RANK_CACHE_KEY); if(raw && ts && now-ts<RANK_TTL) return JSON.parse(raw); }catch(e){} }
    const data=await api('front_ranking_snapshot');
    if(data && data.ok){ try{ sessionStorage.setItem(RANK_CACHE_KEY, JSON.stringify(data)); sessionStorage.setItem(RANK_TIME_KEY, String(now)); }catch(e){} }
    return data;
  }
  function esc(s){ return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function styleRanks(){ if(document.getElementById('rankStyleV368'))return; const st=document.createElement('style'); st.id='rankStyleV368'; st.textContent='.rank-v368-wrap{display:grid;gap:10px;margin:10px 0}.rank-v368-card{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,220,235,.25);background:rgba(255,255,255,.06);border-radius:16px;padding:10px;color:inherit}.rank-v368-no{font-weight:900;min-width:38px;color:#ffd8ea}.rank-v368-av{width:38px;height:38px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(255,221,235,.16);border:1px solid rgba(255,221,235,.3);font-weight:900;overflow:hidden}.rank-v368-av img{width:100%;height:100%;object-fit:cover}.rank-v368-info{display:flex;flex-direction:column;gap:2px;min-width:0}.rank-v368-info b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rank-v368-info span{font-size:12px;opacity:.8}'; document.head.appendChild(st); }
  function itemHtml(x){ const name=x.display_name||x.name||x.username||x.companion_name||'未命名'; const score=x.score??x.total??x.completed_orders??x.order_count??x.exp??'目前在榜'; const rank=x.rank||x.no||''; const av=x.avatar_url||x.avatar||''; return `<div class="rank-v368-card"><div class="rank-v368-no">#${esc(rank)}</div><div class="rank-v368-av">${av?`<img src="${esc(av)}" alt="">`:esc(String(name).slice(0,1))}</div><div class="rank-v368-info"><b>${esc(name)}</b><span>${esc(score)}</span></div></div>`; }
  function rankItems(data){ let items=[]; if(data?.activity?.items) items=data.activity.items; if(!items.length && data?.vip?.ranking) items=data.vip.ranking; return Array.isArray(items)?items:[]; }
  function findSections(words){ const out=[]; document.querySelectorAll('section,.panel,.card,div').forEach(el=>{ const t=(el.textContent||'').replace(/\s+/g,''); if(words.some(w=>t.includes(w)) && el.offsetParent!==null) out.push(el); }); return out; }
  async function renderRankings(force){
    try{ const data=await getRanking(force); const items=rankItems(data); if(!items.length)return; styleRanks(); const top3=items.slice(0,3), rest=items.slice(3,13);
      findSections(['本期前三名','前三名']).slice(0,2).forEach(sec=>{ let box=sec.querySelector('[data-rank-v368-top3]'); if(!box){ box=document.createElement('div'); box.className='rank-v368-wrap'; box.setAttribute('data-rank-v368-top3','1'); sec.appendChild(box); } box.innerHTML=top3.map(itemHtml).join(''); });
      findSections(['後10名','後十名','排行榜']).slice(0,5).forEach(sec=>{ if(sec.querySelector('[data-rank-v368-top3]'))return; let box=sec.querySelector('[data-rank-v368-list]'); if(!box){ box=document.createElement('div'); box.className='rank-v368-wrap'; box.setAttribute('data-rank-v368-list','1'); sec.appendChild(box); } box.innerHTML=(rest.length?rest:items.slice(0,10)).map(itemHtml).join(''); });
    }catch(e){ console.warn('[front_ranking_snapshot]', e.message||e); }
  }

  // 陪玩登出按鈕跟重新整理一樣樣式。
  function fixCompanionLogoutStyle(){
    if(location.hash !== '#companion-home') return;
    const root=document.querySelector('#page-companion-home')||document.querySelector('[data-page="companion-home"]'); if(!root)return;
    const cards=Array.from(root.querySelectorAll('button,a,.service-card,.feature-card,.menu-card,[role="button"],.card,.item'));
    const refresh=cards.find(el=>/重新整理|刷新/.test((el.textContent||'').replace(/\s+/g,''))); if(!refresh || !refresh.parentElement)return;
    root.querySelectorAll('[data-v366-companion-logout],[data-v363-companion-logout],[data-v358-companion-logout],[data-v357-companion-logout]').forEach(x=>x.remove());
    const clone=refresh.cloneNode(true); clone.setAttribute('data-v366-companion-logout','1'); clone.setAttribute('aria-label','登出');
    const nodes=Array.from(clone.querySelectorAll('*')).filter(el=>(el.textContent||'').trim()); let icon=false,label=false;
    nodes.forEach(el=>{ const t=(el.textContent||'').replace(/\s+/g,''); if(!icon && (t==='整'||t==='刷'||t.length<=2)){el.textContent='出'; icon=true; return;} if(!label && /重新整理|刷新/.test(t)){el.textContent='登出'; label=true;} });
    if(!label) clone.innerHTML='<div>出</div><div>登出</div>';
    refresh.parentElement.insertBefore(clone, refresh.nextSibling);
  }

  function boot(){ removeDemoNodes(); renderRankings(false); fixCompanionLogoutStyle(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,100)); else setTimeout(boot,100);
  window.addEventListener('hashchange',()=>setTimeout(boot,120));
  const mo=new MutationObserver(()=>{ clearTimeout(boot._t); boot._t=setTimeout(removeDemoNodes,160); }); if(document.documentElement)mo.observe(document.documentElement,{childList:true,subtree:true});
  window.DreamFormalCoreV368={removeDemoNodes,renderRankings,fixCompanionLogoutStyle};
})();
