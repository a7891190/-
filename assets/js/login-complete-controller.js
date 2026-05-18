/* v388-profile-service-sync */
(function(){
  if(window.__dreamLoginCompleteControllerV384)return;window.__dreamLoginCompleteControllerV384=true;console.info("[DreamLogin v385] controller loaded");
  const API_BASE=()=>{try{return(window.DREAM_CONFIG&&window.DREAM_CONFIG.API_BASE)||"https://api.131rwjuh.com/api.php";}catch(e){return"https://api.131rwjuh.com/api.php";}};
  const $=(s,r=document)=>r.querySelector(s);const $all=(s,r=document)=>Array.from(r.querySelectorAll(s));let running=false;
  function toast(msg,sticky){let el=$("#dreamV384LoginToast");if(!el){el=document.createElement("div");el.id="dreamV384LoginToast";el.style.cssText="position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,390px);padding:12px 15px;border-radius:16px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.98);color:#fff;text-align:center;font-size:14px;font-weight:900;z-index:2147483647;box-shadow:0 14px 28px rgba(0,0,0,.45);opacity:1;transition:.2s";document.body.appendChild(el);}el.textContent=String(msg||"");el.style.opacity="1";clearTimeout(el._t);if(!sticky)el._t=setTimeout(()=>{el.style.opacity="0";},2400);}

  function hideLoginToastV385(){
    try{
      const ids = ["dreamV384LoginToast","dreamV383LoginToast","dreamV382LoginToast","dreamLoginToastV380","dreamLoginToastV381"];
      ids.forEach(id=>{
        const el = document.getElementById(id);
        if(el){
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          clearTimeout(el._t);
          setTimeout(()=>{ try{ el.remove(); }catch(e){} }, 260);
        }
      });
    }catch(e){}
  }

  function setLoading(btn,on){if(!btn)return;if(on){if(!btn.dataset.v384Text)btn.dataset.v384Text=btn.textContent||"登入";btn.textContent="正在登入中...";btn.disabled=true;btn.classList.add("is-loading");btn.style.pointerEvents="none";btn.style.opacity=".72";}else{btn.textContent=btn.dataset.v384Text||"登入";btn.disabled=false;btn.classList.remove("is-loading");btn.style.pointerEvents="";btn.style.opacity="";delete btn.dataset.v384Text;}}
  function role(){const active=document.querySelector("[data-login-tab].active");if(active&&active.dataset.loginTab==="companion")return"companion";try{const saved=localStorage.getItem("dream_login_type_preview")||localStorage.getItem("dream_login_preview_role");if(saved==="companion")return"companion";}catch(e){}return"member";}
  function setRole(r){r=r==="companion"?"companion":"member";$all("[data-login-tab]").forEach(btn=>{const a=btn.dataset.loginTab===r;btn.classList.toggle("active",a);btn.setAttribute("aria-selected",a?"true":"false");});try{localStorage.setItem("dream_login_type_preview",r);}catch(e){}document.body.dataset.loginType=r;}
  function inputs(){const u=$("#front_login_user")||$("#v44_login_user")||document.querySelector("#page-login input[autocomplete='username']")||document.querySelector("input[autocomplete='username']")||document.querySelector("#page-login input:not([type='password'])");const p=$("#front_login_pwd")||$("#v44_login_pwd")||document.querySelector("#page-login input[type='password']")||document.querySelector("input[type='password'][autocomplete='current-password']")||document.querySelector("input[type='password']");return{username:(u&&u.value||"").trim(),password:(p&&p.value||"")};}
  function go(page){try{if(typeof window.showPage==="function"){window.showPage(page);return;}}catch(e){}location.hash="#"+page;}
  async function post(action,payload){const c=new AbortController();const timer=setTimeout(()=>c.abort(),18000);try{const res=await fetch(API_BASE(),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({action},payload||{})),signal:c.signal});const text=await res.text();let data;try{data=JSON.parse(text||"{}");}catch(e){data={ok:false,status:res.status,message:"API 回傳格式錯誤："+text.slice(0,180)};}if(!res.ok&&data.ok!==true){data.ok=false;data.status=res.status;}return data;}catch(e){return{ok:false,message:e&&e.name==="AbortError"?"登入連線逾時，請稍後再試":(e.message||"登入連線失敗")};}finally{clearTimeout(timer);}}
  function persist(r,user){try{localStorage.setItem("dream_persist_login_type",r);localStorage.setItem("dream_login_keep","1");localStorage.setItem("dream_permanent_login","1");localStorage.setItem("dream_persist_user",JSON.stringify(user||{}));window.__dreamFrontAuth={type:r,user:user||null};document.body.classList.add("dream-authenticated");document.body.classList.remove("dream-guest");document.documentElement.classList.add("dream-authenticated");window.dispatchEvent(new CustomEvent("dream-auth-updated",{detail:{type:r,user:user||null}}));}catch(e){}}
  async function login(btn,ev){if(ev){try{ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();}catch(e){}}if(running)return false;btn=btn||$("#front_login_btn")||$("#v44_login_btn")||document.querySelector(".login-main-btn-v116");const data=inputs();const r=role();console.info("[DreamLogin v385] login triggered",{role:r,hasUsername:!!data.username,hasPassword:!!data.password,button:btn&&(btn.id||btn.className||btn.textContent)});if(!data.username||!data.password){toast("請輸入帳號與密碼");return false;}running=true;setLoading(btn,true);toast("正在登入中，請稍候...",true);const payload={username:data.username,password:data.password,account:data.username,email:data.username};const action=r==="companion"?"companion_login":"login";let res=await post(action,payload);if(r==="member"&&(!res||!res.ok)&&(res.status===400||res.status===404))res=await post("member_login",payload);window.DreamLoginDebug={version:"v385-login-toast-auto-hide",role:r,action,payload:{username:data.username,account:data.username,email:data.username},response:res};if(!res||!res.ok){running=false;setLoading(btn,false);toast((res&&(res.message||res.error))||"登入失敗");console.warn("[DreamLogin v385] login failed",res);return false;}const user=res.user||res.companion||res.data||{username:data.username,display_name:data.username};persist(r,user);toast(r==="companion"?"陪玩登入成功，正在前往陪玩中心...":"登入成功，正在前往會員中心...",true);console.info("[DreamLogin v385] login success",{role:r,user});setTimeout(()=>{running=false;setLoading(btn,false);go(r==="companion"?"companion-home":"member");setTimeout(hideLoginToastV385,650);},260);return false;}
  function mark(){const buttons=new Set();["#front_login_btn","#v44_login_btn",".login-main-btn-v116","[data-login-submit]","#page-login button"].forEach(sel=>$all(sel).forEach(btn=>{const txt=(btn.textContent||"").replace(/\s+/g,"");if(btn.id==="front_login_btn"||btn.id==="v44_login_btn"||txt==="登入"||txt.includes("登入"))buttons.add(btn);}));buttons.forEach(btn=>{btn.dataset.v384Bound="1";btn.title="v384 登入主控已接管";btn.onclick=function(ev){return login(btn,ev||window.event);};btn.onpointerdown=function(){btn.dataset.v384Pointer="1";};});}
  function bind(){console.info("[DreamLogin v385] bind scan start");setRole(role());mark();["pointerdown","mousedown","touchstart","click"].forEach(type=>{document.addEventListener(type,function(e){const tab=e.target.closest&&e.target.closest("[data-login-tab]");if(tab){setRole(tab.dataset.loginTab==="companion"?"companion":"member");return;}const btn=e.target.closest&&e.target.closest("#front_login_btn,#v44_login_btn,.login-main-btn-v116,[data-login-submit]");if(btn){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(type==="click"||type==="pointerdown")login(btn,e);return false;}},true);});document.addEventListener("keydown",function(e){if(e.key!=="Enter")return;const t=e.target;if(!t)return;const id=t.id||"";if(id==="front_login_user"||id==="front_login_pwd"||id==="v44_login_user"||id==="v44_login_pwd"){e.preventDefault();e.stopPropagation();login($("#front_login_btn")||$("#v44_login_btn")||document.querySelector(".login-main-btn-v116"),e);}},true);clearInterval(window.__dreamV384BindTimer);window.__dreamV384BindTimer=setInterval(mark,500);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();
  window.DreamLoginForceV384={login,bind,mark,setRole,getRole:role};
})();


/* v387：登入提示清理接口別名 */
window.DreamHideLoginToastV387 = window.DreamHideLoginToastV385 || function(){
  ["dreamV384LoginToast","dreamV383LoginToast","dreamV382LoginToast","dreamLoginToastV380","dreamLoginToastV381"].forEach(function(id){
    var el=document.getElementById(id);
    if(el){ el.style.opacity="0"; setTimeout(function(){try{el.remove();}catch(e){}},260); }
  });
};
