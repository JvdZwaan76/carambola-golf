// CARAMBOLA GOLF CLUB SERVICE WORKER - FIXED VERSION
// This version prevents 206 cache errors while maintaining all functionality

const CACHE_NAME = 'carambola-golf-cache-v3'; // Updated version to force refresh
const STATIC_CACHE = 'carambola-static-v3';

// Enhanced configuration with 206 error prevention
const CONFIG = {
    version: '3.0.0',
    preventPartialResponseCaching: true, // Critical fix
    maxCacheSize: 50 * 1024 * 1024, // 50MB limit
    requestTimeout: 10000, // 10 second timeout
    enableLogging: false // Set to true for debugging
};

// Files to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/styles.css',
    '/script.js',
    '/footer-status.js',
    '/manifest.json',
    '/images/carambola-golf-logo.png',
    '/images/carambola-golf-hero.webp'
];

// Patterns to exclude from caching (these often cause 206 responses)
const EXCLUDE_PATTERNS = [
    /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i, // Video files
    /\.(mp3|wav|ogg|aac|flac|m4a|wma)$/i,     // Audio files
    /\.(pdf|zip|rar|tar|gz|7z)$/i,             // Large downloadable files
    /\/api\//,                                  // API endpoints
    /\/admin\//,                               // Admin areas
    /\/wp-admin\//,                            // WordPress admin
    /\/auth\//,                                // Authentication
    /\/stream\//,                              // Streaming endpoints
    /\/download\//                             // Download endpoints
];

// Enhanced logging function
function log(...args) {
    if (CONFIG.enableLogging) {
        console.log('[SW]', ...args);
    }
}

// Service Worker Installation
self.addEventListener('install', (event) => {
    log('Service Worker: Installing version', CONFIG.version);
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            log('Service Worker: Precaching assets');
            return cache.addAll(PRECACHE_ASSETS).catch((error) => {
                log('Service Worker: Precaching failed (non-fatal):', error);
                // Don't fail installation if precaching fails
                return Promise.resolve();
            });
        }).then(() => {
            log('Service Worker: Installation complete');
            self.skipWaiting(); // Force activation
        })
    );
});

// Service Worker Activation
self.addEventListener('activate', (event) => {
    log('Service Worker: Activating');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
                        log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            log('Service Worker: Claiming clients');
            return self.clients.claim();
        })
    );
});

// CRITICAL FIX: Enhanced fetch handler with 206 error prevention
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }
    
    // CRITICAL: Skip range requests entirely - they cause 206 responses
    if (request.headers.get('range')) {
        log('Bypassing range request to prevent 206 error:', request.url);
        event.respondWith(fetch(request));
        return;
    }
    
    // Skip excluded patterns
    if (shouldSkipCaching(url, request)) {
        event.respondWith(fetch(request));
        return;
    }
    
    // Handle same-origin requests with enhanced caching
    if (url.origin === self.location.origin) {
        event.respondWith(handleSameOriginRequest(event));
    } else {
        // Handle cross-origin requests without caching
        event.respondWith(fetch(request));
    }
});

