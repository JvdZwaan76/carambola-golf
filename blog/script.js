// CARAMBOLA GOLF CLUB BLOG SUPPLEMENTS - ENHANCED WITH STATIC ADS
// Performance-optimized with static advertisement system - CONFLICT-FREE

(function() {
    'use strict';

    // Prevent duplicate initialization and conflicts
    if (window.CarambolaBlogSupplementsInitialized) {
        console.log('🟡 Blog supplements already initialized');
        return;
    }

    // Enhanced configuration with ad system
    const CONFIG = {
        version: '2.2.0',
        debugMode: false,
        
        // Static Advertisement Configuration
        staticAds: {
            enabled: true,
            cobraGolfAd: {
                clickUrl: 'https://www.tkqlhce.com/click-101520211-16945650',
                imageUrl: 'https://www.ftjcfx.com/image-101520211-16945650',
                width: 970,
                height: 250,
                alt: 'Cobra KING Tour Black Irons - Premium Golf Equipment for Championship Performance'
            }
        },
        
        // Engagement requirements for ads - Mobile optimized
        engagementRequirements: {
            minTimeOnPage: 15000, // Reduced to 15 seconds for faster ad display
            minScrollPercent: 15, // Reduced to 15% scroll for mobile
            minInteractions: 1 // At least 1 interaction
        },
        
        // Performance optimizations
        trackingThrottle: 1200, // Faster throttling for better responsiveness
        maxTrackingEvents: 35, // Increased limit for ad tracking
        adLoadDelay: 2000, // Delay before loading ads (performance optimization)
        adViewportThreshold: 0.3 // Ad viewability threshold
    };

    // Enhanced state management with ad tracking
    const state = {
        trackingEvents: 0,
        lastTrackingTime: 0,
        isTracking: false,
        isMobile: window.innerWidth <= 768,
        
        engagement: {
            startTime: Date.now(),
            interactions: 0,
            maxScroll: 0,
            qualified: false
        },
        
        readingProgress: {
            active: false,
            maxProgress: 0,
            reportedMilestones: new Set()
        },
        
        ads: {
            static: {
                loaded: false,
                placed: false,
                visible: new Set(),
                clicked: new Set(),
                impressions: 0
            },
            performance: {
                loadTime: 0,
                renderTime: 0,
                errors: 0
            }
        }
    };

    // Enhanced utility functions
    const utils = {
        log: (...args) => {
            if (CONFIG.debugMode) {
                console.log('📚 Blog:', ...args);
            }
        },

        // Enhanced mobile detection
        isMobile: () => {
            return window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        // Safe tracking with enhanced mobile optimizations
        safeTrack: (action, category, details = {}) => {
            const now = Date.now();
            
            if (state.isTracking || 
                now - state.lastTrackingTime < CONFIG.trackingThrottle ||
                state.trackingEvents >= CONFIG.maxTrackingEvents) {
                return false;
            }
            
            state.isTracking = true;
            state.lastTrackingTime = now;
            state.trackingEvents++;
            
            try {
                // Enhanced tracking with ad context
                if (typeof window.trackBlogInteraction === 'function') {
                    window.trackBlogInteraction(action, category, {
                        ...details,
                        blog_supplement: true,
                        is_mobile: state.isMobile,
                        viewport_width: window.innerWidth,
                        ad_system: 'static_v2'
                    });
                }
                utils.log('Tracked:', action, category);
                return true;
            } catch (error) {
                console.warn('Blog tracking error:', error);
                return false;
            } finally {
                setTimeout(() => {
                    state.isTracking = false;
                }, 100);
            }
        },

        // Enhanced engagement detection
        isUserEngaged: () => {
            const timeOnPage = Date.now() - state.engagement.startTime;
            const scrollPercent = state.engagement.maxScroll;
            const interactions = state.engagement.interactions;
            
            const req = CONFIG.engagementRequirements;
            
            // Mobile-optimized requirements
            const adjustedTimeReq = state.isMobile ? req.minTimeOnPage * 0.8 : req.minTimeOnPage;
            const adjustedScrollReq = state.isMobile ? req.minScrollPercent * 0.8 : req.minScrollPercent;
            
            return timeOnPage >= adjustedTimeReq &&
                   scrollPercent >= adjustedScrollReq &&
                   interactions >= req.minInteractions;
        },

        // Performance-optimized throttle
        throttle: (func, delay) => {
            let timeoutId;
            let lastExecTime = 0;
            
            return function (...args) {
                const currentTime = Date.now();
                
                if (currentTime - lastExecTime > delay) {
                    func.apply(this, args);
                    lastExecTime = currentTime;
                } else {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        func.apply(this, args);
                        lastExecTime = Date.now();
                    }, delay - (currentTime - lastExecTime));
                }
            };
        },

        // Enhanced intersection observer for ads
        createObserver: (callback, options = {}) => {
            const defaultOptions = {
                rootMargin: state.isMobile ? '20px 0px' : '50px 0px',
                threshold: options.threshold || (state.isMobile ? 0.1 : 0.2),
                ...options
            };

            if ('IntersectionObserver' in window) {
                return new IntersectionObserver(callback, defaultOptions);
            }
            return null;
        },

        // Image preloading utility for ads
        preloadImage: (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        },

        // Generate unique ad ID for tracking
        generateAdId: () => {
            return 'ad_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        }
    };

    // ENHANCED STATIC ADVERTISEMENT SYSTEM
    function setupStaticAdSystem() {
        if (!CONFIG.staticAds.enabled || state.ads.static.loaded) {
            utils.log('Static ads disabled or already loaded');
            return;
        }

        utils.log('Initializing static advertisement system...');
        
        // Wait for initial page load and engagement
        setTimeout(() => {
            if (utils.isUserEngaged()) {
                loadStaticAdvertisements();
            } else {
                // Check engagement periodically
                const engagementCheck = setInterval(() => {
                    if (utils.isUserEngaged() && !state.ads.static.loaded) {
                        clearInterval(engagementCheck);
                        loadStaticAdvertisements();
                    }
                }, state.isMobile ? 3000 : 2000);

                // Fallback: load ads after 30 seconds regardless
                setTimeout(() => {
                    if (!state.ads.static.loaded) {
                        clearInterval(engagementCheck);
                        loadStaticAdvertisements();
                        utils.safeTrack('ads_loaded', 'fallback_timer', {
                            reason: 'engagement_timeout'
                        });
                    }
                }, 30000);
            }
        }, CONFIG.adLoadDelay);
    }

    // Load and place static advertisements
    async function loadStaticAdvertisements() {
        if (state.ads.static.loaded) return;
        
        const startTime = performance.now();
        state.ads.static.loaded = true;

        try {
            // Preload ad image for better performance
            await utils.preloadImage(CONFIG.staticAds.cobraGolfAd.imageUrl);
            
            // Find article content
            const article = document.querySelector('.article-body');
            if (!article) {
                throw new Error('Article body not found');
            }

            // Check if ads already exist (from static HTML)
            const existingAds = article.querySelectorAll('.static-advertisement');
            if (existingAds.length > 0) {
                utils.log('Static ads already exist in HTML, enhancing...');
                enhanceExistingAds(existingAds);
                state.ads.static.placed = true;
                return;
            }

            // Place new ads dynamically if none exist
            placeNewStaticAdvertisements(article);
            
            state.ads.performance.loadTime = performance.now() - startTime;
            
            utils.safeTrack('static_ads_loaded', 'dynamic_placement', {
                load_time: Math.round(state.ads.performance.loadTime),
                ad_count: article.querySelectorAll('.static-advertisement').length
            });

        } catch (error) {
            console.error('Static ad loading failed:', error);
            state.ads.performance.errors++;
            
            utils.safeTrack('static_ads_error', 'load_failed', {
                error_message: error.message
            });
        }
    }

    // Enhance existing static ads in HTML
    function enhanceExistingAds(existingAds) {
        existingAds.forEach((ad, index) => {
            const adId = utils.generateAdId();
            ad.setAttribute('data-ad-id', adId);
            
            // Add performance tracking
            const link = ad.querySelector('a');
            if (link) {
                link.addEventListener('click', () => {
                    handleAdClick(adId, 'existing_html', index);
                });
            }

            // Setup viewability tracking
            setupAdViewabilityTracking(ad, adId, index);
            
            // Add fade-in animation
            ad.classList.add('blog-fade-in');
        });

        utils.log('Enhanced', existingAds.length, 'existing static ads');
    }

    // Place new static advertisements dynamically
    function placeNewStaticAdvertisements(article) {
        const paragraphs = article.querySelectorAll('p');
        if (paragraphs.length < 4) {
            utils.log('Insufficient content for ad placement');
            return;
        }

        // Calculate optimal ad positions
        const adPositions = state.isMobile 
            ? [Math.floor(paragraphs.length * 0.4)] // Single ad on mobile
            : [Math.floor(paragraphs.length * 0.35), Math.floor(paragraphs.length * 0.75)]; // Two ads on desktop

        adPositions.forEach((position, index) => {
            if (paragraphs[position]) {
                const adElement = createStaticAdElement(index === 0 ? 'mid' : 'bottom');
                paragraphs[position].parentNode.insertBefore(adElement, paragraphs[position].nextSibling);
            }
        });

        state.ads.static.placed = true;
        utils.log('Placed', adPositions.length, 'new static advertisements');
    }

    // Create enhanced static advertisement element
    function createStaticAdElement(position) {
        const adId = utils.generateAdId();
        const adConfig = CONFIG.staticAds.cobraGolfAd;
        
        const adContainer = document.createElement('div');
        adContainer.className = `static-advertisement static-ad-${position} blog-fade-in`;
        adContainer.setAttribute('data-ad-id', adId);
        adContainer.setAttribute('data-ad-position', position);
        
        // Mobile-responsive dimensions
        const displayWidth = state.isMobile ? Math.min(adConfig.width, 320) : adConfig.width;
        const displayHeight = state.isMobile ? Math.round(displayWidth * (adConfig.height / adConfig.width)) : adConfig.height;
        
        adContainer.innerHTML = `
            <div class="ad-wrapper">
                <a href="${adConfig.clickUrl}" 
                   target="_blank" 
                   rel="noopener sponsored"
                   onclick="handleAdClick('${adId}', '${position}', ${state.ads.static.impressions})"
                   data-ad-link="${adId}">
                    <img src="${adConfig.imageUrl}" 
                         width="${displayWidth}" 
                         height="${displayHeight}" 
                         alt="${adConfig.alt}" 
                         loading="lazy"
                         style="max-width: 100%; height: auto;"
                         data-ad-image="${adId}">
                </a>
            </div>
        `;

        // Setup enhanced tracking
        const link = adContainer.querySelector('a');
        link.addEventListener('click', (event) => {
            handleAdClick(adId, position, state.ads.static.impressions);
        });

        // Setup viewability tracking
        setupAdViewabilityTracking(adContainer, adId, state.ads.static.impressions);
        
        state.ads.static.impressions++;
        return adContainer;
    }

    // Enhanced ad click handling
    function handleAdClick(adId, position, impressionId) {
        if (state.ads.static.clicked.has(adId)) {
            return; // Prevent double-click tracking
        }
        
        state.ads.static.clicked.add(adId);
        
        utils.safeTrack('static_ad_click', 'cobra_golf_equipment', {
            ad_id: adId,
            ad_position: position,
            impression_id: impressionId,
            time_on_page: Date.now() - state.engagement.startTime,
            scroll_progress: state.engagement.maxScroll,
            is_mobile: state.isMobile,
            click_timestamp: Date.now()
        });

        // Enhanced performance tracking
        if (typeof window.trackBlogInteraction === 'function') {
            window.trackBlogInteraction('advertisement_conversion', 'cobra_click', {
                conversion_type: 'external_click',
                ad_system: 'static_v2',
                position: position
            });
        }

        utils.log('Ad click tracked:', adId, position);
    }

    // Setup enhanced ad viewability tracking
    function setupAdViewabilityTracking(adElement, adId, impressionId) {
        const observer = utils.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= CONFIG.adViewportThreshold) {
                    if (!state.ads.static.visible.has(adId)) {
                        state.ads.static.visible.add(adId);
                        
                        utils.safeTrack('static_ad_impression', 'cobra_golf_equipment', {
                            ad_id: adId,
                            impression_id: impressionId,
                            visibility_ratio: entry.intersectionRatio,
                            viewport_height: window.innerHeight,
                            ad_position: adElement.getAttribute('data-ad-position'),
                            time_to_view: Date.now() - state.engagement.startTime
                        });

                        utils.log('Ad impression tracked:', adId);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: CONFIG.adViewportThreshold });

        if (observer) {
            observer.observe(adElement);
        }

        // Fallback for browsers without Intersection Observer
        if (!observer) {
            setTimeout(() => {
                if (!state.ads.static.visible.has(adId)) {
                    handleAdClick(adId, adElement.getAttribute('data-ad-position'), impressionId);
                }
            }, 3000);
        }
    }

    // Make handleAdClick globally available for inline onclick handlers
    window.handleAdClick = function(adId, position, impressionId) {
        if (state.ads.static.clicked.has(adId)) {
            return;
        }
        
        state.ads.static.clicked.add(adId);
        
        utils.safeTrack('static_ad_click', 'cobra_golf_equipment', {
            ad_id: adId,
            ad_position: position,
            impression_id: impressionId,
            time_on_page: Date.now() - state.engagement.startTime,
            scroll_progress: state.engagement.maxScroll,
            is_mobile: state.isMobile,
            click_timestamp: Date.now()
        });

        utils.log('Global ad click tracked:', adId, position);
    };

    // Enhanced reading progress tracker
    function setupReadingProgress() {
        if (state.readingProgress.active) return;
        
        const article = document.querySelector('.article-body');
        if (!article) return;

        state.readingProgress.active = true;

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        progressBar.style.height = state.isMobile ? '3px' : '4px';
        document.body.appendChild(progressBar);
        
        const progressFill = progressBar.querySelector('.reading-progress-fill');
        const milestones = state.isMobile ? [25, 50, 75] : [25, 50, 75, 90];

        const updateProgress = utils.throttle(() => {
            try {
                const articleTop = article.offsetTop;
                const articleHeight = article.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollTop = window.pageYOffset;

                const progress = Math.max(0, Math.min(100, 
                    ((scrollTop - articleTop + windowHeight * 0.3) / articleHeight) * 100
                ));

                const roundedProgress = Math.round(progress);
                progressFill.style.width = `${roundedProgress}%`;

                // Update engagement
                state.engagement.maxScroll = Math.max(state.engagement.maxScroll, roundedProgress);

                // Track milestones
                milestones.forEach(milestone => {
                    if (roundedProgress >= milestone && 
                        !state.readingProgress.reportedMilestones.has(milestone)) {
                        
                        state.readingProgress.reportedMilestones.add(milestone);
                        utils.safeTrack('reading_progress', `${milestone}%`, {
                            progress: milestone,
                            article_height: articleHeight,
                            viewport_height: windowHeight,
                            has_ads: state.ads.static.placed
                        });
                    }
                });
            } catch (error) {
                console.warn('Reading progress error:', error);
            }
        }, state.isMobile ? 1500 : 1000);

        window.addEventListener('scroll', updateProgress, { passive: true });
        utils.log('Reading progress initialized with ad integration');
    }

    // Enhanced engagement tracking
    function setupEngagementTracking() {
        // Track scroll engagement
        window.addEventListener('scroll', utils.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            state.engagement.maxScroll = Math.max(state.engagement.maxScroll, scrollPercent);
        }, 1000), { passive: true });

        // Track interaction engagement
        const interactionEvents = state.isMobile 
            ? ['touchstart', 'click']
            : ['click', 'keydown', 'mousemove'];

        interactionEvents.forEach(event => {
            document.addEventListener(event, utils.throttle(() => {
                state.engagement.interactions++;
            }, 2000), { passive: true });
        });

        utils.log('Enhanced engagement tracking initialized');
    }

    // Enhanced image lazy loading
    function setupImageLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if (!images.length) return;

        const imageObserver = utils.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    img.addEventListener('load', () => {
                        img.classList.add('blog-fade-in');
                    });

                    // Track image views with ad context
                    utils.safeTrack('image_viewed', img.alt || 'unnamed_image', {
                        image_src: img.src,
                        viewport_height: window.innerHeight,
                        ads_present: state.ads.static.placed
                    });

                    imageObserver.unobserve(img);
                }
            });
        }, { threshold: 0.1 });

        images.forEach(img => imageObserver.observe(img));
        utils.log('Enhanced image lazy loading initialized for', images.length, 'images');
    }

    // Enhanced link tracking
    function setupLinkTracking() {
        const links = document.querySelectorAll('.article-body a:not([data-ad-link]), .cta-button');
        
        links.forEach(link => {
            link.addEventListener('click', (event) => {
                const href = link.href;
                const text = link.textContent.trim();
                const isExternal = href && !href.startsWith(window.location.origin);
                
                utils.safeTrack('link_click', isExternal ? 'external' : 'internal', {
                    url: href,
                    text: text.substring(0, 50),
                    is_external: isExternal,
                    is_cta: link.classList.contains('cta-button'),
                    ads_present: state.ads.static.placed
                });
            });
        });

        utils.log('Enhanced link tracking initialized for', links.length, 'links');
    }

    // Enhanced mobile optimizations
    function setupMobileOptimizations() {
        if (!state.isMobile) return;

        // Optimize touch interactions
        document.addEventListener('touchstart', () => {
            state.engagement.interactions++;
        }, { passive: true, once: true });

        // Optimize viewport changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                state.isMobile = utils.isMobile();
                utils.safeTrack('orientation_change', state.isMobile ? 'portrait' : 'landscape', {
                    new_width: window.innerWidth,
                    new_height: window.innerHeight,
                    ads_loaded: state.ads.static.loaded
                });
            }, 100);
        });

        // Mobile-specific ad optimizations
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                setupImageLazyLoading();
            });
        } else {
            setTimeout(setupImageLazyLoading, 1000);
        }

        utils.log('Enhanced mobile optimizations initialized');
    }

    // Enhanced performance monitoring
    function setupPerformanceMonitoring() {
        if (!('performance' in window)) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    utils.safeTrack('page_performance', 'load_complete', {
                        load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                        dom_ready: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                        first_byte: Math.round(perfData.responseStart - perfData.requestStart),
                        is_mobile: state.isMobile,
                        ad_system: 'static_v2',
                        ads_loaded: state.ads.static.loaded
                    });
                }
            }, 1000);
        });

        // Monitor ad performance
        setInterval(() => {
            if (state.ads.static.loaded) {
                utils.safeTrack('ad_performance', 'periodic_check', {
                    impressions: state.ads.static.impressions,
                    clicks: state.ads.static.clicked.size,
                    visible: state.ads.static.visible.size,
                    errors: state.ads.performance.errors,
                    load_time: state.ads.performance.loadTime
                });
            }
        }, 60000); // Every minute

        utils.log('Enhanced performance monitoring initialized');
    }

    // Enhanced error handling
    function setupErrorHandling() {
        window.addEventListener('error', (event) => {
            utils.safeTrack('javascript_error', 'global', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                ads_loaded: state.ads.static.loaded
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            utils.safeTrack('promise_rejection', 'unhandled', {
                reason: event.reason?.toString() || 'unknown',
                ads_loaded: state.ads.static.loaded
            });
        });

        utils.log('Enhanced error handling initialized');
    }

    // Main initialization function
    function initializeBlogSupplements() {
        try {
            window.CarambolaBlogSupplementsInitialized = true;

            // Initialize core systems first
            setupEngagementTracking();
            setupReadingProgress();
            setupLinkTracking();
            setupMobileOptimizations();
            setupPerformanceMonitoring();
            setupErrorHandling();
            
            // Initialize static advertisement system
            setupStaticAdSystem();

            // Track successful initialization
            utils.safeTrack('blog_supplements', 'initialized', {
                version: CONFIG.version,
                is_mobile: state.isMobile,
                viewport_width: window.innerWidth,
                static_ads_enabled: CONFIG.staticAds.enabled,
                user_agent: navigator.userAgent.substring(0, 100)
            });

            utils.log('Enhanced blog supplements initialized successfully', CONFIG.version);

        } catch (error) {
            console.error('Blog supplements initialization failed:', error);
            
            try {
                utils.safeTrack('initialization_error', 'fallback', {
                    error_message: error.message,
                    ad_system: 'disabled'
                });
            } catch (trackingError) {
                console.error('Error tracking failed:', trackingError);
            }
        }
    }

    // Enhanced initialization timing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBlogSupplements);
    } else if (document.readyState === 'interactive') {
        setTimeout(initializeBlogSupplements, 100);
    } else {
        initializeBlogSupplements();
    }

    // Enhanced cleanup on page unload
    window.addEventListener('beforeunload', () => {
        utils.safeTrack('page_unload', 'session_end', {
            time_on_page: Date.now() - state.engagement.startTime,
            max_scroll: state.engagement.maxScroll,
            total_interactions: state.engagement.interactions,
            ad_impressions: state.ads.static.impressions,
            ad_clicks: state.ads.static.clicked.size,
            ad_visible: state.ads.static.visible.size
        });
    });

    // Export enhanced utilities for debugging
    if (CONFIG.debugMode) {
        window.BlogSupplementsDebug = {
            state,
            utils,
            CONFIG,
            ads: {
                forceLoad: () => loadStaticAdvertisements(),
                getStats: () => state.ads,
                testClick: (adId) => handleAdClick(adId, 'test', 0)
            }
        };
    }

})();
