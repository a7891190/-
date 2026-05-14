const CACHE_NAME = 'dream-playmate-v319';
const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './assets/js/app-config.js',
  './assets/js/app-hardening.js',
  './assets/js/api-client.js',
  './assets/js/v26-social-client.js',
  './assets/page_bg.webp',
  './assets/logo.webp',
  './favicon.webp'
];
function isApiRequest(url){ return /api\.php|upload_avatar\.php|support_upload\.php/i.test(url.pathname); }
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL.map(u => new Request(u, {cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(isApiRequest(url)) return;
  if(req.mode === 'navigate'){
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy)); return res;
    }).catch(()=>caches.match('./index.html').then(res => res || caches.match('./offline.html'))));
    return;
  }
  if(/\.(?:webp|png|jpg|jpeg|gif|svg|js|css|json|html)$/i.test(url.pathname)){
    event.respondWith(caches.match(req).then(cached => {
      const network = fetch(req).then(res => { if(res && res.ok){ const copy=res.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(req,copy)); } return res; }).catch(()=>cached);
      return cached || network;
    }));
  }
});
