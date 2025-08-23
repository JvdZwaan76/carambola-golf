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
