/* v426-profile-avatar-grid-sync */
(function(){
  if(window.__dreamLoginCompleteController)return;window.__dreamLoginCompleteController=true;
  const API_BASE=()=>{try{return(window.DREAM_CONFIG&&window.DREAM_CONFIG.API_BASE)||"https://api.131rwjuh.com/api.php";}catch(e){return"https://api.131rwjuh.com/api.php";}};
  const $=(s,r=document)=>r.querySelector(s);const $all=(s,r=document)=>Array.from(r.querySelectorAll(s));let running=false;
  function toast(msg,sticky){let el=$("#dreamLoginToast");if(!el){el=document.createElement("div");el.id="dreamLoginToast";el.style.cssText="position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(88%,390px);padding:12px 15px;border-radius:16px;border:1px solid rgba(255,221,190,.42);background:rgba(72,28,50,.98);color:#fff;text-align:center;font-size:14px;font-weight:900;z-index:2147483647;box-shadow:0 14px 28px rgba(0,0,0,.45);opacity:1;transition:.2s;pointer-events:none";document.body.appendChild(el);}el.textContent=String(msg||"");el.style.opacity="1";clearTimeout(el._t);if(!sticky)el._t=setTimeout(()=>{el.style.opacity="0";},2400);}

  function hideLoginToast(){
    try{
      const ids = ["dreamLoginToast","dreamLegacyLoginToast","dreamLegacyLoginToast2","dreamLegacyLoginToast3","dreamLegacyLoginToast4"];
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

  function setLoading(btn,on){if(!btn)return;if(on){if(!btn.dataset.loginText)btn.dataset.loginText=btn.textContent||"登入";btn.textContent="正在登入中...";btn.disabled=true;btn.classList.add("is-loading");btn.style.pointerEvents="none";btn.style.opacity=".72";}else{btn.textContent=btn.dataset.loginText||"登入";btn.disabled=false;btn.classList.remove("is-loading");btn.style.pointerEvents="";btn.style.opacity="";delete btn.dataset.loginText;}}
  function role(){const active=document.querySelector("[data-login-tab].active");if(active&&active.dataset.loginTab==="companion")return"companion";try{const saved=localStorage.getItem("dream_login_type_preview")||localStorage.getItem("dream_login_preview_role");if(saved==="companion")return"companion";}catch(e){}return"member";}
  function setRole(r){r=r==="companion"?"companion":"member";$all("[data-login-tab]").forEach(btn=>{const a=btn.dataset.loginTab===r;btn.classList.toggle("active",a);btn.setAttribute("aria-selected",a?"true":"false");});try{localStorage.setItem("dream_login_type_preview",r);}catch(e){}document.body.dataset.loginType=r;}
  function inputs(){const u=$("#front_login_user")||$("#v44_login_user")||document.querySelector("#page-login input[autocomplete='username']")||document.querySelector("input[autocomplete='username']")||document.querySelector("#page-login input:not([type='password'])");const p=$("#front_login_pwd")||$("#v44_login_pwd")||document.querySelector("#page-login input[type='password']")||document.querySelector("input[type='password'][autocomplete='current-password']")||document.querySelector("input[type='password']");return{username:(u&&u.value||"").trim(),password:(p&&p.value||"")};}
  function go(page){try{if(typeof window.showPage==="function"){window.showPage(page);return;}}catch(e){}location.hash="#"+page;}
  async function post(action,payload){const c=new AbortController();const timer=setTimeout(()=>c.abort(),90000);try{const res=await fetch(API_BASE(),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({action},payload||{})),signal:c.signal});const text=await res.text();let data;try{data=JSON.parse(text||"{}");}catch(e){data={ok:false,status:res.status,message:"API 回傳格式錯誤："+text.slice(0,180)};}if(!res.ok&&data.ok!==true){data.ok=false;data.status=res.status;}return data;}catch(e){return{ok:false,message:e&&e.name==="AbortError"?"登入連線逾時，請稍後再試":(e.message||"登入連線失敗，請稍後再試")};}finally{clearTimeout(timer);}}
  function persist(r,user){try{localStorage.setItem("dream_persist_login_type",r);localStorage.setItem("dream_login_keep","1");localStorage.setItem("dream_permanent_login","1");localStorage.setItem("dream_persist_user",JSON.stringify(user||{}));window.__dreamFrontAuth={type:r,user:user||null};window.__dreamServerSessionReady=true;try{window.dreamRefreshCsrfToken&&window.dreamRefreshCsrfToken();}catch(_){}document.body.classList.add("dream-authenticated");document.body.classList.remove("dream-guest");document.documentElement.classList.add("dream-authenticated");window.dispatchEvent(new CustomEvent("dream-auth-updated",{detail:{type:r,user:user||null}}));}catch(e){}}
  async function login(btn,ev){if(ev)cancelEvent(ev,true);if(running)return false;btn=btn||$("#front_login_btn")||$("#v44_login_btn")||document.querySelector(".login-main-btn-v116");const data=inputs();const r=role();if(window.DREAM_API_DEBUG) console.info("[DreamLogin v426] login triggered",{role:r,hasUsername:!!data.username,hasPassword:!!data.password,button:btn&&(btn.id||btn.className||btn.textContent)});if(!data.username||!data.password){toast("請輸入帳號與密碼");return false;}running=true;window.__dreamLoginInProgress=true;setLoading(btn,true);toast("正在登入中，請稍候...",true);const payload={username:data.username,password:data.password,account:data.username,email:data.username};const action=r==="companion"?"companion_login":"login";let res=await post(action,payload);if(r==="member"&&(!res||!res.ok)&&(res.status===400||res.status===404))res=await post("member_login",payload);window.DreamLoginDebug={version:"v426-profile-avatar-grid-sync",role:r,action,payload:{username:data.username,account:data.username,email:data.username},response:res};if(!res||!res.ok){running=false;window.__dreamLoginInProgress=false;setLoading(btn,false);toast((res&&(res.message||res.error))||"登入失敗");if(window.DREAM_API_DEBUG) console.warn("[DreamLogin v426] login failed",res);return false;}const user=res.user||res.companion||res.data||{username:data.username,display_name:data.username};if(res.login_reward&&res.login_reward.granted&&user&&(user.limited_coin===undefined||user.limited_coin===null)){user.limited_coin=Number(res.login_reward.amount||0);}persist(r,user);toast(res.login_reward&&res.login_reward.granted?("本次大更新限時短陌已發放："+Number(res.login_reward.amount||0)):(r==="companion"?"陪玩登入成功，正在前往陪玩中心...":"登入成功，正在前往會員中心..."),true);if(window.DREAM_API_DEBUG) console.info("[DreamLogin v426] login success",{role:r,user});setTimeout(()=>{running=false;window.__dreamLoginInProgress=false;setLoading(btn,false);go(r==="companion"?"companion-home":"member");setTimeout(hideLoginToast,650);},260);return false;}
  function mark(){const buttons=new Set();["#front_login_btn","#v44_login_btn",".login-main-btn-v116","[data-login-submit]","#page-login button"].forEach(sel=>$all(sel).forEach(btn=>{const txt=(btn.textContent||"").replace(/\s+/g,"");if(btn.id==="front_login_btn"||btn.id==="v44_login_btn"||txt==="登入"||txt.includes("登入"))buttons.add(btn);}));buttons.forEach(btn=>{btn.dataset.loginBound="1";btn.title="登入主控已接管";btn.onclick=function(ev){return login(btn,ev||window.event);};btn.onpointerdown=function(){btn.dataset.loginPointer="1";};});}
  function cancelEvent(e,prevent){try{if(prevent&&e.cancelable!==false)e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}catch(_){}}
  function bind(){setRole(role());mark();["pointerdown","mousedown","touchstart","click"].forEach(type=>{document.addEventListener(type,function(e){const tab=e.target.closest&&e.target.closest("[data-login-tab]");if(tab){setRole(tab.dataset.loginTab==="companion"?"companion":"member");return;}const btn=e.target.closest&&e.target.closest("#front_login_btn,#v44_login_btn,.login-main-btn-v116,[data-login-submit]");if(btn){cancelEvent(e,type!=="touchstart");if(type==="click"||type==="pointerdown")login(btn,e);return false;}},type==="touchstart"?{capture:true,passive:false}:true);});document.addEventListener("keydown",function(e){if(e.key!=="Enter")return;const t=e.target;if(!t)return;const id=t.id||"";if(id==="front_login_user"||id==="front_login_pwd"||id==="v44_login_user"||id==="v44_login_pwd"){cancelEvent(e,true);login($("#front_login_btn")||$("#v44_login_btn")||document.querySelector(".login-main-btn-v116"),e);}},true);clearInterval(window.__dreamLoginBindTimer);window.__dreamLoginBindTimer=setInterval(mark,500);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();
  window.DreamLoginForce={login,bind,mark,setRole,getRole:role};
  window.DreamHideLoginToast=hideLoginToast;
})();


window.DreamHideLoginToast = window.DreamHideLoginToast || function(){
  ["dreamLoginToast","dreamLegacyLoginToast","dreamLegacyLoginToast2","dreamLegacyLoginToast3","dreamLegacyLoginToast4"].forEach(function(id){
    var el=document.getElementById(id);
    if(el){ el.style.opacity="0"; setTimeout(function(){try{el.remove();}catch(e){}},260); }
  });
};



