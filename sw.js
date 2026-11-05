const CACHE_NAME='madina-manager-v9';
const CORE=['./','./index.html','./app.js?v=20261105-9','./manifest.webmanifest','./icon.svg'];
const EXTERNAL=[
 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js',
 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 await Promise.allSettled(CORE.map(async path=>{try{const response=await fetch(path,{cache:'reload'});if(response&&response.ok)await cache.put(path,response)}catch(error){console.warn('Core offline file could not be cached:',path,error)}}));
 await Promise.allSettled(EXTERNAL.map(async url=>{try{const response=await fetch(url,{mode:'no-cors',cache:'reload'});if(response&&(response.ok||response.type==='opaque'))await cache.put(url,response)}catch(error){console.warn('External library could not be cached:',url,error)}}));
 await self.skipWaiting();
})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith('madina-manager-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));
 await self.clients.claim();
})())});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin===self.location.origin){
  event.respondWith((async()=>{
   try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE_NAME);await cache.put(request,response.clone()).catch(()=>{})}return response}
   catch(error){const cached=await caches.match(request);if(cached)return cached;if(request.mode==='navigate')return (await caches.match('./index.html'))||(await caches.match('./'));return Response.error()}
  })());return;
 }
 if(EXTERNAL.includes(url.href)){
  event.respondWith((async()=>{
   const cached=await caches.match(request);if(cached)return cached;
   try{const response=await fetch(request);if(response){const cache=await caches.open(CACHE_NAME);await cache.put(request,response.clone()).catch(()=>{})}return response}
   catch(error){return Response.error()}
  })());
 }
});
