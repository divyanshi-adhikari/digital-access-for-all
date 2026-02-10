const CACHE_NAME = "digital-access-for-all-v3";

const FILES_TO_CACHE = [
    "./",
    "./home.html",
    "./index.html",
    "./ration.html",
    "./scholarship10.html",
    "./scholarship12.html",
    "./emergency.html",

    "./app.js",
    "./ration.js",
    "./db.js",
    "./sync.js",

    "./style.css",
    "./manifest.json"
];


// INSTALL
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key =>
                    key !== CACHE_NAME ? caches.delete(key) : null
                )
            )
        )
    );
    self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // Let backend requests go to network
    if (url.pathname.startsWith("/gov") || url.pathname.startsWith("/sync")) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request);
        })
    );
});


