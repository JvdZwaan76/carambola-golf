// CARAMBOLA GOLF CLUB BLOG SUPPLEMENTS - ENHANCED WITH DUAL STATIC ADS
// Performance-optimized with dual advertisement system - ENTERPRISE READY

(function() {
    'use strict';

    // Prevent duplicate initialization and conflicts
    if (window.CarambolaBlogSupplementsInitialized) {
        console.log('🟡 Blog supplements already initialized');
        return;
    }

    // Enhanced configuration with dual ad system
    const CONFIG = {
        version: '2.3.0',
        debugMode: false,
        
        // Enhanced Static Advertisement Configuration - Two Different Ads
        staticAds: {
            enabled: true,
            
            // Mid-article ad (existing Cobra irons)
            cobraIronsAd: {
                clickUrl: 'https://www.tkqlhce.com/click-101520211-16945650',
                imageUrl: 'https://www.ftjcfx.com/image-101520211-16945650',
                width: 970,
                height: 250,
                alt: 'Cobra KING Tour Black Irons - Premium Golf Equipment for Championship Performance',
                trackingId: 'cobra_king_tour_irons',
                placement: 'mid'
            },
            
            // Bottom ad (new Cobra vintage putters)
            cobraPuttersAd: {
                clickUrl: 'https://www.dpbolvw.net/click-101520211-15729104',
                imageUrl: 'https://www.ftjcfx.com/image-101520211-15729104',
                width: 728,
                height: 90,
                alt: '2024 COBRA Vintage Putters - Classic Style Meets Modern Performance',
                trackingId: 'cobra_vintage_putters',
                placement: 'bottom'
            }
        },
        
        // Engagement requirements for ads - Mobile optimized
        engagementRequirements: {
            minTimeOnPage: 15000, // 15 seconds for faster ad display
            minScrollPercent: 15, // 15% scroll for mobile
            minInteractions: 1 // At least 1 interaction
        },
        
        // Performance optimizations
        trackingThrottle: 1200,
        maxTrackingEvents: 40, // Increased for dual ad tracking
        adLoadDelay: 2000,
        adViewportThreshold: 0.3
    };

    // Enhanced state management with dual ad tracking
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
                impressions: 0,
                
                // Individual ad tracking
                irons: {
                    loaded: false,
                    visible: false,
                    clicked: false,
                    impressions: 0
                },
                putters: {
                    loaded: false,
                    visible: false,
                    clicked: false,
                    impressions: 0
                }
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

        isMobile: () => {
            return window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

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
                // Enhanced tracking with dual ad context
                if (typeof window.trackBlogInteraction === 'function') {
                    window.trackBlogInteraction(action, category, {
                        ...details,
                        blog_supplement: true,
                        is_mobile: state.isMobile,
                        viewport_width: window.innerWidth,
                        ad_system: 'dual_static_v2',
                        ads_loaded: {
                            irons: state.ads.static.irons.loaded,
                            putters: state.ads.static.putters.loaded
                        }
                    });
                }
                
                // Also try article-specific tracking
                if (typeof window.trackArticleInteraction === 'function') {
                    window.trackArticleInteraction(action, category, details);
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

        isUserEngaged: () => {
            const timeOnPage = Date.now() - state.engagement.startTime;
            const scrollPercent = state.engagement.maxScroll;
            const interactions = state.engagement.interactions;
            
            const req = CONFIG.engagementRequirements;
            const adjustedTimeReq = state.isMobile ? req.minTimeOnPage * 0.8 : req.minTimeOnPage;
            const adjustedScrollReq = state.isMobile ? req.minScrollPercent * 0.8 : req.minScrollPercent;
            
            return timeOnPage >= adjustedTimeReq &&
                   scrollPercent >= adjustedScrollReq &&
                   interactions >= req.minInteractions;
        },

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

        preloadImage: (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        },

        generateAdId: () => {
            return 'ad_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        },

        // Get ad config by type
        getAdConfig: (adType) => {
            switch(adType) {
                case 'irons':
                case 'mid':
                    return CONFIG.staticAds.cobraIronsAd;
                case 'putters':
                case 'bottom':
                    return CONFIG.staticAds.cobraPuttersAd;
                default:
                    return null;
            }
        }
    };

    // ENHANCED DUAL STATIC ADVERTISEMENT SYSTEM
    function setupStaticAdSystem() {
        if (!CONFIG.staticAds.enabled || state.ads.static.loaded) {
            utils.log('Static ads disabled or already loaded');
            return;
        }

        utils.log('Initializing dual static advertisement system...');
        
        setTimeout(() => {
            if (utils.isUserEngaged()) {
                loadStaticAdvertisements();
            } else {
                const engagementCheck = setInterval(() => {
                    if (utils.isUserEngaged() && !state.ads.static.loaded) {
                        clearInterval(engagementCheck);
                        loadStaticAdvertisements();
                    }
                }, state.isMobile ? 3000 : 2000);

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

    // Enhanced load and place static advertisements
    async function loadStaticAdvertisements() {
        if (state.ads.static.loaded) return;
        
        const startTime = performance.now();
        state.ads.static.loaded = true;

        try {
            // Preload both ad images for better performance
            await Promise.all([
                utils.preloadImage(CONFIG.staticAds.cobraIronsAd.imageUrl),
                utils.preloadImage(CONFIG.staticAds.cobraPuttersAd.imageUrl)
            ]);
            
            const article = document.querySelector('.article-body');
            if (!article) {
                throw new Error('Article body not found');
            }

            // Check if ads already exist in HTML
            const existingAds = article.querySelectorAll('.static-advertisement');
            if (existingAds.length > 0) {
                utils.log('Static ads already exist in HTML, enhancing with dual system...');
                enhanceExistingAdsWithDualSystem(existingAds);
                state.ads.static.placed = true;
                return;
            }

            // Place new ads dynamically if none exist
            placeNewDualStaticAdvertisements(article);
            
            state.ads.performance.loadTime = performance.now() - startTime;
            
            utils.safeTrack('dual_static_ads_loaded', 'dynamic_placement', {
                load_time: Math.round(state.ads.performance.loadTime),
                ad_count: article.querySelectorAll('.static-advertisement').length,
                irons_loaded: state.ads.static.irons.loaded,
                putters_loaded: state.ads.static.putters.loaded
            });

        } catch (error) {
            console.error('Dual static ad loading failed:', error);
            state.ads.performance.errors++;
            
            utils.safeTrack('dual_static_ads_error', 'load_failed', {
                error_message: error.message
            });
        }
    }

    // Enhanced function to handle existing ads in HTML with dual system
    function enhanceExistingAdsWithDualSystem(existingAds) {
        existingAds.forEach((ad, index) => {
            const adId = utils.generateAdId();
            ad.setAttribute('data-ad-id', adId);
            
            // Determine ad type based on position or existing content
            let adType, adConfig;
            
            if (ad.classList.contains('static-ad-mid')) {
                adType = 'irons';
                adConfig = CONFIG.staticAds.cobraIronsAd;
                state.ads.static.irons.loaded = true;
            } else if (ad.classList.contains('static-ad-bottom')) {
                adType = 'putters';
                adConfig = CONFIG.staticAds.cobraPuttersAd;
                state.ads.static.putters.loaded = true;
            } else {
                // Fallback: assign based on index
                adType = index === 0 ? 'irons' : 'putters';
                adConfig = utils.getAdConfig(adType);
                state.ads.static[adType].loaded = true;
            }
            
            ad.setAttribute('data-ad-type', adType);

            // Update existing ad content if needed
            const existingLink = ad.querySelector('a');
            const existingImg = ad.querySelector('img');
            
            if (existingLink && existingImg) {
                // Update href if different
                if (existingLink.href !== adConfig.clickUrl) {
                    existingLink.href = adConfig.clickUrl;
                }
                
                // Update image if different
                if (existingImg.src !== adConfig.imageUrl) {
                    existingImg.src = adConfig.imageUrl;
                    existingImg.alt = adConfig.alt;
                }
            }

            // Enhanced click tracking
            const link = ad.querySelector('a');
            if (link) {
                // Remove any existing click handlers
                link.replaceWith(link.cloneNode(true));
                const newLink = ad.querySelector('a');
                
                newLink.addEventListener('click', (event) => {
                    handleEnhancedAdClick(adId, adType, index, adConfig.trackingId);
                });
            }

            // Setup enhanced viewability tracking
            setupEnhancedAdViewabilityTracking(ad, adId, adType, adConfig.trackingId);
            
            // Add fade-in animation
            ad.classList.add('blog-fade-in');
            
            utils.log(`Enhanced existing ${adType} ad with dual system:`, adId);
        });

        state.ads.static.placed = true;
        utils.log('Enhanced', existingAds.length, 'existing ads with dual system');
    }

    // Place new dual static advertisements dynamically
    function placeNewDualStaticAdvertisements(article) {
        const paragraphs = article.querySelectorAll('p');
        if (paragraphs.length < 4) {
            utils.log('Insufficient content for ad placement');
            return;
        }

        // Create both ads for desktop, single ad for mobile
        const adsToPlace = state.isMobile 
            ? [{ type: 'irons', position: Math.floor(paragraphs.length * 0.4) }]
            : [
                { type: 'irons', position: Math.floor(paragraphs.length * 0.35) },
                { type: 'putters', position: Math.floor(paragraphs.length * 0.75) }
              ];

        adsToPlace.forEach(({ type, position }) => {
            if (paragraphs[position]) {
                const adElement = createDualStaticAdElement(type);
                paragraphs[position].parentNode.insertBefore(adElement, paragraphs[position].nextSibling);
                state.ads.static[type].loaded = true;
            }
        });

        state.ads.static.placed = true;
        utils.log('Placed', adsToPlace.length, 'new dual static advertisements');
    }

    // Create enhanced dual static advertisement element
    function createDualStaticAdElement(adType) {
        const adId = utils.generateAdId();
        const adConfig = utils.getAdConfig(adType);
        
        if (!adConfig) {
            console.error('Invalid ad type:', adType);
            return document.createElement('div');
        }
        
        const adContainer = document.createElement('div');
        const placement = adConfig.placement;
        
        adContainer.className = `static-advertisement static-ad-${placement} blog-fade-in`;
        adContainer.setAttribute('data-ad-id', adId);
        adContainer.setAttribute('data-ad-type', adType);
        adContainer.setAttribute('data-ad-position', placement);
        
        // Mobile-responsive dimensions
        const displayWidth = state.isMobile ? Math.min(adConfig.width, 320) : adConfig.width;
        const displayHeight = state.isMobile ? Math.round(displayWidth * (adConfig.height / adConfig.width)) : adConfig.height;
        
        adContainer.innerHTML = `
            <div class="ad-wrapper">
                <a href="${adConfig.clickUrl}" 
                   target="_blank" 
                   rel="noopener sponsored"
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
            handleEnhancedAdClick(adId, adType, state.ads.static.impressions, adConfig.trackingId);
        });

        // Setup viewability tracking
        setupEnhancedAdViewabilityTracking(adContainer, adId, adType, adConfig.trackingId);
        
        state.ads.static.impressions++;
        state.ads.static[adType].impressions++;
        
        return adContainer;
    }

    // Enhanced ad click handling for dual system
    function handleEnhancedAdClick(adId, adType, impressionId, trackingId) {
        if (state.ads.static.clicked.has(adId)) {
            return; // Prevent double-click tracking
        }
        
        state.ads.static.clicked.add(adId);
        state.ads.static[adType].clicked = true;
        
        const adConfig = utils.getAdConfig(adType);
        
        utils.safeTrack('dual_static_ad_click', trackingId, {
            ad_id: adId,
            ad_type: adType,
            ad_position: adConfig.placement,
            impression_id: impressionId,
            time_on_page: Date.now() - state.engagement.startTime,
            scroll_progress: state.engagement.maxScroll,
            is_mobile: state.isMobile,
            click_timestamp: Date.now(),
            destination_url: adConfig.clickUrl,
            equipment_category: adType === 'irons' ? 'irons' : 'putters'
        });

        // Enhanced conversion tracking
        if (typeof window.trackBlogInteraction === 'function') {
            window.trackBlogInteraction('advertisement_conversion', `${trackingId}_click`, {
                conversion_type: 'external_click',
                ad_system: 'dual_static_v2',
                position: adConfig.placement,
                equipment_type: adType
            });
        }

        utils.log('Enhanced ad click tracked:', adId, adType, trackingId);
    }

    // Enhanced ad viewability tracking for dual system
    function setupEnhancedAdViewabilityTracking(adElement, adId, adType, trackingId) {
        const observer = utils.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= CONFIG.adViewportThreshold) {
                    if (!state.ads.static.visible.has(adId)) {
                        state.ads.static.visible.add(adId);
                        state.ads.static[adType].visible = true;
                        
                        const adConfig = utils.getAdConfig(adType);
                        
                        utils.safeTrack('dual_static_ad_impression', trackingId, {
                            ad_id: adId,
                            ad_type: adType,
                            impression_id: state.ads.static[adType].impressions,
                            visibility_ratio: entry.intersectionRatio,
                            viewport_height: window.innerHeight,
                            ad_position: adConfig.placement,
                            time_to_view: Date.now() - state.engagement.startTime,
                            equipment_category: adType === 'irons' ? 'irons' : 'putters'
                        });

                        utils.log('Enhanced ad impression tracked:', adId, adType, trackingId);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: CONFIG.adViewportThreshold });

        if (observer) {
            observer.observe(adElement);
        }
    }

    // Global function for inline onclick handlers (backward compatibility)
    window.handleAdClick = function(adId, position, impressionId) {
        // Determine ad type from position
        const adType = position === 'mid' ? 'irons' : 'putters';
        const adConfig = utils.getAdConfig(adType);
        
        if (adConfig) {
            handleEnhancedAdClick(adId, adType, impressionId, adConfig.trackingId);
        } else {
            // Fallback to original system
            if (state.ads.static.clicked.has(adId)) return;
            
            state.ads.static.clicked.add(adId);
            utils.safeTrack('static_ad_click', 'cobra_golf_equipment', {
                ad_id: adId,
                ad_position: position,
                impression_id: impressionId,
                fallback_tracking: true
            });
        }
    };

    // Enhanced reading progress tracker (unchanged but with dual ad context)
    function setupReadingProgress() {
        if (state.readingProgress.active) return;
        
        const article = document.querySelector('.article-body');
        if (!article) return;

        state.readingProgress.active = true;

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

                state.engagement.maxScroll = Math.max(state.engagement.maxScroll, roundedProgress);

                milestones.forEach(milestone => {
                    if (roundedProgress >= milestone && 
                        !state.readingProgress.reportedMilestones.has(milestone)) {
                        
                        state.readingProgress.reportedMilestones.add(milestone);
                        utils.safeTrack('reading_progress', `${milestone}%`, {
                            progress: milestone,
                            article_height: articleHeight,
                            viewport_height: windowHeight,
                            dual_ads_present: state.ads.static.placed,
                            irons_loaded: state.ads.static.irons.loaded,
                            putters_loaded: state.ads.static.putters.loaded
                        });
                    }
                });
            } catch (error) {
                console.warn('Reading progress error:', error);
            }
        }, state.isMobile ? 1500 : 1000);

        window.addEventListener('scroll', updateProgress, { passive: true });
        utils.log('Reading progress initialized with dual ad integration');
    }

    // Enhanced engagement tracking (unchanged)
    function setupEngagementTracking() {
        window.addEventListener('scroll', utils.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            state.engagement.maxScroll = Math.max(state.engagement.maxScroll, scrollPercent);
        }, 1000), { passive: true });

        const interactionEvents = state.isMobile 
            ? ['touchstart', 'click']
            : ['click', 'keydown', 'mousemove'];

        interactionEvents.forEach(event => {
            document.addEventListener(event, utils.throttle(() => {
                state.engagement.interactions++;
            }, 2000), { passive: true });
        });

        utils.log('Enhanced engagement tracking initialized with dual ad system');
    }

    // Enhanced image lazy loading (unchanged)
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

                    utils.safeTrack('image_viewed', img.alt || 'unnamed_image', {
                        image_src: img.src,
                        viewport_height: window.innerHeight,
                        dual_ads_present: state.ads.static.placed
                    });

                    imageObserver.unobserve(img);
                }
            });
        }, { threshold: 0.1 });

        images.forEach(img => imageObserver.observe(img));
        utils.log('Enhanced image lazy loading initialized for', images.length, 'images');
    }

    // Enhanced link tracking (unchanged)
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
                    dual_ads_present: state.ads.static.placed
                });
            });
        });

        utils.log('Enhanced link tracking initialized for', links.length, 'links');
    }

    // Enhanced mobile optimizations (unchanged)
    function setupMobileOptimizations() {
        if (!state.isMobile) return;

        document.addEventListener('touchstart', () => {
            state.engagement.interactions++;
        }, { passive: true, once: true });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                state.isMobile = utils.isMobile();
                utils.safeTrack('orientation_change', state.isMobile ? 'portrait' : 'landscape', {
                    new_width: window.innerWidth,
                    new_height: window.innerHeight,
                    dual_ads_loaded: state.ads.static.loaded
                });
            }, 100);
        });

        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                setupImageLazyLoading();
            });
        } else {
            setTimeout(setupImageLazyLoading, 1000);
        }

        utils.log('Enhanced mobile optimizations initialized with dual ad system');
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
                        ad_system: 'dual_static_v2',
                        dual_ads_loaded: state.ads.static.loaded,
                        irons_loaded: state.ads.static.irons.loaded,
                        putters_loaded: state.ads.static.putters.loaded
                    });
                }
            }, 1000);
        });

        // Enhanced dual ad performance monitoring
        setInterval(() => {
            if (state.ads.static.loaded) {
                utils.safeTrack('dual_ad_performance', 'periodic_check', {
                    total_impressions: state.ads.static.impressions,
                    total_clicks: state.ads.static.clicked.size,
                    total_visible: state.ads.static.visible.size,
                    irons_stats: {
                        loaded: state.ads.static.irons.loaded,
                        visible: state.ads.static.irons.visible,
                        clicked: state.ads.static.irons.clicked,
                        impressions: state.ads.static.irons.impressions
                    },
                    putters_stats: {
                        loaded: state.ads.static.putters.loaded,
                        visible: state.ads.static.putters.visible,
                        clicked: state.ads.static.putters.clicked,
                        impressions: state.ads.static.putters.impressions
                    },
                    errors: state.ads.performance.errors,
                    load_time: state.ads.performance.loadTime
                });
            }
        }, 60000); // Every minute

        utils.log('Enhanced dual ad performance monitoring initialized');
    }

    // Enhanced error handling (unchanged)
    function setupErrorHandling() {
        window.addEventListener('error', (event) => {
            utils.safeTrack('javascript_error', 'global', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                dual_ads_loaded: state.ads.static.loaded
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            utils.safeTrack('promise_rejection', 'unhandled', {
                reason: event.reason?.toString() || 'unknown',
                dual_ads_loaded: state.ads.static.loaded
            });
        });

        utils.log('Enhanced error handling initialized with dual ad system');
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
            
            // Initialize enhanced dual static advertisement system
            setupStaticAdSystem();

            // Track successful initialization
            utils.safeTrack('blog_supplements', 'initialized', {
                version: CONFIG.version,
                is_mobile: state.isMobile,
                viewport_width: window.innerWidth,
                dual_static_ads_enabled: CONFIG.staticAds.enabled,
                user_agent: navigator.userAgent.substring(0, 100)
            });

            utils.log('Enhanced dual ad blog supplements initialized successfully', CONFIG.version);

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
            dual_ad_impressions: state.ads.static.impressions,
            dual_ad_clicks: state.ads.static.clicked.size,
            dual_ad_visible: state.ads.static.visible.size,
            irons_performance: {
                loaded: state.ads.static.irons.loaded,
                visible: state.ads.static.irons.visible,
                clicked: state.ads.static.irons.clicked
            },
            putters_performance: {
                loaded: state.ads.static.putters.loaded,
                visible: state.ads.static.putters.visible,
                clicked: state.ads.static.putters.clicked
            }
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
                testClick: (adId, adType) => {
                    const trackingId = utils.getAdConfig(adType)?.trackingId || 'test';
                    handleEnhancedAdClick(adId, adType || 'irons', 0, trackingId);
                },
                getDualStats: () => ({
                    irons: state.ads.static.irons,
                    putters: state.ads.static.putters,
                    overall: {
                        loaded: state.ads.static.loaded,
                        placed: state.ads.static.placed,
                        total_impressions: state.ads.static.impressions,
                        total_clicks: state.ads.static.clicked.size,
                        total_visible: state.ads.static.visible.size
                    }
                })
            }
        };
    }

})();
