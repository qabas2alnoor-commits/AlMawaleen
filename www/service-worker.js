// ============================================
// service-worker.js
// تطبيق الموالين - Offline Support
// Android + iPhone
// ============================================

const CACHE_NAME = "al-mowaleen-v7";


// ============================================
// ملفات التطبيق الأساسية
// ============================================

const APP_SHELL = [

    // التطبيق
    "./",
    "./index.html",
    "./manifest.json",

    // CSS
    "./css/style.css",

    // JavaScript
    "./js/splash.js",
    "./js/offline.js",

    "./js/supabase-config.js",
    "./js/supabase-client.js",

    "./js/hijri-settings.js",
    "./js/hijri-events.js",
    "./js/hijri.js",

    "./js/events.js",
    "./js/modal.js",
    "./js/details.js",
    "./js/sidebar.js",

    "./js/dhu-al-hijjah-fix.js",

    "./js/calendar.js",

    "./js/install.js",

    // Icons
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png",

    // Logo
    "./assets/icons/qabas-alnoor.png",

    // Favicon
    "./favicon.png",

    // Splash Video
    "./assets/intro/intro.mp4"
];


// ============================================
// INSTALL
// ============================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "Service Worker installing:",
            CACHE_NAME
        );


        event.waitUntil(

            caches.open(CACHE_NAME)

                .then(async cache => {

                    console.log(
                        "Caching application files..."
                    );


                    for (
                        const file of APP_SHELL
                    ) {

                        try {

                            const response =
                                await fetch(
                                    file,
                                    {
                                        cache: "no-cache"
                                    }
                                );


                            if (
                                response &&
                                response.ok &&
                                response.status !== 206
                            ) {

                                await cache.put(
                                    file,
                                    response.clone()
                                );


                                console.log(
                                    "Cached:",
                                    file
                                );

                            } else {

                                console.warn(
                                    "Skipped:",
                                    file,
                                    response
                                        ? response.status
                                        : "NO RESPONSE"
                                );

                            }

                        }

                        catch (error) {

                            console.warn(
                                "Could not cache:",
                                file,
                                error
                            );

                        }

                    }

                })

        );


        // تفعيل النسخة الجديدة مباشرة
        self.skipWaiting();

    }
);


// ============================================
// ACTIVATE
// ============================================

self.addEventListener(
    "activate",
    event => {

        console.log(
            "Service Worker activated:",
            CACHE_NAME
        );


        event.waitUntil(

            caches.keys()

                .then(cacheNames => {

                    return Promise.all(

                        cacheNames

                            .filter(
                                cacheName =>
                                    cacheName !==
                                    CACHE_NAME
                            )

                            .map(
                                cacheName => {

                                    console.log(
                                        "Deleting old cache:",
                                        cacheName
                                    );

                                    return caches.delete(
                                        cacheName
                                    );

                                }
                            )

                    );

                })

                .then(() => {

                    return self.clients.claim();

                })

        );

    }
);


