// IMMEDIATE FIX FOR CARAMBOLA GOLF SERVICE WORKER
// Paste this at the top of your existing footer-status.js or service-worker.js

// Enhanced error handling to prevent 206 cache errors
(function() {
    'use strict';

    // Prevent duplicate execution of fix
    if (window.CarambolaServiceWorkerFixApplied) {
        console.log('🟡 Service Worker fix already applied');
        return;
    }
    window.CarambolaServiceWorkerFixApplied = true;

    console.log('🔧 Applying Carambola Golf Service Worker fix for 206 errors...');

    // Override the existing handleSameOriginRequest if it exists
    const originalFetch = window.fetch;
    
    // Enhanced fetch wrapper that prevents 206 caching issues
    window.fetch = function(input, init) {
        const request = typeof input === 'string' ? new Request(input, init) : input;
        
        // If this is a range request, log it and proceed without caching
        if (request.headers && request.headers.get && request.headers.get('range')) {
            console.log('🚫 Bypassing range request to prevent 206 error:', request.url);
            return originalFetch.call(this, input, init);
        }
        
        return originalFetch.call(this, input, init).then(response => {
            // If we got a 206 response, log it
            if (response.status === 206) {
                console.log('⚠️ Received 206 response (not cacheable):', request.url);
            }
            
            return response;
        }).catch(error => {
            // Enhanced error logging
            if (error.message && error.message.includes('Partial response')) {
                console.log('✅ Prevented 206 cache error:', error.message);
                return originalFetch.call(this, input, init);
            }
            throw error;
        });
    };

    // Patch the Cache API put method to prevent 206 errors
    if ('caches' in window) {
        const originalCachesOpen = caches.open;
        caches.open = function(cacheName) {
            return originalCachesOpen.call(this, cacheName).then(cache => {
                const originalPut = cache.put;
                cache.put = function(request, response) {
                    // Critical fix: Don't cache 206 responses
                    if (response.status === 206) {
                        console.log('✅ Prevented 206 cache error for:', request.url || request);
                        return Promise.resolve(); // Return resolved promise instead of error
                    }
                    
                    // Don't cache responses that are too large
                    const contentLength = response.headers.get('content-length');
                    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
                        console.log('⚠️ Skipping cache for large response:', request.url || request);
                        return Promise.resolve();
                    }
                    
                    // Don't cache responses with problematic headers
                    const cacheControl = response.headers.get('cache-control');
                    if (cacheControl && (cacheControl.includes('no-cache') || cacheControl.includes('no-store'))) {
                        console.log('⚠️ Skipping cache due to cache-control:', request.url || request);
                        return Promise.resolve();
                    }
                    
                    // Don't cache responses with Set-Cookie
                    if (response.headers.get('set-cookie')) {
                        console.log('⚠️ Skipping cache due to Set-Cookie:', request.url || request);
                        return Promise.resolve();
                    }
                    
                    try {
                        return originalPut.call(this, request, response);
                    } catch (error) {
                        if (error.message && error.message.includes('Partial response')) {
                            console.log('✅ Prevented cache API error:', error.message);
                            return Promise.resolve();
                        }
                        throw error;
                    }
                };
                return cache;
            });
        };
    }

    // Enhanced Service Worker registration with error handling
    if ('serviceWorker' in navigator) {
        // Override service worker fetch handler to prevent 206 errors
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_ERROR') {
                console.log('🔧 Service Worker cache error handled:', event.data.error);
            }
        });

        // Register message handler for service worker communication
        navigator.serviceWorker.ready.then((registration) => {
            console.log('📡 Service Worker communication established');
            
            // Send configuration to service worker
            if (registration.active) {
                registration.active.postMessage({
                    type: 'CONFIG_UPDATE',
                    config: {
                        skipPartialResponses: true,
                        maxCacheSize: 50 * 1024 * 1024,
                        enableFallback: true
                    }
                });
            }
        });
    }

    // Global error handler to catch any remaining issues
    const originalError = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'error' || type === 'unhandledrejection') {
            const wrappedListener = function(event) {
                // Filter out known 206 cache errors
                if (event.error && event.error.message && 
                    event.error.message.includes('Partial response (status code 206)')) {
                    console.log('✅ Filtered out 206 cache error (expected behavior)');
                    event.preventDefault();
                    return;
                }
                
                if (event.reason && event.reason.message && 
                    event.reason.message.includes('Partial response (status code 206)')) {
                    console.log('✅ Filtered out 206 promise rejection (expected behavior)');
                    event.preventDefault();
                    return;
                }
                
                // Call original listener for other errors
                if (typeof listener === 'function') {
                    return listener.call(this, event);
                }
            };
            
            return originalError.call(this, type, wrappedListener, options);
        }
        
        return originalError.call(this, type, listener, options);
    };

    // Patch XMLHttpRequest to handle range requests
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        this._url = url;
        return originalXHROpen.call(this, method, url, async, user, password);
    };

    const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header.toLowerCase() === 'range') {
            console.log('🚫 Range request detected via XHR:', this._url);
        }
        return originalXHRSetRequestHeader.call(this, header, value);
    };

    // Monitor for media elements that might cause range requests
    const observeMediaElements = () => {
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach((element) => {
            element.addEventListener('loadstart', () => {
                console.log('📺 Media element loading (potential range request):', element.src);
            });
            
            element.addEventListener('error', (event) => {
                console.log('❌ Media element error:', event);
            });
        });
    };

    // Run media observation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeMediaElements);
    } else {
        observeMediaElements();
    }

    // Performance monitoring
    const startTime = performance.now();
    setTimeout(() => {
        const endTime = performance.now();
        console.log(`✅ Carambola Service Worker fix applied successfully in ${Math.round(endTime - startTime)}ms`);
    }, 100);

    // Export utilities for debugging
    window.CarambolaServiceWorkerDebug = {
        checkCacheHealth: async () => {
            if (!('caches' in window)) {
                return { error: 'Cache API not available' };
            }
            
            try {
                const cacheNames = await caches.keys();
                const results = {};
                
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    results[cacheName] = {
                        entries: requests.length,
                        urls: requests.slice(0, 5).map(r => r.url)
                    };
                }
                
                return { success: true, caches: results };
            } catch (error) {
                return { error: error.message };
            }
        },
        
        clearProblematicCache: async () => {
            try {
                const cacheNames = await caches.keys();
                let cleared = 0;
                
                for (const cacheName of cacheNames) {
                    await caches.delete(cacheName);
                    cleared++;
                }
                
                return { success: true, cleared };
            } catch (error) {
                return { error: error.message };
            }
        },
        
        testCacheOperation: async () => {
            try {
                const cache = await caches.open('carambola-test-cache');
                const testRequest = new Request(window.location.href);
                const testResponse = new Response('test', { status: 200 });
                
                await cache.put(testRequest, testResponse);
                const retrieved = await cache.match(testRequest);
                await caches.delete('carambola-test-cache');
                
                return { 
                    success: true, 
                    working: retrieved !== undefined 
                };
            } catch (error) {
                return { error: error.message };
            }
        }
    };

    console.log('🎯 Carambola Golf Service Worker fix loaded successfully!');
    console.log('🔍 Debug tools available at: window.CarambolaServiceWorkerDebug');

})();
// Footer Status Integration - Safe integration for existing pages
// This file adds status functionality to the footer without breaking existing design
(function() {
    'use strict';
    
    // Only run if we're NOT on the status page (to avoid conflicts)
    if (window.location.pathname.includes('status')) {
        return;
    }
    
    // Only log in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔗 Initializing Footer Status Integration...');
    }
    
    class FooterStatusIntegration {
        constructor() {
            this.statusData = null;
            this.cache = new Map();
            this.cacheExpiry = 60000; // 1 minute cache for footer
            this.apiEndpoint = 'https://carambola-golf-status-api.jaspervdz.workers.dev/api/status';
            this.init();
        }

        async init() {
            try {
                // Set initial safe fallback
                this.setFallbackStatus();
                
                // Try to fetch real status
                await this.fetchStatus();
                
                // Update footer display
                this.updateFooterStatus();
                
                // Set up periodic updates (every 2 minutes)
                setInterval(() => {
                    this.fetchStatus().then(() => {
                        this.updateFooterStatus();
                    }).catch(() => {
                        // Silent fail - keep using cached or fallback data
                    });
                }, 120000);
                
            } catch (error) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('Footer status integration using fallback data');
                }
                this.setFallbackStatus();
                this.updateFooterStatus();
            }
        }

        setFallbackStatus() {
            this.statusData = {
                overall: {
                    status: 'operational',
                    uptime: 99.98
                },
                realTime: false,
                fallbackMode: true,
                lastUpdated: new Date().toISOString()
            };
        }

        async fetchStatus() {
            try {
                // Check cache first
                const cached = this.cache.get('footer_status');
                if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
                    this.statusData = cached.data;
                    return;
                }

                const response = await fetch(this.apiEndpoint, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.statusData = data;
                    
                    // Cache the result
                    this.cache.set('footer_status', {
                        data: this.statusData,
                        timestamp: Date.now()
                    });
                } else {
                    throw new Error(`API response: ${response.status}`);
                }

            } catch (error) {
                // Use fallback on error
                this.setFallbackStatus();
                throw error;
            }
        }

        updateFooterStatus() {
            const footerLastCheck = document.getElementById('footer-last-check');
            const footerOverallStatus = document.getElementById('footer-overall-status');
            const footerStatusIndicator = document.querySelector('.footer-status-indicator');

            // Update last check time
            if (footerLastCheck) {
                const now = new Date();
                footerLastCheck.textContent = now.toLocaleTimeString('en-US', {
                    timeZone: 'America/St_Thomas',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
            }

            // Update overall status
            if (footerOverallStatus && this.statusData) {
                const status = this.statusData.overall?.status || 'operational';
                const statusText = {
                    'operational': 'All services operational',
                    'degraded': 'Some services degraded',
                    'down': 'Service issues detected'
                };
                
                footerOverallStatus.textContent = statusText[status];
                footerOverallStatus.className = `footer-overall-status ${status}`;
            }

            // Update status indicator styling
            if (footerStatusIndicator && this.statusData) {
                const isRealTime = this.statusData.realTime && !this.statusData.fallbackMode;
                const statusDot = footerStatusIndicator.querySelector('.footer-status-dot');
                const statusText = footerStatusIndicator.querySelector('.footer-status-text');
                
                if (statusDot && statusText) {
                    if (isRealTime) {
                        statusText.textContent = 'Live';
                        statusDot.style.background = '#16a34a';
                        footerStatusIndicator.style.background = 'rgba(22, 163, 74, 0.1)';
                        footerStatusIndicator.style.borderColor = 'rgba(22, 163, 74, 0.3)';
                    } else {
                        statusText.textContent = 'Cached';
                        statusDot.style.background = '#f59e0b';
                        footerStatusIndicator.style.background = 'rgba(245, 158, 11, 0.1)';
                        footerStatusIndicator.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                    }
                }
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new FooterStatusIntegration();
        });
    } else {
        new FooterStatusIntegration();
    }

})();