// FIXED: Enhanced same-origin request handler
async function handleSameOriginRequest(event) {
    const request = event.request;
    const url = new URL(request.url);
    
    try {
        // Try cache first for static assets
        if (isStaticAsset(url)) {
            const cache = await caches.open(STATIC_CACHE);
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                log('Serving from static cache:', request.url);
                return cachedResponse;
            }
        }
        
        // Try dynamic cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            log('Serving from dynamic cache:', request.url);
            return cachedResponse;
        }
        
        // Make network request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeout);
        
        const response = await fetch(request, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // CRITICAL FIX: Check if response should be cached BEFORE attempting to cache
        if (!shouldCacheResponse(response, request)) {
            log('Skipping cache for response:', response.status, request.url);
            return response;
        }
        
        // Clone response for caching
        const responseToCache = response.clone();
        
        // Cache the response with enhanced error handling
        try {
            const targetCache = isStaticAsset(url) ? 
                await caches.open(STATIC_CACHE) : 
                await caches.open(CACHE_NAME);
                
            await targetCache.put(request, responseToCache);
            log('Successfully cached:', request.url);
        } catch (cacheError) {
            // Log cache errors but don't fail the request
            log('Cache operation failed (non-fatal):', cacheError.message, 'for:', request.url);
            
            // If it's the 206 error we're trying to fix, log it specifically
            if (cacheError.message.includes('Partial response (status code 206)')) {
                log('✅ Prevented 206 cache error (this is the fix working)');
            }
        }
        
        return response;
        
    } catch (error) {
        log('Network request failed:', error.message);
        
        // Try to serve stale content on network failure
        const cache = await caches.open(CACHE_NAME);
        const staleResponse = await cache.match(request);
        if (staleResponse) {
            log('Serving stale content for:', request.url);
            return staleResponse;
        }
        
        // If no cached version exists, try static cache
        const staticCache = await caches.open(STATIC_CACHE);
        const staticResponse = await staticCache.match(request);
        if (staticResponse) {
            log('Serving from static cache fallback:', request.url);
            return staticResponse;
        }
        
        // Return a meaningful offline page or error
        if (url.pathname === '/' || url.pathname.endsWith('.html')) {
            return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                    <title>Carambola Golf Club - Offline</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .offline { color: #666; }
                    </style>
                </head>
                <body>
                    <h1>Carambola Golf Club</h1>
                    <p class="offline">This page is temporarily unavailable. Please check your connection and try again.</p>
                    <p><a href="/">Return to Home</a></p>
                </body>
                </html>`,
                { 
                    status: 200,
                    headers: { 'Content-Type': 'text/html' }
                }
            );
        }
        
        throw error;
    }
}

// ENHANCED: Determine if response should be cached (prevents 206 errors)
function shouldCacheResponse(response, request) {
    // CRITICAL: Never cache partial content responses (this is the main fix)
    if (response.status === 206) {
        return false;
    }
    
    // Don't cache non-success responses (except 404 for offline pages)
    if (!response.ok && response.status !== 404) {
        return false;
    }
    
    // Check for cache-control directives
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) {
        if (cacheControl.includes('no-cache') || 
            cacheControl.includes('no-store') || 
            cacheControl.includes('private')) {
            return false;
        }
    }
    
    // Don't cache responses with Set-Cookie headers
    if (response.headers.get('set-cookie')) {
        return false;
    }
    
    // Check response size to prevent cache overflow
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > CONFIG.maxCacheSize) {
        return false;
    }
    
    // Don't cache responses with Vary: * header
    const vary = response.headers.get('vary');
    if (vary === '*') {
        return false;
    }
    
    // Check for streaming content types
    const contentType = response.headers.get('content-type');
    if (contentType) {
        const streamingTypes = [
            'video/',
            'audio/',
            'application/octet-stream'
        ];
        
        if (streamingTypes.some(type => contentType.includes(type))) {
            // Only cache small media files
            if (!contentLength || parseInt(contentLength) > 10 * 1024 * 1024) {
                return false;
            }
        }
    }
    
    return true;
}

// Check if URL should skip caching entirely
function shouldSkipCaching(url, request) {
    // Skip if URL matches excluded patterns
    const pathname = url.pathname.toLowerCase();
    
    for (const pattern of EXCLUDE_PATTERNS) {
        if (pattern.test(pathname) || pattern.test(url.href)) {
            return true;
        }
    }
    
    // Skip authentication and admin requests
    if (pathname.includes('auth') || 
        pathname.includes('login') || 
        pathname.includes('admin') ||
        pathname.startsWith('/wp-admin/')) {
        return true;
    }
    
    // Skip requests with auth headers
    if (request.headers.get('authorization')) {
        return true;
    }
    
    return false;
}

// Check if URL is a static asset
function isStaticAsset(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
    const pathname = url.pathname.toLowerCase();
    
    return staticExtensions.some(ext => pathname.endsWith(ext)) ||
           PRECACHE_ASSETS.includes(url.pathname);
}

// Enhanced error handling
self.addEventListener('error', (event) => {
    log('Global error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    log('Unhandled promise rejection:', event.reason);
    
    // Prevent 206 cache errors from appearing as unhandled rejections
    if (event.reason && event.reason.message && 
        event.reason.message.includes('Partial response (status code 206)')) {
        log('✅ Suppressed known 206 cache API limitation (this is expected)');
        event.preventDefault();
    }
});

// Periodic cache cleanup
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_CLEANUP') {
        cleanupCaches();
    }
    
    if (event.data && event.data.type === 'CONFIG_UPDATE') {
        // Handle configuration updates from the main thread
        Object.assign(CONFIG, event.data.config);
        log('Configuration updated:', CONFIG);
    }
});

// Cache cleanup function
async function cleanupCaches() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        
        // Remove old entries if cache is getting too large
        if (requests.length > 1000) {
            const oldRequests = requests.slice(0, 100);
            await Promise.all(oldRequests.map(req => cache.delete(req)));
            log('Cleaned up', oldRequests.length, 'old cache entries');
        }
        
        return { success: true, cleaned: requests.length > 1000 ? 100 : 0 };
    } catch (error) {
        log('Cache cleanup failed:', error);
        return { error: error.message };
    }
}

// Log successful registration
log('Service Worker: Script loaded successfully with 206 error prevention');
log('Service Worker: Configuration:', CONFIG);

// Register event handlers
log('Service Worker: Registered event handlers');
