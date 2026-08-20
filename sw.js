// ============================================
// SERVICE WORKER - My Service PWA
// ============================================

const CACHE_NAME = 'my-service-v3';
const OFFLINE_URL = '/offline.html';

// Files to cache
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/login.html',
    '/register.html',
    '/parent.html',
    '/driver.html',
    '/school.html',
    '/admin.html',
    '/offline.html',
    '/css/style.css',
    '/css/animations.css',
    '/css/themes.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/api.js',
    '/js/map.js',
    '/js/parent.js',
    '/js/driver.js',
    '/js/school.js',
    '/js/admin.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css',
    'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js',
    'https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.0.12/typed.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
    'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
];

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Removing old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH EVENT
// ============================================
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            message: 'عدم اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید.'
                        }),
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                })
        );
        return;
    }

    // Handle navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    // Handle other requests - cache first, fallback to network
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Return cached response
                    return response;
                }
                
                // Fetch from network and cache
                return fetch(event.request)
                    .then(networkResponse => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        
                        // Clone the response
                        const responseToCache = networkResponse.clone();
                        
                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // If both cache and network fail, return offline page for HTML
                        if (event.request.headers.get('Accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// ============================================
// PUSH NOTIFICATION EVENT
// ============================================
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'اعلان جدید از سرویس من',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'مشاهده'
            },
            {
                action: 'close',
                title: 'بستن'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'سرویس من', options)
    );
});

// ============================================
// NOTIFICATION CLICK EVENT
// ============================================
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// ============================================
// MESSAGE EVENT
// ============================================
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        // Get pending data from IndexedDB
        const pending = await getPendingData();
        
        if (pending.length > 0) {
            // Sync with server
            const responses = await Promise.all(
                pending.map(data => {
                    return fetch('/api/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                })
            );
            
            // Clear pending data on success
            if (responses.every(r => r.ok)) {
                await clearPendingData();
            }
        }
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// ============================================
// IndexedDB Helpers (mock)
// ============================================
function getPendingData() {
    return new Promise(resolve => {
        // Mock: return empty array
        resolve([]);
    });
}

function clearPendingData() {
    return new Promise(resolve => {
        resolve();
    });
}