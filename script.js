// Carambola Golf Club JavaScript - PERFORMANCE OPTIMIZED VERSION
// Enhanced with CSP-compliant optimizations and faster loading
(function() {
    'use strict';

    // Prevent duplicate execution
    if (window.CarambolaGolfInitialized) {
        console.log('Main script already initialized, skipping duplicate execution');
        return;
    }
    window.CarambolaGolfInitialized = true;

    // PERFORMANCE OPTIMIZATION: Enhanced preloader with actual resource tracking
    class PreloaderManager {
        constructor() {
            this.preloader = document.getElementById('preloader');
            this.progress = document.querySelector('.loading-progress');
            this.loadingSteps = [];
            this.completedSteps = 0;
            this.minimumShowTime = window.innerWidth <= 768 ? 600 : 800; // REDUCED
            this.maximumShowTime = window.innerWidth <= 768 ? 2000 : 3000; // REDUCED
            this.startTime = performance.now();
            this.forceHideTimer = null;
            
            // FIXED: Track actual resource loading
            this.criticalResourcesLoaded = false;
            this.setupCriticalResourceTracking();
        }

        setupCriticalResourceTracking() {
            const criticalResources = [
                '/styles.css',
                '/script.js',
                '/images/carambola-golf-clubhouse.webp'
            ];

            let loadedCount = 0;
            const totalCount = criticalResources.length;

            // Check DOM ready state
            if (document.readyState === 'complete') {
                this.criticalResourcesLoaded = true;
                this.checkComplete();
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    this.criticalResourcesLoaded = true;
                    this.checkComplete();
                });
            }

            // Also listen for window load
            if (document.readyState === 'complete') {
                loadedCount = totalCount;
            } else {
                window.addEventListener('load', () => {
                    loadedCount = totalCount;
                    this.updateProgress(1);
                    this.criticalResourcesLoaded = true;
                    this.checkComplete();
                });
            }
        }

        addStep(name) {
            this.loadingSteps.push(name);
        }

        completeStep(name) {
            this.completedSteps++;
            this.updateProgress();
            
            if (this.completedSteps >= this.loadingSteps.length && this.criticalResourcesLoaded) {
                this.checkComplete();
            }
        }

        updateProgress(override = null) {
            if (this.progress) {
                const percentage = override !== null ? override * 100 : 
                                 (this.completedSteps / Math.max(this.loadingSteps.length, 1)) * 100;
                this.progress.style.width = `${Math.min(percentage, 100)}%`;
            }
        }

        async checkComplete() {
            const elapsedTime = performance.now() - this.startTime;
            const remainingTime = Math.max(0, this.minimumShowTime - elapsedTime);
            
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }
            
            this.hide();
        }

        hide() {
            if (this.forceHideTimer) {
                clearTimeout(this.forceHideTimer);
            }
            
            if (this.preloader) {
                this.preloader.classList.add('hidden');
                
                setTimeout(() => {
                    if (this.preloader && this.preloader.parentNode) {
                        this.preloader.parentNode.removeChild(this.preloader);
                    }
                }, 300);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'preloader_complete', {
                        'event_category': 'performance',
                        'value': Math.round(performance.now() - this.startTime),
                        'non_interaction': true
                    });
                }
            }
        }

        init() {
            this.forceHideTimer = setTimeout(() => {
                this.hide();
            }, this.maximumShowTime);
        }
    }

    // PERFORMANCE OPTIMIZATION: Enhanced image optimization
    class ImageOptimizer {
        constructor() {
            this.lazyImages = document.querySelectorAll('img[data-src]');
            this.imageObserver = null;
            this.loadedImages = new Set();
            this.init();
        }

        init() {
            if ('IntersectionObserver' in window) {
                this.imageObserver = new IntersectionObserver(this.handleIntersection.bind(this), {
                    root: null,
                    rootMargin: '100px', // Increased for faster loading
                    threshold: 0.01 // Reduced for earlier loading
                });

                this.lazyImages.forEach(img => this.imageObserver.observe(img));
            } else {
                this.loadAllImages();
            }
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.loadedImages.has(entry.target)) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                    this.loadedImages.add(entry.target);
                }
            });
        }

        loadImage(img) {
            return new Promise((resolve) => {
                const newImg = new Image();
                newImg.onload = () => {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                    resolve();
                };
                newImg.onerror = () => {
                    // Better error handling with fallback
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=';
                    img.classList.add('loaded', 'error');
                    resolve();
                };
                newImg.src = img.dataset.src;
            });
        }

        loadAllImages() {
            this.lazyImages.forEach(img => this.loadImage(img));
        }
    }

    // PERFORMANCE OPTIMIZATION: Resource usage tracking
    class ResourceUsageTracker {
        constructor() {
            this.preloadedResources = new Map();
            this.usageTimeout = 3000;
            this.init();
        }

        init() {
            document.querySelectorAll('link[rel="preload"]').forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    this.preloadedResources.set(href, {
                        element: link,
                        loaded: false,
                        used: false,
                        timestamp: Date.now()
                    });
                }
            });

            this.markCriticalResourcesAsUsed();
            this.detectResourceUsage();
        }

        markCriticalResourcesAsUsed() {
            const criticalResources = ['/styles.css', '/script.js'];
            
            criticalResources.forEach(resource => {
                const resourceData = this.preloadedResources.get(resource);
                if (resourceData) {
                    resourceData.used = true;
                    if (resource.endsWith('.css')) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = resource;
                        link.crossOrigin = 'anonymous';
                        document.head.appendChild(link);
                    }
                }
            });
        }

        detectResourceUsage() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                                this.markResourceAsUsed(node.href);
                            }
                            if (node.tagName === 'SCRIPT' && node.src) {
                                this.markResourceAsUsed(node.src);
                            }
                        }
                    });
                });
            });

            observer.observe(document.head, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                this.preloadedResources.forEach((data, href) => {
                    if (!data.used) {
                        this.markResourceAsUsed(href);
                    }
                });
            }, 1000);
        }

        markResourceAsUsed(href) {
            const resourceData = this.preloadedResources.get(href);
            if (resourceData && !resourceData.used) {
                resourceData.used = true;
                resourceData.element.setAttribute('data-used', 'true');
            }
        }
    }

    // Performance optimization utilities
    const supportsPassive = (() => {
        let supportsPassive = false;
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get() {
                    supportsPassive = true;
                }
            });
            window.addEventListener('test', null, opts);
        } catch (e) {}
        return supportsPassive;
    })();

    const passiveIfSupported = supportsPassive ? { passive: true } : false;

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Performance metrics tracking
    const performanceMetrics = {
        startTime: performance.now(),
        marks: {},
        
        mark(name) {
            this.marks[name] = performance.now();
            if (typeof gtag !== 'undefined') {
                gtag('event', 'performance_mark', {
                    'event_category': 'performance',
                    'event_label': name,
                    'value': Math.round(this.marks[name] - this.startTime),
                    'non_interaction': true
                });
            }
        }
    };

    // ENHANCED Service Worker Registration with better error handling
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Unregister existing service workers first to prevent conflicts
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }

                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });
                
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Service Worker updated');
                        }
                    });
                });

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_worker_registered', {
                        'event_category': 'pwa',
                        'event_label': 'success',
                        'non_interaction': true
                    });
                }

                return true;

            } catch (error) {
                console.warn('ServiceWorker registration failed:', error);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_worker_error', {
                        'event_category': 'pwa',
                        'event_label': error.message,
                        'non_interaction': true
                    });
                }
                return false;
            }
        }
        return false;
    }

    // TRUE POSTER-FIRST VIDEO HERO MANAGER - UNCHANGED BUT OPTIMIZED
    class HeroVideoManager {
        constructor() {
            this.video = null;
            this.poster = null;
            this.playButton = null;
            this.loadingIndicator = null;
            this.videoLoaded = false;
            this.isPlaying = false;
            this.userInteracted = false;
            this.initAttempts = 0;
            this.maxInitAttempts = 10;
            
            this.tryInit();
        }
        
        tryInit() {
            this.initAttempts++;
            
            this.video = document.querySelector('.hero-video');
            this.poster = document.querySelector('.hero-poster');
            this.playButton = document.querySelector('.hero-play-button');
            this.loadingIndicator = document.querySelector('.hero-video-loading');
            
            if (this.video && this.playButton && this.poster) {
                this.init();
                return;
            }
            
            if (this.initAttempts < this.maxInitAttempts) {
                setTimeout(() => this.tryInit(), 200);
                return;
            }
            
            console.warn('Hero video initialization failed - required elements not found after max attempts');
        }
        
        init() {
            try {
                this.enforceNoAutoLoad();
                
                this.playButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handlePlayClick();
                }, { once: false });
                
                this.video.addEventListener('canplay', () => this.onVideoReady());
                this.video.addEventListener('canplaythrough', () => this.onVideoReadyToPlay());
                this.video.addEventListener('error', (e) => this.onVideoError(e));
                this.video.addEventListener('ended', () => this.onVideoEnded());
                this.video.addEventListener('play', () => this.onVideoPlay());
                this.video.addEventListener('pause', () => this.onVideoPause());
                
                this.video.addEventListener('loadstart', (e) => {
                    if (!this.userInteracted) {
                        console.warn('Video attempted to load without user interaction - preventing');
                        this.video.pause();
                        this.video.currentTime = 0;
                    }
                });
                
                this.playButton.addEventListener('click', () => {
                    if (typeof trackUserEngagement === 'function') {
                        trackUserEngagement('video_play_click', 'hero_video');
                    }
                });

                this.enhancePlayButton();
                this.ensureProperLayering();
                
            } catch (error) {
                console.error('Error initializing hero video manager:', error);
            }
        }
        
        enforceNoAutoLoad() {
            this.video.preload = 'none';
            this.video.setAttribute('preload', 'none');
            
            if (this.video.src) {
                this.video.removeAttribute('src');
            }
            
            const sources = this.video.querySelectorAll('source');
            sources.forEach(source => {
                if (source.src && source.hasAttribute('data-src')) {
                    source.removeAttribute('src');
                }
            });
            
            this.video.pause();
        }
        
        ensureProperLayering() {
            this.poster.style.zIndex = '1';
            this.video.style.zIndex = '2';
            this.playButton.style.zIndex = '10';
            
            if (this.loadingIndicator) {
                this.loadingIndicator.style.zIndex = '11';
            }
            
            this.playButton.style.position = 'absolute';
            this.playButton.style.pointerEvents = 'all';
            this.playButton.style.cursor = 'pointer';
            
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.zIndex = '5';
                heroContent.style.pointerEvents = 'none';
                
                const ctaButtons = heroContent.querySelectorAll('.cta-button, a, button');
                ctaButtons.forEach(btn => {
                    btn.style.pointerEvents = 'all';
                });
            }
        }

        enhancePlayButton() {
            this.playButton.style.display = 'flex';
            this.playButton.style.alignItems = 'center';
            this.playButton.style.justifyContent = 'center';
            this.playButton.style.opacity = '1';
            this.playButton.style.visibility = 'visible';
            this.playButton.style.animation = 'playButtonPulse 3s ease-in-out infinite';
            
            this.playButton.addEventListener('mouseenter', () => {
                this.playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
                this.playButton.style.background = 'var(--accent-gold)';
                this.playButton.style.color = 'var(--primary-navy)';
            });
            
            this.playButton.addEventListener('mouseleave', () => {
                if (!this.isPlaying) {
                    this.playButton.style.transform = 'translate(-50%, -50%) scale(1)';
                    this.playButton.style.background = 'rgba(30, 58, 95, 0.85)';
                    this.playButton.style.color = 'white';
                }
            });
            
            this.playButton.setAttribute('tabindex', '0');
            this.playButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handlePlayClick();
                }
            });
        }
        
        async handlePlayClick() {
            this.userInteracted = true;
            
            if (this.isPlaying) {
                this.pauseVideo();
                return;
            }
            
            try {
                this.showLoading();
                
                if (!this.videoLoaded) {
                    await this.loadVideo();
                }

                await this.playVideo();
                
            } catch (error) {
                console.error('Error playing video:', error);
                this.onVideoError(error);
            }
        }
        
        async loadVideo() {
            return new Promise((resolve, reject) => {
                const source = this.video.querySelector('source[data-src]');
                if (!source) {
                    reject(new Error('Video source not found'));
                    return;
                }
                
                if (!source.src) {
                    source.src = source.getAttribute('data-src');
                    this.video.load();
                }
                
                const onCanPlay = () => {
                    this.video.removeEventListener('canplay', onCanPlay);
                    this.video.removeEventListener('error', onError);
                    this.videoLoaded = true;
                    resolve();
                };
                
                const onError = (e) => {
                    this.video.removeEventListener('canplay', onCanPlay);
                    this.video.removeEventListener('error', onError);
                    reject(new Error('Video failed to load'));
                };
                
                if (this.video.readyState >= 3) {
                    this.videoLoaded = true;
                    resolve();
                } else {
                    this.video.addEventListener('canplay', onCanPlay);
                    this.video.addEventListener('error', onError);
                }
            });
        }

        async playVideo() {
            try {
                this.video.muted = false;
                await this.video.play();
                this.isPlaying = true;
                
                this.video.classList.add('playing');
                this.poster.classList.add('hidden');
                this.playButton.classList.add('hidden');
                this.hideLoading();
                
                this.video.style.cursor = 'pointer';
                this.video.addEventListener('click', () => this.toggleVideoPlayback());
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'hero_video_play', {
                        'event_category': 'media',
                        'event_label': 'user_initiated',
                        'value': 1
                    });
                }
                
            } catch (error) {
                console.error('Error starting video playback:', error);
                throw error;
            }
        }

        pauseVideo() {
            this.video.pause();
            this.isPlaying = false;
            
            this.playButton.classList.remove('hidden');
            this.playButton.style.background = 'rgba(30, 58, 95, 0.85)';
            this.playButton.style.color = 'white';
            
            const icon = this.playButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        }

        toggleVideoPlayback() {
            if (this.isPlaying) {
                this.pauseVideo();
            } else {
                this.video.play().catch(console.error);
            }
        }

        onVideoPlay() {
            this.isPlaying = true;
            
            const icon = this.playButton.querySelector('i');
            if (icon && !this.playButton.classList.contains('hidden')) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            }
        }

        onVideoPause() {
            this.isPlaying = false;
            
            const icon = this.playButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        }
        
        showLoading() {
            if (this.loadingIndicator) {
                this.loadingIndicator.classList.add('visible');
            }
            this.playButton.style.opacity = '0.5';
            this.playButton.style.pointerEvents = 'none';
        }
        
        hideLoading() {
            if (this.loadingIndicator) {
                this.loadingIndicator.classList.remove('visible');
            }
            this.playButton.style.opacity = '1';
            this.playButton.style.pointerEvents = 'all';
        }
        
        onVideoReady() {
            this.hideLoading();
        }

        onVideoReadyToPlay() {
            this.hideLoading();
        }
        
        onVideoError(error) {
            console.error('Video error:', error);
            this.hideLoading();
            
            this.poster.classList.remove('hidden');
            this.video.classList.remove('playing');
            this.playButton.classList.remove('hidden');
            
            this.playButton.style.background = 'rgba(255, 107, 107, 0.8)';
            this.playButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_video_error', {
                    'event_category': 'media',
                    'event_label': 'load_failed',
                    'non_interaction': true
                });
            }
        }
        
        onVideoEnded() {
            this.video.currentTime = 0;
            if (this.isPlaying) {
                this.video.play().catch(console.error);
            }
        }
    }

    // Score Card Flip Manager - UNCHANGED
    class ScoreCardManager {
        constructor() {
            this.scoreCards = document.querySelectorAll('.score-card-flip');
            this.init();
        }

        init() {
            if (this.scoreCards.length === 0) return;

            this.setupEventListeners();
            this.setupAccessibility();
        }

        setupEventListeners() {
            this.scoreCards.forEach((card, index) => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.flip-btn')) {
                        this.handleFlipButtonClick(card, e);
                    } else {
                        this.toggleCard(card);
                    }
                    this.trackInteraction('card_click', index + 1);
                });

                this.setupTouchEvents(card, index);

                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleCard(card);
                        this.trackInteraction('keyboard_flip', index + 1);
                    }
                });

                const flipBtn = card.querySelector('.flip-btn');
                if (flipBtn) {
                    flipBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleFlipButtonClick(card, e);
                    });
                }
            });
        }

        setupTouchEvents(card, index) {
            let touchStartTime = 0;
            let touchStartX = 0;
            let touchStartY = 0;

            card.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            card.addEventListener('touchend', (e) => {
                const touchEndTime = Date.now();
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const timeDiff = touchEndTime - touchStartTime;
                const distanceX = Math.abs(touchEndX - touchStartX);
                const distanceY = Math.abs(touchEndY - touchStartY);
                
                if (timeDiff < 500 && distanceX < 50 && distanceY < 50) {
                    if (!e.target.closest('.flip-btn')) {
                        this.toggleCard(card);
                        this.trackInteraction('touch_flip', index + 1);
                    }
                }
            }, { passive: true });
        }

        setupAccessibility() {
            this.scoreCards.forEach((card) => {
                card.setAttribute('role', 'button');
                card.setAttribute('aria-label', 'Flip card to view additional information');
                
                if (!card.hasAttribute('tabindex')) {
                    card.setAttribute('tabindex', '0');
                }

                this.updateAriaLabel(card);
            });
        }

        toggleCard(card) {
            const isFlipped = card.classList.contains('flipped');
            
            card.classList.add('flipping');
            
            if (isFlipped) {
                this.flipToFront(card);
            } else {
                this.flipToBack(card);
            }

            setTimeout(() => {
                card.classList.remove('flipping');
            }, 800);

            this.updateAriaLabel(card);
        }

        flipToFront(card) {
            card.classList.remove('flipped');
            card.setAttribute('aria-expanded', 'false');
            
            const flipBtn = card.querySelector('.flip-btn i');
            if (flipBtn) {
                flipBtn.style.transform = 'rotate(0deg)';
            }
        }

        flipToBack(card) {
            card.classList.add('flipped');
            card.setAttribute('aria-expanded', 'true');
            
            const flipBtn = card.querySelector('.flip-btn i');
            if (flipBtn) {
                flipBtn.style.transform = 'rotate(180deg)';
            }
        }

        handleFlipButtonClick(card, event) {
            event.preventDefault();
            event.stopPropagation();
            
            this.toggleCard(card);
            
            const flipBtn = event.target.closest('.flip-btn');
            if (flipBtn) {
                flipBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    flipBtn.style.transform = '';
                }, 150);
            }
        }

        updateAriaLabel(card) {
            const isFlipped = card.classList.contains('flipped');
            const cardTitle = card.querySelector('.score-card-header h3')?.textContent || 'Score card';
            
            if (isFlipped) {
                card.setAttribute('aria-label', `${cardTitle} - Showing details. Click to view score card.`);
            } else {
                card.setAttribute('aria-label', `${cardTitle} - Showing score card. Click to view details.`);
            }
        }

        trackInteraction(action, cardNumber) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'scorecard_interaction', {
                    'event_category': 'scorecard',
                    'event_label': action,
                    'card_number': cardNumber,
                    'page_location': window.location.pathname
                });
            }
        }

        flipAllToFront() {
            this.scoreCards.forEach(card => {
                if (card.classList.contains('flipped')) {
                    this.flipToFront(card);
                }
            });
        }

        resetAllCards() {
            this.scoreCards.forEach(card => {
                card.classList.remove('flipped', 'flipping');
                this.updateAriaLabel(card);
            });
        }
    }

    // Enhanced offline detection
    class OfflineManager {
        constructor() {
            this.indicator = document.getElementById('offlineIndicator');
            this.isOnline = navigator.onLine;
            this.init();
        }

        init() {
            window.addEventListener('online', this.handleOnline.bind(this), passiveIfSupported);
            window.addEventListener('offline', this.handleOffline.bind(this), passiveIfSupported);
            
            if (!this.isOnline) {
                this.showOfflineIndicator();
            }
        }

        handleOnline() {
            this.isOnline = true;
            this.hideOfflineIndicator();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'connection_restored', {
                    'event_category': 'connectivity',
                    'non_interaction': true
                });
            }
        }

        handleOffline() {
            this.isOnline = false;
            this.showOfflineIndicator();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'connection_lost', {
                    'event_category': 'connectivity',
                    'non_interaction': true
                });
            }
        }

        showOfflineIndicator() {
            if (this.indicator) {
                this.indicator.style.display = 'block';
                setTimeout(() => this.indicator.classList.add('show'), 10);
            }
        }

        hideOfflineIndicator() {
            if (this.indicator) {
                this.indicator.classList.remove('show');
                setTimeout(() => this.indicator.style.display = 'none', 300);
            }
        }
    }

    // Enhanced modal functionality
    class ModalManager {
        constructor() {
            this.modal = document.getElementById('constructionModal');
            this.closeBtn = document.getElementById('closeModal');
            this.bookButtons = document.querySelectorAll('.book-tee-time, .cta-button');
            this.hasVisited = this.checkVisitHistory();
            this.init();
        }

        init() {
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', this.hide.bind(this));
            }

            if (this.modal) {
                this.modal.addEventListener('click', this.handleBackdropClick.bind(this));
            }

            document.addEventListener('keydown', this.handleKeydown.bind(this));

            this.bookButtons.forEach(button => {
                if (button.classList.contains('book-tee-time') || 
                    button.textContent.toLowerCase().includes('book') ||
                    button.href?.includes('contact')) {
                    button.addEventListener('click', this.handleBookingClick.bind(this));
                }
            });

            if (!this.hasVisited) {
                setTimeout(() => this.show(), 2000);
            }
        }

        checkVisitHistory() {
            try {
                return localStorage.getItem('carambola-visited') === 'true';
            } catch (e) {
                return false;
            }
        }

        setVisited() {
            try {
                localStorage.setItem('carambola-visited', 'true');
            } catch (e) {
                // Continue if localStorage is not available
            }
        }

        show() {
            if (this.modal) {
                this.modal.classList.add('show');
                document.body.style.overflow = 'hidden';
                this.setVisited();
                
                this.trapFocus();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'modal_shown', {
                        'event_category': 'engagement',
                        'event_label': 'construction_modal',
                        'page_location': window.location.pathname
                    });
                }
            }
        }

        hide() {
            if (this.modal) {
                this.modal.classList.remove('show');
                document.body.style.overflow = '';
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'modal_closed', {
                        'event_category': 'engagement',
                        'event_label': 'construction_modal',
                        'page_location': window.location.pathname
                    });
                }
            }
        }

        handleBackdropClick(e) {
            if (e.target === this.modal) {
                this.hide();
            }
        }

        handleKeydown(e) {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('show')) {
                this.hide();
            }
        }

        handleBookingClick(e) {
            if (e.target.classList.contains('book-tee-time') || 
                e.target.textContent.toLowerCase().includes('book') ||
                e.target.href?.includes('contact')) {
                e.preventDefault();
                this.show();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'tee_time_intent', {
                        'event_category': 'conversion',
                        'event_label': 'book_tee_time_clicked',
                        'value': 1,
                        'page_location': window.location.pathname
                    });
                }
            }
        }

        trapFocus() {
            const focusableElements = this.modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            this.modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        }
    }

    // Enhanced NavigationManager class
    class NavigationManager {
        constructor() {
            this.navbar = document.querySelector('.navbar');
            this.mobileMenuBtn = document.querySelector('.mobile-menu');
            this.navLinks = document.querySelector('.nav-links');
            this.lastScrollY = window.scrollY;
            this.isScrolling = false;
            this.mobileMenuOpen = false;
            this.init();
        }

        init() {
            if (this.mobileMenuBtn && this.navLinks && !window.CarambolaBlogInitialized) {
                this.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
                this.navLinks.addEventListener('click', this.handleLinkClick.bind(this));
                this.setupMobileMenuEnhancements();
            }

            window.addEventListener('scroll', throttle(this.handleScroll.bind(this), 16), passiveIfSupported);
            this.setActiveNavigation();
        }

        setupMobileMenuEnhancements() {
            document.addEventListener('click', (e) => {
                if (this.mobileMenuOpen && 
                    !this.navbar.contains(e.target) && 
                    this.navLinks.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });

            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth > 768 && this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            }, 250));

            this.setupScrollLock();
        }

        setupScrollLock() {
            let scrollPosition = 0;
            
            this.lockScroll = () => {
                scrollPosition = window.pageYOffset;
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollPosition}px`;
                document.body.style.width = '100%';
            };

            this.unlockScroll = () => {
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('position');
                document.body.style.removeProperty('top');
                document.body.style.removeProperty('width');
                window.scrollTo(0, scrollPosition);
            };
        }

        toggleMobileMenu() {
            const isExpanded = this.navLinks.classList.contains('active');
            
            if (isExpanded) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }

        openMobileMenu() {
            this.navLinks.classList.add('active');
            this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
            this.mobileMenuOpen = true;

            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }

            if (window.innerWidth <= 768) {
                this.lockScroll();
            }

            if (typeof gtag !== 'undefined') {
                gtag('event', 'mobile_menu_opened', {
                    'event_category': 'navigation',
                    'event_label': 'mobile_hamburger',
                    'page_location': window.location.pathname
                });
            }
        }

        closeMobileMenu() {
            this.navLinks.classList.remove('active');
            this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            this.mobileMenuOpen = false;

            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }

            this.unlockScroll();
        }

        handleLinkClick(e) {
            if (e.target.tagName === 'A') {
                this.closeMobileMenu();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'mobile_nav_click', {
                        'event_category': 'navigation',
                        'event_label': e.target.textContent.trim(),
                        'link_url': e.target.href,
                        'page_location': window.location.pathname
                    });
                }
            }
        }

        handleScroll() {
            if (!this.isScrolling) {
                requestAnimationFrame(() => {
                    this.updateNavbarStyle();
                    this.isScrolling = false;
                });
                this.isScrolling = true;
            }
        }

        updateNavbarStyle() {
            if (this.navbar) {
                if (window.scrollY > 50) {
                    this.navbar.style.background = 'rgba(30, 58, 95, 0.98)';
                    this.navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    this.navbar.style.backdropFilter = 'blur(10px)';
                } else {
                    this.navbar.style.background = 'rgba(30, 58, 95, 0.95)';
                    this.navbar.style.boxShadow = 'none';
                    this.navbar.style.backdropFilter = 'blur(10px)';
                }
            }
        }

        setActiveNavigation() {
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.nav-links a');
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkPath = new URL(link.href).pathname;
                
                if (currentPath === linkPath || 
                    (currentPath === '/' && linkPath === '/') ||
                    (currentPath.includes(linkPath) && linkPath !== '/')) {
                    link.classList.add('active');
                }
            });
        }
    }

    // Enhanced analytics and tracking
    class AnalyticsManager {
        constructor() {
            this.maxScroll = 0;
            this.scrollDepthThresholds = [25, 50, 75, 100];
            this.scrollDepthHit = new Set();
            this.init();
        }

        init() {
            this.setupScrollTracking();
            this.setupLinkTracking();
            this.setupPerformanceTracking();
            this.trackPageView();
        }

        setupScrollTracking() {
            const updateScrollDepth = throttle(() => {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                this.maxScroll = Math.max(this.maxScroll, scrollPercent);
                
                this.scrollDepthThresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !this.scrollDepthHit.has(threshold)) {
                        this.scrollDepthHit.add(threshold);
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'scroll_depth', {
                                'event_category': 'engagement',
                                'event_label': `${threshold}%`,
                                'value': threshold,
                                'non_interaction': true,
                                'page_location': window.location.pathname
                            });
                        }
                    }
                });
            }, 250);

            window.addEventListener('scroll', updateScrollDepth, passiveIfSupported);
        }

        setupLinkTracking() {
            document.addEventListener('click', (e) => {
                const target = e.target.closest('a');
                if (target && (target.href.startsWith('http') || target.href.startsWith('mailto') || target.href.startsWith('tel'))) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'external_link_click', {
                            'event_category': 'engagement',
                            'event_label': target.href,
                            'link_text': target.textContent.trim(),
                            'transport_type': 'beacon',
                            'page_location': window.location.pathname
                        });
                    }
                }
            });
        }

        setupPerformanceTracking() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if ('performance' in window) {
                        const perfData = performance.getEntriesByType('navigation')[0];
                        if (typeof gtag !== 'undefined' && perfData) {
                            gtag('event', 'page_load_time', {
                                'event_category': 'performance',
                                'value': Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                                'non_interaction': true,
                                'page_location': window.location.pathname
                            });
                        }
                    }
                }, 0);
            });
        }

        trackPageView() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_view', {
                    'page_title': document.title,
                    'page_location': window.location.href,
                    'page_path': window.location.pathname
                });
            }
        }
    }

    // Smooth scrolling for anchor links
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const navbar = document.querySelector('.navbar');
                    const navHeight = navbar ? navbar.offsetHeight : 0;
                    const targetPosition = target.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'navigation_click', {
                            'event_category': 'engagement',
                            'event_label': this.getAttribute('href'),
                            'transport_type': 'beacon',
                            'page_location': window.location.pathname
                        });
                    }
                }
            });
        });
    }

    // ENHANCED error handling for external resources
    window.addEventListener('error', function(e) {
        if (e.target && e.target.src && e.target.src.includes('cdnjs.cloudflare.com')) {
            console.warn('External CDN resource failed to load:', e.target.src);
            
            if (e.target.src.includes('font-awesome')) {
                const fallbackCSS = document.createElement('style');
                fallbackCSS.textContent = `
                    .fas, .far, .fab, .fa {
                        display: inline-block;
                        font-style: normal;
                        font-variant: normal;
                        text-rendering: auto;
                        line-height: 1;
                    }
                    .fa-play:before { content: "▶"; }
                    .fa-pause:before { content: "⏸"; }
                    .fa-bars:before { content: "☰"; }
                    .fa-times:before { content: "✕"; }
                `;
                document.head.appendChild(fallbackCSS);
            }
        }
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'javascript_error', {
                'event_category': 'error',
                'event_label': e.message,
                'value': 1,
                'non_interaction': true
            });
        }
    }, true);

    // Main initialization - OPTIMIZED
    document.addEventListener('DOMContentLoaded', async function() {
        performanceMetrics.mark('dom_ready');
        
        console.log('🚀 Enhanced Carambola Golf Club performance optimizations loaded');
        
        try {
            // Initialize performance optimizations FIRST
            const preloader = new PreloaderManager();
            new ResourceUsageTracker();
            
            // REDUCED loading steps for faster completion
            preloader.addStep('service_worker');
            preloader.addStep('images');
            preloader.addStep('core_systems');
            
            preloader.init();
            
            // Register service worker
            const swResult = await registerServiceWorker();
            preloader.completeStep('service_worker');
            
            // Initialize image optimizer
            new ImageOptimizer();
            preloader.completeStep('images');
            
            // Initialize all managers
            new ModalManager();
            new NavigationManager();
            new AnalyticsManager();
            new OfflineManager();
            
            // Initialize video hero for home page
            if (document.querySelector('.hero-video')) {
                new HeroVideoManager();
            }
            
            // Initialize score card functionality
            const scoreCardManager = new ScoreCardManager();
            window.scoreCardManager = scoreCardManager;
            
            // Setup additional functionality
            setupSmoothScrolling();
            
            preloader.completeStep('core_systems');
            
            performanceMetrics.mark('init_complete');
            
        } catch (error) {
            console.error('Main script initialization error:', error);
            // Hide preloader even on error
            const preloader = document.getElementById('preloader');
            if (preloader) {
                setTimeout(() => preloader.classList.add('hidden'), 1000);
            }
        }
    });

    // Performance monitoring
    if (typeof gtag !== 'undefined') {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if ('performance' in window) {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    
                    if (perfData) {
                        gtag('event', 'performance_metrics', {
                            'event_category': 'performance',
                            'dom_content_loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                            'load_complete': Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                            'first_byte': Math.round(perfData.responseStart - perfData.requestStart),
                            'non_interaction': true
                        });
                    }
                }
            }, 0);
        });
    }

    // Global utility functions
    window.CarambolaGolf = {
        updateModalContent: function(title, message, email = 'info@carambola.golf', phone = '+1-340-778-5638') {
            const modal = document.getElementById('constructionModal');
            if (!modal) return;
            
            const titleElement = modal.querySelector('.modal-header h2');
            const messageElement = modal.querySelector('.modal-body p');
            const emailElement = modal.querySelector('[href^="mailto:"]');
            const phoneElement = modal.querySelector('[href^="tel:"]');
            
            if (titleElement) titleElement.textContent = title;
            if (messageElement) messageElement.textContent = message;
            if (emailElement) {
                emailElement.href = `mailto:${email}`;
                emailElement.textContent = email;
            }
            if (phoneElement) {
                phoneElement.href = `tel:${phone.replace(/[\s\-()]/g, '')}`;
                phoneElement.textContent = phone;
            }
        },
        
        showModal: function() {
            const modal = document.getElementById('constructionModal');
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        },
        
        resetFirstVisit: function() {
            try {
                localStorage.removeItem('carambola-visited');
                console.log('First visit flag reset. Refresh page to see modal again.');
            } catch (e) {
                console.log('Could not reset visit flag.');
            }
        },
        
        trackEvent: function(category, action, label, value = null) {
            if (typeof gtag !== 'undefined') {
                const eventData = {
                    'event_category': category,
                    'event_label': label,
                    'page_location': window.location.pathname
                };
                
                if (value !== null) {
                    eventData.value = value;
                }
                
                gtag('event', action, eventData);
            }
        },
        
        getPerformanceMetrics: function() {
            return {
                ...performanceMetrics.marks,
                loadTime: performance.now() - performanceMetrics.startTime
            };
        },

        flipScoreCard: function(cardIndex) {
            const scoreCardManager = window.scoreCardManager;
            if (scoreCardManager && scoreCardManager.scoreCards[cardIndex]) {
                scoreCardManager.toggleCard(scoreCardManager.scoreCards[cardIndex]);
            }
        },
        
        resetScoreCards: function() {
            const scoreCardManager = window.scoreCardManager;
            if (scoreCardManager) {
                scoreCardManager.resetAllCards();
            }
        }
    };

    // Console branding
    console.log('%cCarambola Golf Club - Performance Optimized', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.log('%cCSP-compliant with enhanced loading speed', 'color: #1e3a5f; font-size: 12px;');
    console.log('%cTechnical support: jaspervdz@me.com', 'color: #1e3a5f; font-size: 12px;');

})();
