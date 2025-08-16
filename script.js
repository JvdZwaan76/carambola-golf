// Carambola Golf Club JavaScript - Quick Fix Version (Preloader Disabled)
(function() {
    'use strict';

    // Performance optimization: Use passive event listeners
    const supportsPassive = (() => {
        let supportsPassive = false;
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get() {
                    supportsPassive = true;
                }
            });
            window.addEventListener('test', null, opts);
        } catch (e) {}
        return supportsPassive;
    })();

    const passiveIfSupported = supportsPassive ? { passive: true } : false;

    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Performance metrics tracking
    const performanceMetrics = {
        startTime: performance.now(),
        marks: {},
        
        mark(name) {
            this.marks[name] = performance.now();
            if (typeof gtag !== 'undefined') {
                gtag('event', 'performance_mark', {
                    'event_category': 'performance',
                    'event_label': name,
                    'value': Math.round(this.marks[name] - this.startTime),
                    'non_interaction': true
                });
            }
        },
        
        measure(name, startMark, endMark) {
            const duration = this.marks[endMark] - this.marks[startMark];
            if (typeof gtag !== 'undefined') {
                gtag('event', 'performance_measure', {
                    'event_category': 'performance',
                    'event_label': name,
                    'value': Math.round(duration),
                    'non_interaction': true
                });
            }
            return duration;
        }
    };

    // Quick preloader hide function
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 300);
        }
    }

    // Service Worker Registration
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });
                console.log('ServiceWorker registration successful:', registration);
            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        }
    }

    // Enhanced Video Hero Manager
    class VideoHeroManager {
        constructor() {
            this.video = document.querySelector('.hero-video');
            this.fallbackImage = document.querySelector('.hero-fallback-image');
            this.init();
        }

        init() {
            if (!this.video) return;

            // Handle video loading
            this.video.addEventListener('loadeddata', this.handleVideoLoaded.bind(this));
            this.video.addEventListener('error', this.handleVideoError.bind(this));
            this.video.addEventListener('canplay', this.handleVideoCanPlay.bind(this));

            // Intersection Observer for performance
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadVideo();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(this.video);

            // Preload video on fast connections
            if (navigator.connection && navigator.connection.effectiveType === '4g') {
                this.video.preload = 'auto';
            }
        }

        loadVideo() {
            if (this.video.readyState >= 2) {
                this.handleVideoCanPlay();
            } else {
                this.video.load();
            }
        }

        handleVideoLoaded() {
            this.video.setAttribute('data-loaded', 'true');
            performanceMetrics.mark('video_loaded');
        }

        handleVideoCanPlay() {
            this.video.style.opacity = '1';
            if (this.fallbackImage) {
                this.fallbackImage.style.opacity = '0';
            }
            
            // Track successful video load
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_video_loaded', {
                    'event_category': 'media',
                    'event_label': 'success',
                    'non_interaction': true
                });
            }
        }

        handleVideoError(event) {
            console.warn('Video failed to load:', event);
            this.video.setAttribute('data-error', 'true');
            this.video.style.opacity = '0';
            
            if (this.fallbackImage) {
                this.fallbackImage.style.opacity = '1';
            }

            // Track video error
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_video_error', {
                    'event_category': 'media',
                    'event_label': 'fallback_image_shown',
                    'non_interaction': true
                });
            }
        }
    }

    // Course Hero Carousel Manager
    class CarouselManager {
        constructor() {
            this.carousel = document.querySelector('.course-hero-carousel');
            this.slides = document.querySelectorAll('.carousel-slide');
            this.prevBtn = document.querySelector('.carousel-btn.prev');
            this.nextBtn = document.querySelector('.carousel-btn.next');
            this.dots = document.querySelectorAll('.carousel-dot');
            this.progressBar = document.querySelector('.carousel-progress-bar');
            
            this.currentSlide = 0;
            this.totalSlides = this.slides.length;
            this.autoplayDelay = 6000;
            this.autoplayTimer = null;
            this.isPlaying = true;
            this.progressTimer = null;

            this.init();
        }

        init() {
            if (!this.carousel || this.totalSlides === 0) return;

            this.setupEventListeners();
            this.startAutoplay();
            this.updateProgressBar();

            // Pause autoplay when user interacts
            this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.carousel.addEventListener('mouseleave', () => this.resumeAutoplay());
        }

        setupEventListeners() {
            // Navigation buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.previousSlide();
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                });
            }

            // Dots navigation
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.goToSlide(index);
                });
            });
        }

        goToSlide(index) {
            if (index < 0 || index >= this.totalSlides || index === this.currentSlide) return;

            // Remove active class from current slide and dot
            this.slides[this.currentSlide].classList.remove('active');
            this.dots[this.currentSlide]?.classList.remove('active');

            // Update current slide
            this.currentSlide = index;

            // Add active class to new slide and dot
            this.slides[this.currentSlide].classList.add('active');
            this.dots[this.currentSlide]?.classList.add('active');

            this.updateProgressBar();
            this.restartAutoplay();
        }

        nextSlide() {
            const nextIndex = (this.currentSlide + 1) % this.totalSlides;
            this.goToSlide(nextIndex);
        }

        previousSlide() {
            const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
            this.goToSlide(prevIndex);
        }

        startAutoplay() {
            if (!this.isPlaying) return;
            
            this.autoplayTimer = setInterval(() => {
                this.nextSlide();
            }, this.autoplayDelay);
        }

        pauseAutoplay() {
            this.isPlaying = false;
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
            if (this.progressTimer) {
                clearTimeout(this.progressTimer);
                this.progressTimer = null;
            }
        }

        resumeAutoplay() {
            this.isPlaying = true;
            this.startAutoplay();
            this.updateProgressBar();
        }

        restartAutoplay() {
            this.pauseAutoplay();
            this.resumeAutoplay();
        }

        updateProgressBar() {
            if (!this.progressBar) return;

            this.progressBar.style.width = '0%';
            
            if (this.progressTimer) {
                clearTimeout(this.progressTimer);
            }

            if (this.isPlaying) {
                this.progressTimer = setTimeout(() => {
                    this.progressBar.style.transition = `width ${this.autoplayDelay}ms linear`;
                    this.progressBar.style.width = '100%';
                }, 50);
            }
        }
    }

    // Enhanced modal functionality
    class ModalManager {
        constructor() {
            this.modal = document.getElementById('constructionModal');
            this.closeBtn = document.getElementById('closeModal');
            this.bookButtons = document.querySelectorAll('.book-tee-time, .cta-button');
            this.hasVisited = this.checkVisitHistory();
            this.init();
        }

        init() {
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', this.hide.bind(this));
            }

            if (this.modal) {
                this.modal.addEventListener('click', this.handleBackdropClick.bind(this));
            }

            document.addEventListener('keydown', this.handleKeydown.bind(this));

            this.bookButtons.forEach(button => {
                button.addEventListener('click', this.handleBookingClick.bind(this));
            });

            // Show modal on first visit with delay
            if (!this.hasVisited) {
                setTimeout(() => this.show(), 2000);
            }
        }

        checkVisitHistory() {
            try {
                return localStorage.getItem('carambola-visited') === 'true';
            } catch (e) {
                return false;
            }
        }

        setVisited() {
            try {
                localStorage.setItem('carambola-visited', 'true');
            } catch (e) {
                // Continue if localStorage is not available
            }
        }

        show() {
            if (this.modal) {
                this.modal.classList.add('show');
                document.body.style.overflow = 'hidden';
                this.setVisited();
            }
        }

        hide() {
            if (this.modal) {
                this.modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }

        handleBackdropClick(e) {
            if (e.target === this.modal) {
                this.hide();
            }
        }

        handleKeydown(e) {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('show')) {
                this.hide();
            }
        }

        handleBookingClick(e) {
            e.preventDefault();
            this.show();
        }
    }

    // Enhanced navigation
    class NavigationManager {
        constructor() {
            this.navbar = document.querySelector('.navbar');
            this.mobileMenuBtn = document.querySelector('.mobile-menu');
            this.navLinks = document.querySelector('.nav-links');
            this.init();
        }

        init() {
            if (this.mobileMenuBtn && this.navLinks) {
                this.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
                this.navLinks.addEventListener('click', this.handleLinkClick.bind(this));
            }

            // Optimized scroll handling
            window.addEventListener('scroll', throttle(this.handleScroll.bind(this), 16), passiveIfSupported);
            this.setActiveNavigation();
        }

        toggleMobileMenu() {
            const isExpanded = this.navLinks.classList.contains('active');
            this.navLinks.classList.toggle('active');
            this.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);

            // Update icon
            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) {
                if (!isExpanded) {
                    icon.classList.replace('fa-bars', 'fa-times');
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        }

        handleLinkClick(e) {
            if (e.target.tagName === 'A') {
                this.navLinks.classList.remove('active');
                this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                
                const icon = this.mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        }

        handleScroll() {
            if (this.navbar) {
                if (window.scrollY > 50) {
                    this.navbar.style.background = 'rgba(30, 58, 95, 0.98)';
                    this.navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                } else {
                    this.navbar.style.background = 'rgba(30, 58, 95, 0.95)';
                    this.navbar.style.boxShadow = 'none';
                }
            }
        }

        setActiveNavigation() {
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
    }

    // Console branding
    console.log('%c🌊 Welcome to Carambola Golf Club! 🌊', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.log('%cQuick fix version - preloader disabled', 'color: #1e3a5f; font-size: 12px;');

    // Main initialization - SIMPLIFIED
    document.addEventListener('DOMContentLoaded', function() {
        // Immediately hide preloader
        hidePreloader();
        
        try {
            // Initialize core managers only
            new ModalManager();
            new NavigationManager();
            
            // Initialize video hero for home page
            if (document.querySelector('.hero-video')) {
                new VideoHeroManager();
            }
            
            // Initialize carousel for course page
            if (document.querySelector('.course-hero-carousel')) {
                new CarouselManager();
            }
            
            // Register service worker (non-blocking)
            registerServiceWorker().catch(console.warn);
            
            console.log('✅ Carambola Golf initialized successfully');
            
        } catch (error) {
            console.error('Initialization error:', error);
        }
    });

    // Global utility functions
    window.CarambolaGolf = {
        updateModalContent: function(title, message, email = 'info@carambola.golf', phone = '+1-340-778-5638') {
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
        },
        
        showModal: function() {
            const modal = document.getElementById('constructionModal');
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        },
        
        resetFirstVisit: function() {
            try {
                localStorage.removeItem('carambola-visited');
                console.log('First visit flag reset. Refresh page to see modal again.');
            } catch (e) {
                console.log('Could not reset visit flag.');
            }
        }
    };

})();
