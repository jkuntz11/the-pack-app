const C='the-pack-v1-2-1-dynamic-toc-20260716';
const CORE=[
  './','./index.html','./styles.css','./app.js','./manifest.webmanifest',
  './assets/heroes/home-hero.webp',
  './assets/journal/cover-v2.webp',
  './assets/journal/explorers-guide.webp',
  './assets/journal/table-of-contents.webp',
  './assets/journal/master-page.webp',
  './assets/journal/journal-structure.json',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png',
  './assets/icons/favicon-16.png',
  './assets/icons/favicon.ico'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(C).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==C).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response && response.status===200 && response.type==='basic'){
        const copy=response.clone();
        caches.open(C).then(cache=>cache.put(event.request,copy)).catch(()=>{});
      }
      return response;
    }))
  );
});
