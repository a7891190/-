(function(){
  if (!window.DreamAPI) return;
  const api = window.DreamAPI.api;

  function toast(msg){
    let el = document.getElementById("v26Toast");
    if(!el){
      el = document.createElement("div");
      el.id = "v26Toast";
      el.style.cssText = "position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,360px);padding:12px 14px;border-radius:14px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.92);color:#fff1f6;text-align:center;font-size:13px;z-index:9999;box-shadow:0 14px 28px rgba(0,0,0,.4);opacity:0;transition:.2s";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(()=>el.style.opacity="0", 1800);
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

  document.addEventListener("change", (e)=>{
    const fileInput = e.target.closest("[data-v26-input='inn-image']");
    if(!fileInput) return;
    const name = fileInput.files?.[0]?.name || "尚未選擇圖片";
    const label = document.querySelector("[data-v26-image-name]");
    if(label) label.textContent = name;
  });

  document.addEventListener("click", async (e)=>{
    const postBtn = e.target.closest("[data-v26-action='inn-post']");
    if(postBtn){
      const input = document.querySelector("[data-v26-input='inn-content']");
      const imageInput = document.querySelector("[data-v26-input='inn-image']");
      const content = (input?.value || "").trim();
      const file = imageInput?.files?.[0] || null;
      if(!content && !file){ toast("發文內容或圖片不能空白"); return; }
      try{
        postBtn.disabled = true;
        postBtn.textContent = "發布中...";
        const image_url = file ? await uploadPostImage(file) : "";
        await api("inn_post_create", {content: content || "分享了一張圖片", image_url, post_image_url:image_url});
        toast("發文成功");
        input.value = "";
        if(imageInput) imageInput.value = "";
        const label = document.querySelector("[data-v26-image-name]");
        if(label) label.textContent = "尚未選擇圖片";
      }catch(err){ toast(err.message); }
      finally{
        postBtn.disabled = false;
        postBtn.textContent = "＋ 發布文章";
      }
    }

    const commentBtn = e.target.closest("[data-v26-action='comment']");
    if(commentBtn){
      const postId = commentBtn.dataset.postId;
      const input = document.querySelector(`[data-v26-comment-input='${postId}']`);
      const comment_text = (input?.value || "").trim();
      if(!comment_text){ toast("留言不能空白"); return; }
      try{
        await api("inn_comment_create", {post_id:postId, comment_text});
        toast("留言成功");
        input.value = "";
      }catch(err){ toast(err.message); }
    }

    const likeBtn = e.target.closest("[data-v26-action='like']");
    if(likeBtn){
      try{ await api("inn_like_toggle", {post_id:likeBtn.dataset.postId}); toast("已更新愛心"); }
      catch(err){ toast(err.message); }
    }

    const favBtn = e.target.closest("[data-v26-action='favorite']");
    if(favBtn){
      try{ await api("inn_favorite_toggle", {post_id:favBtn.dataset.postId}); toast("已更新收藏"); }
      catch(err){ toast(err.message); }
    }

    const followBtn = e.target.closest("[data-v26-action='follow']");
    if(followBtn){
      try{
        await api("follow_toggle", {target_type:followBtn.dataset.targetType, target_id:followBtn.dataset.targetId});
        toast("已更新關注紀錄");
      }catch(err){ toast(err.message); }
    }

    const cartBtn = e.target.closest("[data-cart-id]");
    if(cartBtn && cartBtn.dataset.cartId){
      try{ await api("cart_add", {shop_item_id:cartBtn.dataset.cartId}); toast("已加入購物車"); }
      catch(err){ toast(err.message); }
    }

    const renewBtn = e.target.closest("[data-v26-action='renew-code']");
    if(renewBtn){
      const username = document.querySelector("[data-v26-input='renew-username']")?.value.trim() || "";
      const code = document.querySelector("[data-v26-input='renew-code']")?.value.trim() || "";
      if(!username || !code){ toast("請輸入帳號與會員碼"); return; }
      try{
        const res = await api("member_renew_by_code", {username, code});
        toast(res.message || "續期成功");
      }catch(err){ toast(err.message); }
    }

    const checkinBtn = e.target.closest("[data-v26-action='checkin']");
    if(checkinBtn){
      try{ const res = await api("checkin_today"); toast(res.message || "簽到成功"); }
      catch(err){ toast(err.message); }
    }
  });
})();
