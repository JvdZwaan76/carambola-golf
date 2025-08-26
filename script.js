// Carambola Golf Club JavaScript - Enhanced Performance Version with Auto-Playing Video Hero
(function() {
    'use strict';

    // Prevent duplicate execution
    if (window.CarambolaGolfInitialized) {
        console.log('🟡 Main script already initialized, skipping duplicate execution');
        return;
    }
    window.CarambolaGolfInitialized = true;

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

    // Service Worker Registration
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });
                
                console.log('ServiceWorker registration successful');
                
                // Track service worker registration
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_worker_registered', {
                        'event_category': 'pwa',
                        'event_label': 'success',
                        'non_interaction': true
                    });
                }

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content available, notify user
                            showUpdateNotification();
                        }
                    });
                });

                return true;

            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_worker_error', {
                        'event_category': 'pwa',
                        'event_label': error.message,
                        'non_interaction': true
                    });
                }
                return false;
            }
        }
        return false;
    }

    // Show update notification
    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span>New version available!</span>
                <button onclick="window.location.reload()" class="update-btn">Update</button>
                <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn">×</button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    // ENHANCED VIDEO HERO MANAGER WITH WORKING AUTOPLAY
    class HeroVideoManager {
        constructor() {
            this.video = document.querySelector('.hero-video');
            this.poster = document.querySelector('.hero-poster');
            this.playButton = document.querySelector('.hero-play-button');
            this.loadingIndicator = document.querySelector('.hero-video-loading');
            this.videoLoaded = false;
            this.isPlaying = false;
            this.autoplayAttempted = false;
            this.autoplayDelay = 3000; // 3 seconds after page load
            this.canAutoplay = false;
            
            this.init();
        }
        
        init() {
            if (!this.video || !this.playButton) return;
            
            // Add click event to play button (for manual control)
            this.playButton.addEventListener('click', () => this.handlePlayClick());
            
            // Video event listeners
            this.video.addEventListener('loadstart', () => this.showLoading());
            this.video.addEventListener('canplay', () => this.onVideoReady());
            this.video.addEventListener('canplaythrough', () => this.onVideoReadyToPlay());
            this.video.addEventListener('error', () => this.onVideoError());
            this.video.addEventListener('ended', () => this.onVideoEnded());
            this.video.addEventListener('play', () => this.onVideoPlay());
            this.video.addEventListener('pause', () => this.onVideoPause());
            
            // Track video interaction for analytics
            this.playButton.addEventListener('click', () => {
                if (typeof trackUserEngagement === 'function') {
                    trackUserEngagement('video_play_click', 'hero_video');
                }
            });

            // Check if autoplay is possible
            this.checkAutoplaySupport();
            
            // Auto-start video loading after page load with delay
            this.startAutoVideoLoad();
            
            console.log('🎥 Hero video manager initialized with enhanced autoplay');
        }

        async checkAutoplaySupport() {
            // Create a test video to check autoplay support
            const testVideo = document.createElement('video');
            testVideo.muted = true;
            testVideo.setAttribute('playsinline', '');
            testVideo.style.position = 'absolute';
            testVideo.style.top = '-9999px';
            testVideo.style.left = '-9999px';
            testVideo.style.width = '1px';
            testVideo.style.height = '1px';
            
            try {
                document.body.appendChild(testVideo);
                const playPromise = testVideo.play();
                
                if (playPromise !== undefined) {
                    await playPromise;
                    this.canAutoplay = true;
                    console.log('✅ Autoplay supported');
                } else {
                    this.canAutoplay = false;
                }
                
                testVideo.pause();
                testVideo.remove();
                
            } catch (error) {
                this.canAutoplay = false;
                console.log('❌ Autoplay blocked by browser');
                testVideo.remove();
            }
        }

        startAutoVideoLoad() {
            // Wait for page to be fully loaded and settled
            if (document.readyState === 'loading') {
                window.addEventListener('DOMContentLoaded', () => {
                    this.scheduleAutoplay();
                });
            } else {
                this.scheduleAutoplay();
            }
        }

        scheduleAutoplay() {
            // Wait for images and other resources to load
            if (document.readyState !== 'complete') {
                window.addEventListener('load', () => {
                    setTimeout(() => this.startAutoplaySequence(), this.autoplayDelay);
                });
            } else {
                setTimeout(() => this.startAutoplaySequence(), this.autoplayDelay);
            }
        }

        async startAutoplaySequence() {
            if (this.autoplayAttempted || this.isPlaying) return;
            
            this.autoplayAttempted = true;
            console.log('🎬 Starting autoplay sequence...');

            try {
                // Show subtle loading
                this.showLoadingQuietly();
                
                // Load video if not already loaded
                if (!this.videoLoaded) {
                    await this.loadVideo();
                }

                // Wait a moment for video to buffer
                await this.waitForBuffer();

                // Attempt autoplay
                await this.attemptAutoplay();
                
            } catch (error) {
                console.log('⚠️ Autoplay failed, showing play button:', error.message);
                this.onAutoplayFailed();
            }
        }

        async waitForBuffer() {
            return new Promise((resolve) => {
                if (this.video.readyState >= 3) { // HAVE_FUTURE_DATA
                    resolve();
                } else {
                    const onCanPlay = () => {
                        this.video.removeEventListener('canplay', onCanPlay);
                        resolve();
                    };
                    this.video.addEventListener('canplay', onCanPlay);
                    
                    // Timeout fallback
                    setTimeout(resolve, 2000);
                }
            });
        }

        async attemptAutoplay() {
            // Ensure video is muted for autoplay
            this.video.muted = true;
            this.video.setAttribute('playsinline', '');
            
            try {
                const playPromise = this.video.play();
                
                if (playPromise !== undefined) {
                    await playPromise;
                    this.onAutoplaySuccess();
                } else {
                    throw new Error('Play promise undefined');
                }
                
            } catch (error) {
                console.log('Autoplay blocked:', error.message);
                throw error;
            }
        }

        onAutoplaySuccess() {
            this.isPlaying = true;
            
            // Update UI - video takes over
            this.video.classList.add('playing');
            this.poster.classList.add('hidden');
            this.playButton.classList.add('hidden');
            this.hideLoading();
            
            console.log('✅ Video autoplay successful');
            
            // Track autoplay success
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_video_autoplay', {
                    'event_category': 'media',
                    'event_label': 'success',
                    'non_interaction': true
                });
            }

            // Add click handler to pause/play video
            this.video.addEventListener('click', () => this.toggleVideoPlayback());
        }

        onAutoplayFailed() {
            this.hideLoading();
            
            // Show play button with enhanced styling to indicate video is ready
            this.playButton.classList.remove('hidden');
            this.playButton.style.background = 'rgba(212, 175, 55, 0.9)';
            this.playButton.style.color = 'var(--primary-navy)';
            this.playButton.style.animation = 'playButtonPulse 3s ease-in-out infinite';
            
            // Update button text/icon to show it's ready
            const icon = this.playButton.querySelector('i');
            if (icon) {
                icon.style.animation = 'bounce 2s infinite';
            }
            
            // Track autoplay failure
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_video_autoplay', {
                    'event_category': 'media',
                    'event_label': 'blocked',
                    'non_interaction': true
                });
            }
        }

        toggleVideoPlayback() {
            if (this.isPlaying) {
                this.video.pause();
            } else {
                this.video.play();
            }
        }
        
        async handlePlayClick() {
            if (this.isPlaying) {
                this.pauseVideo();
                return;
            }
            
            try {
                // Show loading state
                this.showLoading();
                
                // Load video source if not already loaded
                if (!this.videoLoaded) {
                    await this.loadVideo();
                }

                // Start playing
                await this.playVideo();
                
            } catch (error) {
                console.error('Error playing video:', error);
                this.onVideoError();
            }
        }
        
        async loadVideo() {
            return new Promise((resolve, reject) => {
                const source = this.video.querySelector('source[data-src]');
                if (!source) {
                    reject(new Error('Video source not found'));
                    return;
                }
                
                // Set the actual src from data-src
                if (!source.src) {
                    source.src = source.getAttribute('data-src');
                    this.video.load();
                }
                
                // Wait for video to be ready
                const onCanPlay = () => {
                    this.video.removeEventListener('canplay', onCanPlay);
                    this.video.removeEventListener('error', onError);
                    this.videoLoaded = true;
                    console.log('📹 Video loaded successfully');
                    resolve();
                };
                
                const onError = (e) => {
                    this.video.removeEventListener('canplay', onCanPlay);
                    this.video.removeEventListener('error', onError);
                    console.error('Video load error:', e);
                    reject(new Error('Video failed to load'));
                };
                
                if (this.video.readyState >= 3) {
                    // Video already loaded
                    this.videoLoaded = true;
                    resolve();
                } else {
                    this.video.addEventListener('canplay', onCanPlay);
                    this.video.addEventListener('error', onError);
                }
            });
        }

        async playVideo() {
            try {
                this.video.muted = false; // Unmute for manual play
                await this.video.play();
                this.isPlaying = true;
                
                // Update UI
                this.video.classList.add('playing');
                this.poster.classList.add('hidden');
                this.playButton.classList.add('hidden');
                this.hideLoading();
                
                // Add click handler for pause
                this.video.addEventListener('click', () => this.toggleVideoPlayback());
                
            } catch (error) {
                console.error('Error starting video playback:', error);
                throw error;
            }
        }

        pauseVideo() {
            this.video.pause();
            this.isPlaying = false;
            
            // Show play button again with pause styling
            this.playButton.classList.remove('hidden');
            this.playButton.style.background = 'rgba(30, 58, 95, 0.85)';
            this.playButton.style.color = 'white';
            
            // Update play button icon
            const icon = this.playButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        }

        onVideoPlay() {
            this.isPlaying = true;
        }

        onVideoPause() {
            this.isPlaying = false;
        }
        
        showLoading() {
            this.loadingIndicator.classList.add('visible');
            this.playButton.style.opacity = '0.5';
            this.playButton.style.pointerEvents = 'none';
        }

        showLoadingQuietly() {
            // Show loading without disabling play button
            this.loadingIndicator.classList.add('visible');
        }
        
        hideLoading() {
            this.loadingIndicator.classList.remove('visible');
            this.playButton.style.opacity = '1';
            this.playButton.style.pointerEvents = 'all';
        }
        
        onVideoReady() {
            console.log('📹 Video ready state: canplay');
        }

        onVideoReadyToPlay() {
            this.hideLoading();
            this.playButton.style.opacity = '1';
            this.playButton.style.pointerEvents = 'all';
            
            console.log('✅ Video ready for playback (canplaythrough)');
        }
        
        onVideoError() {
            this.hideLoading();
            this.playButton.style.opacity = '1';
            this.playButton.style.pointerEvents = 'all';
            
            // Show fallback state
            this.poster.classList.remove('hidden');
            this.video.classList.remove('playing');
            this.playButton.classList.remove('hidden');
            
            console.warn('Video failed to load, showing poster image');
            
            // Track video error
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_video_error', {
                    'event_category': 'media',
                    'event_label': 'fallback_shown',
                    'non_interaction': true
                });
            }
        }
        
        onVideoEnded() {
            // Loop the video smoothly
            this.video.currentTime = 0;
            if (this.isPlaying) {
                this.video.play();
            }
        }
    }

    // Score Card Flip Manager - Enhanced Functionality
    class ScoreCardManager {
        constructor() {
            this.scoreCards = document.querySelectorAll('.score-card-flip');
            this.init();
        }

        init() {
            if (this.scoreCards.length === 0) return;

            this.setupEventListeners();
            this.setupAccessibility();
            console.log('🎯 Score card flip functionality initialized');
        }

        setupEventListeners() {
            this.scoreCards.forEach((card, index) => {
                // Click event for flipping
                card.addEventListener('click', (e) => {
                    // Don't flip if clicking on the flip button specifically
                    if (e.target.closest('.flip-btn')) {
                        this.handleFlipButtonClick(card, e);
                    } else {
                        this.toggleCard(card);
                    }
                    this.trackInteraction('card_click', index + 1);
                });

                // Touch events for mobile
                this.setupTouchEvents(card, index);

                // Keyboard navigation
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleCard(card);
                        this.trackInteraction('keyboard_flip', index + 1);
                    }
                });

                // Handle flip button separately
                const flipBtn = card.querySelector('.flip-btn');
                if (flipBtn) {
                    flipBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleFlipButtonClick(card, e);
                    });
                }
            });
        }

        setupTouchEvents(card, index) {
            let touchStartTime = 0;
            let touchStartX = 0;
            let touchStartY = 0;

            card.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            card.addEventListener('touchend', (e) => {
                const touchEndTime = Date.now();
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const timeDiff = touchEndTime - touchStartTime;
                const distanceX = Math.abs(touchEndX - touchStartX);
                const distanceY = Math.abs(touchEndY - touchStartY);
                
                // Consider it a tap if it's quick and doesn't move much
                if (timeDiff < 500 && distanceX < 50 && distanceY < 50) {
                    // Don't flip if touching the flip button
                    if (!e.target.closest('.flip-btn')) {
                        this.toggleCard(card);
                        this.trackInteraction('touch_flip', index + 1);
                    }
                }
            }, { passive: true });
        }

        setupAccessibility() {
            this.scoreCards.forEach((card) => {
                // Ensure proper ARIA attributes
                card.setAttribute('role', 'button');
                card.setAttribute('aria-label', 'Flip card to view additional information');
                
                // Add tabindex if not present
                if (!card.hasAttribute('tabindex')) {
                    card.setAttribute('tabindex', '0');
                }

                // Update ARIA label based on flip state
                this.updateAriaLabel(card);
            });
        }

        toggleCard(card) {
            const isFlipped = card.classList.contains('flipped');
            
            // Add visual feedback
            card.classList.add('flipping');
            
            if (isFlipped) {
                this.flipToFront(card);
            } else {
                this.flipToBack(card);
            }

            // Remove flipping class after animation
            setTimeout(() => {
                card.classList.remove('flipping');
            }, 800);

            this.updateAriaLabel(card);
        }

        flipToFront(card) {
            card.classList.remove('flipped');
            card.setAttribute('aria-expanded', 'false');
            
            // Update flip button icon if present
            const flipBtn = card.querySelector('.flip-btn i');
            if (flipBtn) {
                flipBtn.style.transform = 'rotate(0deg)';
            }
        }

        flipToBack(card) {
            card.classList.add('flipped');
            card.setAttribute('aria-expanded', 'true');
            
            // Update flip button icon if present
            const flipBtn = card.querySelector('.flip-btn i');
            if (flipBtn) {
                flipBtn.style.transform = 'rotate(180deg)';
            }
        }

        handleFlipButtonClick(card, event) {
            event.preventDefault();
            event.stopPropagation();
            
            this.toggleCard(card);
            
            // Add visual feedback to button
            const flipBtn = event.target.closest('.flip-btn');
            if (flipBtn) {
                flipBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    flipBtn.style.transform = '';
                }, 150);
            }
        }

        updateAriaLabel(card) {
            const isFlipped = card.classList.contains('flipped');
            const cardTitle = card.querySelector('.score-card-header h3')?.textContent || 'Score card';
            
            if (isFlipped) {
                card.setAttribute('aria-label', `${cardTitle} - Showing details. Click to view score card.`);
            } else {
                card.setAttribute('aria-label', `${cardTitle} - Showing score card. Click to view details.`);
            }
        }

        trackInteraction(action, cardNumber) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'scorecard_interaction', {
                    'event_category': 'scorecard',
                    'event_label': action,
                    'card_number': cardNumber,
                    'page_location': window.location.pathname
                });
            }
        }

        // Public method to flip all cards to front (useful for printing)
        flipAllToFront() {
            this.scoreCards.forEach(card => {
                if (card.classList.contains('flipped')) {
                    this.flipToFront(card);
                }
            });
        }

        // Public method to reset all cards
        resetAllCards() {
            this.scoreCards.forEach(card => {
                card.classList.remove('flipped', 'flipping');
                this.updateAriaLabel(card);
            });
        }
    }

    // Course Hero Carousel Manager
    class CarouselManager {
        constructor() {
            this.carousel = document.querySelector('.course-hero-carousel');
            this.slides = document.querySelectorAll('.carousel-slide');
            this.prevBtn = document.querySelector('.carousel-prev');
            this.nextBtn = document.querySelector('.carousel-next');
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

            // Track carousel initialization
            if (typeof gtag !== 'undefined') {
                gtag('event', 'carousel_initialized', {
                    'event_category': 'hero_carousel',
                    'event_label': 'course_page',
                    'slide_count': this.totalSlides
                });
            }

            console.log('🎠 Course carousel initialized');
        }

        setupEventListeners() {
            // Navigation buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.previousSlide();
                    this.trackCarouselInteraction('prev_button');
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                    this.trackCarouselInteraction('next_button');
                });
            }

            // Dots navigation
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.goToSlide(index);
                    this.trackCarouselInteraction('dot_navigation');
                });
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (this.carousel && this.isInViewport(this.carousel)) {
                    if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        this.previousSlide();
                        this.trackCarouselInteraction('keyboard_prev');
                    } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        this.nextSlide();
                        this.trackCarouselInteraction('keyboard_next');
                    }
                }
            });

            // Touch/swipe support
            this.setupTouchEvents();
        }

        setupTouchEvents() {
            let startX = 0;
            let endX = 0;
            let startY = 0;
            let endY = 0;

            this.carousel.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, passiveIfSupported);

            this.carousel.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;
                
                const deltaX = startX - endX;
                const deltaY = startY - endY;
                
                // Only trigger if horizontal swipe is more significant than vertical
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        this.nextSlide();
                        this.trackCarouselInteraction('swipe_left');
                    } else {
                        this.previousSlide();
                        this.trackCarouselInteraction('swipe_right');
                    }
                }
            }, passiveIfSupported);
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

        isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return rect.top >= 0 && rect.top <= window.innerHeight;
        }

        trackCarouselInteraction(action) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'carousel_interaction', {
                    'event_category': 'carousel',
                    'event_label': action,
                    'slide_number': this.currentSlide + 1,
                    'page_location': window.location.pathname
                });
            }
        }
    }

    // Hole 1 Mini Carousel Manager
    class HoleCarouselManager {
        constructor() {
            this.carousel = document.querySelector('.hole-1-special .hole-image-carousel');
            this.slides = document.querySelectorAll('.hole-carousel-slide');
            this.playBtn = document.querySelector('.hole-carousel-play-btn');
            this.prevBtn = document.querySelector('.hole-carousel-prev');
            this.nextBtn = document.querySelector('.hole-carousel-next');
            this.dots = document.querySelectorAll('.hole-carousel-dot');
            
            this.currentSlide = 0;
            this.totalSlides = this.slides.length;
            this.isPlaying = false;
            this.autoplayTimer = null;
            this.autoplayDelay = 3000; // 3 seconds per slide
            
            this.init();
        }

        init() {
            if (!this.carousel || this.totalSlides === 0) return;

            this.setupEventListeners();
            this.updateDots();

            // Track hole carousel initialization
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hole_carousel_initialized', {
                    'event_category': 'hole_gallery',
                    'event_label': 'hole_1',
                    'slide_count': this.totalSlides
                });
            }

            console.log('🌟 Hole carousel initialized');
        }

        setupEventListeners() {
            // Play/Pause button
            if (this.playBtn) {
                this.playBtn.addEventListener('click', () => {
                    this.togglePlayback();
                });
            }

            // Navigation buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.previousSlide();
                    this.trackHoleCarouselInteraction('prev_button');
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                    this.trackHoleCarouselInteraction('next_button');
                });
            }

            // Dots navigation
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.goToSlide(index);
                    this.trackHoleCarouselInteraction('dot_navigation');
                });
            });

            // Touch/swipe support
            this.setupTouchEvents();

            // Keyboard navigation when focused
            if (this.carousel) {
                this.carousel.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        this.previousSlide();
                        this.trackHoleCarouselInteraction('keyboard_prev');
                    } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        this.nextSlide();
                        this.trackHoleCarouselInteraction('keyboard_next');
                    } else if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        this.togglePlayback();
                    }
                });

                // Make carousel focusable for keyboard navigation
                this.carousel.setAttribute('tabindex', '0');
            }
        }

        setupTouchEvents() {
            if (!this.carousel) return;
            
            let startX = 0;
            let endX = 0;
            let startY = 0;
            let endY = 0;

            this.carousel.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, passiveIfSupported);

            this.carousel.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;
                
                const deltaX = startX - endX;
                const deltaY = startY - endY;
                
                // Only trigger if horizontal swipe is more significant than vertical
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
                    if (deltaX > 0) {
                        this.nextSlide();
                        this.trackHoleCarouselInteraction('swipe_left');
                    } else {
                        this.previousSlide();
                        this.trackHoleCarouselInteraction('swipe_right');
                    }
                }
            }, passiveIfSupported);
        }

        togglePlayback() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        }

        play() {
            this.isPlaying = true;
            if (this.playBtn) {
                this.playBtn.classList.add('playing');
                
                // Update play button icon
                const icon = this.playBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                }
            }

            this.startAutoplay();
            this.trackHoleCarouselInteraction('play');
        }

        pause() {
            this.isPlaying = false;
            if (this.playBtn) {
                this.playBtn.classList.remove('playing');
                
                // Update play button icon
                const icon = this.playBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                }
            }

            this.stopAutoplay();
            this.trackHoleCarouselInteraction('pause');
        }

        startAutoplay() {
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
            }
            
            this.autoplayTimer = setInterval(() => {
                this.nextSlide();
            }, this.autoplayDelay);
        }

        stopAutoplay() {
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
        }

        goToSlide(index) {
            if (index < 0 || index >= this.totalSlides || index === this.currentSlide) return;

            // Remove active class from current slide
            this.slides[this.currentSlide].classList.remove('active');
            
            // Update current slide
            this.currentSlide = index;
            
            // Add active class to new slide
            this.slides[this.currentSlide].classList.add('active');
            
            this.updateDots();
        }

        nextSlide() {
            const nextIndex = (this.currentSlide + 1) % this.totalSlides;
            this.goToSlide(nextIndex);
        }

        previousSlide() {
            const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
            this.goToSlide(prevIndex);
        }

        updateDots() {
            this.dots.forEach((dot, index) => {
                if (index === this.currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        trackHoleCarouselInteraction(action) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hole_carousel_interaction', {
                    'event_category': 'hole_gallery',
                    'event_label': action,
                    'hole_number': 1,
                    'slide_number': this.currentSlide + 1,
                    'page_location': window.location.pathname
                });
            }
        }
    }

    // Enhanced preloader with progress tracking - CRITICAL MOBILE FIX
    class PreloaderManager {
        constructor() {
            this.preloader = document.getElementById('preloader');
            this.progress = document.querySelector('.loading-progress');
            this.loadingSteps = [];
            this.completedSteps = 0;
            this.minimumShowTime = window.innerWidth <= 768 ? 800 : 1000; // Shorter on mobile
            this.maximumShowTime = window.innerWidth <= 768 ? 4000 : 6000; // Max 4s on mobile, 6s desktop
            this.startTime = performance.now();
            this.forceHideTimer = null;
        }

        addStep(name) {
            this.loadingSteps.push(name);
            console.log(`Preloader step added: ${name} (${this.loadingSteps.length} total)`);
        }

        completeStep(name) {
            this.completedSteps++;
            this.updateProgress();
            console.log(`Preloader step completed: ${name} (${this.completedSteps}/${this.loadingSteps.length})`);
            
            if (this.completedSteps >= this.loadingSteps.length) {
                this.checkComplete();
            }
        }

        updateProgress() {
            if (this.progress && this.loadingSteps.length > 0) {
                const percentage = (this.completedSteps / this.loadingSteps.length) * 100;
                this.progress.style.width = `${percentage}%`;
            }
        }

        async checkComplete() {
            const elapsedTime = performance.now() - this.startTime;
            const remainingTime = Math.max(0, this.minimumShowTime - elapsedTime);
            
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }
            
            this.hide();
        }

        hide() {
            if (this.forceHideTimer) {
                clearTimeout(this.forceHideTimer);
            }
            
            if (this.preloader) {
                this.preloader.classList.add('hidden');
                performanceMetrics.mark('preloader_hidden');
                
                // Remove from DOM after animation
                setTimeout(() => {
                    if (this.preloader && this.preloader.parentNode) {
                        this.preloader.parentNode.removeChild(this.preloader);
                    }
                }, 500);
                
                // Track preloader completion time
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'preloader_complete', {
                        'event_category': 'performance',
                        'value': Math.round(performance.now() - this.startTime),
                        'non_interaction': true
                    });
                }
                
                console.log('✅ Preloader hidden successfully');
            }
        }

        init() {
            // Force hide after maximum time regardless of completion
            this.forceHideTimer = setTimeout(() => {
                console.log('⏰ Preloader safety timeout reached');
                this.hide();
            }, this.maximumShowTime);
        }
    }

    // Image optimization and lazy loading
    class ImageOptimizer {
        constructor() {
            this.lazyImages = document.querySelectorAll('img[data-src]');
            this.imageObserver = null;
            this.init();
        }

        init() {
            if ('IntersectionObserver' in window) {
                this.imageObserver = new IntersectionObserver(this.handleIntersection.bind(this), {
                    root: null,
                    rootMargin: '50px',
                    threshold: 0.1
                });

                this.lazyImages.forEach(img => this.imageObserver.observe(img));
            } else {
                // Fallback for older browsers
                this.loadAllImages();
            }
            console.log('🖼️ Image optimizer initialized');
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }

        loadImage(img) {
            return new Promise((resolve) => {
                const newImg = new Image();
                newImg.onload = () => {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    resolve();
                };
                newImg.onerror = resolve; // Continue even if image fails
                newImg.src = img.dataset.src;
            });
        }

        loadAllImages() {
            this.lazyImages.forEach(img => this.loadImage(img));
        }
    }

    // Enhanced offline detection
    class OfflineManager {
        constructor() {
            this.indicator = document.getElementById('offlineIndicator');
            this.isOnline = navigator.onLine;
            this.init();
        }

        init() {
            window.addEventListener('online', this.handleOnline.bind(this), passiveIfSupported);
            window.addEventListener('offline', this.handleOffline.bind(this), passiveIfSupported);
            
            // Initial state
            if (!this.isOnline) {
                this.showOfflineIndicator();
            }
        }

        handleOnline() {
            this.isOnline = true;
            this.hideOfflineIndicator();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'connection_restored', {
                    'event_category': 'connectivity',
                    'non_interaction': true
                });
            }
        }

        handleOffline() {
            this.isOnline = false;
            this.showOfflineIndicator();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'connection_lost', {
                    'event_category': 'connectivity',
                    'non_interaction': true
                });
            }
        }

        showOfflineIndicator() {
            if (this.indicator) {
                this.indicator.style.display = 'block';
                setTimeout(() => this.indicator.classList.add('show'), 10);
            }
        }

        hideOfflineIndicator() {
            if (this.indicator) {
                this.indicator.classList.remove('show');
                setTimeout(() => this.indicator.style.display = 'none', 300);
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

            // FIXED: Only attach modal to booking buttons, not all CTA buttons to avoid blog conflicts
            this.bookButtons.forEach(button => {
                // Only attach to actual booking buttons, not blog CTA buttons
                if (button.classList.contains('book-tee-time') || 
                    button.textContent.toLowerCase().includes('book') ||
                    button.href?.includes('contact')) {
                    button.addEventListener('click', this.handleBookingClick.bind(this));
                }
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
                return false; // Fallback if localStorage is not available
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
                
                // Focus trap
                this.trapFocus();
                
                // Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'modal_shown', {
                        'event_category': 'engagement',
                        'event_label': 'construction_modal',
                        'page_location': window.location.pathname
                    });
                }
            }
        }

        hide() {
            if (this.modal) {
                this.modal.classList.remove('show');
                document.body.style.overflow = '';
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'modal_closed', {
                        'event_category': 'engagement',
                        'event_label': 'construction_modal',
                        'page_location': window.location.pathname
                    });
                }
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
            // Only prevent default for actual booking buttons
            if (e.target.classList.contains('book-tee-time') || 
                e.target.textContent.toLowerCase().includes('book') ||
                e.target.href?.includes('contact')) {
                e.preventDefault();
                this.show();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'tee_time_intent', {
                        'event_category': 'conversion',
                        'event_label': 'book_tee_time_clicked',
                        'value': 1,
                        'page_location': window.location.pathname
                    });
                }
            }
        }

        trapFocus() {
            const focusableElements = this.modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            this.modal.addEventListener('keydown', (e) => {
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
    }

    // Enhanced NavigationManager class with complete mobile functionality
    class NavigationManager {
        constructor() {
            this.navbar = document.querySelector('.navbar');
            this.mobileMenuBtn = document.querySelector('.mobile-menu');
            this.navLinks = document.querySelector('.nav-links');
            this.lastScrollY = window.scrollY;
            this.isScrolling = false;
            this.mobileMenuOpen = false;
            this.init();
        }

        init() {
            // FIXED: Only initialize if not already handled by blog script
            if (this.mobileMenuBtn && this.navLinks && !window.CarambolaBlogInitialized) {
                this.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
                this.navLinks.addEventListener('click', this.handleLinkClick.bind(this));
                this.setupMobileMenuEnhancements();
            }

            // Optimized scroll handling
            window.addEventListener('scroll', throttle(this.handleScroll.bind(this), 16), passiveIfSupported);
            this.setActiveNavigation();
            
            console.log('📱 Enhanced mobile navigation initialized');
        }

        setupMobileMenuEnhancements() {
            // Close menu on outside click
            document.addEventListener('click', (e) => {
                if (this.mobileMenuOpen && 
                    !this.navbar.contains(e.target) && 
                    this.navLinks.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });

            // Close menu on window resize (when switching to desktop)
            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth > 768 && this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            }, 250));

            // Prevent body scroll when menu is open
            this.setupScrollLock();
        }

        setupScrollLock() {
            let scrollPosition = 0;
            
            this.lockScroll = () => {
                scrollPosition = window.pageYOffset;
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollPosition}px`;
                document.body.style.width = '100%';
            };

            this.unlockScroll = () => {
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('position');
                document.body.style.removeProperty('top');
                document.body.style.removeProperty('width');
                window.scrollTo(0, scrollPosition);
            };
        }

        toggleMobileMenu() {
            const isExpanded = this.navLinks.classList.contains('active');
            
            if (isExpanded) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }

        openMobileMenu() {
            this.navLinks.classList.add('active');
            this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
            this.mobileMenuOpen = true;

            // Update icon
            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }

            // Lock body scroll on mobile
            if (window.innerWidth <= 768) {
                this.lockScroll();
            }

            // Track mobile menu interaction
            if (typeof gtag !== 'undefined') {
                gtag('event', 'mobile_menu_opened', {
                    'event_category': 'navigation',
                    'event_label': 'mobile_hamburger',
                    'page_location': window.location.pathname
                });
            }

            console.log('📱 Mobile menu opened');
        }

        closeMobileMenu() {
            this.navLinks.classList.remove('active');
            this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            this.mobileMenuOpen = false;

            // Update icon
            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }

            // Unlock body scroll
            this.unlockScroll();

            console.log('📱 Mobile menu closed');
        }

        handleLinkClick(e) {
            if (e.target.tagName === 'A') {
                this.closeMobileMenu();
                
                // Track navigation click
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'mobile_nav_click', {
                        'event_category': 'navigation',
                        'event_label': e.target.textContent.trim(),
                        'link_url': e.target.href,
                        'page_location': window.location.pathname
                    });
                }
            }
        }

        handleScroll() {
            if (!this.isScrolling) {
                requestAnimationFrame(() => {
                    this.updateNavbarStyle();
                    this.isScrolling = false;
                });
                this.isScrolling = true;
            }
        }

        updateNavbarStyle() {
            if (this.navbar) {
                if (window.scrollY > 50) {
                    this.navbar.style.background = 'rgba(30, 58, 95, 0.98)';
                    this.navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    this.navbar.style.backdropFilter = 'blur(10px)';
                } else {
                    this.navbar.style.background = 'rgba(30, 58, 95, 0.95)';
                    this.navbar.style.boxShadow = 'none';
                    this.navbar.style.backdropFilter = 'blur(10px)';
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

    // Enhanced animation manager with Intersection Observer
    class AnimationManager {
        constructor() {
            this.observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -30px 0px'
            };
            this.observer = null;
            this.statsObserver = null;
            this.init();
        }

        init() {
            this.setupMainObserver();
            this.setupStatsObserver();
            this.observeElements();
            console.log('✨ Animation manager initialized');
        }

        setupMainObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        
                        // Track section visibility
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
            }, this.observerOptions);
        }

        setupStatsObserver() {
            this.statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                    }
                });
            }, { threshold: 0.5 });
        }

        observeElements() {
            // Observe cards for animation with staggered delays
            document.querySelectorAll('.feature-card, .hole-card, .stat-card, .quick-link-card, .value-card, .booking-card, .accommodation-card, .benefit-card, .experience-card').forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                this.observer.observe(el);
            });

            // Observe stats for counter animation
            document.querySelectorAll('.stat-card').forEach(stat => {
                this.statsObserver.observe(stat);
            });
        }

        animateCounter(statCard) {
            const stat = statCard.querySelector('.stat-number');
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
    }

    // Enhanced tab functionality
    class TabManager {
        constructor() {
            this.init();
        }

        init() {
            this.setupPricingTabs();
            this.setupExperienceTabs();
            this.setupAccommodationTabs();
        }

        setupPricingTabs() {
            const pricingTabs = document.querySelectorAll('.pricing-tab');
            const pricingContainers = document.querySelectorAll('.pricing-table-container');
            
            pricingTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetTab = tab.dataset.tab;
                    
                    pricingTabs.forEach(t => t.classList.remove('active'));
                    pricingContainers.forEach(c => c.classList.remove('active'));
                    
                    tab.classList.add('active');
                    const targetContainer = document.getElementById(targetTab);
                    if (targetContainer) {
                        targetContainer.classList.add('active');
                    }
                    
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
        }

        setupExperienceTabs() {
            const experienceTabs = document.querySelectorAll('.experience-tab');
            const experienceSections = document.querySelectorAll('.experience-section');
            
            experienceTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetTab = tab.dataset.tab;
                    
                    experienceTabs.forEach(t => t.classList.remove('active'));
                    experienceSections.forEach(s => s.classList.remove('active'));
                    
                    tab.classList.add('active');
                    const targetSection = document.getElementById(targetTab);
                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                    
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

        setupAccommodationTabs() {
            const accommodationTabs = document.querySelectorAll('.accommodation-tab');
            const accommodationSections = document.querySelectorAll('.accommodations-section');
            
            accommodationTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetTab = tab.dataset.tab;
                    
                    accommodationTabs.forEach(t => t.classList.remove('active'));
                    accommodationSections.forEach(s => s.classList.remove('active'));
                    
                    tab.classList.add('active');
                    const targetSection = document.getElementById(targetTab);
                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'accommodation_tab_click', {
                            'event_category': 'engagement',
                            'event_label': targetTab,
                            'section': 'accommodations',
                            'page_location': window.location.pathname
                        });
                    }
                });
            });
        }
    }

    // Enhanced analytics and tracking
    class AnalyticsManager {
        constructor() {
            this.maxScroll = 0;
            this.scrollDepthThresholds = [25, 50, 75, 100];
            this.scrollDepthHit = new Set();
            this.init();
        }

        init() {
            this.setupScrollTracking();
            this.setupLinkTracking();
            this.setupFormTracking();
            this.setupPerformanceTracking();
            this.trackPageView();
            console.log('📊 Analytics initialized');
        }

        setupScrollTracking() {
            const updateScrollDepth = throttle(() => {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                this.maxScroll = Math.max(this.maxScroll, scrollPercent);
                
                this.scrollDepthThresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !this.scrollDepthHit.has(threshold)) {
                        this.scrollDepthHit.add(threshold);
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
            }, 250);

            window.addEventListener('scroll', updateScrollDepth, passiveIfSupported);
        }

        setupLinkTracking() {
            document.addEventListener('click', (e) => {
                const target = e.target.closest('a');
                if (target && (target.href.startsWith('http') || target.href.startsWith('mailto') || target.href.startsWith('tel'))) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'external_link_click', {
                            'event_category': 'engagement',
                            'event_label': target.href,
                            'link_text': target.textContent.trim(),
                            'transport_type': 'beacon',
                            'page_location': window.location.pathname
                        });
                    }
                }
            });
        }

        setupFormTracking() {
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', () => {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submit', {
                            'event_category': 'engagement',
                            'event_label': 'contact_form',
                            'page_location': window.location.pathname
                        });
                    }
                });
            });
        }

        setupPerformanceTracking() {
            window.addEventListener('load', () => {
                setTimeout(() => {
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
        }

        trackPageView() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_view', {
                    'page_title': document.title,
                    'page_location': window.location.href,
                    'page_path': window.location.pathname
                });
            }
        }
    }

    // Enhanced card interactions
    class CardInteractionManager {
        constructor() {
            this.init();
        }

        init() {
            this.setupHoleCards();
            this.setupExperienceCards();
            this.setupQuickLinkCards();
            this.setupAccommodationCards();
        }

        setupHoleCards() {
            document.querySelectorAll('.hole-card').forEach((card, index) => {
                this.addHoverEffects(card);
                
                card.addEventListener('click', () => {
                    const holeNumber = card.querySelector('.hole-number')?.textContent || 'unknown';
                    const holeName = card.querySelector('h4')?.textContent || 'unknown';
                    
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
        }

        setupExperienceCards() {
            document.querySelectorAll('.experience-card').forEach((card, index) => {
                this.addHoverEffects(card);
                
                card.addEventListener('click', () => {
                    const experienceName = card.querySelector('h3')?.textContent || 'unknown';
                    const experienceCategory = card.querySelector('.experience-category')?.textContent || 'unknown';
                    
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
        }

        setupQuickLinkCards() {
            document.querySelectorAll('.quick-link-card').forEach((card, index) => {
                this.addHoverEffects(card);
                
                card.addEventListener('click', () => {
                    const cardName = card.querySelector('h3')?.textContent || 'unknown';
                    
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
        }

        setupAccommodationCards() {
            document.querySelectorAll('.accommodation-card').forEach((card, index) => {
                this.addHoverEffects(card);
                
                card.addEventListener('click', () => {
                    const accommodationName = card.querySelector('h3')?.textContent || 'unknown';
                    const accommodationCategory = card.querySelector('.accommodation-category')?.textContent || 'unknown';
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'accommodation_card_interaction', {
                            'event_category': 'engagement',
                            'event_label': accommodationName,
                            'accommodation_category': accommodationCategory,
                            'card_position': index + 1,
                            'page_location': window.location.pathname
                        });
                    }
                });
            });
        }

        addHoverEffects(card) {
            card.addEventListener('mouseenter', () => {
                if (card.classList.contains('hole-card')) {
                    card.style.transform = 'translateY(-3px) scale(1.02)';
                } else {
                    card.style.transform = 'translateY(-5px) scale(1.02)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        }
    }

    // Smooth scrolling for anchor links
    function setupSmoothScrolling() {
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
    }

    // External link tracking
    function setupExternalLinkTracking() {
        document.querySelectorAll('a[href*="http"]').forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                link.addEventListener('click', function() {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'external_link_click', {
                            'event_category': 'external_navigation',
                            'event_label': this.href,
                            'link_domain': new URL(this.href).hostname
                        });
                    }
                });
            }
        });
    }

    // Enhanced form validation and tracking
    function setupFormHandling() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                // Basic form validation
                const requiredFields = this.querySelectorAll('[required]');
                let isValid = true;
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                    } else {
                        field.classList.remove('error');
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    return;
                }
                
                // Track successful form submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'conversion',
                        'event_label': 'contact_form',
                        'value': 1
                    });
                }
            });
        });
    }

    // Error handling and reporting
    function setupErrorHandling() {
        window.addEventListener('error', function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'javascript_error', {
                    'event_category': 'error',
                    'event_label': e.message,
                    'value': 1,
                    'non_interaction': true
                });
            }
        });

        window.addEventListener('unhandledrejection', function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'promise_rejection', {
                    'event_category': 'error',
                    'event_label': e.reason.toString(),
                    'value': 1,
                    'non_interaction': true
                });
            }
        });
    }

    // Main initialization
    document.addEventListener('DOMContentLoaded', async function() {
        performanceMetrics.mark('dom_ready');
        
        console.log('🌴 Welcome to Carambola Golf Club! 🌴');
        console.log('🔧 Enhanced performance with working autoplay video hero');
        console.log('🔧 For technical inquiries: jaspervdz@me.com');
        
        // Initialize preloader
        const preloader = new PreloaderManager();
        
        // Add loading steps
        preloader.addStep('service_worker');
        preloader.addStep('images');
        preloader.addStep('fonts');
        preloader.addStep('analytics');
        preloader.addStep('animations');
        preloader.addStep('video_hero');
        preloader.addStep('carousel');
        preloader.addStep('hole_carousel');
        preloader.addStep('score_cards');
        
        console.log('⚡ Starting initialization...');
        
        try {
            // Initialize preloader with mobile optimizations
            preloader.init();
            
            // Register service worker
            const swResult = await registerServiceWorker();
            console.log('✅ Service worker ready');
            preloader.completeStep('service_worker');
            
            // Initialize image optimizer
            new ImageOptimizer();
            preloader.completeStep('images');
            
            // Check for font loading
            if (document.fonts) {
                await document.fonts.ready;
            }
            console.log('✅ Fonts ready');
            preloader.completeStep('fonts');
            
            // Initialize analytics
            new AnalyticsManager();
            preloader.completeStep('analytics');
            
            // Initialize all managers
            new ModalManager();
            new NavigationManager();
            new AnimationManager();
            new TabManager();
            new CardInteractionManager();
            new OfflineManager();
            
            // Initialize enhanced video hero for home page
            if (document.querySelector('.hero-video')) {
                new HeroVideoManager();
            }
            preloader.completeStep('video_hero');
            
            // Initialize carousel for course page
            if (document.querySelector('.course-hero-carousel')) {
                new CarouselManager();
            }
            
            // Initialize hole 1 carousel
            if (document.querySelector('.hole-1-special .hole-image-carousel')) {
                new HoleCarouselManager();
            }
            
            // Initialize score card functionality
            const scoreCardManager = new ScoreCardManager();
            window.scoreCardManager = scoreCardManager; // Make it globally accessible
            
            // Setup additional functionality
            setupSmoothScrolling();
            setupExternalLinkTracking();
            setupFormHandling();
            setupErrorHandling();
            
            preloader.completeStep('carousel');
            preloader.completeStep('hole_carousel');
            preloader.completeStep('score_cards');
            
            console.log('✅ Main script initialization complete with working autoplay!');
            
            performanceMetrics.mark('init_complete');
            
        } catch (error) {
            console.error('⚠️ Main script initialization error:', error);
            preloader.hide(); // Hide preloader even if there's an error
        }
    });

    // Handle window events that might affect components
    window.addEventListener('resize', debounce(() => {
        const scoreCardManager = window.scoreCardManager;
        if (scoreCardManager && window.innerWidth !== window.lastWidth) {
            // Only reset if width changed significantly
            if (Math.abs(window.innerWidth - (window.lastWidth || 0)) > 100) {
                scoreCardManager.resetAllCards();
            }
            window.lastWidth = window.innerWidth;
        }
    }, 250));

    // Handle print events
    window.addEventListener('beforeprint', () => {
        const scoreCards = document.querySelectorAll('.score-card-flip');
        scoreCards.forEach(card => {
            card.classList.add('printing');
        });
    });

    window.addEventListener('afterprint', () => {
        const scoreCards = document.querySelectorAll('.score-card-flip');
        scoreCards.forEach(card => {
            card.classList.remove('printing');
        });
    });

    // Handle orientation change
    window.addEventListener('orientationchange', debounce(() => {
        const heroes = document.querySelectorAll('.hero, .page-hero, .course-hero-carousel');
        heroes.forEach(hero => {
            hero.style.height = 'auto';
            if (hero.classList.contains('course-hero-carousel')) {
                hero.style.minHeight = window.innerWidth <= 768 ? '70vh' : '80vh';
            } else {
                hero.style.minHeight = window.innerWidth <= 768 ? '80vh' : '90vh';
            }
        });
    }, 100));

    // Console branding
    console.log('%c🌴 Welcome to Carambola Golf Club! 🌴', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.log('%c⚡ Enhanced website with working autoplay video hero', 'color: #1e3a5f; font-size: 12px;');
    console.log('%c🔧 Technical support: jaspervdz@me.com', 'color: #1e3a5f; font-size: 12px;');

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
        },
        
        trackEvent: function(category, action, label, value = null) {
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
        },
        
        getPerformanceMetrics: function() {
            return {
                ...performanceMetrics.marks,
                loadTime: performance.now() - performanceMetrics.startTime
            };
        },

        // Score card utilities
        flipScoreCard: function(cardIndex) {
            const scoreCardManager = window.scoreCardManager;
            if (scoreCardManager && scoreCardManager.scoreCards[cardIndex]) {
                scoreCardManager.toggleCard(scoreCardManager.scoreCards[cardIndex]);
            }
        },
        
        resetScoreCards: function() {
            const scoreCardManager = window.scoreCardManager;
            if (scoreCardManager) {
                scoreCardManager.resetAllCards();
            }
        }
    };

})();
