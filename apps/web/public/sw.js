const STATIC_CACHE = "mbc-static-v1";
const DYNAMIC_CACHE = "mbc-dynamic-v1";
const OFFLINE_URL = "/offline";
const STATIC_ASSETS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/api/pwa-icon/192",
  "/api/pwa-icon/512",
  "/api/pwa-icon/apple"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    event.respondWith(networkOnly(request));
    return;
  }

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isStaticAsset = STATIC_ASSETS.includes(url.pathname) ||
    ["style", "script", "font", "image"].includes(request.destination);

  if (isSameOrigin && isStaticAsset) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    if (response && response.status === 200 && request.method === "GET") {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    if (request.mode === "navigate") {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(null, {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}

self.addEventListener("sync", (event) => {
  if (event.tag === "mbc-background-sync") {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Placeholder: enqueue failed requests and retry here when implementing background sync.
  return Promise.resolve();
}
