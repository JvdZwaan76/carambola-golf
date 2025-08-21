// CARAMBOLA GOLF BLOG - ROBUST NAVIGATION FIX
// Forces proper navigation and CSS loading

(function() {
    'use strict';

    console.log('🔧 ROBUST Blog Navigation Fix - Loading...');

    // Prevent multiple initialization
    if (window.CarambolaBlogNavigationFixed) {
        console.log('🟡 Blog navigation already fixed, skipping');
        return;
    }

    // FORCE CSS LOADING - Inject critical styles if not loaded
    function forceCSSLoading() {
        console.log('🎨 Forcing CSS loading...');
        
        // Check if blog CSS is loaded
        const blogStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .filter(link => link.href.includes('blog/styles.css'));
        
        if (blogStylesheets.length === 0) {
            console.warn('⚠️ Blog CSS not found, injecting...');
            const blogCSS = document.createElement('link');
            blogCSS.rel = 'stylesheet';
            blogCSS.href = '/blog/styles.css';
            blogCSS.onload = () => console.log('✅ Blog CSS injected and loaded');
            blogCSS.onerror = () => console.error('❌ Failed to inject blog CSS');
            document.head.appendChild(blogCSS);
        }

        // Inject critical inline styles as backup
        const criticalStyles = `
            <style id="blog-critical-backup">
                /* CRITICAL BLOG STYLES BACKUP */
                .blog-hero {
                    background: linear-gradient(rgba(30, 58, 95, 0.6), rgba(30, 58, 95, 0.6)), url('/images/carambola-golf-hole-18.webp') center/cover !important;
                    min-height: 60vh !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: white !important;
                    text-align: center !important;
                    padding: 4rem 2rem !important;
                    margin-top: 80px !important;
                }
                
                .cta-button, #featured-article-cta {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 0.5rem !important;
                    padding: 1rem 2rem !important;
                    background: #d4af37 !important;
                    color: #1e3a5f !important;
                    border: 2px solid #d4af37 !important;
                    border-radius: 8px !important;
                    text-decoration: none !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    cursor: pointer !important;
                    min-height: 44px !important;
                    font-size: 1rem !important;
                }
                
                .cta-button:hover, #featured-article-cta:hover {
                    background: #1e3a5f !important;
                    color: white !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.12) !important;
                }
                
                .container {
                    max-width: 1200px !important;
                    margin: 0 auto !important;
                    padding: 0 2rem !important;
                }
                
                .section-title {
                    text-align: center !important;
                    font-size: 2.5rem !important;
                    margin-bottom: 3rem !important;
                    color: #1e3a5f !important;
                }
                
                .featured-article {
                    padding: 6rem 0 !important;
                    background: white !important;
                }
                
                .blog-overview {
                    padding: 6rem 0 !important;
                    background: #f9fafb !important;
                }
                
                .blog-categories {
                    padding: 6rem 0 !important;
                    background: #f9fafb !important;
                }
                
                .newsletter-signup {
                    padding: 6rem 0 !important;
                    background: #1e3a5f !important;
                    color: white !important;
                }
            </style>
        `;
        
        if (!document.getElementById('blog-critical-backup')) {
            document.head.insertAdjacentHTML('beforeend', criticalStyles);
            console.log('✅ Critical backup styles injected');
        }
    }

    // ROBUST NAVIGATION HANDLER
    function setupRobustNavigation() {
        console.log('🧭 Setting up robust navigation...');

        // Find all CTA buttons with multiple selectors
        const ctaSelectors = [
            '#featured-article-cta',
            '.featured-article .cta-button.primary',
            '.featured-article-card .cta-button',
            '.article-actions .cta-button.primary',
            'a[href*="ultimate-guide-carambola-golf-resort"]'
        ];

        let ctaButton = null;
        let foundSelector = '';

        // Try each selector until we find the button
        for (const selector of ctaSelectors) {
            ctaButton = document.querySelector(selector);
            if (ctaButton) {
                foundSelector = selector;
                console.log(`✅ Found CTA button with: ${selector}`);
                break;
            }
        }

        if (!ctaButton) {
            console.error('❌ CTA button not found with any selector');
            return;
        }

        // Verify it's a proper link
        if (ctaButton.tagName !== 'A') {
            console.error('❌ CTA is not an anchor tag:', ctaButton.tagName);
            return;
        }

        if (!ctaButton.href) {
            console.error('❌ CTA has no href attribute');
            return;
        }

        console.log('🔗 CTA button details:');
        console.log('  - Tag:', ctaButton.tagName);
        console.log('  - Href:', ctaButton.href);
        console.log('  - Text:', ctaButton.textContent.trim());

        // FORCE navigation function
        const forceNavigation = (url) => {
            console.log('🚀 Forcing navigation to:', url);
            
            // Try multiple navigation methods
            try {
                // Method 1: Direct assignment
                window.location.href = url;
            } catch (e1) {
                try {
                    // Method 2: Replace
                    window.location.replace(url);
                } catch (e2) {
                    try {
                        // Method 3: Assign to location
                        window.location = url;
                    } catch (e3) {
                        // Method 4: Open in new window as fallback
                        console.warn('⚠️ Standard navigation failed, opening in new window');
                        window.open(url, '_blank');
                    }
                }
            }
        };

        // Remove ALL existing event listeners by cloning the element
        const newCtaButton = ctaButton.cloneNode(true);
        ctaButton.parentNode.replaceChild(newCtaButton, ctaButton);
        ctaButton = newCtaButton;

        // Add ROBUST click handler with highest priority
        const robustClickHandler = function(e) {
            console.log('🖱️ ROBUST: CTA button clicked!');
            console.log('🖱️ Target URL:', this.href);
            
            // Prevent any other handlers from interfering
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Don't prevent default initially - let normal navigation try first
            
            // Track the interaction
            try {
                if (window.trackBlogInteraction) {
                    window.trackBlogInteraction('featured_article_click_robust', 'ultimate-guide-carambola-2025', {
                        method: 'robust_handler',
                        href: this.href,
                        timestamp: Date.now()
                    });
                }
            } catch (trackError) {
                console.warn('Tracking error:', trackError);
            }

            // Force navigation after a tiny delay to allow tracking
            setTimeout(() => {
                forceNavigation(this.href);
            }, 100);
        };

        // Add event listener with highest priority (capture phase)
        ctaButton.addEventListener('click', robustClickHandler, true);

        // Also add a backup handler in bubble phase
        ctaButton.addEventListener('click', function(e) {
            console.log('🔄 BACKUP: Navigation handler triggered');
            if (!e.defaultPrevented) {
                setTimeout(() => {
                    if (window.location.href === location.href) {
                        console.log('🚨 Navigation didn\'t happen, forcing...');
                        forceNavigation(this.href);
                    }
                }, 500);
            }
        }, false);

        // Add double-click handler as additional backup
        ctaButton.addEventListener('dblclick', function(e) {
            console.log('🖱️ Double-click detected, forcing navigation...');
            e.preventDefault();
            e.stopPropagation();
            forceNavigation(this.href);
        });

        // Add keyboard handler for accessibility
        ctaButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                console.log('⌨️ Keyboard navigation triggered');
                e.preventDefault();
                e.stopPropagation();
                forceNavigation(this.href);
            }
        });

        // Visual feedback for testing
        ctaButton.style.position = 'relative';
        ctaButton.style.zIndex = '999';
        
        // Add hover effect to confirm button is interactive
        ctaButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            console.log('🖱️ Button hover - ready for click');
        });

        ctaButton.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });

        console.log('✅ Robust navigation setup complete for:', foundSelector);
        return ctaButton;
    }

    // SETUP ALL OTHER BUTTONS
    function setupAllButtons() {
        console.log('🔧 Setting up all blog buttons...');

        // Setup share buttons
        const shareButtons = document.querySelectorAll('.share-btn, [id*="share"], [class*="share-btn"]');
        shareButtons.forEach((btn, index) => {
            btn.addEventListener('click', function(e) {
                console.log('📤 Share button clicked:', this.className);
                // Share functionality (existing code)
            });
        });

        // Setup other CTA buttons
        const otherCTAs = document.querySelectorAll('.cta-button:not(#featured-article-cta)');
        otherCTAs.forEach((btn, index) => {
            if (btn.href) {
                btn.addEventListener('click', function(e) {
                    console.log('🔗 Other CTA clicked:', this.href);
                    // Let normal navigation work for other buttons
                });
            }
        });

        console.log(`✅ Setup ${shareButtons.length} share buttons and ${otherCTAs.length} other CTAs`);
    }

    // SETUP NEWSLETTER FORM
    function setupNewsletterForm() {
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('📧 Newsletter form submitted');
                
                const email = this.querySelector('input[type="email"]').value;
                const name = this.querySelector('input[name="name"]').value;
                
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    alert('Please enter a valid email address.');
                    return;
                }
                
                // Simulate subscription
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Success!';
                    submitBtn.style.background = '#16a34a';
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                        this.reset();
                    }, 3000);
                }, 1500);
            });
            console.log('✅ Newsletter form setup complete');
        }
    }

    // MAIN INITIALIZATION
    function initializeRobustBlogFix() {
        console.log('🚀 Initializing ROBUST blog fixes...');

        try {
            // Force CSS loading first
            forceCSSLoading();
            
            // Setup navigation with delay to ensure DOM is ready
            setTimeout(() => {
                const ctaButton = setupRobustNavigation();
                setupAllButtons();
                setupNewsletterForm();
                
                if (ctaButton) {
                    console.log('✅ ROBUST blog navigation fix complete!');
                    console.log('🧪 Test by clicking the "READ FULL GUIDE" button');
                    
                    // Mark as fixed
                    window.CarambolaBlogNavigationFixed = true;
                    
                    // Add global test function
                    window.testBlogNavigation = function() {
                        console.log('🧪 Testing blog navigation...');
                        if (ctaButton && ctaButton.href) {
                            ctaButton.click();
                        } else {
                            console.error('❌ No CTA button found for testing');
                        }
                    };
                    
                    console.log('🧪 Run window.testBlogNavigation() to test programmatically');
                } else {
                    console.error('❌ Failed to setup CTA button');
                }
            }, 500);

        } catch (error) {
            console.error('❌ Error in robust blog fix:', error);
        }
    }

    // Initialize based on document state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRobustBlogFix);
    } else {
        // DOM already loaded, initialize immediately
        initializeRobustBlogFix();
    }

    // Fallback initialization
    setTimeout(() => {
        if (!window.CarambolaBlogNavigationFixed) {
            console.log('🔄 Fallback initialization triggered...');
            initializeRobustBlogFix();
        }
    }, 2000);

    console.log('🔧 ROBUST Blog Navigation Fix loaded');

})();
