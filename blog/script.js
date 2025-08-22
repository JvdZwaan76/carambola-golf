// CARAMBOLA GOLF CLUB - LIGHTWEIGHT BLOG SUPPLEMENTS
// Only adds blog-specific functionality without overriding main site

(function() {
    'use strict';

    // Prevent duplicate initialization
    if (window.CarambolaBlogSupplementsInitialized) {
        console.log('🟡 Blog supplements already initialized');
        return;
    }

    // Lightweight configuration
    const CONFIG = {
        version: '2.0.0',
        debugMode: false,
        
        // Engagement requirements for ads
        engagementRequirements: {
            minTimeOnPage: 30000, // 30 seconds
            minScrollPercent: 25, // 25% scroll
            minInteractions: 1 // At least 1 interaction
        },
        
        // Tracking throttling
        trackingThrottle: 2000, // 2 seconds between events
        maxTrackingEvents: 25 // Reduced limit
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

    // Utility functions
    const utils = {
        log: (...args) => {
            if (CONFIG.debugMode) {
                console.log('📚 Blog:', ...args);
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
                // Use existing tracking if available
                if (typeof window.trackBlogInteraction === 'function') {
                    window.trackBlogInteraction(action, category, {
                        ...details,
                        blog_supplement: true
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
                
                // Show ads for engaged users
                placeAdvertisements();
            }
        }, 3000);

        // Track interactions
        document.addEventListener('click', trackInteraction, { passive: true });
        document.addEventListener('keydown', trackInteraction, { passive: true });
        
        // Time-based engagement check
        setTimeout(() => {
            if (utils.isUserEngaged() && !state.engagement.qualified) {
                state.engagement.qualified = true;
                placeAdvertisements();
            }
        }, CONFIG.engagementRequirements.minTimeOnPage);

        utils.log('Engagement tracking initialized');
    }

    // Advertisement placement
    function placeAdvertisements() {
        if (state.ads.placed) return;

        const article = document.querySelector('.article-body');
        if (!article) return;

        const adCode = `<a href="https://www.tkqlhce.com/click-101520211-16945650" target="_top" rel="noopener"><img src="https://www.ftjcfx.com/image-101520211-16945650" width="970" height="250" alt="Premium Golf Equipment" border="0"/></a>`;

        // Place mid-article ad
        const midPoint = placeMidArticleAd(article, adCode);
        if (midPoint) {
            utils.safeTrack('ad_displayed', 'advertising', {
                placement: 'mid_article'
            });
        }

        // Place bottom ad  
        const bottomAd = placeBottomArticleAd(article, adCode);
        if (bottomAd) {
            utils.safeTrack('ad_displayed', 'advertising', {
                placement: 'bottom_article'
            });
        }

        state.ads.placed = true;
        utils.log('Advertisements placed for engaged user');
    }

    function placeMidArticleAd(article, adCode) {
        // Find second H2 or middle paragraph
        const headings = article.querySelectorAll('h2');
        let insertionPoint = null;

        if (headings.length >= 2) {
            insertionPoint = headings[1];
        } else {
            const paragraphs = article.querySelectorAll('p');
            const middleIndex = Math.floor(paragraphs.length / 2);
            if (paragraphs[middleIndex]) {
                insertionPoint = paragraphs[middleIndex];
            }
        }

        if (insertionPoint) {
            const adElement = createAdElement('mid', adCode);
            insertionPoint.parentNode.insertBefore(adElement, insertionPoint.nextSibling);
            
            setTimeout(() => {
                adElement.classList.add('visible');
            }, 500);
            
            return adElement;
        }
        return null;
    }

    function placeBottomArticleAd(article, adCode) {
        const authorBio = document.querySelector('.author-bio');
        const shareSection = document.querySelector('.share-section');
        
        let insertionPoint = authorBio || shareSection;
        
        if (insertionPoint) {
            const adElement = createAdElement('bottom', adCode);
            insertionPoint.parentNode.insertBefore(adElement, insertionPoint);
            
            setTimeout(() => {
                adElement.classList.add('visible');
            }, 500);
            
            return adElement;
        }
        return null;
    }

    function createAdElement(placement, adCode) {
        const adContainer = document.createElement('div');
        adContainer.className = `blog-advertisement blog-ad-${placement}`;
        adContainer.innerHTML = adCode;
        
        // Add click tracking
        const adLink = adContainer.querySelector('a');
        if (adLink) {
            adLink.addEventListener('click', () => {
                state.ads.clicksTracked++;
                utils.safeTrack('ad_click', 'advertising', {
                    placement: placement,
                    total_clicks: state.ads.clicksTracked
                });
            });
        }
        
        return adContainer;
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

    // Newsletter form enhancement
    function setupNewsletterForm() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('newsletter-email');
            const nameInput = document.getElementById('newsletter-name');
            const submitButton = form.querySelector('button[type="submit"]');
            
            if (!emailInput || !emailInput.value.trim()) {
                showFormMessage('Please enter a valid email address', 'error');
                return;
            }
            
            // Add loading state
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            submitButton.disabled = true;
            
            // Track subscription attempt
            utils.safeTrack('newsletter_signup', 'engagement', {
                email_provided: !!emailInput.value,
                name_provided: !!nameInput.value.trim(),
                source: 'blog_footer'
            });
            
            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                showFormMessage('Thank you! Check your email for the free strategy guide.', 'success');
                form.reset();
                
                // Reset button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                utils.safeTrack('newsletter_success', 'conversion', {
                    source: 'blog_footer'
                });
            }, 2000);
        });

        utils.log('Newsletter form enhanced');
    }

    function showFormMessage(message, type) {
        const form = document.getElementById('newsletter-form');
        if (!form) return;
        
        // Remove existing messages
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message-${type}`;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            ${type === 'success' ? 
                'background: rgba(40, 167, 69, 0.1); color: #28a745; border: 1px solid rgba(40, 167, 69, 0.3);' :
                'background: rgba(220, 53, 69, 0.1); color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.3);'
            }
        `;
        messageDiv.textContent = message;
        
        form.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Article meta enhancements
    function setupArticleEnhancements() {
        // Add reading time to article meta if missing
        const articleMeta = document.querySelector('.article-meta');
        const readingTime = document.querySelector('.article-reading-time, .reading-time');
        
        if (articleMeta && !readingTime) {
            const article = document.querySelector('.article-body');
            if (article) {
                const wordCount = getWordCount(article);
                const estimatedTime = Math.ceil(wordCount / 200); // 200 words per minute
                
                const timeElement = document.createElement('span');
                timeElement.className = 'reading-time';
                timeElement.innerHTML = `<i class="fas fa-clock"></i> ${estimatedTime} min read`;
                
                articleMeta.appendChild(timeElement);
            }
        }

        // Enhanced social sharing
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.classList.contains('facebook') ? 'facebook' :
                               button.classList.contains('twitter') ? 'twitter' :
                               button.classList.contains('linkedin') ? 'linkedin' : 'email';
                
                utils.safeTrack('social_share', platform, {
                    article_title: document.title,
                    page_url: window.location.href
                });
            });
        });

        utils.log('Article enhancements setup');
    }

    function getWordCount(element) {
        const text = element.textContent || element.innerText || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    // Performance monitoring
    function setupPerformanceMonitoring() {
        if ('performance' in window && 'getEntriesByType' in window.performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    reportPerformanceMetrics();
                }, 1000);
            });
        }
    }

    function reportPerformanceMetrics() {
        try {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const metrics = {
                    loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                    firstByte: Math.round(navigation.responseStart - navigation.fetchStart)
                };

                utils.safeTrack('page_performance', 'load_metrics', {
                    ...metrics,
                    page_type: document.querySelector('.article-body') ? 'article' : 'blog_index',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.warn('Performance monitoring error:', error);
        }
    }

    // Cleanup function
    function setupCleanup() {
        window.addEventListener('beforeunload', () => {
            if (state.engagement.qualified) {
                utils.safeTrack('session_end', 'engagement', {
                    total_time: Date.now() - state.engagement.startTime,
                    max_scroll: state.engagement.maxScroll,
                    interactions: state.engagement.interactions,
                    ads_clicked: state.ads.clicksTracked
                });
            }
        });
    }

    // External API for manual control
    function createPublicAPI() {
        window.CarambolaBlogSupplements = {
            // Force engagement and show ads
            forceEngagement: () => {
                state.engagement.qualified = true;
                placeAdvertisements();
                utils.log('Engagement forced, ads displayed');
            },
            
            // Get current state
            getState: () => ({
                engagement: { ...state.engagement },
                ads: { ...state.ads },
                readingProgress: { ...state.readingProgress }
            }),
            
            // Manual tracking
            track: utils.safeTrack,
            
            // Check if user is engaged
            isEngaged: utils.isUserEngaged
        };
    }

    // Main initialization
    function initializeBlogSupplements() {
        try {
            // Wait for main site scripts to be ready
            if (typeof window.CarambolaBlogInitialized !== 'undefined' && 
                !window.CarambolaBlogInitialized) {
                setTimeout(initializeBlogSupplements, 500);
                return;
            }

            // Initialize features
            setupReadingProgress();
            setupEngagementTracking();
            setupImageHandling();
            setupNewsletterForm();
            setupArticleEnhancements();
            setupPerformanceMonitoring();
            setupCleanup();
            createPublicAPI();

            // Mark as initialized
            window.CarambolaBlogSupplementsInitialized = true;

            // Track initialization
            utils.safeTrack('blog_supplements_loaded', 'system', {
                version: CONFIG.version,
                page_type: document.querySelector('.article-body') ? 'article' : 'blog_index',
                user_agent: navigator.userAgent.substring(0, 100)
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

    // Debug utilities (only in debug mode)
    if (CONFIG.debugMode) {
        window.BlogSupplementDebug = {
            state: state,
            config: CONFIG,
            utils: utils,
            forceEngagement: () => {
                state.engagement.qualified = true;
                placeAdvertisements();
            }
        };
    }

})();
