// CARAMBOLA GOLF CLUB BLOG - SUPPLEMENTARY SCRIPT
// Blog-specific functionality that loads after main script.js
// FIXED: Tracking loops and adds advertising for engaged users

(function() {
    'use strict';

    console.log('📝 Blog supplementary script loading...');

    // Prevent multiple initialization of blog supplements
    if (window.CarambolaBlogSupplementsInitialized) {
        console.log('🟡 Blog supplements already initialized');
        return;
    }

    // Blog supplement configuration
    const BLOG_SUPPLEMENT_CONFIG = {
        version: '1.0.0',
        debugMode: false,
        
        // FIXED: Tracking control settings
        trackingThrottle: 1000, // 1 second minimum between tracking events
        maxTrackingEvents: 50, // Maximum tracking events per session
        
        // Engagement settings for ads
        engagementRequirements: {
            minTimeOnPage: 30000, // 30 seconds
            minScrollPercent: 25, // 25% scroll
            minInteractions: 1 // At least 1 interaction
        },
        
        // Ad placement settings
        adPlacements: {
            enabled: true,
            midArticle: true,
            bottomArticle: true,
            trackClicks: true
        }
    };

    // FIXED: Global state management to prevent tracking loops
    const blogState = {
        trackingEvents: 0,
        lastTrackingTime: 0,
        isTracking: false,
        
        // Reading progress state
        readingProgress: {
            active: false,
            maxProgress: 0,
            reportedMilestones: new Set(),
            lastUpdate: 0
        },
        
        // Engagement tracking
        engagement: {
            startTime: Date.now(),
            interactions: 0,
            maxScroll: 0,
            qualified: false
        },
        
        // Ad state
        ads: {
            placed: false,
            midArticleShown: false,
            bottomArticleShown: false,
            clicksTracked: 0
        }
    };

    // Utility functions for blog supplements
    const blogUtils = {
        log: (...args) => {
            if (BLOG_SUPPLEMENT_CONFIG.debugMode) {
                console.log('📝 Blog Supplement:', ...args);
            }
        },

        // FIXED: Safe tracking function with loop prevention
        safeTrack: (action, category, details = {}) => {
            const now = Date.now();
            
            // Prevent tracking loops
            if (blogState.isTracking) {
                blogUtils.log('Tracking blocked - already in progress');
                return false;
            }
            
            // Throttle tracking events
            if (now - blogState.lastTrackingTime < BLOG_SUPPLEMENT_CONFIG.trackingThrottle) {
                blogUtils.log('Tracking throttled');
                return false;
            }
            
            // Limit total tracking events
            if (blogState.trackingEvents >= BLOG_SUPPLEMENT_CONFIG.maxTrackingEvents) {
                blogUtils.log('Tracking limit reached');
                return false;
            }
            
            blogState.isTracking = true;
            blogState.lastTrackingTime = now;
            blogState.trackingEvents++;
            
            try {
                // Use existing tracking functions if available
                if (window.CarambolaBlog && typeof window.CarambolaBlog.trackEvent === 'function') {
                    window.CarambolaBlog.trackEvent(action, category, {
                        ...details,
                        blog_supplement: true,
                        timestamp: now
                    });
                } else if (typeof window.trackBlogInteraction === 'function') {
                    window.trackBlogInteraction(action, category, details);
                }
                
                blogUtils.log('Tracked:', action, category);
                return true;
            } catch (error) {
                console.warn('Blog supplement tracking error:', error);
                return false;
            } finally {
                // Always reset tracking flag
                setTimeout(() => {
                    blogState.isTracking = false;
                }, 100);
            }
        },

        // Throttle function
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

        // Check if user is engaged enough to see ads
        isUserEngaged: () => {
            const timeOnPage = Date.now() - blogState.engagement.startTime;
            const scrollPercent = blogState.engagement.maxScroll;
            const interactions = blogState.engagement.interactions;
            
            const requirements = BLOG_SUPPLEMENT_CONFIG.engagementRequirements;
            
            return timeOnPage >= requirements.minTimeOnPage &&
                   scrollPercent >= requirements.minScrollPercent &&
                   interactions >= requirements.minInteractions;
        },

        // Create advertising element
        createAdElement: (placement, adCode) => {
            const adContainer = document.createElement('div');
            adContainer.className = `blog-advertisement blog-ad-${placement}`;
            adContainer.setAttribute('data-placement', placement);
            adContainer.setAttribute('data-ad-tracked', 'false');
            adContainer.innerHTML = adCode;
            
            // Add click tracking
            const adLink = adContainer.querySelector('a');
            if (adLink && BLOG_SUPPLEMENT_CONFIG.adPlacements.trackClicks) {
                adLink.addEventListener('click', () => {
                    blogState.ads.clicksTracked++;
                    blogUtils.safeTrack('ad_click', 'advertising', {
                        placement: placement,
                        total_clicks: blogState.ads.clicksTracked,
                        engagement_level: blogUtils.getEngagementLevel()
                    });
                });
            }
            
            return adContainer;
        },

        // Get user engagement level
        getEngagementLevel: () => {
            const timeOnPage = Date.now() - blogState.engagement.startTime;
            const scrollPercent = blogState.engagement.maxScroll;
            
            if (timeOnPage > 120000 && scrollPercent > 75) return 'high';
            if (timeOnPage > 60000 && scrollPercent > 50) return 'medium';
            if (timeOnPage > 30000 && scrollPercent > 25) return 'basic';
            return 'low';
        }
    };

    // FIXED: Reading progress with proper state management
    function setupImprovedReadingProgress() {
        // Skip if reading progress is already active
        if (blogState.readingProgress.active) {
            blogUtils.log('Reading progress already active');
            return;
        }

        const article = document.querySelector('.article-body');
        if (!article) {
            blogUtils.log('No article found for reading progress');
            return;
        }

        blogState.readingProgress.active = true;
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.appendChild(progressBar);
        
        const progressFill = progressBar.querySelector('.reading-progress-fill');
        const milestones = [25, 50, 75, 90];

        const updateProgress = () => {
            if (blogState.isTracking) return; // Prevent tracking conflicts

            try {
                const articleRect = article.getBoundingClientRect();
                const articleTop = article.offsetTop;
                const articleHeight = article.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollTop = window.pageYOffset;

                // Calculate progress
                const viewportProgress = Math.max(0, Math.min(100, 
                    ((scrollTop - articleTop + windowHeight * 0.3) / articleHeight) * 100
                ));

                const roundedProgress = Math.round(viewportProgress);

                // Update progress bar
                progressFill.style.width = `${roundedProgress}%`;

                // Update engagement tracking
                blogState.engagement.maxScroll = Math.max(blogState.engagement.maxScroll, roundedProgress);

                // Track milestones (FIXED: with proper throttling)
                if (roundedProgress > blogState.readingProgress.maxProgress) {
                    blogState.readingProgress.maxProgress = roundedProgress;

                    milestones.forEach(milestone => {
                        if (roundedProgress >= milestone && 
                            !blogState.readingProgress.reportedMilestones.has(milestone)) {
                            
                            blogState.readingProgress.reportedMilestones.add(milestone);
                            
                            // FIXED: Use safe tracking
                            blogUtils.safeTrack('reading_progress', `${milestone}%`, {
                                progress: milestone,
                                engagement_level: blogUtils.getEngagementLevel(),
                                time_on_page: Date.now() - blogState.engagement.startTime
                            });
                        }
                    });
                }
            } catch (error) {
                console.warn('Reading progress error:', error);
            }
        };

        // FIXED: Properly throttled scroll handler
        const throttledUpdate = blogUtils.throttle(updateProgress, 500);
        
        window.addEventListener('scroll', throttledUpdate, { passive: true });
        
        blogUtils.log('Improved reading progress setup complete');
    }

    // Engagement tracking
    function setupEngagementTracking() {
        // Track user interactions
        const trackInteraction = blogUtils.throttle(() => {
            blogState.engagement.interactions++;
            
            // Check if user becomes engaged
            if (!blogState.engagement.qualified && blogUtils.isUserEngaged()) {
                blogState.engagement.qualified = true;
                blogUtils.safeTrack('user_engaged', 'engagement', {
                    time_to_engage: Date.now() - blogState.engagement.startTime,
                    interactions: blogState.engagement.interactions,
                    scroll_percent: blogState.engagement.maxScroll
                });
                
                // Place ads for engaged users
                if (BLOG_SUPPLEMENT_CONFIG.adPlacements.enabled) {
                    placeAdvertisements();
                }
            }
        }, 2000);

        // Track various interaction types
        document.addEventListener('click', trackInteraction, { passive: true });
        document.addEventListener('keydown', trackInteraction, { passive: true });
        
        // Track time-based engagement
        setTimeout(() => {
            if (blogUtils.isUserEngaged() && !blogState.engagement.qualified) {
                blogState.engagement.qualified = true;
                if (BLOG_SUPPLEMENT_CONFIG.adPlacements.enabled) {
                    placeAdvertisements();
                }
            }
        }, BLOG_SUPPLEMENT_CONFIG.engagementRequirements.minTimeOnPage);

        blogUtils.log('Engagement tracking setup complete');
    }

    // Advertisement placement for engaged users
    function placeAdvertisements() {
        if (blogState.ads.placed || !BLOG_SUPPLEMENT_CONFIG.adPlacements.enabled) {
            return;
        }

        const article = document.querySelector('.article-body');
        if (!article) return;

        const adCode = `<a href="https://www.tkqlhce.com/click-101520211-16945650" target="_top"><img src="https://www.ftjcfx.com/image-101520211-16945650" width="970" height="250" alt="Cobra KING Tour Black Irons" border="0"/></a>`;

        // Place mid-article ad
        if (BLOG_SUPPLEMENT_CONFIG.adPlacements.midArticle && !blogState.ads.midArticleShown) {
            const midPoint = placeMidArticleAd(article, adCode);
            if (midPoint) {
                blogState.ads.midArticleShown = true;
                blogUtils.safeTrack('ad_displayed', 'advertising', {
                    placement: 'mid_article',
                    engagement_level: blogUtils.getEngagementLevel()
                });
            }
        }

        // Place bottom ad
        if (BLOG_SUPPLEMENT_CONFIG.adPlacements.bottomArticle && !blogState.ads.bottomArticleShown) {
            const bottomAd = placeBottomArticleAd(article, adCode);
            if (bottomAd) {
                blogState.ads.bottomArticleShown = true;
                blogUtils.safeTrack('ad_displayed', 'advertising', {
                    placement: 'bottom_article',
                    engagement_level: blogUtils.getEngagementLevel()
                });
            }
        }

        blogState.ads.placed = true;
        blogUtils.log('Advertisements placed for engaged user');
    }

    // Place mid-article advertisement
    function placeMidArticleAd(article, adCode) {
        // Find second H2 or middle of article
        const headings = article.querySelectorAll('h2');
        let insertionPoint = null;

        if (headings.length >= 2) {
            insertionPoint = headings[1];
        } else {
            // Find middle paragraph
            const paragraphs = article.querySelectorAll('p');
            const middleIndex = Math.floor(paragraphs.length / 2);
            if (paragraphs[middleIndex]) {
                insertionPoint = paragraphs[middleIndex];
            }
        }

        if (insertionPoint) {
            const adElement = blogUtils.createAdElement('mid', adCode);
            insertionPoint.parentNode.insertBefore(adElement, insertionPoint.nextSibling);
            
            // Animate in
            setTimeout(() => {
                adElement.classList.add('visible');
            }, 500);
            
            return adElement;
        }
        
        return null;
    }

    // Place bottom article advertisement
    function placeBottomArticleAd(article, adCode) {
        // Place before author bio or at end of article
        const authorBio = document.querySelector('.author-bio');
        const shareSection = document.querySelector('.share-section');
        
        let insertionPoint = authorBio || shareSection;
        
        if (insertionPoint) {
            const adElement = blogUtils.createAdElement('bottom', adCode);
            insertionPoint.parentNode.insertBefore(adElement, insertionPoint);
            
            // Animate in
            setTimeout(() => {
                adElement.classList.add('visible');
            }, 500);
            
            return adElement;
        }
        
        return null;
    }

    // Enhanced image loading with lazy loading
    function setupEnhancedImageHandling() {
        const images = document.querySelectorAll('.article-image img');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Track image view
                        blogUtils.safeTrack('image_viewed', 'content', {
                            src: img.src.split('/').pop(),
                            alt: img.alt || 'no-alt-text'
                        });
                        
                        // Add loaded class for styling
                        img.classList.add('image-loaded');
                        
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            images.forEach(img => {
                imageObserver.observe(img);
            });
        }

        blogUtils.log(`Enhanced image handling setup for ${images.length} images`);
    }

    // Performance monitoring for blog supplements
    function setupPerformanceMonitoring() {
        // Monitor script performance
        const startTime = performance.now();
        
        window.addEventListener('load', () => {
            const endTime = performance.now();
            const loadTime = Math.round(endTime - startTime);
            
            blogUtils.safeTrack('blog_supplement_performance', 'timing', {
                load_time: loadTime,
                tracking_events: blogState.trackingEvents,
                ads_placed: blogState.ads.placed
            });
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                if (blogState.trackingEvents < BLOG_SUPPLEMENT_CONFIG.maxTrackingEvents) {
                    const memory = performance.memory;
                    blogUtils.log('Memory usage:', {
                        used: Math.round(memory.usedJSHeapSize / 1048576),
                        total: Math.round(memory.totalJSHeapSize / 1048576)
                    });
                }
            }, 30000); // Every 30 seconds
        }
    }

    // Cleanup function
    function setupCleanup() {
        window.addEventListener('beforeunload', () => {
            // Final engagement tracking
            if (blogState.engagement.qualified) {
                const finalEngagement = {
                    total_time: Date.now() - blogState.engagement.startTime,
                    max_scroll: blogState.engagement.maxScroll,
                    interactions: blogState.engagement.interactions,
                    ads_clicked: blogState.ads.clicksTracked,
                    reading_progress: blogState.readingProgress.maxProgress
                };
                
                blogUtils.safeTrack('session_end', 'engagement', finalEngagement);
            }
            
            blogUtils.log('Blog supplement session ended');
        });
    }

    // Main initialization function
    function initializeBlogSupplements() {
        blogUtils.log('Initializing blog supplements...');

        try {
            // Wait for main blog script to be ready
            if (!window.CarambolaBlogInitialized) {
                setTimeout(initializeBlogSupplements, 500);
                return;
            }

            // Setup all blog supplement features
            setupImprovedReadingProgress();
            setupEngagementTracking();
            setupEnhancedImageHandling();
            setupPerformanceMonitoring();
            setupCleanup();

            // Mark as initialized
            window.CarambolaBlogSupplementsInitialized = true;

            // Track initialization
            blogUtils.safeTrack('blog_supplements_loaded', 'system', {
                version: BLOG_SUPPLEMENT_CONFIG.version,
                features_enabled: {
                    reading_progress: true,
                    engagement_tracking: true,
                    advertisements: BLOG_SUPPLEMENT_CONFIG.adPlacements.enabled,
                    enhanced_images: true
                }
            });

            console.log('✅ Blog supplements initialized successfully');

        } catch (error) {
            console.error('❌ Blog supplements initialization error:', error);
            
            blogUtils.safeTrack('blog_supplements_error', 'error', {
                error_message: error.message,
                error_stack: error.stack?.substring(0, 200)
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBlogSupplements);
    } else {
        initializeBlogSupplements();
    }

    // Expose utilities for debugging
    if (BLOG_SUPPLEMENT_CONFIG.debugMode) {
        window.BlogSupplementDebug = {
            state: blogState,
            config: BLOG_SUPPLEMENT_CONFIG,
            utils: blogUtils,
            forceEngagement: () => {
                blogState.engagement.qualified = true;
                placeAdvertisements();
            },
            resetTracking: () => {
                blogState.trackingEvents = 0;
                blogState.lastTrackingTime = 0;
                blogState.isTracking = false;
                console.log('🔄 Blog supplement tracking reset');
            }
        };
    }

    console.log('📝 Blog supplement script loaded');

})();
