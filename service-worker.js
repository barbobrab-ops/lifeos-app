const CACHE='lifeos-cloud-v3';const ASSETS=['./','./index.html','./style.css','./script.js','./cloud.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;const u=new URL(e.request.url);if(e.request.mode==='navigate'||u.pathname.endsWith('/config.js')||u.pathname.endsWith('/cloud.js')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return}e.respondWith(fetch(e.request).then(response=>{if(response.ok){const copy=response.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)))}return response}).catch(()=>caches.match(e.request)))})
/* Web Push: mostra promemoria inviati dal server anche con LifeOS chiusa. */
self.addEventListener('push',event=>{
 let payload={};try{payload=event.data?event.data.json():{}}catch{payload={body:event.data?.text()||''}}
 const title=String(payload.title||'LifeOS · Calendario').slice(0,140);
 const options={body:String(payload.body||'Hai un appuntamento in programma.').slice(0,300),icon:'./icon-192.png',badge:'./icon-192.png',tag:String(payload.tag||'lifeos-calendar'),data:{url:'./'}};
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
  for(const client of clients){if(client.url.startsWith(self.registration.scope)){await client.focus();return}}
  return self.clients.openWindow('./');
 }));
});
