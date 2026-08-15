const CACHE_NAME = "mawaqit-alwalaa-v1";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.png",
  "./css/style.css"
];

// تثبيت Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// تفعيل النسخة الجديدة وحذف Cache القديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// التعامل مع الطلبات
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // لا نخزن Supabase أو API في Cache
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("aladhan.com")
  ) {
    return;
  }

  // ملفات التطبيق الثابتة:
  // Cache First ثم الشبكة
  if (request.method === "GET" && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return networkResponse;
        });
      })
    );
  }
});