// CARAMBOLA GOLF CLUB BLOG - FIXED SCRIPT
// Clean, functional blog JavaScript without conflicts - FIXED TRACKING LOOPS

(function() {
    'use strict';

    console.log('🎯 Carambola Blog Script - Loading...');

    // Prevent multiple initialization
    if (window.CarambolaBlogInitialized) {
        console.log('🟡 Blog already initialized, skipping');
        return;
    }

    // Configuration
    const BLOG_CONFIG = {
        trackingEnabled: true,
        debugMode: false,
        mobileBreakpoint: 768,
        version: '2.0.1',
        // FIXED: Add tracking control flags
        readingProgressEnabled: true,
        scrollTrackingThrottle: 500, // Increased throttle time
        maxProgressTracking: 100 // Prevent over-tracking
    };

    // FIXED: Global tracking state to prevent loops
    const trackingState = {
        readingProgressActive: false,
        lastProgressReported: 0,
        progressMilestones: new Set(),
        scrollTrackingId: null,
        isTracking: false
    };

    // Utility functions
    const utils = {
        isMobile: () => window.innerWidth <= BLOG_CONFIG.mobileBreakpoint,
        
        log: (...args) => {
            if (BLOG_CONFIG.debugMode) {
                console.log('🎯 Blog:', ...args);
            }
        },

        // FIXED: Better debounce with cleanup
        debounce: (func, wait, immediate = false) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },

        // FIXED: Throttle with immediate execution control
        throttle: (func, delay) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, delay);
                }
            };
        },

        trackEvent: (action, category, details = {}) => {
            if (!BLOG_CONFIG.trackingEnabled || trackingState.isTracking) return;
            
            // FIXED: Prevent recursive tracking
            trackingState.isTracking = true;
            
            try {
                // Google Analytics 4 tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', action, {
                        event_category: category,
                        blog_version: BLOG_CONFIG.version,
                        ...details
                    });
                }

                // Custom tracking function
                if (typeof window.trackBlogInteraction === 'function') {
                    window.trackBlogInteraction(action, category, details);
                }

                utils.log('Tracked:', action, category, details);
            } catch (error) {
                console.warn('Tracking error:', error);
            } finally {
                // FIXED: Always reset tracking flag
                setTimeout(() => {
                    trackingState.isTracking = false;
                }, 100);
            }
        },

        validateEmail: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        showNotification: (message, type = 'info', duration = 5000) => {
            const notification = document.createElement('div');
            notification.className = `blog-notification blog-notification--${type}`;
            notification.innerHTML = `
                <div class="blog-notification__content">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                    <button class="blog-notification__close" aria-label="Close notification">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            // Notification styles
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#1e3a5f'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 1000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 350px;
                font-weight: 500;
                font-family: inherit;
            `;

            document.body.appendChild(notification);

            // Show notification
            setTimeout(() => notification.style.transform = 'translateX(0)', 100);

            // Auto-hide
            const autoHide = setTimeout(() => hideNotification(), duration);

            // Close button handler
            const closeButton = notification.querySelector('.blog-notification__close');
            closeButton.addEventListener('click', () => {
                clearTimeout(autoHide);
                hideNotification();
            });

            function hideNotification() {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }

            utils.log('Notification shown:', message, type);
            return notification;
        }
    };

    // Mobile menu functionality
    function setupMobileMenu() {
        const mobileMenuButton = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        
        if (!mobileMenuButton || !navLinks) {
            utils.log('Mobile menu elements not found');
            return;
        }

        const toggleMenu = () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;
            
            mobileMenuButton.setAttribute('aria-expanded', newState);
            
            if (newState) {
                navLinks.classList.add('mobile-menu-open');
            } else {
                navLinks.classList.remove('mobile-menu-open');
            }
            
            utils.log('Mobile menu toggled:', newState);
            utils.trackEvent('mobile_menu_toggle', 'navigation', { expanded: newState });
        };

        // Button click handler
        mobileMenuButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuButton.contains(e.target) && !navLinks.contains(e.target)) {
                if (mobileMenuButton.getAttribute('aria-expanded') === 'true') {
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                    navLinks.classList.remove('mobile-menu-open');
                    utils.log('Mobile menu closed (outside click)');
                }
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenuButton.getAttribute('aria-expanded') === 'true') {
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('mobile-menu-open');
                utils.log('Mobile menu closed (escape key)');
            }
        });

        // Close menu on window resize
        window.addEventListener('resize', utils.debounce(() => {
            if (window.innerWidth > BLOG_CONFIG.mobileBreakpoint) {
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('mobile-menu-open');
            }
        }, 250));

        utils.log('Mobile menu setup complete');
    }

    // Featured Article CTA functionality
    function setupFeaturedCTA() {
        const selectors = [
            '#featured-article-cta',
            '.featured-article .cta-button.primary',
            '.featured-article-card .cta-button',
            'a[href*="ultimate-guide-carambola-golf-resort"]'
        ];

        let ctaButton = null;
        let selectorUsed = '';
        
        // Find the CTA button
        for (const selector of selectors) {
            ctaButton = document.querySelector(selector);
            if (ctaButton) {
                selectorUsed = selector;
                utils.log('Found featured CTA:', selector);
                break;
            }
        }

        if (!ctaButton) {
            console.warn('⚠️ Featured CTA button not found');
            return null;
        }

        // Validate it's a proper link
        if (ctaButton.tagName !== 'A') {
            console.error('❌ CTA is not an anchor tag:', ctaButton.tagName);
            return null;
        }

        if (!ctaButton.href) {
            console.error('❌ CTA has no href attribute');
            return null;
        }

        utils.log('CTA button validation passed:', {
            tag: ctaButton.tagName,
            href: ctaButton.href,
            text: ctaButton.textContent.trim()
        });

        // Clean click handler - let normal navigation work
        ctaButton.addEventListener('click', function(e) {
            utils.log('Featured CTA clicked:', this.href);
            
            // Track the click
            utils.trackEvent('featured_article_click', 'navigation', {
                href: this.href,
                text: this.textContent.trim(),
                source: 'blog_index',
                selector_used: selectorUsed
            });

            // Don't prevent default - allow normal navigation
            utils.log('Navigation proceeding to:', this.href);
        });

        // Add visual feedback
        ctaButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });

        ctaButton.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });

        utils.log('Featured CTA setup complete');
        return ctaButton;
    }

    // Share functionality
    function setupShareButtons() {
        const shareButtons = document.querySelectorAll('[data-share], .share-btn');
        
        shareButtons.forEach((button, index) => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const platform = this.dataset.share || 
                               this.className.split(' ').find(cls => cls.includes('facebook') || cls.includes('twitter') || cls.includes('linkedin') || cls.includes('email')) ||
                               'unknown';
                
                utils.log('Share button clicked:', platform);
                
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                const description = encodeURIComponent('Check out this guide from Carambola Golf Club!');
                
                let shareUrl = '';
                
                switch(platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                    case 'email':
                        shareUrl = `mailto:?subject=${title}&body=Check out this article: ${decodeURIComponent(url)}`;
                        break;
                    default:
                        console.warn('Unknown share platform:', platform);
                        return;
                }
                
                if (platform === 'email') {
                    window.location.href = shareUrl;
                } else {
                    const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
                    
                    // Check if popup was blocked
                    if (!shareWindow || shareWindow.closed || typeof shareWindow.closed === 'undefined') {
                        utils.showNotification('Please allow popups to share this article.', 'error');
                    }
                }
                
                utils.trackEvent('share_click', platform, {
                    url: window.location.href,
                    title: document.title
                });
            });
        });

        utils.log(`Setup ${shareButtons.length} share buttons`);
    }

    // Newsletter form functionality
    function setupNewsletterForm() {
        const newsletterForm = document.getElementById('newsletter-form');
        if (!newsletterForm) {
            utils.log('Newsletter form not found');
            return;
        }

        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            utils.log('Newsletter form submitted');
            
            const emailInput = this.querySelector('input[type="email"]');
            const nameInput = this.querySelector('input[name="name"]');
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (!emailInput || !submitButton) {
                console.error('Missing form elements');
                return;
            }
            
            const email = emailInput.value.trim();
            const name = nameInput ? nameInput.value.trim() : '';
            
            // Validate email
            if (!email) {
                utils.showNotification('Please enter your email address.', 'error');
                emailInput.focus();
                return;
            }
            
            if (!utils.validateEmail(email)) {
                utils.showNotification('Please enter a valid email address.', 'error');
                emailInput.focus();
                return;
            }
            
            // Show loading state
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            
            // Track subscription attempt
            utils.trackEvent('newsletter_signup_attempt', 'engagement', {
                has_name: !!name,
                email_domain: email.split('@')[1]
            });
            
            // Simulate subscription (replace with actual API call)
            setTimeout(() => {
                // Success state
                submitButton.innerHTML = '<i class="fas fa-check-circle"></i> Strategy Guide Sent!';
                submitButton.style.background = '#16a34a';
                submitButton.classList.remove('loading');
                
                // Track successful subscription
                utils.trackEvent('newsletter_signup_success', 'conversion', {
                    value: 25,
                    currency: 'USD',
                    has_name: !!name
                });
                
                // Google Analytics conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'send_to': 'G-YJ3H2GJ4SS/newsletter_signup',
                        'value': 25.00,
                        'currency': 'USD'
                    });
                }
                
                // Show success notification
                utils.showNotification('Check your email for your free strategy guide!', 'success');
                
                // Reset form after delay
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.style.background = '';
                    submitButton.disabled = false;
                    this.reset();
                }, 3000);
                
            }, 1500);
        });

        // Real-time email validation
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !utils.validateEmail(email)) {
                    this.style.borderColor = '#dc2626';
                } else {
                    this.style.borderColor = '';
                }
            });
        }

        utils.log('Newsletter form setup complete');
    }

    // Other CTA buttons tracking
    function setupOtherCTAs() {
        const otherCTAs = document.querySelectorAll('.cta-button:not(#featured-article-cta)');
        
        otherCTAs.forEach((button, index) => {
            if (button.href) {
                button.addEventListener('click', function() {
                    utils.log('Other CTA clicked:', this.href);
                    
                    const buttonText = this.textContent.trim();
                    const isBooking = buttonText.toLowerCase().includes('book');
                    const isExplore = buttonText.toLowerCase().includes('explore');
                    const isContact = this.href.includes('/contact');
                    
                    const category = isBooking || isContact ? 'booking' : 
                                   isExplore ? 'explore' : 'other';
                    
                    utils.trackEvent('cta_click', category, {
                        text: buttonText,
                        href: this.href,
                        position: index + 1
                    });
                });
            }
        });

        utils.log(`Setup ${otherCTAs.length} other CTA buttons`);
    }

    // FIXED: Reading progress tracking with proper controls
    function setupReadingProgress() {
        // FIXED: Check if reading progress is already active
        if (trackingState.readingProgressActive || !BLOG_CONFIG.readingProgressEnabled) {
            utils.log('Reading progress tracking skipped - already active or disabled');
            return;
        }

        const article = document.querySelector('.article-body, .blog-overview-content, .featured-article-content');
        if (!article) {
            utils.log('No article content found for reading progress');
            return;
        }

        // FIXED: Mark as active to prevent multiple instances
        trackingState.readingProgressActive = true;

        const milestones = [25, 50, 75, 90];
        let maxProgress = 0;

        const trackProgress = () => {
            // FIXED: Prevent tracking if already processing
            if (trackingState.isTracking) {
                return;
            }

            try {
                const articleRect = article.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Calculate reading progress
                const articleTop = article.offsetTop;
                const articleHeight = article.offsetHeight;
                const scrollTop = window.pageYOffset;
                
                if (scrollTop >= articleTop && scrollTop <= articleTop + articleHeight) {
                    const progress = Math.round(((scrollTop - articleTop + windowHeight / 3) / articleHeight) * 100);
                    const clampedProgress = Math.min(BLOG_CONFIG.maxProgressTracking, Math.max(0, progress));

                    if (clampedProgress > maxProgress) {
                        maxProgress = clampedProgress;

                        // FIXED: Report milestones with better control
                        milestones.forEach(milestone => {
                            if (clampedProgress >= milestone && !trackingState.progressMilestones.has(milestone)) {
                                trackingState.progressMilestones.add(milestone);
                                
                                // FIXED: Only track if not already tracking
                                if (!trackingState.isTracking) {
                                    utils.trackEvent('reading_progress', `${milestone}%`, { 
                                        progress: milestone,
                                        article_section: getCurrentSection(),
                                        timestamp: Date.now()
                                    });
                                    utils.log(`Reading milestone: ${milestone}%`);
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.warn('Reading progress tracking error:', error);
            }
        };

        const getCurrentSection = () => {
            try {
                const headers = document.querySelectorAll('h2, h3');
                const scrollPosition = window.pageYOffset + 200;
                
                for (let i = headers.length - 1; i >= 0; i--) {
                    if (headers[i].offsetTop <= scrollPosition) {
                        return headers[i].textContent.trim();
                    }
                }
                return 'Introduction';
            } catch (error) {
                return 'Unknown';
            }
        };

        // FIXED: Better throttled scroll listener with cleanup
        const throttledTrackProgress = utils.throttle(trackProgress, BLOG_CONFIG.scrollTrackingThrottle);
        
        // FIXED: Store reference for cleanup
        trackingState.scrollTrackingId = Date.now();
        const currentTrackingId = trackingState.scrollTrackingId;
        
        const scrollHandler = (event) => {
            // FIXED: Check if this handler is still valid
            if (trackingState.scrollTrackingId !== currentTrackingId) {
                return; // This handler is outdated
            }
            throttledTrackProgress();
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });

        // FIXED: Cleanup function
        const cleanup = () => {
            window.removeEventListener('scroll', scrollHandler);
            trackingState.readingProgressActive = false;
            trackingState.scrollTrackingId = null;
            utils.log('Reading progress tracking cleaned up');
        };

        // FIXED: Auto cleanup on page unload
        window.addEventListener('beforeunload', cleanup);

        utils.log('Reading progress tracking setup with throttle:', BLOG_CONFIG.scrollTrackingThrottle);
    }

    // Image lazy loading enhancement
    function setupImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Track image view
                        utils.trackEvent('image_viewed', 'engagement', {
                            src: img.src,
                            alt: img.alt || 'no-alt'
                        });
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            // Observe images
            document.querySelectorAll('img').forEach(img => {
                imageObserver.observe(img);
            });

            utils.log('Image lazy loading setup');
        }
    }

    // External link tracking
    function setupExternalLinkTracking() {
        const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="carambola.golf"])');
        
        externalLinks.forEach(link => {
            link.addEventListener('click', function() {
                utils.trackEvent('external_link_click', 'outbound', {
                    url: this.href,
                    text: this.textContent.trim(),
                    domain: new URL(this.href).hostname
                });
                utils.log('External link clicked:', this.href);
            });
        });

        utils.log(`Setup tracking for ${externalLinks.length} external links`);
    }

    // Performance monitoring
    function setupPerformanceMonitoring() {
        // Page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                if ('performance' in window && 'getEntriesByType' in performance) {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        const metrics = {
                            loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                            firstByte: Math.round(navigation.responseStart - navigation.fetchStart)
                        };

                        utils.trackEvent('page_performance', 'timing', {
                            ...metrics,
                            page_type: getPageType()
                        });

                        utils.log('Performance metrics:', metrics);
                    }
                }
            }, 1000);
        });

        // FIXED: Track time on page without interfering with other tracking
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            // FIXED: Prevent tracking during unload if other tracking is active
            if (!trackingState.isTracking) {
                const timeSpent = Math.round((Date.now() - startTime) / 1000);
                utils.trackEvent('time_on_page', 'engagement', {
                    seconds: timeSpent,
                    page_type: getPageType()
                });
            }
        });

        function getPageType() {
            if (document.querySelector('.article-body')) return 'article';
            if (document.querySelector('.blog-hero')) return 'blog_index';
            return 'other';
        }
    }

    // Main initialization function
    function initializeBlog() {
        utils.log('Initializing blog functionality...');

        try {
            // FIXED: Initialize tracking state
            trackingState.readingProgressActive = false;
            trackingState.lastProgressReported = 0;
            trackingState.progressMilestones.clear();
            trackingState.isTracking = false;

            // Setup all components
            setupMobileMenu();
            const featuredCTA = setupFeaturedCTA();
            setupShareButtons();
            setupNewsletterForm();
            setupOtherCTAs();
            
            // FIXED: Only setup reading progress if not already active
            if (!trackingState.readingProgressActive) {
                setupReadingProgress();
            }
            
            setupImageLazyLoading();
            setupExternalLinkTracking();
            setupPerformanceMonitoring();

            // Track page load
            utils.trackEvent('page_load', 'blog', {
                page_type: document.querySelector('.article-body') ? 'article' : 'index',
                referrer: document.referrer || 'direct',
                user_agent: navigator.userAgent.substring(0, 100),
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                blog_version: BLOG_CONFIG.version
            });

            // Mark as initialized
            window.CarambolaBlogInitialized = true;

            // Add debugging helpers
            if (BLOG_CONFIG.debugMode) {
                window.blogDebug = {
                    utils,
                    config: BLOG_CONFIG,
                    trackingState,
                    testCTA: () => featuredCTA?.click(),
                    showNotification: utils.showNotification,
                    trackEvent: utils.trackEvent,
                    resetReadingProgress: () => {
                        trackingState.readingProgressActive = false;
                        trackingState.progressMilestones.clear();
                        trackingState.isTracking = false;
                        console.log('Reading progress reset');
                    }
                };
                console.log('🛠 Blog debug mode enabled');
            }

            console.log('✅ Carambola Blog initialized successfully');

        } catch (error) {
            console.error('❌ Blog initialization error:', error);
            
            // Track initialization error
            utils.trackEvent('initialization_error', 'error', {
                error_message: error.message,
                error_stack: error.stack?.substring(0, 200)
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBlog);
    } else {
        // DOM already loaded
        setTimeout(initializeBlog, 100);
    }

    // FIXED: Global utility functions and API with better tracking control
    window.CarambolaBlog = {
        trackEvent: utils.trackEvent,
        showNotification: utils.showNotification,
        config: BLOG_CONFIG,
        version: BLOG_CONFIG.version,
        
        // FIXED: Add tracking state access
        getTrackingState: () => ({ ...trackingState }),
        
        // Public methods
        refreshTracking: () => {
            if (!trackingState.isTracking) {
                utils.trackEvent('manual_refresh', 'user_action', {
                    timestamp: Date.now()
                });
            }
        },

        // FIXED: Method to reset reading progress if needed
        resetReadingProgress: () => {
            trackingState.readingProgressActive = false;
            trackingState.progressMilestones.clear();
            trackingState.isTracking = false;
            console.log('🔄 Reading progress tracking reset');
        }
    };

})();

