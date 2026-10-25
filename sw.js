const CACHE = 'sag-production-shell-2026-10-25-1';
const FILES = ['./index.html','./config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const path of FILES){const response=await fetch(new Request(path,{cache:'reload',redirect:'follow'}));
    if(!response.ok || response.redirected) throw Error('Asset non direct: '+path);
    await cache.put(path,response);
  }
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys()) if(key.startsWith('sag-production-shell-')&&key!==CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  const scope=new URL(self.registration.scope);
  if(!url.pathname.startsWith(scope.pathname)) return;
  const target=(url.pathname===scope.pathname || url.pathname===scope.pathname+'index.html')?'./index.html':url.pathname.slice(scope.pathname.length);
  const allowed=new Set(FILES);
  const key=target.startsWith('./')?target:'./'+target;
  if(!allowed.has(key)) return;
  event.respondWith((async()=>{const cached=await caches.match(key);if(cached)return cached;
    const response=await fetch(event.request);return response;})());
});
