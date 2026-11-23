/* ไกด์ญี่ปุ่น: เก็บไว้ใช้ออฟไลน์ */
const V="1795427677",CORE="core-"+V,RUN="run-"+V,TILE="tiles-"+V;
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png",
 "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js","https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CORE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>![CORE,RUN,TILE].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
async function trim(name,max){const c=await caches.open(name),ks=await c.keys();for(let i=0;i<ks.length-max;i++)await c.delete(ks[i]);}
function cacheFirst(req,name,max){
  return caches.match(req).then(m=>m||fetch(req).then(r=>{if(r&&(r.ok||r.type==="opaque")){const c=r.clone();caches.open(name).then(x=>x.put(req,c)).then(()=>max&&trim(name,max));}return r;}));
}
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    if(req.mode==="navigate"){
      e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CORE).then(x=>x.put("./index.html",c));return r;}).catch(()=>caches.match("./index.html")));
    }else e.respondWith(cacheFirst(req,CORE));
    return;
  }
  if(u.hostname==="tile.openstreetmap.org"){e.respondWith(cacheFirst(req,TILE,1500));return;}
  if(/(^|\.)wikimedia\.org$/.test(u.hostname)||u.hostname==="cdnjs.cloudflare.com"||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(cacheFirst(req,RUN,400));return;
  }
  if(u.hostname==="ja.wikipedia.org"){e.respondWith(fetch(req).catch(()=>caches.match(req)));return;}
});
