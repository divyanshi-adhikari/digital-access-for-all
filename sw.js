const CACHE_NAME = "digital-access-for-all-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./app.js",
    "./emergency.html",
    "./manifest.json",
    "./style.css"
];

// Install event – cache files
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// Activate event – clean old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cache =>
                    cache !== CACHE_NAME ? caches.delete(cache) : null
                )
            )
        )
    );
    self.clients.claim();
});

// Fetch event – cache frontend only, NOT APIs
self.addEventListener("fetch", event => {
    const req = event.request;
    const url = new URL(req.url);

    if (
        url.origin === location.origin &&
        !url.pathname.startsWith("/gov") &&
        !url.pathname.startsWith("/sync")
    ) {
        event.respondWith(
            caches.match(req).then(response => response || fetch(req))
        );
    }
});
