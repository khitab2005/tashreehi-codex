/* Cache only this app's public assets. Never intercept cross-origin traffic. */
const CACHE='tashreehi-v1';
const CORE=['/offline.html','/icon.svg','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tashreehi-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request;const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||request.headers.has('range')||request.headers.has('rsc')||url.searchParams.has('_rsc'))return;
  const asset=url.pathname.startsWith('/models/')||url.pathname.startsWith('/fonts/')||url.pathname.startsWith('/icons/')||url.pathname.startsWith('/_next/static/');
  if(asset){event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{}));}return response;})));return;}
  if(request.mode==='navigate'){event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{}));}return response;}).catch(async()=>await caches.match(request)||await caches.match('/offline.html')));}
});
