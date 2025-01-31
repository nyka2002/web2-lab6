// Service Worker

const CACHE_NAME = "pwa-cache-v3";
const FILES_TO_CACHE = [
    "index.html",
    "styles.css",
    "script.js",
    "manifest.json",
    "icon.png",
    "offline.html"
];

// cache essential files when installed

self.addEventListener("install", (event) => {
    console.log("installing sw...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("caching files...");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// serve cached files when offline

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
        .then((response) => {
            return response || caches.match(event.request);
        })
        .catch(() => {
            return caches.match(event.request)
            .then((cachedResponse) => {
                return cachedResponse || caches.match("offline.html");
            });
        })
    );
});

self.addEventListener("activate", (event) => {
    console.log("sw activated");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("deleting old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// background syn

self.addEventListener("sync", function (event) {
    if (event.tag === "sync-data") {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    const savedData = await getQueuedData(); // from idxdb.js

    if (savedData.length > 0) {
        for (const item of savedData) {
            await fetch("/sync-endpoint", {
                method: "POST",
                body: JSON.stringify(item),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            await removeFromQueue(item.id); // if sync successful - delete
        }
    }
}