// CARAMBOLA GOLF CLUB - FIXED BLOG SUPPLEMENTS
// Immediate ad display for testing, then engagement-based

(function() {
    'use strict';

    // Prevent duplicate initialization
    if (window.CarambolaBlogSupplementsInitialized) {
        console.log('🟡 Blog supplements already initialized');
        return;
    }

    // TESTING MODE: Set to true for immediate ads, false for engagement-based
    const TESTING_MODE = true;

    // Simplified configuration for testing
    const CONFIG = {
        version: '2.1.0',
        debugMode: true, // Enable for testing
        
        // Relaxed engagement requirements for testing
        engagementRequirements: {
            minTimeOnPage: TESTING_MODE ? 0 : 10000, // 0 for testing, 10 seconds normally
            minScrollPercent: TESTING_MODE ? 0 : 10, // 0 for testing, 10% normally  
            minInteractions: TESTING_MODE ? 0 : 0    // 0 for both testing and normal
        },
        
        // Tracking throttling
        trackingThrottle: 2000,
        maxTrackingEvents: 25
    };

    // State management
    const state = {
        trackingEvents: 0,
        lastTrackingTime: 0,
        isTracking: false,
        
        engagement: {
            startTime: Date.now(),
            interactions: 0,
            maxScroll: 0,
            qualified: TESTING_MODE // Start qualified if testing
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

    // Utility functions
    const utils = {
        log: (...args) => {
            if (CONFIG.debugMode) {
                console.log('📚 Blog Fixed:', ...args);
            }
        },

        // Safe tracking with throttling
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
                if (typeof window.trackBlogInteraction === 'function') {
                    window.trackBlogInteraction(action, category, {
                        ...details,
                        blog_supplement_fixed: true
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

        // Check user engagement
        isUserEngaged: () => {
            if (TESTING_MODE) return true; // Always engaged in testing mode
            
            const timeOnPage = Date.now() - state.engagement.startTime;
            const scrollPercent = state.engagement.maxScroll;
            const interactions = state.engagement.interactions;
            
            const req = CONFIG.engagementRequirements;
            return timeOnPage >= req.minTimeOnPage &&
                   scrollPercent >= req.minScrollPercent &&
                   interactions >= req.minInteractions;
        },

        // Throttle utility
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
        }
    };

    // Advertisement placement - FIXED VERSION
    function placeAdvertisements() {
        if (state.ads.placed) {
            utils.log('Ads already placed, skipping');
            return;
        }

        utils.log('Placing advertisements...');

        const article = document.querySelector('.article-body');
        if (!article) {
            utils.log('No article body found');
            return;
        }

        // Commission Junction ad code
        const adCode = `
            <a href="https://www.tkqlhce.com/click-101520211-16945650" target="_top" rel="noopener">
                <img src="https://www.ftjcfx.com/image-101520211-16945650" 
                     width="970" height="250" 
                     alt="Premium Golf Equipment" 
                     border="0"
                     style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
            </a>`;

        let adsPlaced = 0;

        // Place mid-article ad
        const midAd = placeMidArticleAd(article, adCode);
        if (midAd) {
            adsPlaced++;
            utils.log('Mid-article ad placed');
            utils.safeTrack('ad_displayed', 'advertising', {
                placement: 'mid_article'
            });
        }

        // Place bottom ad  
        const bottomAd = placeBottomArticleAd(article, adCode);
        if (bottomAd) {
            adsPlaced++;
            utils.log('Bottom article ad placed');
            utils.safeTrack('ad_displayed', 'advertising', {
                placement: 'bottom_article'
            });
        }

        if (adsPlaced > 0) {
            state.ads.placed = true;
            utils.log(`Successfully placed ${adsPlaced} advertisements`);
        } else {
            utils.log('No advertisements were placed');
        }
    }

    function placeMidArticleAd(article, adCode) {
        // Find a good insertion point - after second paragraph or first H2
        const headings = article.querySelectorAll('h2');
        const paragraphs = article.querySelectorAll('p');
        let insertionPoint = null;

        // Try to find the second H2 heading
        if (headings.length >= 2) {
            insertionPoint = headings[1];
            utils.log('Inserting mid-ad after second H2');
        } 
        // Otherwise use a paragraph in the middle
        else if (paragraphs.length >= 3) {
            const middleIndex = Math.min(2, Math.floor(paragraphs.length / 2));
            insertionPoint = paragraphs[middleIndex];
            utils.log(`Inserting mid-ad after paragraph ${middleIndex + 1}`);
        }

        if (insertionPoint) {
            const adElement = createAdElement('mid', adCode);
            
            // Insert after the element
            if (insertionPoint.nextSibling) {
                insertionPoint.parentNode.insertBefore(adElement, insertionPoint.nextSibling);
            } else {
                insertionPoint.parentNode.appendChild(adElement);
            }
            
            // Make visible immediately in testing mode
            if (TESTING_MODE) {
                adElement.classList.add('visible');
                utils.log('Mid-ad made immediately visible (testing mode)');
            } else {
                setTimeout(() => {
                    adElement.classList.add('visible');
                }, 500);
            }
            
            return adElement;
        }
        
        utils.log('No suitable insertion point found for mid-article ad');
        return null;
    }

    function placeBottomArticleAd(article, adCode) {
        // Find insertion point before author bio or share section
        const authorBio = document.querySelector('.author-bio');
        const shareSection = document.querySelector('.share-section');
        const faqSection = document.querySelector('.faq-section');
        
        let insertionPoint = authorBio || shareSection || faqSection;
        
        if (insertionPoint) {
            const adElement = createAdElement('bottom', adCode);
            insertionPoint.parentNode.insertBefore(adElement, insertionPoint);
            
            // Make visible immediately in testing mode
            if (TESTING_MODE) {
                adElement.classList.add('visible');
                utils.log('Bottom ad made immediately visible (testing mode)');
            } else {
                setTimeout(() => {
                    adElement.classList.add('visible');
                }, 800);
            }
            
            return adElement;
        }
        
        // Fallback: append to end of article
        const adElement = createAdElement('bottom', adCode);
        article.appendChild(adElement);
        
        if (TESTING_MODE) {
            adElement.classList.add('visible');
            utils.log('Bottom ad appended to article and made visible (testing mode)');
        }
        
        return adElement;
    }

    function createAdElement(placement, adCode) {
        const adContainer = document.createElement('div');
        adContainer.className = `blog-advertisement blog-ad-${placement}`;
        
        // In testing mode, start visible
        if (TESTING_MODE) {
            adContainer.style.opacity = '1';
            adContainer.style.visibility = 'visible';
        }
        
        adContainer.innerHTML = adCode;
        
        // Add click tracking
        const adLink = adContainer.querySelector('a');
        if (adLink) {
            adLink.addEventListener('click', () => {
                state.ads.clicksTracked++;
                utils.safeTrack('ad_click', 'advertising', {
                    placement: placement,
                    total_clicks: state.ads.clicksTracked,
                    testing_mode: TESTING_MODE
                });
                utils.log(`Ad clicked: ${placement}`);
            });
        }
        
        utils.log(`Created ${placement} ad element`);
        return adContainer;
    }

    // Reading progress tracker
    function setupReadingProgress() {
        if (state.readingProgress.active) return;
        
        const article = document.querySelector('.article-body');
        if (!article) return;

        state.readingProgress.active = true;

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.appendChild(progressBar);
        
        const progressFill = progressBar.querySelector('.reading-progress-fill');
        const milestones = [25, 50, 75, 90];

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
                if (roundedProgress > state.readingProgress.maxProgress) {
                    state.readingProgress.maxProgress = roundedProgress;

                    milestones.forEach(milestone => {
                        if (roundedProgress >= milestone && 
                            !state.readingProgress.reportedMilestones.has(milestone)) {
                            
                            state.readingProgress.reportedMilestones.add(milestone);
                            utils.safeTrack('reading_progress', `${milestone}%`, {
                                progress: milestone
                            });
                        }
                    });
                }
            } catch (error) {
                console.warn('Reading progress error:', error);
            }
        }, 1000);

        window.addEventListener('scroll', updateProgress, { passive: true });
        utils.log('Reading progress initialized');
    }

    // Engagement tracking
    function setupEngagementTracking() {
        const trackInteraction = utils.throttle(() => {
            state.engagement.interactions++;
            
            if (!state.engagement.qualified && utils.isUserEngaged()) {
                state.engagement.qualified = true;
                utils.safeTrack('user_engaged', 'engagement', {
                    time_to_engage: Date.now() - state.engagement.startTime
                });
                
                // Show ads for engaged users (unless already shown in testing mode)
                if (!state.ads.placed) {
                    placeAdvertisements();
                }
            }
        }, 3000);

        // Track interactions
        document.addEventListener('click', trackInteraction, { passive: true });
        document.addEventListener('keydown', trackInteraction, { passive: true });
        
        // Time-based engagement check
        if (!TESTING_MODE) {
            setTimeout(() => {
                if (utils.isUserEngaged() && !state.engagement.qualified) {
                    state.engagement.qualified = true;
                    if (!state.ads.placed) {
                        placeAdvertisements();
                    }
                }
            }, CONFIG.engagementRequirements.minTimeOnPage);
        }

        utils.log('Engagement tracking initialized');
    }

    // Enhanced image handling
    function setupImageHandling() {
        const images = document.querySelectorAll('.article-image img');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        utils.safeTrack('image_viewed', 'content', {
                            src: img.src.split('/').pop() || 'unknown'
                        });
                        
                        img.classList.add('blog-fade-in');
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

        utils.log(`Image handling setup for ${images.length} images`);
    }

    // Main initialization
    function initializeBlogSupplements() {
        try {
            utils.log('Starting blog supplements initialization...');

            // Initialize features
            setupReadingProgress();
            setupEngagementTracking();
            setupImageHandling();

            // In testing mode, place ads immediately
            if (TESTING_MODE) {
                utils.log('TESTING MODE: Placing ads immediately');
                setTimeout(() => {
                    placeAdvertisements();
                }, 1000); // Wait 1 second for DOM to be ready
            }

            // Mark as initialized
            window.CarambolaBlogSupplementsInitialized = true;

            // Track initialization
            utils.safeTrack('blog_supplements_loaded', 'system', {
                version: CONFIG.version,
                testing_mode: TESTING_MODE
            });

            console.log('✅ Blog supplements initialized successfully');

        } catch (error) {
            console.error('❌ Blog supplements initialization error:', error);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBlogSupplements);
    } else {
        initializeBlogSupplements();
    }

    // Debug utilities
    if (CONFIG.debugMode) {
        window.BlogSupplementDebug = {
            state: state,
            config: CONFIG,
            utils: utils,
            placeAds: () => {
                utils.log('Manual ad placement triggered');
                placeAdvertisements();
            },
            clearAds: () => {
                document.querySelectorAll('.blog-advertisement').forEach(ad => ad.remove());
                state.ads.placed = false;
                utils.log('All ads cleared');
            }
        };
        
        utils.log('Debug utilities available at window.BlogSupplementDebug');
    }

})();