// Global functions for backwards compatibility and inline handlers
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.click();
    } else {
        console.warn('Mobile menu button not found');
    }
}

// Enhanced share function for inline handlers
function shareArticle(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        case 'email':
            shareUrl = `mailto:?subject=${title}&body=Check out this article: ${decodeURIComponent(url)}`;
            break;
        default:
            console.warn('Unknown share platform:', platform);
            return;
    }
    
    if (platform === 'email') {
        window.location.href = shareUrl;
    } else {
        const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        
        if (!shareWindow || shareWindow.closed || typeof shareWindow.closed === 'undefined') {
            if (window.CarambolaBlog) {
                window.CarambolaBlog.showNotification('Please allow popups to share this article.', 'error');
            }
        }
    }
    
    // Track the share
    if (window.CarambolaBlog) {
        window.CarambolaBlog.trackEvent('share_click', platform, {
            url: window.location.href,
            title: document.title,
            method: 'inline_function'
        });
    }
}

// FIXED: Article-specific tracking function with loop prevention
function trackArticleInteraction(action, section, details = {}) {
    if (window.CarambolaBlog && !window.CarambolaBlog.getTrackingState().isTracking) {
        window.CarambolaBlog.trackEvent(action, section, {
            ...details,
            article_title: document.title,
            timestamp: Date.now()
        });
    }
}

console.log('🎯 Carambola Blog Script loaded - FIXED VERSION');
