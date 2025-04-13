const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
  '/index.html',
  '/bootstrap/css/bootstrap.min.css',
  '/bootstrap/js/bootstrap.bundle.min.js',
  '/static/js/bundle.js',
  '/static/css/main.928dabc7.css',
  '/static/js/main.a044b3e1.js',
  '/static/media/tuplogo.bf503865e05a1b3a6263.png',
  '/static/media/clalogo.db3811bdf57666054c4a.png',
  '/static/media/background.780f9c0f31f1e2160442.jpg',
  '/static/media/Inter_24pt-Regular.fcd4310affaf30346b67.ttf',
  '/static/media/add-item.74f964c9fc364b2abb4bfd0cd868b78b.svg',
  '/static/media/add.5743a8925924b435894fb655cd3daece.svg',
  '/static/media/arrow-dropdown.05cf2a4bbb69bd5a6fcb9498431c8145.svg',
  '/static/media/arrow-left-black.1f4ba5988aa2a78ee5584b0b9c205d81.svg',
  '/static/media/arrow-left-red.5baf6c5d33c933255c63bae0473786b0.svg',
  '/static/media/arrow-right-black.b959810b851988800b482da97beb4c7d.svg',
  '/static/media/arrow-right-red.bd3e1635ab191b86e01b4257170afa41.svg',
  '/static/media/cataloging.2ee75c8298bd6567d5220286c3f2e890.svg',
  '/static/media/checkout.5308bcd60af7dd85a9cf134d01fdbd03.svg',
  '/static/media/circulation.f1b35840e4b2ad1e1804f49b9172f15a.svg',
  '/static/media/dashboard.3a914998b492330405c3a1eebf2a8dd1.svg',
  '/static/media/dropdown-black.99df3fd0dc118d7b6c1633a23084d979.svg',
  '/static/media/dropdown-yellow.e22c001522743a25ada72590ad7954ad.svg',
  '/static/media/edit-patron.1a20a027e34f472841d4ccaa519b113f.svg',
  '/static/media/export.a4ae8294048513bc4d76889722318c36.svg',
  '/static/media/generate-report.cabaf7a32dd171ebcc56f9a1682a4851.svg',
  '/static/media/inventory.4696903aa8e678cf8e3d99155ff5e28d.svg',
  '/static/media/logbook.8c3ca82f12860caff0b3437244cc4345.svg',
  '/static/media/more.c49064831f39999bc3a9de0c50361767.svg',
  '/static/media/patrons.1b06107bc5b36fe2fabacbd4dec84f53.svg',
  '/static/media/reports.687d086d3c09f22bfb1e72864ad6c4be.svg',
  '/static/media/scan-item.e4352c5efb4d4d4353ec8adec6df1029.svg',
  '/static/media/search.7fa8563cc79a8447c632733437734c2d.svg',
  '/static/media/total-borrowed.83aec8ab92d8eb1da51d4da3b3c4b6d5.svg',
  '/static/media/total-visitors.a219788674b67bf6294a67e03890d3c6.svg',
  '/static/media/user-profile.2224aa11d71f0002406ab8c20ad810d0.svg',
  
 
  

  // Add any other assets you need
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('caching assets');
      return cache.addAll(urlsToCache);
    })
  );
});




self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      console.log("Fetch event", response)
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker Activated');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
 