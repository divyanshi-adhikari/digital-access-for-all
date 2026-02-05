const CACHE_NAME = "digital-access-for-all-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./app.js",
    "./manifest.json",
    "./style.css"
];

// Install event – cache files
self.addEventListener("install", event => {
    event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(FILES_TO_CACHE);
    })
);
self.skipWaiting();
});

// Activate event – clean old caches
self.addEventListener("activate", event => {
    event.waitUntil(
    caches.keys().then(cacheNames => {
        return Promise.all(
        cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
            return caches.delete(cache);
        }
        })
    );
    })
);
self.clients.claim();
});

// Fetch event – serve from cache first
self.addEventListener("fetch", event => {
    event.respondWith(
    caches.match(event.request).then(response => {
        return response || fetch(event.request);
    })
);
});