// Carambola Golf Club Service Worker - Fixed Version
// Enhanced caching strategy with proper error handling

const CACHE_NAME = 'carambola-golf-v1.2.1';
const STATIC_CACHE = 'carambola-static-v1.2.1';
const DYNAMIC_CACHE = 'carambola-dynamic-v1.2.1';

// Core assets that must be cached (exclude external fonts that cause CORS issues)
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/course.html',
    '/pricing.html',
    '/accommodations.html',
    '/st-croix.html',
    '/contact.html',
    '/status.html',
    '/styles.css',
    '/status.css',
    '/script.js',
    '/status-page.js',
    '/manifest.json',
    '/favicon.ico',
    '/offline.html'
];

// Key images for core functionality
const KEY_IMAGES = [
    '/images/carambola-golf-clubhouse.webp',
    '/images/carambola-golf-hole-1.webp',
    '/images/carambola-golf-hole-12.webp',
    '/images/carambola-golf-hole-18.webp'
];

// External resources (handle carefully due to CORS)
const EXTERNAL_RESOURCES = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
];

console.log('Service Worker: Script loaded');

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker: Installing');
    
    event.waitUntil(
        Promise.all([
            // Cache core assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching core assets');
                return cache.addAll(CORE_ASSETS).catch(error => {
                    console.warn('Service Worker: Failed to cache some core assets:', error);
                    // Try to cache individually to identify problematic assets
                    return Promise.allSettled(
                        CORE_ASSETS.map(asset => 
                            cache.add(asset).catch(err => 
                                console.warn(`Failed to cache ${asset}:`, err)
                            )
                        )
                    );
                });
            }),
            
            // Cache key images
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching key images');
                return Promise.allSettled(
                    KEY_IMAGES.map(image => 
                        cache.add(image).catch(err => 
                            console.warn(`Failed to cache image ${image}:`, err)
                        )
                    )
                );
            }),
            
            // Cache external resources (with error handling)
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching external resources');
                return Promise.allSettled(
                    EXTERNAL_RESOURCES.map(resource => 
                        fetch(resource, { mode: 'cors', credentials: 'omit' })
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(resource, response);
                                }
                                throw new Error(`HTTP ${response.status}`);
                            })
                            .catch(err => 
                                console.warn(`Failed to cache external resource ${resource}:`, err)
                            )
                    )
                );
            })
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            self.skipWaiting();
        }).catch(error => {
            console.error('Service Worker: Installation failed:', error);
        })
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Take control of all pages
            self.clients.claim()
        ]).then(() => {
            console.log('Service Worker: Activation complete');
        })
    );
});

// Fetch event with improved caching strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.origin === location.origin) {
        // Same-origin requests
        event.respondWith(handleSameOriginRequest(request));
    } else if (isExternalResource(url)) {
        // External resources (CDN, APIs, etc.)
        event.respondWith(handleExternalRequest(request));
    } else {
        // Other external requests (analytics, etc.)
        event.respondWith(fetch(request).catch(() => new Response('', { status: 200 })));
    }
});

// Handle same-origin requests with cache-first strategy
async function handleSameOriginRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Check static cache first
        const staticCache = await caches.open(STATIC_CACHE);
        const staticResponse = await staticCache.match(request);
        
        if (staticResponse) {
            // Update cache in background for HTML files
            if (url.pathname.endsWith('.html') || url.pathname === '/') {
                updateCacheInBackground(request, staticCache);
            }
            return staticResponse;
        }
        
        // Check dynamic cache
        const dynamicCache = await caches.open(DYNAMIC_CACHE);
        const dynamicResponse = await dynamicCache.match(request);
        
        if (dynamicResponse) {
            return dynamicResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const responseClone = networkResponse.clone();
            
            if (shouldCache(url)) {
                if (isStaticAsset(url)) {
                    staticCache.put(request, responseClone);
                } else {
                    dynamicCache.put(request, responseClone);
                }
            }
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn('Service Worker: Fetch failed for', request.url, error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineResponse = await caches.match('/offline.html');
            return offlineResponse || new Response('Offline', { 
                status: 503, 
                statusText: 'Service Unavailable' 
            });
        }
        
        // Return empty response for other requests
        return new Response('', { status: 200 });
    }
}

// Handle external requests with network-first strategy
async function handleExternalRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request, {
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('Failed to cache external resource:', err);
            });
        }
        
        return networkResponse;
        
    } catch (error) {
        // Try cache if network fails
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return empty response if both network and cache fail
        console.warn('Service Worker: External resource unavailable:', request.url);
        return new Response('', { status: 200 });
    }
}

// Update cache in background
async function updateCacheInBackground(request, cache) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
    } catch (error) {
        console.warn('Background cache update failed:', error);
    }
}

// Helper functions
function isExternalResource(url) {
    return url.hostname === 'cdnjs.cloudflare.com' ||
           url.hostname === 'fonts.googleapis.com' ||
           url.hostname === 'fonts.gstatic.com' ||
           url.hostname === 'www.googletagmanager.com' ||
           url.hostname === 'www.google-analytics.com';
}

function isStaticAsset(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.pathname.includes(ext));
}

function shouldCache(url) {
    // Don't cache analytics or tracking requests
    if (url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('googletagmanager.com') ||
        url.hostname.includes('doubleclick.net')) {
        return false;
    }
    
    // Don't cache API requests that change frequently
    if (url.pathname.includes('/api/') && !url.pathname.includes('/api/static/')) {
        return false;
    }
    
    return true;
}

// Handle background sync
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle any background sync tasks
            console.log('Service Worker: Background sync triggered')
        );
    }
});

// Handle push notifications
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'New update available',
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            data: data.data || {}
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Carambola Golf Club', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// Error handling
self.addEventListener('error', error => {
    console.error('Service Worker: Global error:', error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

console.log('Service Worker: Registered event handlers');