// ============================================
// FETCH
// ============================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        // ========================================
        // GET فقط
        // ========================================

        if (
            request.method !== "GET"
        ) {

            return;

        }


        const url =
            new URL(request.url);


        // ========================================
        // Aladhan API
        // Offline Support
        // ========================================

        if (
            url.hostname.includes(
                "api.aladhan.com"
            )
        ) {

            event.respondWith(

                fetch(request)

                    .then(networkResponse => {

                        if (
                            networkResponse &&
                            networkResponse.ok &&
                            networkResponse.status !== 206
                        ) {

                            const responseClone =
                                networkResponse.clone();


                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    return cache.put(
                                        request,
                                        responseClone
                                    );

                                })
                                .catch(() => {});

                        }


                        return networkResponse;

                    })

                    .catch(() => {

                        console.log(
                            "🔴 Aladhan Offline - استخدام البيانات المحفوظة:",
                            request.url
                        );


                        return caches.match(request)

                            .then(cachedResponse => {

                                if (
                                    cachedResponse
                                ) {

                                    return cachedResponse;

                                }


                                return new Response(

                                    JSON.stringify({
                                        code: 503,
                                        status: "Offline",
                                        data: null
                                    }),

                                    {
                                        status: 503,

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        }

                                    }

                                );

                            });

                    })

            );


            return;

        }


        // ========================================
        // الطلبات الخارجية
        // لا نتدخل بها
        // ========================================

        // Supabase
        if (
            url.hostname.includes(
                "supabase.co"
            ) ||
            url.hostname.includes(
                "supabase.in"
            )
        ) {

            return;

        }


        // ========================================
        // CDN
        // ========================================

        if (
            url.hostname.includes(
                "googleapis.com"
            ) ||
            url.hostname.includes(
                "gstatic.com"
            ) ||
            url.hostname.includes(
                "cdn.jsdelivr.net"
            ) ||
            url.hostname.includes(
                "cdnjs.cloudflare.com"
            )
        ) {

            return;

        }


        // ========================================
        // Range Requests
        // ========================================
        //
        // مهم جدًا للفيديو.
        //
        // لا نتدخل في طلبات Range.
        // ========================================

        if (
            request.headers.get("range")
        ) {

            return;

        }


        // ========================================
        // CACHE FIRST
        // ========================================

        event.respondWith(

            caches.match(request)

                .then(cachedResponse => {


                    // ==================================
                    // موجود في الكاش
                    // ==================================

                    if (
                        cachedResponse
                    ) {

                        // =================================
                        // تحديث الكاش في الخلفية
                        // =================================

                        fetch(request)

                            .then(
                                networkResponse => {

                                    if (
                                        networkResponse &&
                                        networkResponse.ok &&
                                        networkResponse.status !== 206
                                    ) {

                                        caches.open(
                                            CACHE_NAME
                                        )

                                            .then(cache => {

                                                cache.put(
                                                    request,
                                                    networkResponse
                                                        .clone()
                                                );

                                            })

                                            .catch(() => {});

                                    }

                                }
                            )

                            .catch(() => {

                                console.log(
                                    "Offline: استخدام النسخة المحلية:",
                                    request.url
                                );

                            });


                        return cachedResponse;

                    }


                    // ==================================
                    // غير موجود في الكاش
                    // ==================================

                    return fetch(request)

                        .then(
                            networkResponse => {

                                // =================================
                                // التحقق من Response
                                // =================================

                                if (
                                    !networkResponse
                                ) {

                                    throw new Error(
                                        "Network response is empty"
                                    );

                                }


                                // =================================
                                // حفظ الاستجابة في الكاش
                                // =================================

                                if (
                                    networkResponse.ok &&
                                    networkResponse.status !== 206
                                ) {

                                    const responseClone =
                                        networkResponse.clone();


                                    caches.open(
                                        CACHE_NAME
                                    )

                                        .then(cache => {

                                            return cache.put(
                                                request,
                                                responseClone
                                            );

                                        })

                                        .catch(() => {});

                                }


                                return networkResponse;

                            }
                        )

                        .catch(
                            () => {

                                // =================================
                                // Offline Navigation
                                // =================================

                                if (
                                    request.mode ===
                                    "navigate"
                                ) {

                                    return caches.match(
                                        "./index.html"
                                    )

                                        .then(response => {

                                            if (
                                                response
                                            ) {

                                                return response;

                                            }


                                            return new Response(
                                                `
                                                <!DOCTYPE html>
                                                <html lang="ar" dir="rtl">
                                                <head>
                                                    <meta charset="UTF-8">
                                                    <title>تطبيق الموالين</title>
                                                </head>
                                                <body>
                                                    <h2>تطبيق الموالين</h2>
                                                    <p>
                                                        التطبيق يعمل بدون إنترنت،
                                                        لكن الصفحة غير متوفرة محليًا.
                                                    </p>
                                                </body>
                                                </html>
                                                `,
                                                {
                                                    status: 200,
                                                    headers: {
                                                        "Content-Type":
                                                            "text/html; charset=utf-8"
                                                    }
                                                }
                                            );

                                        });

                                }


                                // =================================
                                // محاولة أخيرة من الكاش
                                // =================================

                                return caches.match(
                                    request
                                )

                                    .then(response => {

                                        if (
                                            response
                                        ) {

                                            return response;

                                        }


                                        // =================================
                                        // Response احتياطي صالح
                                        // =================================

                                        return new Response(
                                            "",
                                            {
                                                status: 503,
                                                statusText:
                                                    "Offline"
                                            }
                                        );

                                    });

                            }
                        );

                })

                .catch(
                    error => {

                        console.error(
                            "Service Worker fetch error:",
                            error
                        );


                        return new Response(
                            "",
                            {
                                status: 503,
                                statusText:
                                    "Service Unavailable"
                            }
                        );

                    }
                )

        );

    }
);


// ============================================
// MESSAGE
// ============================================
//
// يسمح بتحديث Service Worker يدويًا مستقبلًا
// ============================================

self.addEventListener(
    "message",
    event => {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);