const CACHE_NAME = "allffa-store-v1"
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./images/logo.jpg",
    "./images/rice.jpg",
    "./images/oil.jpg",
    "./images/soap.jpg"
];
self.addEventListener("install", e => {
    console.log("[Service Worker] Installing...");
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[Service Worker] Caching files");
                return cache.addAll(ASSETS_TO_CACHE)
                })
            );
            self.skipWaiting();
                });

                //Activate event - clean old caches
                self.addEventListener("activate", e => {
                    console.log("[Service Worker] Activating...");
                    e.waitUntil(
                        caches.keys().then(keys => {
                            return Promise.all(
                                keys.map(key => {
                                    if (key !== CACHE_NAME)
                                    {
                                        console.log("[Service Worker] Removing old cacvhe", key);
                                        return caches.delete(key);
                                    }
                                })
                            );
                        })
                    );
                    self.clients.claim();
                });

                // Fetch event - serve from cache first
                self.addEventListener("fetch", e => {
                    e.respondWith(

                        caches.match(e.request).then(response => {
                            return response ||
                            fetch(e.request);
                        })
                    );
                });
