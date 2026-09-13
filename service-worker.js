const CACHE='menu-familiar-v2-2';
const ASSETS=['./','./index.html','./styles.css','./manifest.webmanifest','./icons/app-icon.svg','./data/base.js','./data/recipes-01.js','./data/recipes-02.js','./data/recipes-03.js','./data/recipes-04.js','./data/recipes-05.js','./data/recipes-06.js','./js/core.js','./js/recipes.js','./js/pantry.js','./js/shopping.js','./js/settings.js'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{
      const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  if(url.origin===self.location.origin){
    event.respondWith(caches.match(event.request).then(cached=>{
      const network=fetch(event.request).then(response=>{
        if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
        return response;
      }).catch(()=>cached);
      return cached||network;
    }));
  }
});
