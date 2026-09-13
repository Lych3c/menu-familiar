const CACHE='menu-familiar-v2-1';
const ASSETS=['./','./index.html','./styles.css','./manifest.webmanifest','./icons/app-icon.svg','./data/base.js','./data/recipes-01.js','./data/recipes-02.js','./data/recipes-03.js','./data/recipes-04.js','./data/recipes-05.js','./data/recipes-06.js','./js/core.js','./js/recipes.js','./js/pantry.js','./js/shopping.js','./js/settings.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match('./index.html'))))});
