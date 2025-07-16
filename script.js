// Carambola Golf Club JavaScript - Multi-page Version
document.addEventListener('DOMContentLoaded', function() {
    
    // Modal functionality
    const modal = document.getElementById('constructionModal');
    const closeModalBtn = document.getElementById('closeModal');
    const bookTeeTimeButtons = document.querySelectorAll('.book-tee-time, .cta-button');
    
    // Check if this is the first visit
    function showModalOnFirstVisit() {
        const hasVisited = localStorage.getItem('carambola-visited');
        if (!hasVisited) {
            showModal();
            localStorage.setItem('carambola-visited', 'true');
        }
    }
    
    // Show modal function
    function showModal() {
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Google Analytics event (if GTM is loaded)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'modal_shown', {
                    'event_category': 'engagement',
                    'event_label': 'construction_modal',
                    'page_location': window.location.pathname
                });
            }
            
            // Enhanced conversion tracking
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({
                    'event': 'modal_interaction',
                    'modal_type': 'construction',
                    'user_intent': 'information_request',
                    'page_path': window.location.pathname
                });
            }
        }
    }
    
    // Hide modal function
    function hideModal() {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Google Analytics event (if GTM is loaded)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'modal_closed', {
                    'event_category': 'engagement',
                    'event_label': 'construction_modal',
                    'page_location': window.location.pathname
                });
            }
        }
    }
    
    // Close modal when clicking close button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }
    
    // Close modal when clicking outside of it
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
    }
    
    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            hideModal();
        }
    });
    
    // Show modal when clicking any "Book Tee Time" button
    bookTeeTimeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showModal();
            
            // Enhanced conversion tracking for tee time intent
            if (typeof gtag !== 'undefined') {
                gtag('event', 'tee_time_intent', {
                    'event_category': 'conversion',
                    'event_label': 'book_tee_time_clicked',
                    'value': 1,
                    'page_location': window.location.pathname
                });
            }
            
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({
                    'event': 'tee_time_intent',
                    'button_location': e.target.closest('section')?.id || 'unknown',
                    'user_engagement': 'high_intent',
                    'page_path': window.location.pathname
                });
            }
        });
    });
    
    // Show modal on first visit (with a small delay for better UX)
    setTimeout(showModalOnFirstVisit, 1500);
    
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Toggle aria-expanded for accessibility
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
            
            // Change icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (isExpanded) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Close mobile menu when clicking on a link
        navLinks.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
    
    // Set active navigation state based on current page
    function setActiveNavigation() {
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
    
    // Set active navigation on page load
    setActiveNavigation();
    
    // Smooth scrolling for anchor links (same page)
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
                
                // Enhanced navigation tracking
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
    
    // Enhanced navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(30, 58, 95, 0.98)';
            } else {
                navbar.style.background = 'rgba(30, 58, 95, 0.95)';
            }
        });
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Track section visibility for engagement
                if (typeof gtag !== 'undefined') {
                    const sectionName = entry.target.id || entry.target.className;
                    gtag('event', 'section_view', {
                        'event_category': 'engagement',
                        'event_label': sectionName,
                        'non_interaction': true,
                        'page_location': window.location.pathname
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe cards for animation with staggered delays
    document.querySelectorAll('.feature-card, .hole-card, .stat-card, .quick-link-card, .value-card, .booking-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
    
    // Counter animation for stats
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target.querySelector('.stat-number');
                if (stat && !stat.hasAttribute('data-counted')) {
                    stat.setAttribute('data-counted', 'true');
                    const finalValue = parseInt(stat.textContent.replace(/,/g, ''));
                    let currentValue = 0;
                    const increment = finalValue / 60;
                    
                    const timer = setInterval(() => {
                        currentValue += increment;
                        if (currentValue >= finalValue) {
                            stat.textContent = finalValue.toLocaleString();
                            clearInterval(timer);
                        } else {
                            stat.textContent = Math.floor(currentValue).toLocaleString();
                        }
                    }, 25);
                }
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.stat-card').forEach(stat => {
        statsObserver.observe(stat);
    });
    
    // Pricing and Experience tabs functionality
    function initializeTabs() {
        // Pricing tabs
        const pricingTabs = document.querySelectorAll('.pricing-tab');
        const pricingContainers = document.querySelectorAll('.pricing-table-container');
        
        pricingTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                
                // Remove active class from all tabs and containers
                pricingTabs.forEach(t => t.classList.remove('active'));
                pricingContainers.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding container
                this.classList.add('active');
                const targetContainer = document.getElementById(targetTab);
                if (targetContainer) {
                    targetContainer.classList.add('active');
                }
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pricing_tab_click', {
                        'event_category': 'engagement',
                        'event_label': targetTab,
                        'section': 'pricing',
                        'page_location': window.location.pathname
                    });
                }
            });
        });
        
        // Experience tabs
        const experienceTabs = document.querySelectorAll('.experience-tab');
        const experienceSections = document.querySelectorAll('.experience-section');
        
        experienceTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                
                // Remove active class from all tabs and sections
                experienceTabs.forEach(t => t.classList.remove('active'));
                experienceSections.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding section
                this.classList.add('active');
                const targetSection = document.getElementById(targetTab);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'experience_tab_click', {
                        'event_category': 'engagement',
                        'event_label': targetTab,
                        'section': 'experience',
                        'page_location': window.location.pathname
                    });
                }
            });
        });
    }
    
    // Initialize tabs
    initializeTabs();
    
    // Track external link clicks with enhanced data
    document.addEventListener('click', function(e) {
        if (e.target.matches('a[href^="http"]') || e.target.matches('a[href^="mailto"]') || e.target.matches('a[href^="tel"]')) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'external_link_click', {
                    'event_category': 'engagement',
                    'event_label': e.target.href,
                    'link_text': e.target.textContent,
                    'transport_type': 'beacon',
                    'page_location': window.location.pathname
                });
            }
        }
    });
    
    // Enhanced hole card interactions with tracking
    document.querySelectorAll('.hole-card').forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click tracking for hole cards with detailed data
        card.addEventListener('click', function() {
            const holeNumberEl = this.querySelector('.hole-number');
            const holeNameEl = this.querySelector('h4');
            const holeNumber = holeNumberEl ? holeNumberEl.textContent : 'unknown';
            const holeName = holeNameEl ? holeNameEl.textContent : 'unknown';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hole_card_interaction', {
                    'event_category': 'engagement',
                    'event_label': `hole_${holeNumber}`,
                    'hole_name': holeName,
                    'hole_position': index + 1,
                    'page_location': window.location.pathname
                });
            }
        });
    });
    
    // Experience card interactions
    document.querySelectorAll('.experience-card').forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click tracking for experience cards
        card.addEventListener('click', function() {
            const experienceNameEl = this.querySelector('h3');
            const experienceCategoryEl = this.querySelector('.experience-category');
            const experienceName = experienceNameEl ? experienceNameEl.textContent : 'unknown';
            const experienceCategory = experienceCategoryEl ? experienceCategoryEl.textContent : 'unknown';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'experience_card_interaction', {
                    'event_category': 'engagement',
                    'event_label': experienceName,
                    'experience_category': experienceCategory,
                    'card_position': index + 1,
                    'page_location': window.location.pathname
                });
            }
        });
    });
    
    // Quick link card interactions
    document.querySelectorAll('.quick-link-card').forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click tracking for quick link cards
        card.addEventListener('click', function() {
            const cardNameEl = this.querySelector('h3');
            const cardName = cardNameEl ? cardNameEl.textContent : 'unknown';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'quick_link_interaction', {
                    'event_category': 'navigation',
                    'event_label': cardName,
                    'card_position': index + 1,
                    'page_location': window.location.pathname
                });
            }
        });
    });
    
    // Page performance tracking
    window.addEventListener('load', function() {
        setTimeout(function() {
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
    
    // Scroll depth tracking
    let maxScroll = 0;
    const scrollDepthThresholds = [25, 50, 75, 100];
    const scrollDepthHit = new Set();
    
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        maxScroll = Math.max(maxScroll, scrollPercent);
        
        scrollDepthThresholds.forEach(threshold => {
            if (scrollPercent >= threshold && !scrollDepthHit.has(threshold)) {
                scrollDepthHit.add(threshold);
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
    });
    
    // Page view tracking for multi-page setup
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': document.title,
            'page_location': window.location.href,
            'page_path': window.location.pathname
        });
    }
    
    // Track page-specific interactions
    const currentPage = window.location.pathname;
    
    // Contact form interactions (if any forms are added later)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'engagement',
                    'event_label': 'contact_form',
                    'page_location': window.location.pathname
                });
            }
        });
    });
    
    // Track phone number clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'phone_click', {
                    'event_category': 'contact',
                    'event_label': this.href,
                    'page_location': window.location.pathname
                });
            }
        });
    });
    
    // Track email clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'email_click', {
                    'event_category': 'contact',
                    'event_label': this.href,
                    'page_location': window.location.pathname
                });
            }
        });
    });
    
    // Accessibility improvements
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', function(e) {
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
    
    // Apply focus trapping to modal
    const modalContent = modal?.querySelector('.modal-content');
    if (modalContent) {
        trapFocus(modalContent);
    }
    
    // Enhanced error handling for missing elements
    function safelyAddEventListener(selector, event, handler) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element) {
                element.addEventListener(event, handler);
            }
        });
    }
    
    // Console message for developers
    console.log('%c🏌️ Welcome to Carambola Golf Club! 🏌️', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.log('%cMulti-page website optimized for golf and St. Croix tourism', 'color: #1e3a5f; font-size: 12px;');
    console.log('%cFor technical inquiries, contact: jaspervdz@me.com', 'color: #1e3a5f; font-size: 12px;');
    console.log('%cWebsite optimized for SEO and performance', 'color: #2d8f2d; font-size: 10px;');
    
});

// Additional utility functions
function updateModalContent(title, message, email = 'info@carambola.golf', phone = '+1-340-778-5638') {
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
}

// Function to manually show modal (for testing or other purposes)
function showConstructionModal() {
    const modal = document.getElementById('constructionModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Function to reset first visit flag (for testing)
function resetFirstVisit() {
    localStorage.removeItem('carambola-visited');
    console.log('First visit flag reset. Refresh page to see modal again.');
}

// Function to track custom events (for future use)
function trackCustomEvent(category, action, label, value = null) {
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
}

// Function to handle dynamic content loading (for future enhancements)
function handleDynamicContent() {
    // Re-initialize observers and event listeners for dynamically loaded content
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe new cards
    document.querySelectorAll('.feature-card:not([data-observed]), .hole-card:not([data-observed])').forEach(el => {
        el.setAttribute('data-observed', 'true');
        observer.observe(el);
    });
}

// Export functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateModalContent,
        showConstructionModal,
        resetFirstVisit,
        trackCustomEvent,
        handleDynamicContent
    };
}
