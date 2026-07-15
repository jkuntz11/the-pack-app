const C='the-pack-v1-release-20260715';
const CORE=[
  './','./index.html','./styles.css','./app.js','./manifest.webmanifest',
  './assets/heroes/home-hero.webp',
  './assets/journal/cover-v2.webp',
  './assets/journal/explorers-guide.webp',
  './assets/journal/table-of-contents.webp',
  './assets/journal/master-page.webp',
  './assets/journal/journal-structure.json'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(C).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==C).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response && response.status===200 && response.type==='basic'){
        const copy=response.clone();
        caches.open(C).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }))
  );
});
