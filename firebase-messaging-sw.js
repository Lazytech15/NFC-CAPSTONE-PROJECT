importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");const n={apiKey:"AIzaSyC8tDVbDIrKuylsyF3rbDSSPlzsEHXqZIs",authDomain:"online-attendance-21f95.firebaseapp.com",projectId:"online-attendance-21f95",storageBucket:"online-attendance-21f95.appspot.com",messagingSenderId:"756223518392",appId:"1:756223518392:web:5e8d28c78f7eefb8be764d"};firebase.initializeApp(n);const r=firebase.messaging();workbox.core.clientsClaim();self.skipWaiting();workbox.precaching.precacheAndRoute([{"revision":null,"url":"assets/index-9sMKEb8K.js"},{"revision":null,"url":"assets/index-iHc0j0iz.css"},{"revision":null,"url":"assets/workbox-window.prod.es5-B9K5rw8f.js"},{"revision":"b62d6f537edb41dcb8d620ab3baa27d7","url":"index.html"},{"revision":"fed9e51e68da48d132326b129199d96b","url":"icons/icon.svg"},{"revision":"25539606f714a6c1af2346bfa8b68989","url":"manifest.webmanifest"}]||[]);workbox.routing.registerRoute(({request:e})=>e.mode==="navigate",new workbox.strategies.NetworkFirst({cacheName:"pages-cache"}));workbox.routing.registerRoute(({request:e})=>e.destination==="style"||e.destination==="script"||e.destination==="worker",new workbox.strategies.StaleWhileRevalidate({cacheName:"assets-cache"}));workbox.routing.registerRoute(({request:e})=>e.destination==="image",new workbox.strategies.CacheFirst({cacheName:"images-cache",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:50,maxAgeSeconds:30*24*60*60})]}));r.onBackgroundMessage(async e=>{var i,t;console.log("Received background message:",e);try{const o={body:e.notification.body,icon:"/icons/icon.svg",badge:"/icons/icon.svg",vibrate:[100,50,100],tag:((i=e.data)==null?void 0:i.messageId)||"default",renotify:!0,requireInteraction:!0,actions:[{action:"view",title:"View Message"}],data:{...e.data,url:`${((t=e.data)==null?void 0:t.url)||""}`,timestamp:Date.now()}};await self.registration.showNotification(e.notification.title,o)}catch(o){console.error("Error showing notification:",o),setTimeout(async()=>{try{await self.registration.showNotification(e.notification.title,notificationOptions)}catch(a){console.error("Retry failed:",a)}},1e3)}});self.addEventListener("notificationclick",e=>{var o;const i=e.notification,t=(o=i.data)==null?void 0:o.url;i.close(),e.waitUntil((async()=>{try{const a=await clients.matchAll({type:"window",includeUncontrolled:!0});for(const s of a)if(s.url===t&&"focus"in s){await s.focus();return}t&&await clients.openWindow(t)}catch(a){console.error("Error handling notification click:",a)}})())});self.addEventListener("fetch",e=>{e.request.mode==="navigate"&&e.respondWith(fetch(e.request).catch(()=>caches.match("/")||caches.match("/index.html")))});self.addEventListener("activate",e=>{e.waitUntil(Promise.all([caches.keys().then(i=>Promise.all(i.map(t=>{if(t.startsWith("workbox-")||t.endsWith("-cache"))return caches.delete(t)}))),clients.claim(),clients.matchAll().then(i=>{i.forEach(t=>t.postMessage({type:"CACHE_UPDATED"}))})]))});self.addEventListener("message",e=>{e.data&&e.data.type==="SKIP_WAITING"&&self.skipWaiting()});
