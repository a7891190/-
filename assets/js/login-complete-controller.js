/* v381-architecture-complete：會員/陪玩登入唯一主控 */
(function(){
  if(window.__dreamLoginCompleteControllerV381) return;
  window.__dreamLoginCompleteControllerV381 = true;

  const API_BASE=()=>{try{return (window.DREAM_CONFIG&&window.DREAM_CONFIG.API_BASE)||"https://api.131rwjuh.com/api.php";}catch(e){return "https://api.131rwjuh.com/api.php";}};
  let loginType="member";
  let isLoggingIn=false;
  const $=(s,r=document)=>r.querySelector(s);
  const $all=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function toast(msg,sticky){
    let el=$("#dreamLoginToastV381");
    if(!el){
      el=document.createElement("div");
      el.id="dreamLoginToastV381";
      el.style.cssText="position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,360px);padding:12px 14px;border-radius:14px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.96);color:#fff;text-align:center;font-size:14px;font-weight:900;z-index:2147483647;box-shadow:0 14px 28px rgba(0,0,0,.4);opacity:1;transition:.2s";
      document.body.appendChild(el);
    }
    el.textContent=String(msg||""); el.style.opacity="1"; clearTimeout(el._t); if(!sticky) el._t=setTimeout(()=>el.style.opacity="0",2200);
  }
  function setLoading(btn,on){
    if(!btn) return;
    if(on){
      if(!btn.dataset.oldText) btn.dataset.oldText=btn.textContent||"登入";
      btn.textContent="正在登入中...";
      btn.disabled=true; btn.classList.add("is-loading"); btn.style.pointerEvents="none"; btn.style.opacity=".72";
    }else{
      btn.textContent=btn.dataset.oldText||"登入";
      btn.disabled=false; btn.classList.remove("is-loading"); btn.style.pointerEvents=""; btn.style.opacity=""; delete btn.dataset.oldText;
    }
  }
  function getType(){
    const active=document.querySelector("[data-login-tab].active");
    if(active && active.dataset.loginTab) return active.dataset.loginTab==="companion" ? "companion" : "member";
    return loginType;
  }
  function setType(type){
    loginType=type==="companion"?"companion":"member";
    $all("[data-login-tab]").forEach(btn=>{const a=btn.dataset.loginTab===loginType; btn.classList.toggle("active",a); btn.setAttribute("aria-selected",a?"true":"false");});
    try{localStorage.setItem("dream_login_type_preview",loginType);}catch(e){}
    document.body.dataset.loginType=loginType;
  }
  function go(page){
    try{if(typeof window.showPage==="function"){window.showPage(page); return;}}catch(e){}
    location.hash="#"+page;
  }
  async function api(action,payload){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),18000);
    try{
      const res=await fetch(API_BASE(),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({action},payload||{})),signal:controller.signal});
      const text=await res.text();
      let data;
      try{data=JSON.parse(text||"{}");}catch(e){data={ok:false,message:"API 回傳格式錯誤："+text.slice(0,120),status:res.status};}
      if(!res.ok && data.ok!==true){data.ok=false; data.status=res.status;}
      return data;
    }catch(e){
      if(e && e.name==="AbortError") return {ok:false,message:"登入連線逾時，請稍後再試"};
      return {ok:false,message:e.message||"登入連線失敗"};
    }finally{clearTimeout(timer);}
  }
  function persist(role,user){
    try{
      localStorage.setItem("dream_persist_login_type",role);
      localStorage.setItem("dream_login_keep","1");
      localStorage.setItem("dream_permanent_login","1");
      localStorage.setItem("dream_persist_user",JSON.stringify(user||{}));
      window.__dreamFrontAuth={type:role,user:user||null};
      document.body.classList.add("dream-authenticated");
      document.body.classList.remove("dream-guest");
      document.documentElement.classList.add("dream-authenticated");
      window.dispatchEvent(new CustomEvent("dream-auth-updated",{detail:{type:role,user}}));
    }catch(e){}
  }
  async function login(btn){
    if(isLoggingIn) return;
    const username=($("#front_login_user")?.value || $("#v44_login_user")?.value || "").trim();
    const password=$("#front_login_pwd")?.value || $("#v44_login_pwd")?.value || "";
    const role=getType();

    if(!username || !password){toast("請輸入帳號與密碼"); return;}

    isLoggingIn=true;
    btn=btn || $("#front_login_btn") || $("#v44_login_btn");
    setLoading(btn,true);
    toast("正在登入中，請稍候...",true);

    const payload={username,password,account:username,email:username};
    let action=role==="companion" ? "companion_login" : "login";
    let res=await api(action,payload);
    if(role==="member" && (!res || !res.ok) && res.status===400) res=await api("member_login",payload);

    window.DreamLoginDebug={action,role,payload:{username,account:username,email:username},response:res};

    if(!res || !res.ok){
      setLoading(btn,false); isLoggingIn=false;
      toast((res&&(res.message||res.error))||"登入失敗");
      return;
    }

    const user=res.user || res.companion || res.data || {username,display_name:username};
    persist(role,user);
    toast(role==="companion" ? "陪玩登入成功，正在前往陪玩中心..." : "登入成功，正在前往會員中心...",true);
    setTimeout(()=>{setLoading(btn,false); isLoggingIn=false; go(role==="companion"?"companion-home":"member");},260);
  }

  function wire(){
    setType(getType());
    document.addEventListener("click",function(e){
      const tab=e.target.closest&&e.target.closest("[data-login-tab]");
      if(tab){setType(tab.dataset.loginTab==="companion"?"companion":"member"); return;}
      const btn=e.target.closest&&e.target.closest("#front_login_btn,#v44_login_btn,[data-login-submit],.login-main-btn-v116");
      if(btn){e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); login(btn); return false;}
    },true);
    ["front_login_user","front_login_pwd","v44_login_user","v44_login_pwd"].forEach(id=>{
      const el=document.getElementById(id);
      if(el && !el.dataset.v381Enter){el.dataset.v381Enter="1"; el.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault(); login($("#front_login_btn")||$("#v44_login_btn"));}},true);}
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",wire);
  else wire();
  window.DreamLoginCompleteV381={login,setType,getType};
})();
