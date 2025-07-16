// Carambola Golf Club Service Worker
const CACHE_NAME = 'carambola-golf-v1.0.0';
const CACHE_PREFIX = 'carambola-golf';
const OFFLINE_PAGE = '/offline.html';

// Assets to cache immediately
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/course.html',
    '/pricing.html',
    '/st-croix.html',
    '/contact.html',
    '/styles.css',
    '/script.js',
    '/offline.html',
    '/manifest.json',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png'
];

// Images to cache on demand
const IMAGE_CACHE = 'carambola-images-v1.0.0';
const IMAGES_TO_CACHE = [
    '/images/carambola-golf-hole-1.webp',
    '/images/carambola-golf-hole-1.jpg',
    '/images/carambola-golf-hole-12.webp',
    '/images/carambola-golf-hole-12.jpg',
    '/images/carambola-golf-hole-18.webp',
    '/images/carambola-golf-hole-18.jpg',
    '/images/carambola-attraction-buck-island.webp',
    '/images/carambola-attraction-buck-island.jpg'
];

// External resources cache
const EXTERNAL_CACHE = 'carambola-external-v1.0.0';
const EXTERNAL_RESOURCES = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Georgia:wght@400;600;700&display=swap'
];

// Cache strategies
const CACHE_STRATEGIES = {
    pages: 'networkFirst',
    assets: 'cacheFirst',
    images: 'cacheFirst',
    external: 'staleWhileRevalidate'
};

// Install event - cache core assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing');
    
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching core assets');
                return cache.addAll(CORE_ASSETS);
            }),
            caches.open(IMAGE_CACHE).then(cache => {
                console.log('Service Worker: Caching key images');
                return cache.addAll(IMAGES_TO_CACHE);
            }),
            caches.open(EXTERNAL_CACHE).then(cache => {
                console.log('Service Worker: Caching external resources');
                return cache.addAll(EXTERNAL_RESOURCES);
            })
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName.startsWith(CACHE_PREFIX) && 
                        cacheName !== CACHE_NAME && 
                        cacheName !== IMAGE_CACHE && 
                        cacheName !== EXTERNAL_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            self.clients.claim();
        })
    );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extensions
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Skip Google Analytics and other tracking
    if (url.hostname.includes('google-analytics.com') || 
        url.hostname.includes('googletagmanager.com') ||
        url.hostname.includes('analytics.google.com')) {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

// Handle different types of requests
async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // HTML pages - Network First
        if (request.headers.get('accept').includes('text/html')) {
            return await networkFirst(request, CACHE_NAME);
        }
        
        // Images - Cache First
        if (request.headers.get('accept').includes('image/') || 
            url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
            return await cacheFirst(request, IMAGE_CACHE);
        }
        
        // External resources - Stale While Revalidate
        if (url.origin !== location.origin) {
            return await staleWhileRevalidate(request, EXTERNAL_CACHE);
        }
        
        // CSS, JS, fonts - Cache First
        if (url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/)) {
            return await cacheFirst(request, CACHE_NAME);
        }
        
        // Default - Network First
        return await networkFirst(request, CACHE_NAME);
        
    } catch (error) {
        console.error('Service Worker: Request failed:', error);
        
        // Return offline page for navigation requests
        if (request.headers.get('accept').includes('text/html')) {
            return await caches.match(OFFLINE_PAGE) || 
                   new Response('Offline - Please check your connection', {
                       status: 200,
                       headers: { 'Content-Type': 'text/plain' }
                   });
        }
        
        // Return cached version or error for other requests
        return await caches.match(request) || 
               new Response('Resource not available offline', {
                   status: 503,
                   headers: { 'Content-Type': 'text/plain' }
               });
    }
}

// Network First strategy
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        return await caches.match(request) || 
               await caches.match(OFFLINE_PAGE);
    }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('Failed to fetch and cache:', request.url);
        throw error;
    }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(response => {
        if (response.status === 200) {
            const cache = caches.open(cacheName);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    }).catch(error => {
        console.log('Background fetch failed:', request.url);
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Message handling for manual cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
    
    if (event.data && event.data.type === 'CACHE_CLEAN') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith(CACHE_PREFIX)) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle background sync tasks
            handleBackgroundSync()
        );
    }
});

async function handleBackgroundSync() {
    // Handle any queued actions when back online
    console.log('Background sync triggered');
    
    // Example: Send queued analytics events
    if ('indexedDB' in self) {
        // Implementation for offline analytics queue
        console.log('Processing offline analytics queue');
    }
}

// Push notification handling
self.addEventListener('push', event => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/android-chrome-192x192.png',
            badge: '/android-chrome-192x192.png',
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View Course',
                    icon: '/android-chrome-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/android-chrome-192x192.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification('Carambola Golf Club', options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/course.html')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open homepage
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled promise rejection:', event.reason);
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'content-sync') {
        event.waitUntil(
            // Update cached content periodically
            updateCachedContent()
        );
    }
});

async function updateCachedContent() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        
        // Update HTML pages
        const htmlRequests = requests.filter(req => 
            req.url.includes('.html') || req.url.endsWith('/')
        );
        
        for (const request of htmlRequests) {
            try {
                const response = await fetch(request);
                if (response.status === 200) {
                    await cache.put(request, response);
                }
            } catch (error) {
                console.log('Failed to update cached content:', request.url);
            }
        }
        
        console.log('Cached content updated');
    } catch (error) {
        console.error('Failed to update cached content:', error);
    }
}

console.log('Service Worker: Script loaded');