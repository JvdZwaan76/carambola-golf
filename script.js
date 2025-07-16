// Carambola Golf Club JavaScript
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
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Google Analytics event (if GTM is loaded)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'modal_shown', {
                'event_category': 'engagement',
                'event_label': 'construction_modal'
            });
        }
        
        // Enhanced conversion tracking
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
                'event': 'modal_interaction',
                'modal_type': 'construction',
                'user_intent': 'information_request'
            });
        }
    }
    
    // Hide modal function
    function hideModal() {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Google Analytics event (if GTM is loaded)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'modal_closed', {
                'event_category': 'engagement',
                'event_label': 'construction_modal'
            });
        }
    }
    
    // Close modal when clicking close button
    closeModalBtn.addEventListener('click', hideModal);
    
    // Close modal when clicking outside of it
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
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
                    'value': 1
                });
            }
            
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({
                    'event': 'tee_time_intent',
                    'button_location': e.target.closest('section')?.id || 'unknown',
                    'user_engagement': 'high_intent'
                });
            }
        });
    });
    
    // Show modal on first visit (with a small delay for better UX)
    setTimeout(showModalOnFirstVisit, 1500);
    
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Toggle aria-expanded for accessibility
        const isExpanded = navLinks.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
        
        // Change icon
        const icon = mobileMenuBtn.querySelector('i');
        if (isExpanded) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close mobile menu when clicking on a link
    navLinks.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            navLinks.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
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
                        'transport_type': 'beacon'
                    });
                }
            }
        });
    });
    
    // Enhanced navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(30, 58, 95, 0.98)';
        } else {
            navbar.style.background = 'rgba(30, 58, 95, 0.95)';
        }
    });
    
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
                        'non_interaction': true
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe cards for animation with staggered delays
    document.querySelectorAll('.feature-card, .hole-card, .stat-card').forEach((el, index) => {
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
                const finalValue = parseInt(stat.textContent.replace(',', ''));
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
                document.getElementById(targetTab).classList.add('active');
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pricing_tab_click', {
                        'event_category': 'engagement',
                        'event_label': targetTab,
                        'section': 'pricing'
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
                document.getElementById(targetTab).classList.add('active');
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'experience_tab_click', {
                        'event_category': 'engagement',
                        'event_label': targetTab,
                        'section': 'experience'
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
                    'transport_type': 'beacon'
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
            const holeNumber = this.querySelector('.hole-number').textContent;
            const holeName = this.querySelector('h4').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hole_card_interaction', {
                    'event_category': 'engagement',
                    'event_label': `hole_${holeNumber}`,
                    'hole_name': holeName,
                    'hole_position': index + 1
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
            const experienceName = this.querySelector('h3').textContent;
            const experienceCategory = this.querySelector('.experience-category').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'experience_card_interaction', {
                    'event_category': 'engagement',
                    'event_label': experienceName,
                    'experience_category': experienceCategory,
                    'card_position': index + 1
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
                        'non_interaction': true
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
                        'non_interaction': true
                    });
                }
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
    const modalContent = modal.querySelector('.modal-content');
    trapFocus(modalContent);
    
    // Console message for developers
    console.log('%c🏌️ Welcome to Carambola Golf Club! 🏌️', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.log('%cFor technical inquiries, contact: jaspervdz@me.com', 'color: #1e3a5f; font-size: 12px;');
    console.log('%cWebsite optimized for SEO and performance', 'color: #2d8f2d; font-size: 10px;');
    
});

// Additional utility functions
function updateModalContent(title, message, email = 'jaspervdz@me.com', phone = '+1 805 338.7681') {
    const modal = document.getElementById('constructionModal');
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
        phoneElement.href = `tel:${phone.replace(/\s/g, '')}`;
        phoneElement.textContent = phone;
    }
}

// Function to manually show modal (for testing or other purposes)
function showConstructionModal() {
    const modal = document.getElementById('constructionModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Function to reset first visit flag (for testing)
function resetFirstVisit() {
    localStorage.removeItem('carambola-visited');
    console.log('First visit flag reset. Refresh page to see modal again.');
}
