importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js");const c={apiKey:"AIzaSyC8tDVbDIrKuylsyF3rbDSSPlzsEHXqZIs",authDomain:"online-attendance-21f95.firebaseapp.com",projectId:"online-attendance-21f95",storageBucket:"online-attendance-21f95.appspot.com",messagingSenderId:"756223518392",appId:"1:756223518392:web:5e8d28c78f7eefb8be764d"};firebase.initializeApp(c);const s=firebase.messaging();s.onBackgroundMessage(t=>{var i;console.log("Received background message:",t);const e={body:t.notification.body,icon:"/NFC-CAPSTONE-PROJECT/icons/icon.svg",badge:"/NFC-CAPSTONE-PROJECT/icons/icon.svg",vibrate:[100,50,100],data:{...t.data,url:`/NFC-CAPSTONE-PROJECT${((i=t.data)==null?void 0:i.url)||""}`}};self.registration.showNotification(t.notification.title,e)});self.addEventListener("notificationclick",t=>{t.notification.close(),t.notification.data&&t.notification.data.url&&t.waitUntil(clients.matchAll({type:"window"}).then(e=>{for(const i of e)if(i.url===t.notification.data.url&&"focus"in i)return i.focus();if(clients.openWindow)return clients.openWindow(t.notification.data.url)}))});self.addEventListener("install",t=>{self.skipWaiting()});self.addEventListener("activate",t=>{t.waitUntil(clients.claim())});workbox.core.clientsClaim();self.clients.claim();workbox.routing.registerRoute(({request:t})=>t.mode==="navigate",new workbox.strategies.NetworkFirst({cacheName:"pages-cache"}));workbox.routing.registerRoute(({request:t})=>t.destination==="style"||t.destination==="script"||t.destination==="worker",new workbox.strategies.StaleWhileRevalidate({cacheName:"assets-cache"}));workbox.routing.registerRoute(({request:t})=>t.destination==="image",new workbox.strategies.CacheFirst({cacheName:"images-cache",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:50,maxAgeSeconds:30*24*60*60})]}));self.addEventListener("fetch",t=>{t.request.mode==="navigate"&&t.respondWith(fetch(t.request).catch(()=>caches.match("/NFC-CAPSTONE-PROJECT/")||caches.match("/NFC-CAPSTONE-PROJECT/index.html")))});self.addEventListener("message",t=>{t.data&&t.data.type==="SKIP_WAITING"&&self.skipWaiting()});self.addEventListener("activate",t=>{t.waitUntil(Promise.all([caches.keys().then(e=>Promise.all(e.map(i=>{if(i.startsWith("workbox-")||i.endsWith("-cache"))return caches.delete(i)}))),clients.claim(),clients.matchAll().then(e=>{e.forEach(i=>i.postMessage({type:"CACHE_UPDATED"}))})]))});workbox.precaching.precacheAndRoute([{"revision":null,"url":"assets/index-BIeYN_wf.js"},{"revision":null,"url":"assets/index-BoSwUss-.css"},{"revision":null,"url":"assets/workbox-window.prod.es5-B9K5rw8f.js"},{"revision":"67c4776b6ec2576be8addc2471c4f944","url":"index.html"},{"revision":"fed9e51e68da48d132326b129199d96b","url":"icons/icon.svg"},{"revision":"771c59a3931ff519a750cf71c6b24578","url":"manifest.webmanifest"}]);s.onBackgroundMessage(async t=>{var e,i;console.log("Received background message:",t);try{const o={body:t.notification.body,icon:"/NFC-CAPSTONE-PROJECT/icons/icon.svg",badge:"/NFC-CAPSTONE-PROJECT/icons/icon.svg",vibrate:[100,50,100],tag:((e=t.data)==null?void 0:e.messageId)||"default",renotify:!0,requireInteraction:!0,actions:[{action:"view",title:"View Message"}],data:{...t.data,url:`/NFC-CAPSTONE-PROJECT${((i=t.data)==null?void 0:i.url)||""}`,timestamp:Date.now()}};await self.registration.showNotification(t.notification.title,o)}catch(o){console.error("Error showing notification:",o),setTimeout(async()=>{try{await self.registration.showNotification(t.notification.title,notificationOptions)}catch(n){console.error("Retry failed:",n)}},1e3)}});self.addEventListener("notificationclick",t=>{var o;const e=t.notification;t.action;const i=(o=e.data)==null?void 0:o.url;e.close(),t.waitUntil((async()=>{try{const n=await clients.matchAll({type:"window",includeUncontrolled:!0});for(const a of n)if(a.url===i&&"focus"in a){await a.focus();return}i&&await clients.openWindow(i)}catch(n){console.error("Error handling notification click:",n)}})())});
