/* v367-formal-front-functions-1778910571 formal shared inn client */
(function(){
  if (!window.DreamAPI) return;
  const api = window.DreamAPI.api;
  const state = { filter:"all", sort:"time", posts:[] };

  function toast(msg){
    try{ if(typeof window.toast === "function"){ window.toast(msg); return; } }catch(e){}
    let el = document.getElementById("v367InnToast");
    if(!el){
      el = document.createElement("div");
      el.id = "v367InnToast";
      el.style.cssText = "position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,360px);padding:12px 14px;border-radius:14px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.92);color:#fff1f6;text-align:center;font-size:13px;z-index:9999;box-shadow:0 14px 28px rgba(0,0,0,.4);opacity:0;transition:.2s";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(()=>el.style.opacity="0", 1800);
  }

  function esc(s){ return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function avatarText(name){ const s=String(name||"夢").trim(); return esc(s.slice(0,1)||"夢"); }
  function timeText(v){
    if(!v) return "";
    const d = new Date(v);
    if(Number.isNaN(d.getTime())) return esc(v);
    const p=n=>String(n).padStart(2,"0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function isInnPage(){ return location.hash==="#inn" || !!document.querySelector("#page-inn.active"); }

  function renderComments(post){
    const comments = Array.isArray(post.comments) ? post.comments : [];
    if(!comments.length) return "";
    return `<div class="inn-comments">${comments.map(c => `
      <div class="inn-comment"><b>${esc(c.author_name || "會員")}</b><span>${esc(c.comment_text || c.content || "")}</span></div>
    `).join("")}</div>`;
  }

  function renderPosts(){
    const list = document.getElementById("innPostList");
    const empty = document.getElementById("innEmptyState");
    if(!list) return;

    let posts = [...state.posts];
    if(state.filter === "favorites") posts = posts.filter(p=>!!p.is_favorited);
    if(state.filter === "following") posts = posts.filter(p=>!!p.is_following_author);
    if(state.sort === "likes") posts.sort((a,b)=>Number(b.like_count||0)-Number(a.like_count||0));
    else if(state.sort === "favorites") posts.sort((a,b)=>Number(b.favorite_count||0)-Number(a.favorite_count||0));
    else posts.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));

    if(!posts.length){
      list.innerHTML = "";
      if(empty){
        empty.style.display = "block";
        empty.textContent = state.filter === "favorites" ? "目前尚無收藏資料。" : state.filter === "following" ? "目前尚無關注動態。" : "目前尚無客棧動態。";
      }
      return;
    }
    if(empty) empty.style.display = "none";

    list.innerHTML = posts.map(post => {
      const id = String(post.id || post.post_id || "");
      const authorName = post.author_name || post.display_name || post.username || "夢競會員";
      const authorType = post.author_type || "member";
      const authorId = post.author_id || "";
      const image = post.image_url || post.post_image_url || "";
      return `
      <article class="panel post-card" data-post-id="${esc(id)}">
        <div class="post-head">
          <div class="post-avatar">${avatarText(authorName)}</div>
          <div>
            <div class="post-name">${esc(authorName)} <button type="button" data-v26-action="follow" data-target-type="${esc(authorType)}" data-target-id="${esc(authorId)}" style="margin-left:8px;border-radius:999px;padding:4px 8px;border:1px solid rgba(255,220,235,.28);background:rgba(255,255,255,.08);color:inherit">${post.is_following_author ? "已關注" : "關注"}</button></div>
            <div class="post-time">${timeText(post.created_at)}</div>
          </div>
        </div>
        <div class="post-text">${esc(post.content || "")}</div>
        ${image ? `<div class="post-image"><img src="${esc(image)}" alt="客棧圖片" loading="lazy" style="width:100%;border-radius:16px;display:block"></div>` : `<div class="post-image" style="display:none"></div>`}
        <div class="post-actions">
          <button type="button" data-v26-action="favorite" data-post-id="${esc(id)}">${post.is_favorited ? "★" : "☆"} 收藏 <span data-fav-count>${Number(post.favorite_count||0)}</span></button>
          <button type="button" data-v26-action="comment-open" data-post-id="${esc(id)}">留言 <span>${Number(post.comment_count||0)}</span></button>
          <button type="button" data-v26-action="like" data-post-id="${esc(id)}">${post.is_liked ? "♥" : "♡"} <span data-like-count>${Number(post.like_count||0)}</span></button>
        </div>
        ${renderComments(post)}
        <div style="display:flex;gap:8px;margin-top:10px">
          <input data-v26-comment-input="${esc(id)}" placeholder="留言不能空白" style="flex:1;border-radius:999px;padding:0 12px">
          <button class="btn" data-v26-action="comment" data-post-id="${esc(id)}" type="button">送出</button>
        </div>
      </article>`;
    }).join("");
  }

  async function loadInnPosts(){
    const list = document.getElementById("innPostList");
    if(list && !state.posts.length) list.innerHTML = "";
    try{
      const res = await api("inn_post_list", {limit:50});
      state.posts = res.posts || res.list || res.data || [];
    }catch(err){
      console.warn("[inn_post_list]", err.message || err);
      state.posts = [];
    }
    renderPosts();
  }

  async function uploadPostImage(file){
    const cfg = window.DREAM_CONFIG || {};
    const url = cfg.POST_IMAGE_UPLOAD_URL || cfg.SUPPORT_UPLOAD_URL;
    if(!url) throw new Error("尚未設定圖片上傳 API");
    if(file.size > 8 * 1024 * 1024) throw new Error("圖片請小於 8MB");
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(url, {method:"POST", credentials:"include", body:fd});
    const data = await res.json();
    if(!data.ok) throw new Error(data.message || "圖片上傳失敗");
    return data.image_url || data.url || data.path || "";
  }

  document.addEventListener("change", e=>{
    const fileInput = e.target.closest("[data-v26-input='inn-image']");
    if(!fileInput) return;
    const label = document.querySelector("[data-v26-image-name]");
    if(label) label.textContent = fileInput.files?.[0]?.name || "尚未選擇圖片";
  });

  document.addEventListener("click", async e=>{
    const filterBtn = e.target.closest("[data-inn-filter]");
    if(filterBtn){ state.filter = filterBtn.dataset.innFilter || "all"; document.querySelectorAll("[data-inn-filter]").forEach(b=>b.classList.toggle("active", b===filterBtn)); renderPosts(); return; }

    const sortBtn = e.target.closest("[data-inn-sort]");
    if(sortBtn){ state.sort = sortBtn.dataset.innSort || "time"; document.querySelectorAll("[data-inn-sort]").forEach(b=>b.classList.toggle("active", b===sortBtn)); renderPosts(); return; }

    const postBtn = e.target.closest("[data-v26-action='inn-post']");
    if(postBtn){
      const input = document.querySelector("[data-v26-input='inn-content']");
      const imageInput = document.querySelector("[data-v26-input='inn-image']");
      const content = (input?.value || "").trim();
      const file = imageInput?.files?.[0] || null;
      if(!content && !file){ toast("發文內容或圖片不能空白"); return; }
      try{
        postBtn.disabled = true; postBtn.textContent = "發布中...";
        const image_url = file ? await uploadPostImage(file) : "";
        await api("inn_post_create", {content: content || "分享了一張圖片", image_url, post_image_url:image_url});
        toast("發文成功");
        input.value = "";
        if(imageInput) imageInput.value = "";
        const label = document.querySelector("[data-v26-image-name]");
        if(label) label.textContent = "尚未選擇圖片";
        await loadInnPosts();
      }catch(err){ toast(err.message || "發文失敗"); }
      finally{ postBtn.disabled = false; postBtn.textContent = "＋ 發布文章"; }
      return;
    }

    const commentBtn = e.target.closest("[data-v26-action='comment']");
    if(commentBtn){
      const postId = commentBtn.dataset.postId;
      const input = document.querySelector(`[data-v26-comment-input='${CSS.escape(String(postId))}']`);
      const comment_text = (input?.value || "").trim();
      if(!comment_text){ toast("留言不能空白"); return; }
      try{ await api("inn_comment_create", {post_id:postId, comment_text}); toast("留言成功"); input.value = ""; await loadInnPosts(); }
      catch(err){ toast(err.message || "留言失敗"); }
      return;
    }

    const likeBtn = e.target.closest("[data-v26-action='like']");
    if(likeBtn){ try{ await api("inn_like_toggle", {post_id:likeBtn.dataset.postId}); await loadInnPosts(); }catch(err){ toast(err.message || "愛心更新失敗"); } return; }

    const favBtn = e.target.closest("[data-v26-action='favorite']");
    if(favBtn){ try{ await api("inn_favorite_toggle", {post_id:favBtn.dataset.postId}); await loadInnPosts(); }catch(err){ toast(err.message || "收藏更新失敗"); } return; }

    const followBtn = e.target.closest("[data-v26-action='follow']");
    if(followBtn){ try{ await api("follow_toggle", {target_type:followBtn.dataset.targetType, target_id:followBtn.dataset.targetId}); toast("已更新關注紀錄"); await loadInnPosts(); }catch(err){ toast(err.message || "關注更新失敗"); } return; }
  });

  window.addEventListener("hashchange", ()=>{ if(isInnPage()) setTimeout(loadInnPosts,80); });
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", ()=>setTimeout(loadInnPosts,120));
  else setTimeout(loadInnPosts,120);

  window.DreamInnFormalV367 = {load:loadInnPosts, render:renderPosts, state};
})();
