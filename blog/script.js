// CARAMBOLA GOLF CLUB BLOG SUPPLEMENTS - OPTIMIZED VERSION
// Only adds blog-specific functionality without overriding main site - CONFLICT-FREE

(function() {
    'use strict';

    // Prevent duplicate initialization and conflicts
    if (window.CarambolaBlogSupplementsInitialized) {
        console.log('🟡 Blog supplements already initialized');
        return;
    }

    // Lightweight configuration - Optimized for performance
    const CONFIG = {
        version: '2.1.0',
        debugMode: false,
        
        // Engagement requirements for ads - Mobile optimized
        engagementRequirements: {
            minTimeOnPage: 20000, // Reduced to 20 seconds for mobile
            minScrollPercent: 20, // Reduced to 20% scroll for mobile
            minInteractions: 1 // At least 1 interaction
        },
        
        // Tracking throttling - Optimized
        trackingThrottle: 1500, // Reduced for better responsiveness
        maxTrackingEvents: 30 // Slightly increased limit
    };

    // State management - Enhanced
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
            placed: false,
            clicksTracked: 0
        }
    };

    // Utility functions - Enhanced with mobile detection
    const utils = {
        log: (...args) => {
            if (CONFIG.debugMode) {
                console.log('📚 Blog:', ...args);
            }
        },

        // Mobile detection
        isMobile: () => {
            return window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        // Enhanced safe tracking with mobile optimizations
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
                // Use existing tracking if available - with conflict prevention
                if (typeof window.trackBlogInteraction === 'function') {
                    window.trackBlogInteraction(action, category, {
                        ...details,
                        blog_supplement: true,
                        is_mobile: state.isMobile,
                        viewport_width: window.innerWidth
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

        // Enhanced engagement detection with mobile considerations
        isUserEngaged: () => {
            const timeOnPage = Date.now() - state.engagement.startTime;
            const scrollPercent = state.engagement.maxScroll;
            const interactions = state.engagement.interactions;
            
            const req = CONFIG.engagementRequirements;
            
            // Adjust requirements for mobile
            const adjustedTimeReq = state.isMobile ? req.minTimeOnPage * 0.8 : req.minTimeOnPage;
            const adjustedScrollReq = state.isMobile ? req.minScrollPercent * 0.8 : req.minScrollPercent;
            
            return timeOnPage >= adjustedTimeReq &&
                   scrollPercent >= adjustedScrollReq &&
                   interactions >= req.minInteractions;
        },

        // Enhanced throttle utility with better mobile performance
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

        // Mobile-optimized intersection observer
        createObserver: (callback, options = {}) => {
            const defaultOptions = {
                rootMargin: state.isMobile ? '20px 0px' : '50px 0px',
                threshold: state.isMobile ? 0.05 : 0.1,
                ...options
            };

            if ('IntersectionObserver' in window) {
                return new IntersectionObserver(callback, defaultOptions);
            }
            return null;
        }
    };

    // Enhanced reading progress tracker with mobile optimizations
    function setupReadingProgress() {
        if (state.readingProgress.active) return;
        
        const article = document.querySelector('.article-body');
        if (!article) return;

        state.readingProgress.active = true;

        // Create mobile-optimized progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        progressBar.style.height = state.isMobile ? '3px' : '4px'; // Thinner on mobile
        document.body.appendChild(progressBar);
        
        const progressFill = progressBar.querySelector('.reading-progress-fill');
        const milestones = state.isMobile ? [25, 50, 75] : [25, 50, 75, 90]; // Fewer milestones on mobile

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

                // Track milestones with mobile optimization
                if (roundedProgress > state.readingProgress.maxProgress) {
                    state.readingProgress.maxProgress = roundedProgress;

                    milestones.forEach(milestone => {
                        if (roundedProgress >= milestone && 
                            !state.readingProgress.reportedMilestones.has(milestone)) {
                            
                            state.readingProgress.reportedMilestones.add(milestone);
                            utils.safeTrack('reading_progress', `${milestone}%`, {
                                progress: milestone,
                                article_height: articleHeight,
                                viewport_height: windowHeight
                            });
                        }
                    });
                }
            } catch (error) {
                console.warn('Reading progress error:', error);
            }
        }, state.isMobile ? 1500 : 1000); // Longer throttle on mobile

        window.addEventListener('scroll', updateProgress, { passive: true });
        utils.log('Reading progress initialized');
    }

    // Enhanced engagement tracking with mobile considerations
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

        utils.log('Engagement tracking initialized');
    }

    // Enhanced ad placement system with mobile optimizations
    function setupAdSystem() {
        if (state.ads.placed) return;

        const article = document.querySelector('.article-body');
        if (!article) return;

        // Wait for user engagement before placing ads
        const checkEngagement = () => {
            if (utils.isUserEngaged() && !state.ads.placed) {
                placeAdvertisements();
                state.ads.placed = true;
                utils.safeTrack('ads_placed', 'user_engaged', {
                    time_to_engage: Date.now() - state.engagement.startTime,
                    interactions: state.engagement.interactions,
                    max_scroll: state.engagement.maxScroll
                });
            }
        };

        // Check engagement periodically
        const engagementChecker = setInterval(() => {
            checkEngagement();
            if (state.ads.placed) {
                clearInterval(engagementChecker);
            }
        }, state.isMobile ? 5000 : 3000); // Less frequent checks on mobile

        // Fallback: place ads after 60 seconds regardless
        setTimeout(() => {
            if (!state.ads.placed) {
                placeAdvertisements();
                state.ads.placed = true;
                utils.safeTrack('ads_placed', 'fallback_timer', {
                    fallback_reason: 'timeout'
                });
            }
            clearInterval(engagementChecker);
        }, 60000);

        utils.log('Ad system initialized');
    }

    // Enhanced advertisement placement with mobile optimization
    function placeAdvertisements() {
        const article = document.querySelector('.article-body');
        if (!article) return;

        const paragraphs = article.querySelectorAll('p');
        if (paragraphs.length < 4) return; // Need minimum content

        // Mobile-optimized ad placement
        const adPositions = state.isMobile 
            ? [Math.floor(paragraphs.length * 0.4)] // Single ad on mobile
            : [Math.floor(paragraphs.length * 0.3), Math.floor(paragraphs.length * 0.7)]; // Two ads on desktop

        adPositions.forEach((position, index) => {
            if (paragraphs[position]) {
                const adElement = createAdElement(index === 0 ? 'mid' : 'bottom');
                paragraphs[position].parentNode.insertBefore(adElement, paragraphs[position].nextSibling);
            }
        });

        // Setup ad tracking
        setupAdTracking();
        utils.log('Advertisements placed:', adPositions.length);
    }

    // Enhanced ad element creation
    function createAdElement(position) {
        const adContainer = document.createElement('div');
        adContainer.className = `blog-advertisement blog-ad-${position} blog-fade-in`;
        
        // Mobile-optimized ad content
        const adWidth = state.isMobile ? 300 : 728;
        const adHeight = state.isMobile ? 250 : 90;
        
        adContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem 1rem;">
                <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                           border: 2px solid #d4af37; border-radius: 12px; 
                           padding: 2rem; max-width: ${adWidth}px; margin: 0 auto;
                           box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <h4 style="color: #1e3a5f; margin: 0 0 1rem 0; font-size: 1.1rem;">
                        🏌️ Plan Your Perfect St. Croix Golf Vacation
                    </h4>
                    <p style="color: #666; margin: 0 0 1.5rem 0; line-height: 1.5;">
                        Discover championship golf at Carambola with vacation packages, 
                        accommodations, and island activities for the ultimate Caribbean getaway.
                    </p>
                    <a href="/accommodations.html" 
                       class="ad-cta-button" 
                       onclick="trackAdClick('${position}', 'accommodations')"
                       style="background: #d4af37; color: #1e3a5f; padding: 0.8rem 2rem; 
                              border-radius: 25px; text-decoration: none; font-weight: 600; 
                              display: inline-block; transition: all 0.3s ease;
                              box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);">
                        Explore Golf Packages
                    </a>
                </div>
            </div>
        `;

        return adContainer;
    }

    // Enhanced ad tracking system
    function setupAdTracking() {
        const ads = document.querySelectorAll('.blog-advertisement');
        
        ads.forEach((ad, index) => {
            // Track ad visibility with intersection observer
            const observer = utils.createObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        utils.safeTrack('ad_viewed', `position_${index}`, {
                            ad_position: index,
                            visibility_ratio: entry.intersectionRatio
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            if (observer) {
                observer.observe(ad);
            }

            // Add hover tracking for desktop
            if (!state.isMobile) {
                ad.addEventListener('mouseenter', () => {
                    utils.safeTrack('ad_hover', `position_${index}`, {
                        ad_position: index
                    });
                });
            }
        });
    }

    // Global ad click tracking function
    window.trackAdClick = function(position, destination) {
        state.ads.clicksTracked++;
        utils.safeTrack('ad_click', destination, {
            ad_position: position,
            total_clicks: state.ads.clicksTracked,
            time_on_page: Date.now() - state.engagement.startTime
        });
    };

    // Enhanced image lazy loading with fade-in effect
    function setupImageLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if (!images.length) return;

        const imageObserver = utils.createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Add fade-in class when image loads
                    img.addEventListener('load', () => {
                        img.classList.add('blog-fade-in');
                    });

                    // Track image views
                    utils.safeTrack('image_viewed', img.alt || 'unnamed_image', {
                        image_src: img.src,
                        viewport_height: window.innerHeight
                    });

                    imageObserver.unobserve(img);
                }
            });
        }, { threshold: 0.1 });

        images.forEach(img => imageObserver.observe(img));
        utils.log('Image lazy loading initialized for', images.length, 'images');
    }

    // Enhanced link tracking
    function setupLinkTracking() {
        const links = document.querySelectorAll('.article-body a, .cta-button');
        
        links.forEach(link => {
            link.addEventListener('click', (event) => {
                const href = link.href;
                const text = link.textContent.trim();
                const isExternal = href && !href.startsWith(window.location.origin);
                
                utils.safeTrack('link_click', isExternal ? 'external' : 'internal', {
                    url: href,
                    text: text.substring(0, 50), // Limit text length
                    is_external: isExternal,
                    is_cta: link.classList.contains('cta-button')
                });
            });
        });

        utils.log('Link tracking initialized for', links.length, 'links');
    }

    // Enhanced mobile-specific optimizations
    function setupMobileOptimizations() {
        if (!state.isMobile) return;

        // Optimize touch interactions
        document.addEventListener('touchstart', () => {
            state.engagement.interactions++;
        }, { passive: true, once: true });

        // Optimize viewport changes (rotation, etc.)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                state.isMobile = utils.isMobile();
                utils.safeTrack('orientation_change', state.isMobile ? 'portrait' : 'landscape', {
                    new_width: window.innerWidth,
                    new_height: window.innerHeight
                });
            }, 100);
        });

        // Mobile-specific performance optimizations
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Defer non-critical mobile optimizations
                setupImageLazyLoading();
            });
        } else {
            setTimeout(setupImageLazyLoading, 1000);
        }

        utils.log('Mobile optimizations initialized');
    }

    // Enhanced performance monitoring
    function setupPerformanceMonitoring() {
        if (!('performance' in window)) return;

        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    utils.safeTrack('page_performance', 'load_complete', {
                        load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                        dom_ready: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                        first_byte: Math.round(perfData.responseStart - perfData.requestStart),
                        is_mobile: state.isMobile
                    });
                }
            }, 1000);
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                    utils.log('High memory usage detected:', memory.usedJSHeapSize);
                }
            }, 30000);
        }

        utils.log('Performance monitoring initialized');
    }

    // Enhanced error handling and recovery
    function setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            utils.safeTrack('javascript_error', 'global', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            utils.safeTrack('promise_rejection', 'unhandled', {
                reason: event.reason?.toString() || 'unknown'
            });
        });

        // Blog-specific error recovery
        const criticalElements = ['.article-body', '.blog-hero', '.footer-status'];
        criticalElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (!element) {
                utils.safeTrack('missing_element', 'critical', {
                    selector: selector
                });
            }
        });

        utils.log('Error handling initialized');
    }

    // Main initialization function
    function initializeBlogSupplements() {
        try {
            // Mark as initialized to prevent duplicates
            window.CarambolaBlogSupplementsInitialized = true;

            // Initialize core systems
            setupEngagementTracking();
            setupReadingProgress();
            setupLinkTracking();
            setupMobileOptimizations();
            setupPerformanceMonitoring();
            setupErrorHandling();
            
            // Initialize ad system (with engagement requirements)
            setupAdSystem();

            // Track successful initialization
            utils.safeTrack('blog_supplements', 'initialized', {
                version: CONFIG.version,
                is_mobile: state.isMobile,
                viewport_width: window.innerWidth,
                user_agent: navigator.userAgent.substring(0, 100)
            });

            utils.log('Blog supplements initialized successfully', CONFIG.version);

        } catch (error) {
            console.error('Blog supplements initialization failed:', error);
            
            // Attempt graceful degradation
            try {
                utils.safeTrack('initialization_error', 'fallback', {
                    error_message: error.message
                });
            } catch (trackingError) {
                console.error('Even error tracking failed:', trackingError);
            }
        }
    }

    // Enhanced initialization timing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBlogSupplements);
    } else if (document.readyState === 'interactive') {
        // DOM is ready but resources might still be loading
        setTimeout(initializeBlogSupplements, 100);
    } else {
        // Document is fully loaded
        initializeBlogSupplements();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        // Final engagement tracking
        utils.safeTrack('page_unload', 'session_end', {
            time_on_page: Date.now() - state.engagement.startTime,
            max_scroll: state.engagement.maxScroll,
            total_interactions: state.engagement.interactions,
            ads_clicked: state.ads.clicksTracked
        });
    });

    // Export utilities for external use (debugging/testing)
    if (CONFIG.debugMode) {
        window.BlogSupplementsDebug = {
            state,
            utils,
            CONFIG
        };
    }

})();
