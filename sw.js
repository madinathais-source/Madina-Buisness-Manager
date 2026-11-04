const CACHE_NAME='madina-manager-v1';
const CORE=['./','./index.html','./app.js','./manifest.webmanifest','./icon.svg'];
const EXTERNAL=[
 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js',
 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await cache.addAll(CORE);await Promise.allSettled(EXTERNAL.map(async url=>{try{const response=await fetch(url,{mode:'no-cors'});await cache.put(url,response)}catch(error){console.warn('Could not cache external library',url,error)}}));await self.skipWaiting()})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('madina-manager-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin===self.location.origin){event.respondWith((async()=>{try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone())}return response}catch(error){const cached=await caches.match(request);if(cached)return cached;if(request.mode==='navigate')return caches.match('./index.html');throw error}})());return}if(EXTERNAL.includes(request.url)){event.respondWith((async()=>{const cached=await caches.match(request);if(cached)return cached;try{const response=await fetch(request);const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone());return response}catch(error){return cached||Response.error()}})())}});
