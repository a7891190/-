/* v377-home-render-isolation：首頁渲染隔離，避免陪玩資料塞到首頁 */
(function(){
  if(window.__dreamHomeRenderIsolationV377) return;
  window.__dreamHomeRenderIsolationV377 = true;
  function currentPage(){ return (location.hash || '#home').replace(/^#/,'') || 'home'; }
  function isHome(){ return currentPage()==='home' || currentPage()===''; }
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function markScopes(){
    document.querySelectorAll("section[id^='page-']").forEach(sec=>sec.setAttribute('data-page-scope', sec.id.replace(/^page-/,'')));
  }
  function cleanHomeWrongCompanions(){
    const home=document.querySelector('#page-home');
    if(!home) return;
    home.querySelectorAll('#companionGrid,[data-list="companions"]').forEach(el=>{ if(!el.closest('#page-companion')) el.remove(); });
    home.querySelectorAll('.companion-card,[data-companion-id],[data-role="companion-card"]').forEach(el=>{
      if(!el.closest('[data-home-ranking],.rank-scroll,[data-rank-scroll],.top3-stage,.top3-board')) el.remove();
    });
    home.querySelectorAll('.v367-rank-card,.dream-clean-rank-card,[data-v367-rank-card]').forEach(el=>{
      if(!el.closest('[data-home-ranking],.rank-scroll,[data-rank-scroll],.top3-stage,.top3-board,.dream-home-ranking-slot')) el.remove();
    });
  }
  function ensureStyle(){
    if(document.getElementById('dreamHomeIsolationStyleV377')) return;
    const style=document.createElement('style'); style.id='dreamHomeIsolationStyleV377';
    style.textContent='.dream-home-ranking-slot{display:grid;gap:10px;margin:10px 0}.dream-home-rank-card{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,220,235,.25);background:rgba(255,255,255,.06);border-radius:16px;padding:10px;color:inherit}.dream-home-rank-no{font-weight:900;min-width:38px;color:#ffd8ea}.dream-home-rank-avatar{width:38px;height:38px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(255,221,235,.16);border:1px solid rgba(255,221,235,.3);font-weight:900;overflow:hidden}.dream-home-rank-avatar img{width:100%;height:100%;object-fit:cover}.dream-home-rank-info{display:flex;flex-direction:column;gap:2px;min-width:0}.dream-home-rank-info b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dream-home-rank-info span{font-size:12px;opacity:.8}';
    document.head.appendChild(style);
  }
  function findHomeRankingSlot(kind){
    const home=document.querySelector('#page-home'); if(!home) return null;
    let slot=home.querySelector(kind==='top3' ? '[data-home-ranking="top3"]' : '[data-home-ranking="list"]');
    if(slot) return slot;
    const words=kind==='top3' ? ['本期前三名','前三名'] : ['後10名','後十名','排行榜'];
    const candidates=Array.from(home.querySelectorAll('section,.panel,.card,div')).filter(el=>{
      const t=(el.textContent||'').replace(/\s+/g,'');
      return words.some(w=>t.includes(w)) && !el.closest('#page-companion,#page-inn,#page-market');
    }).sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
    const host=candidates.find(el=>el!==home) || home;
    slot=document.createElement('div'); slot.className='dream-home-ranking-slot'; slot.setAttribute('data-home-ranking', kind==='top3'?'top3':'list');
    host.appendChild(slot); return slot;
  }
  function normalize(data){
    let items=[];
    if(data && data.activity && Array.isArray(data.activity.items)) items=data.activity.items;
    if(!items.length && data && data.vip && Array.isArray(data.vip.ranking)) items=data.vip.ranking;
    if(!items.length && data && Array.isArray(data.ranking)) items=data.ranking;
    return items.map((x,i)=>({rank:Number(x.rank||x.no||i+1),name:x.display_name||x.name||x.username||x.companion_name||'未命名',score:x.score??x.total??x.completed_orders??x.order_count??x.exp??'',avatar:x.avatar_url||''}));
  }
  function card(x){
    const avatar=x.avatar?`<img src="${esc(x.avatar)}" alt="">`:esc(String(x.name||'夢').slice(0,1));
    return `<div class="dream-home-rank-card" data-home-rank-item="1"><div class="dream-home-rank-no">#${x.rank}</div><div class="dream-home-rank-avatar">${avatar}</div><div class="dream-home-rank-info"><b>${esc(x.name)}</b><span>${x.score!==''?esc(x.score):'目前在榜'}</span></div></div>`;
  }
  function renderHomeRanking(data){
    if(!isHome()) return;
    const items=normalize(data); if(!items.length) return;
    ensureStyle(); cleanHomeWrongCompanions();
    const top=findHomeRankingSlot('top3'); const list=findHomeRankingSlot('list');
    if(top) top.innerHTML=items.slice(0,3).map(card).join('');
    if(list) list.innerHTML=(items.slice(3,13).length?items.slice(3,13):items.slice(0,10)).map(card).join('');
  }
  async function loadHomeRanking(){
    if(!isHome()) return;
    try{
      const api=window.DreamStableFetchV377 || window.DreamStableFetchV376;
      if(!api) return;
      renderHomeRanking(await api('front_ranking_snapshot',{}));
    }catch(e){ console.warn('[home ranking isolated]', e.message||e); }
  }
  const originalAppend=Element.prototype.appendChild;
  Element.prototype.appendChild=function(child){
    try{
      if(child && child.nodeType===1 && isHome()){
        const isOldRank=child.matches && (child.matches('[data-v367-top3],[data-v367-rank-list],[data-clean-top3],[data-clean-rank-list]') || child.classList.contains('v367-rank-wrap') || child.classList.contains('dream-clean-rank-wrap'));
        if(isOldRank && this.id==='page-home'){
          const slot=findHomeRankingSlot('list'); if(slot) return originalAppend.call(slot, child);
        }
      }
    }catch(e){}
    return originalAppend.call(this, child);
  };
  function boot(){ markScopes(); cleanHomeWrongCompanions(); loadHomeRanking(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,120)); else setTimeout(boot,120);
  window.addEventListener('hashchange',()=>setTimeout(boot,120));
  const mo=new MutationObserver(()=>{ clearTimeout(boot._t); boot._t=setTimeout(()=>{ markScopes(); cleanHomeWrongCompanions(); },120); });
  if(document.documentElement) mo.observe(document.documentElement,{childList:true,subtree:true});
  window.DreamHomeRenderIsolationV377={boot,cleanHomeWrongCompanions,loadHomeRanking,renderHomeRanking};
})();
