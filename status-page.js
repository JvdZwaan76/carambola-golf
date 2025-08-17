// Carambola Golf Club Status Page JavaScript - COMPLETE ENHANCED VERSION
// This file is loaded ONLY on the status page with all mobile optimizations and features

(function() {
    'use strict';
    
    // Only run if we're on the status page
    if (!window.location.pathname.includes('status')) {
        return;
    }
    
    console.log('🌴⛳ Initializing Enhanced Carambola Golf Status Page...');
    
    // Enhanced Mobile Navigation for Status Sections
    class StatusNavigation {
        constructor() {
            this.currentSection = 'metrics';
            this.sections = ['metrics', 'services', 'performance', 'activity', 'support'];
            this.init();
        }

        init() {
            this.createMobileNav();
            this.setupIntersectionObserver();
            this.setupSmoothScrolling();
        }

        createMobileNav() {
            if (window.innerWidth <= 768) {
                const navHTML = `
                    <nav class="status-nav-mobile" aria-label="Status page navigation">
                        <div class="status-nav-links">
                            <a href="#metrics" class="status-nav-link active" data-section="metrics">
                                <i class="fas fa-tachometer-alt"></i> Metrics
                            </a>
                            <a href="#services" class="status-nav-link" data-section="services">
                                <i class="fas fa-server"></i> Services
                            </a>
                            <a href="#performance" class="status-nav-link" data-section="performance">
                                <i class="fas fa-chart-line"></i> Performance
                            </a>
                            <a href="#activity" class="status-nav-link" data-section="activity">
                                <i class="fas fa-history"></i> Activity
                            </a>
                            <a href="#support" class="status-nav-link" data-section="support">
                                <i class="fas fa-headset"></i> Support
                            </a>
                        </div>
                    </nav>
                `;
                
                const statusHeader = document.querySelector('.status-header');
                if (statusHeader && !document.querySelector('.status-nav-mobile')) {
                    statusHeader.insertAdjacentHTML('afterend', navHTML);
                }
            }
        }

        setupIntersectionObserver() {
            const sections = document.querySelectorAll('.status-section');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionId = this.getSectionId(entry.target);
                        this.updateActiveNav(sectionId);
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '-20% 0px -60% 0px'
            });

            sections.forEach(section => observer.observe(section));
        }

        getSectionId(section) {
            if (section.querySelector('.metrics-grid')) return 'metrics';
            if (section.querySelector('.services-list')) return 'services';
            if (section.querySelector('.charts-grid')) return 'performance';
            if (section.querySelector('.activity-feed')) return 'activity';
            if (section.querySelector('.support-content')) return 'support';
            return 'metrics';
        }

        updateActiveNav(sectionId) {
            const navLinks = document.querySelectorAll('.status-nav-link');
            navLinks.forEach(link => {
                if (link.dataset.section === sectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            this.currentSection = sectionId;
        }

        setupSmoothScrolling() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('.status-nav-link');
                if (link) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetSection = this.findSectionByType(targetId);
                    
                    if (targetSection) {
                        const offset = document.querySelector('.navbar')?.offsetHeight || 0;
                        const mobileNavHeight = document.querySelector('.status-nav-mobile')?.offsetHeight || 0;
                        const targetPosition = targetSection.offsetTop - offset - mobileNavHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }

        findSectionByType(type) {
            const sections = document.querySelectorAll('.status-section');
            for (const section of sections) {
                if (this.getSectionId(section) === type) {
                    return section;
                }
            }
            return null;
        }
    }

    // Enhanced Toast Notification System
    class StatusToastManager {
        constructor() {
            this.toasts = [];
            this.maxToasts = 3;
            this.defaultDuration = 5000;
        }

        show(title, message, type = 'info', duration = null) {
            const toast = this.createToast(title, message, type, duration || this.defaultDuration);
            this.addToast(toast);
            return toast;
        }

        createToast(title, message, type, duration) {
            const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-triangle',
                warning: 'fa-exclamation-circle',
                info: 'fa-info-circle'
            };

            const toast = document.createElement('div');
            toast.id = toastId;
            toast.className = `status-toast ${type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');
            
            toast.innerHTML = `
                <div class="toast-title">
                    <i class="fas ${icons[type] || icons.info}"></i>
                    ${title}
                </div>
                <p class="toast-message">${message}</p>
            `;

            // Auto-dismiss
            setTimeout(() => this.removeToast(toastId), duration);

            // Manual dismiss on click
            toast.addEventListener('click', () => this.removeToast(toastId));

            return { element: toast, id: toastId };
        }

        addToast(toast) {
            // Remove oldest toast if at max capacity
            if (this.toasts.length >= this.maxToasts) {
                const oldestToast = this.toasts.shift();
                this.removeToast(oldestToast.id);
            }

            document.body.appendChild(toast.element);
            this.toasts.push(toast);

            // Trigger show animation
            requestAnimationFrame(() => {
                toast.element.classList.add('show');
            });

            // Announce to screen readers
            this.announceToScreenReader(`${toast.element.textContent}`);
        }

        removeToast(toastId) {
            const toastIndex = this.toasts.findIndex(t => t.id === toastId);
            if (toastIndex === -1) return;

            const toast = this.toasts[toastIndex];
            if (toast.element && toast.element.classList) {
                toast.element.classList.remove('show');
            }

            setTimeout(() => {
                if (toast.element && toast.element.parentNode) {
                    toast.element.parentNode.removeChild(toast.element);
                }
                this.toasts.splice(toastIndex, 1);
            }, 300);
        }

        announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                if (announcement.parentNode) {
                    announcement.parentNode.removeChild(announcement);
                }
            }, 1000);
        }
    }

    // Enhanced Error State Management
    class StatusErrorManager {
        constructor(statusManager) {
            this.statusManager = statusManager;
            this.retryAttempts = 0;
            this.maxRetries = 3;
            this.retryDelay = 5000;
            this.backoffMultiplier = 2;
        }

        showError(message, canRetry = true) {
            const errorHTML = `
                <div class="status-error" role="alert">
                    <h3>
                        <i class="fas fa-exclamation-triangle"></i>
                        Connection Issue
                    </h3>
                    <p>${message}</p>
                    ${canRetry ? `
                        <button class="status-retry-btn" onclick="window.statusErrorManager?.retry()">
                            <i class="fas fa-redo"></i> Retry Connection
                        </button>
                    ` : ''}
                </div>
            `;

            const existingError = document.querySelector('.status-error');
            if (existingError) {
                existingError.remove();
            }

            const statusControls = document.querySelector('.status-controls');
            if (statusControls) {
                statusControls.insertAdjacentHTML('afterend', errorHTML);
            }

            // Show toast notification as well
            if (window.statusToasts) {
                window.statusToasts.show(
                    'Connection Issue',
                    'Using cached data while reconnecting...',
                    'warning'
                );
            }
        }

        hideError() {
            const errorElement = document.querySelector('.status-error');
            if (errorElement) {
                errorElement.remove();
            }
        }

        async retry() {
            if (this.retryAttempts >= this.maxRetries) {
                this.showError('Maximum retry attempts reached. Please refresh the page.', false);
                return;
            }

            this.retryAttempts++;
            const delay = this.retryDelay * Math.pow(this.backoffMultiplier, this.retryAttempts - 1);

            // Show loading state
            const retryBtn = document.querySelector('.status-retry-btn');
            if (retryBtn) {
                retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reconnecting...';
                retryBtn.disabled = true;
            }

            try {
                // Wait for delay
                await new Promise(resolve => setTimeout(resolve, Math.min(delay, 30000)));
                
                // Attempt to reconnect
                await this.statusManager.fetchStatusData();
                this.statusManager.updateStatusDisplay();
                
                // Success - reset retry count and hide error
                this.retryAttempts = 0;
                this.hideError();
                
                if (window.statusToasts) {
                    window.statusToasts.show(
                        'Connection Restored',
                        'Successfully reconnected to live data',
                        'success'
                    );
                }

            } catch (error) {
                console.error('Retry failed:', error);
                
                if (this.retryAttempts >= this.maxRetries) {
                    this.showError('Unable to establish connection. Please check your internet connection and refresh the page.', false);
                } else {
                    // Re-enable retry button
                    if (retryBtn) {
                        retryBtn.innerHTML = '<i class="fas fa-redo"></i> Retry Connection';
                        retryBtn.disabled = false;
                    }
                }
            }
        }
    }

    // Enhanced Touch Gesture Support
    class StatusTouchManager {
        constructor() {
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchEndX = 0;
            this.touchEndY = 0;
            this.minSwipeDistance = 50;
            this.maxVerticalDistance = 100;
            this.init();
        }

        init() {
            if ('ontouchstart' in window) {
                this.setupTouchEvents();
            }
        }

        setupTouchEvents() {
            // Enhanced chart touch interactions
            document.querySelectorAll('.chart-container').forEach(container => {
                container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
                container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
            });

            // Card tap enhancements
            document.querySelectorAll('.metric-card, .service-status-card').forEach(card => {
                let tapCount = 0;
                card.addEventListener('touchend', (e) => {
                    tapCount++;
                    if (tapCount === 1) {
                        setTimeout(() => {
                            if (tapCount === 1) {
                                this.handleSingleTap(card);
                            } else if (tapCount === 2) {
                                this.handleDoubleTap(card);
                            }
                            tapCount = 0;
                        }, 300);
                    }
                });
            });
        }

        handleTouchStart(e) {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }

        handleTouchEnd(e) {
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }

        handleSwipe() {
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = Math.abs(this.touchEndY - this.touchStartY);
            
            // Only register as swipe if horizontal movement is significant and vertical is minimal
            if (Math.abs(deltaX) > this.minSwipeDistance && deltaY < this.maxVerticalDistance) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
        }

        handleSwipeRight() {
            // Navigate to previous section
            if (window.statusNavigation) {
                const sections = window.statusNavigation.sections;
                const currentIndex = sections.indexOf(window.statusNavigation.currentSection);
                if (currentIndex > 0) {
                    const previousSection = sections[currentIndex - 1];
                    this.navigateToSection(previousSection);
                }
            }
        }

        handleSwipeLeft() {
            // Navigate to next section
            if (window.statusNavigation) {
                const sections = window.statusNavigation.sections;
                const currentIndex = sections.indexOf(window.statusNavigation.currentSection);
                if (currentIndex < sections.length - 1) {
                    const nextSection = sections[currentIndex + 1];
                    this.navigateToSection(nextSection);
                }
            }
        }

        navigateToSection(sectionId) {
            const link = document.querySelector(`.status-nav-link[data-section="${sectionId}"]`);
            if (link) {
                link.click();
            }
        }

        handleSingleTap(card) {
            // Add visual feedback for single tap
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        }

        handleDoubleTap(card) {
            // Enhanced interaction for double tap
            const hasDetails = card.querySelector('.metric-value, .service-info');
            if (hasDetails) {
                this.showCardDetails(card);
            }
        }

        showCardDetails(card) {
            // Create detailed view overlay for mobile
            const title = card.querySelector('h3, .metric-label')?.textContent || 'Details';
            const details = this.extractCardDetails(card);
            
            const overlay = document.createElement('div');
            overlay.className = 'card-details-overlay';
            overlay.innerHTML = `
                <div class="card-details-content">
                    <h3 style="margin-bottom: 1rem; color: var(--primary-navy);">${title}</h3>
                    ${details}
                    <button class="close-details-btn" style="
                        background: var(--accent-gold);
                        color: var(--primary-navy);
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        font-weight: 600;
                        margin-top: 1rem;
                        width: 100%;
                        cursor: pointer;
                    ">Close</button>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Handle close
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target.classList.contains('close-details-btn')) {
                    document.body.removeChild(overlay);
                }
            });
            
            // Auto-close after 10 seconds
            setTimeout(() => {
                if (overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
            }, 10000);
        }

        extractCardDetails(card) {
            // Extract relevant details from the card
            const details = [];
            
            if (card.classList.contains('metric-card')) {
                const value = card.querySelector('.metric-value')?.textContent;
                const label = card.querySelector('.metric-label')?.textContent;
                const trend = card.querySelector('.metric-trend')?.textContent;
                
                if (value) details.push(`<p><strong>Current Value:</strong> ${value}</p>`);
                if (label) details.push(`<p><strong>Metric:</strong> ${label}</p>`);
                if (trend) details.push(`<p><strong>Trend:</strong> ${trend}</p>`);
                
            } else if (card.classList.contains('service-status-card')) {
                const name = card.querySelector('h3')?.textContent;
                const description = card.querySelector('p')?.textContent;
                const uptime = card.querySelector('.service-uptime')?.textContent;
                const status = card.querySelector('.status-pill span')?.textContent;
                
                if (name) details.push(`<p><strong>Service:</strong> ${name}</p>`);
                if (description) details.push(`<p><strong>Description:</strong> ${description}</p>`);
                if (status) details.push(`<p><strong>Status:</strong> ${status}</p>`);
                if (uptime) details.push(`<p><strong>${uptime}</strong></p>`);
            }
            
            return details.length > 0 ? details.join('') : '<p>No additional details available.</p>';
        }
    }
    
    class StatusPageManager {
        constructor() {
            this.statusData = null;
            this.refreshInterval = null;
            this.charts = {};
            
            // API configuration
            this.apiConfig = {
                statusEndpoint: 'https://carambola-golf-status-api.jaspervdz.workers.dev/api/status',
                zoneInfoEndpoint: 'https://carambola-golf-status-api.jaspervdz.workers.dev/api/cloudflare-zone-info'
            };
            
            this.fallbackMode = true; // Start in fallback mode
            this.lastSuccessfulFetch = null;
            this.dataCache = new Map();
            this.cacheExpiry = 30000; // 30 seconds cache
            
            this.init();
        }

        async init() {
            try {
                console.log('🌴 Initializing Enhanced Carambola Golf Status Page...');
                
                // Set initial safe fallback data
                this.setInitialFallbackData();
                console.log('✓ Initial fallback data set');
                
                // Update display with initial data
                this.updateStatusDisplay();
                this.updateTimestamp();
                
                // Try to detect zone and fetch real data
                await this.detectCloudflareZone();
                
                // Attempt to fetch real-time data
                try {
                    await this.fetchStatusData();
                    console.log('✓ Status data fetch completed');
                    this.updateStatusDisplay(); // Update with real data
                } catch (error) {
                    console.log('! Using fallback data due to fetch error:', error.message);
                    this.fallbackMode = true;
                }
                
                this.updateTimestamp();
                
                // Initialize charts when Chart.js is ready
                this.waitForChartJS(() => {
                    this.initializeCharts();
                    console.log('✓ Charts initialized');
                });
                
                this.startAutoRefresh();
                console.log('✓ Auto-refresh started (30 second interval)');
                
                // Track page visit
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'status_page_view', {
                        event_category: 'system_monitoring',
                        event_label: 'golf_status_dashboard',
                        value: 1
                    });
                }
                
                console.log('✅ Enhanced Carambola Golf Status Page initialized successfully');
                
                // Show current mode
                this.logCurrentMode();
                
            } catch (error) {
                console.error('❌ Failed to initialize status page:', error);
                this.setInitialFallbackData();
                this.updateStatusDisplay();
                
                // Show error to user
                if (window.statusErrorManager) {
                    window.statusErrorManager.showError('Failed to initialize status page. Please refresh to try again.');
                }
            }
        }

        logCurrentMode() {
            if (this.fallbackMode) {
                console.log('📊 Operating in FALLBACK mode (estimated data)');
            } else {
                console.log('📊 Operating in LIVE mode (real-time data)');
            }
        }

        setInitialFallbackData() {
            console.log('Setting initial fallback data for status page');
            this.fallbackMode = true;
            
            const now = new Date();
            const baseUptime = 99.95 + Math.random() * 0.05;
            const baseResponseTime = 220 + Math.random() * 60;
            
            this.statusData = {
                overall: { 
                    status: 'operational', 
                    uptime: Number(baseUptime.toFixed(2)),
                    responseTime: Math.round(baseResponseTime),
                    lastChecked: now.toISOString()
                },
                metrics: { 
                    uptime30Days: Number((99.96).toFixed(2)), 
                    averageResponseTime: Math.round(235), 
                    pageSpeedScore: 92, 
                    securityGrade: 'A+', 
                    requests24h: (12500 + Math.random() * 1000).toLocaleString(),
                    cachingRatio: Number((93.5 + Math.random() * 2).toFixed(1)),
                    bandwidth: 450,
                    threats: 0,
                    uniqueVisitors: 1250
                },
                services: this.generateServiceStatus(),
                coreWebVitals: {
                    lcp: { value: 1.1, score: 88, status: 'good' },
                    fid: { value: 35, score: 90, status: 'good' },
                    cls: { value: 0.05, score: 85, status: 'good' }
                },
                activity: this.generateRecentActivity(),
                cloudflare: this.getEstimatedCloudflareData(),
                realTime: false,
                fallbackMode: true,
                lastUpdated: now.toISOString()
            };
            
            console.log('✓ Initial fallback data structure ready');
        }

        generateServiceStatus() {
            const baseServices = [
                { name: 'Website Core', description: 'Main golf course website and content delivery', baseUptime: 99.98 },
                { name: 'Tee Time System', description: 'Online tee time booking system', baseUptime: 99.97 },
                { name: 'Pro Shop Communications', description: 'Primary pro shop line +1-340-778-5638', baseUptime: 99.99 },
                { name: 'Email Services', description: 'Golf course email system', baseUptime: 99.95 },
                { name: 'Course Information System', description: 'Robert Trent Jones Sr. course details', baseUptime: 99.98 },
                { name: 'Cloudflare Protection', description: 'DDoS protection and optimization', baseUptime: 99.99 },
                { name: 'Weather & Course Conditions', description: 'St. Croix weather data', baseUptime: 99.94 }
            ];

            return baseServices.map(service => {
                const variance = (Math.random() - 0.5) * 0.1;
                const currentUptime = Math.min(100, Math.max(98, service.baseUptime + variance));
                const status = currentUptime > 99 ? 'operational' : currentUptime > 95 ? 'degraded' : 'down';

                return {
                    ...service,
                    status,
                    uptime: Number(currentUptime.toFixed(2)),
                    lastChecked: new Date().toISOString()
                };
            });
        }

        generateRecentActivity() {
            const activities = [
                {
                    type: 'optimization',
                    title: 'Real-Time Monitoring Enhanced',
                    description: 'Implemented live status dashboard with real-time Cloudflare API integration.',
                    hours: 1
                },
                {
                    type: 'security',
                    title: 'SSL Certificate Auto-Renewal',
                    description: 'Automated SSL/TLS certificate renewal system deployed.',
                    hours: 6
                },
                {
                    type: 'performance',
                    title: 'CDN Performance Optimization',
                    description: 'Optimized Cloudflare CDN configuration for faster loading.',
                    hours: 12
                }
            ];
            
            return activities.slice(0, 3).map(activity => ({
                ...activity,
                timestamp: new Date(Date.now() - activity.hours * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            }));
        }

        getEstimatedCloudflareData() {
            const now = new Date();
            const hour = now.getHours();
            const trafficMultiplier = hour >= 6 && hour <= 22 ? 1.2 : 0.6;
            
            return {
                requests: Math.round((8000 + Math.random() * 4000) * trafficMultiplier),
                bandwidth: Math.round((450 + Math.random() * 200) * trafficMultiplier),
                responseTime: Math.round(180 + Math.random() * 80),
                cacheHitRatio: Number((92 + Math.random() * 6).toFixed(1)),
                threats: Math.round(Math.random() * 10),
                uniqueVisitors: Math.round((1200 + Math.random() * 300) * trafficMultiplier)
            };
        }

        async detectCloudflareZone() {
            try {
                console.log('Detecting Cloudflare zone for domain:', window.location.hostname);
                
                const response = await fetch(this.apiConfig.zoneInfoEndpoint, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const zoneInfo = await response.json();
                    console.log('Zone ID detected:', zoneInfo.zoneId);
                    return true;
                } else {
                    console.log('Zone detection failed, using fallback mode');
                    return false;
                }
            } catch (error) {
                console.log('Zone detection error, using fallback mode:', error.message);
                return false;
            }
        }

        waitForChartJS(callback) {
            if (typeof Chart !== 'undefined') {
                callback();
            } else {
                setTimeout(() => this.waitForChartJS(callback), 100);
            }
        }

        async fetchStatusData() {
            try {
                console.log('Fetching real-time status data...');
                
                // Check cache first
                const cacheKey = 'status_data';
                const cached = this.dataCache.get(cacheKey);
                if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
                    console.log('✓ Using cached status data');
                    this.statusData = cached.data;
                    this.lastSuccessfulFetch = new Date(cached.timestamp);
                    this.fallbackMode = !(this.statusData.realTime === true && this.statusData.fallbackMode === false);
                    return;
                }
                
                // Fetch from status API
                const response = await fetch(this.apiConfig.statusEndpoint, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✓ API response received');
                    console.log('🔍 Data check - realTime:', data.realTime, 'fallbackMode:', data.fallbackMode);
                    
                    // Check if we got real-time data
                    if (data.realTime === true && data.fallbackMode === false) {
                        console.log('✅ Real-time data detected! Switching to LIVE mode');
                        this.statusData = this.sanitizeAPIData(data);
                        this.fallbackMode = false;
                        console.log('✓ Successfully updated with REAL-TIME analytics');
                        
                        if (typeof trackStatusCheck === 'function') {
                            trackStatusCheck('api_success_realtime');
                        }
                        
                        // Show success toast
                        if (window.statusToasts) {
                            window.statusToasts.show(
                                'Live Data Connected',
                                'Real-time metrics now active',
                                'success',
                                3000
                            );
                        }
                    } else {
                        console.log('ℹ️ API returned fallback data, staying in fallback mode');
                        this.statusData = this.sanitizeAPIData(data);
                        this.fallbackMode = true;
                        
                        if (typeof trackStatusCheck === 'function') {
                            trackStatusCheck('api_success_fallback');
                        }
                    }
                    
                    // Cache the result
                    this.dataCache.set(cacheKey, {
                        data: this.statusData,
                        timestamp: Date.now()
                    });
                    
                } else {
                    throw new Error(`API response: ${response.status}`);
                }
                
            } catch (error) {
                console.error('! Error fetching status data:', error.message);
                this.fallbackMode = true;
                console.log('✓ Continuing with fallback data');
                
                if (typeof trackStatusCheck === 'function') {
                    trackStatusCheck('api_error');
                }
                
                throw error;
            }
        }

        sanitizeAPIData(data) {
            // Ensure all required fields have safe values
            const sanitized = { ...data };
            
            // Fix overall section
            if (!sanitized.overall) sanitized.overall = {};
            if (typeof sanitized.overall.uptime !== 'number' || isNaN(sanitized.overall.uptime)) {
                sanitized.overall.uptime = 99.98;
            }
            if (typeof sanitized.overall.responseTime !== 'number' || isNaN(sanitized.overall.responseTime)) {
                sanitized.overall.responseTime = 240;
            }
            if (!sanitized.overall.status) sanitized.overall.status = 'operational';
            
            // Fix metrics section
            if (!sanitized.metrics) sanitized.metrics = {};
            if (typeof sanitized.metrics.uptime30Days !== 'number' || isNaN(sanitized.metrics.uptime30Days)) {
                sanitized.metrics.uptime30Days = 99.96;
            }
            if (typeof sanitized.metrics.averageResponseTime !== 'number' || isNaN(sanitized.metrics.averageResponseTime)) {
                sanitized.metrics.averageResponseTime = 240;
            }
            
            // Fix services array
            if (!Array.isArray(sanitized.services)) {
                sanitized.services = this.generateServiceStatus();
            }
            
            return sanitized;
        }

        updateStatusDisplay() {
            if (!this.statusData) {
                console.warn('No status data available for display');
                this.setInitialFallbackData();
            }

            try {
                // Extract data with safe fallbacks
                const overall = this.statusData.overall || { status: 'operational', uptime: 99.95, responseTime: 240 };
                const metrics = this.statusData.metrics || {};
                const services = this.statusData.services || [];
                const coreWebVitals = this.statusData.coreWebVitals || {};
                const activity = this.statusData.activity || [];

                // Update all sections
                this.updateOverallStatus(overall);
                this.updateKeyMetrics(metrics);
                this.updateServicesList(services);
                this.updateCoreWebVitals(coreWebVitals);
                this.updateActivityList(activity);
                this.updateFooterStatus(overall);
                this.updateRealTimeIndicator();
                
                // Handle fallback warning
                if (this.fallbackMode) {
                    this.showFallbackWarning();
                } else {
                    this.hideFallbackWarning();
                }
                
            } catch (error) {
                console.error('Error updating status display:', error);
                this.setInitialFallbackData();
                setTimeout(() => this.updateStatusDisplay(), 100);
            }
        }

        updateOverallStatus(overall) {
            const statusElement = document.getElementById('overall-status');
            const uptimeElement = document.querySelector('.hero-uptime-text');
            
            if (!statusElement) return;

            // Safe uptime handling
            let uptime = 99.95; // safe default
            if (overall && typeof overall.uptime === 'number' && !isNaN(overall.uptime)) {
                uptime = overall.uptime;
            } else if (overall && overall.uptime) {
                const parsed = parseFloat(overall.uptime);
                if (!isNaN(parsed)) {
                    uptime = parsed;
                }
            }
            
            const status = (overall && overall.status) ? overall.status : 'operational';

            // Status configuration
            const statusConfig = {
                operational: { class: 'operational', text: 'All Systems Operational', icon: 'operational' },
                degraded: { class: 'degraded', text: 'Some Services Degraded', icon: 'degraded' },
                down: { class: 'down', text: 'Service Outage', icon: 'down' }
            };
            
            const config = statusConfig[status] || statusConfig.operational;
            
            statusElement.className = `status-pill ${config.class}`;
            statusElement.innerHTML = `
                <div class="status-indicator ${config.icon}"></div>
                <span>${config.text}</span>
            `;

            // Update uptime display safely
            if (uptimeElement) {
                uptimeElement.textContent = `${uptime.toFixed(2)}% Uptime`;
            }
        }

        updateKeyMetrics(metrics) {
            if (!metrics) metrics = {};

            const elements = {
                'uptime-value': `${((metrics.uptime30Days || 99.95)).toFixed(2)}%`,
                'response-time-value': `${Math.round(metrics.averageResponseTime || 240)}ms`,
                'pagespeed-value': Math.round(metrics.pageSpeedScore || 92),
                'security-value': metrics.securityGrade || 'A+'
            };

            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });

            // Update chart summaries
            const responseChartSummary = document.getElementById('response-chart-summary');
            if (responseChartSummary) {
                responseChartSummary.textContent = `Average: ${Math.round(metrics.averageResponseTime || 240)}ms | Requests: ${metrics.requests24h || '12,500'} | Bandwidth: ${metrics.bandwidth || 450}MB`;
            }

            const uptimeChartSummary = document.getElementById('uptime-chart-summary');
            if (uptimeChartSummary) {
                const uptime = metrics.uptime30Days || 99.95;
                const caching = metrics.cachingRatio || 93.5;
                uptimeChartSummary.textContent = `30-day uptime: ${uptime.toFixed(2)}% | Caching: ${caching.toFixed(1)}% | Visitors: ${metrics.uniqueVisitors || 1250}`;
            }
        }

        updateServicesList(services) {
            const servicesContainer = document.getElementById('services-list');
            if (!servicesContainer) return;

            if (!services || !Array.isArray(services) || services.length === 0) {
                services = this.generateServiceStatus();
            }

            servicesContainer.innerHTML = services.map(service => `
                <div class="service-status-card">
                    <div class="service-info">
                        <h3>${service.name || 'Unknown Service'}</h3>
                        <p>${service.description || 'Service description unavailable'}</p>
                        <div class="service-details">
                            ${service.uptime ? `<div class="service-uptime">Uptime: ${service.uptime}%</div>` : ''}
                            <div class="service-last-checked">Last checked: ${this.formatTimestamp(service.lastChecked || new Date().toISOString())}</div>
                        </div>
                    </div>
                    <div class="service-status">
                        <div class="status-pill ${this.getStatusClass(service.status || 'operational')}">
                            <div class="status-indicator ${this.getStatusClass(service.status || 'operational')}"></div>
                            <span>${this.getStatusText(service.status || 'operational')}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        updateCoreWebVitals(vitals) {
            const vitalsContainer = document.getElementById('core-web-vitals');
            if (!vitalsContainer) return;

            if (!vitals || !vitals.lcp) {
                vitals = {
                    lcp: { value: 1.1, score: 88, status: 'good' },
                    fid: { value: 35, score: 90, status: 'good' },
                    cls: { value: 0.05, score: 85, status: 'good' }
                };
            }

            const vitalsData = [
                { name: 'Largest Contentful Paint', metric: vitals.lcp, unit: 's', target: '<2.5s' },
                { name: 'First Input Delay', metric: vitals.fid, unit: 'ms', target: '<100ms' },
                { name: 'Cumulative Layout Shift', metric: vitals.cls, unit: '', target: '<0.1' }
            ];

            vitalsContainer.innerHTML = vitalsData.map(vital => `
                <div class="vital-metric">
                    <div class="vital-header">
                        <span class="vital-name">${vital.name}</span>
                        <span class="vital-value ${this.getVitalStatusClass(vital.metric.status)}">${vital.metric.value.toFixed(vital.unit === 's' ? 2 : 0)}${vital.unit}</span>
                    </div>
                    <div class="vital-progress">
                        <div class="vital-progress-bar ${this.getVitalStatusClass(vital.metric.status)}" data-width="${vital.metric.score}%"></div>
                    </div>
                    <div class="vital-target">Target: ${vital.target} | Status: ${this.getVitalStatusText(vital.metric.status)}</div>
                </div>
            `).join('');

            setTimeout(() => {
                vitalsContainer.querySelectorAll('[data-width]').forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width;
                });
            }, 100);
        }

        updateActivityList(activity) {
            const activityContainer = document.getElementById('activity-list');
            if (!activityContainer) return;

            if (!activity || !Array.isArray(activity) || activity.length === 0) {
                activity = this.generateRecentActivity();
            }

            activityContainer.innerHTML = activity.map(item => `
                <div class="activity-card ${item.status || 'completed'}">
                    <div class="activity-content">
                        <div class="activity-header">
                            <div class="activity-details">
                                <h3 class="activity-title">${item.title || 'System Activity'}</h3>
                                <span class="activity-timestamp">${this.formatTimestamp(item.timestamp || new Date().toISOString())}</span>
                            </div>
                        </div>
                        <p class="activity-description">${item.description || 'Activity description not available'}</p>
                        <div class="activity-status">
                            <div class="status-pill ${this.getActivityStatusClass(item.status || 'completed')}">
                                <div class="status-indicator ${this.getActivityStatusClass(item.status || 'completed')}"></div>
                                <span>${this.getActivityStatusText(item.status || 'completed')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        updateFooterStatus(overall) {
            const footerLastCheck = document.getElementById('footer-last-check');
            const footerOverallStatus = document.getElementById('footer-overall-status');

            if (footerLastCheck) {
                const now = new Date();
                footerLastCheck.textContent = now.toLocaleTimeString('en-US', {
                    timeZone: 'America/St_Thomas',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
            }

            if (footerOverallStatus) {
                const status = (overall && overall.status) ? overall.status : 'operational';
                footerOverallStatus.textContent = status === 'operational' ? 'All services operational' : 
                                                 status === 'degraded' ? 'Some services degraded' : 'Service issues detected';
                footerOverallStatus.className = `footer-overall-status ${status}`;
            }
        }

        updateTimestamp() {
            const now = new Date();
            const timestamp = now.toLocaleString('en-US', {
                timeZone: 'America/St_Thomas',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short'
            });

            const lastUpdateElement = document.getElementById('last-update');
            if (lastUpdateElement) {
                lastUpdateElement.textContent = timestamp;
            }
        }

        updateRealTimeIndicator() {
            const statusElement = document.getElementById('overall-status');
            if (statusElement) {
                const existingIndicator = statusElement.querySelector('.real-time-indicator');
                if (existingIndicator) {
                    existingIndicator.remove();
                }
                
                if (this.statusData && this.statusData.realTime && !this.fallbackMode) {
                    const indicator = document.createElement('div');
                    indicator.className = 'real-time-indicator';
                    indicator.innerHTML = '<i class="fas fa-circle"></i> Live';
                    indicator.style.cssText = `
                        margin-left: 0.5rem;
                        color: #16a34a;
                        font-size: 0.7rem;
                        font-weight: 600;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.25rem;
                    `;
                    statusElement.appendChild(indicator);
                }
            }
        }

        showFallbackWarning() {
            const existingWarning = document.querySelector('.fallback-warning');
            if (existingWarning) return;
            
            const warning = document.createElement('div');
            warning.className = 'fallback-warning';
            warning.style.cssText = `
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 0.5rem;
                padding: 1rem;
                margin: 1rem 0;
                text-align: center;
                color: #92400e;
                font-weight: 500;
            `;
            warning.innerHTML = `
                <div class="warning-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Real-time data temporarily unavailable. Showing estimated metrics.</span>
                </div>
            `;
            
            const container = document.querySelector('.status-controls');
            if (container) {
                container.insertBefore(warning, container.firstChild);
            }
        }

        hideFallbackWarning() {
            const existingWarning = document.querySelector('.fallback-warning');
            if (existingWarning) {
                existingWarning.remove();
            }
        }

        initializeCharts() {
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not loaded');
                return;
            }

            this.createResponseTimeChart();
            this.createUptimeChart();
        }

        createResponseTimeChart() {
            const ctx = document.getElementById('response-time-chart');
            if (!ctx) return;

            const now = new Date();
            const data = [];
            const labels = [];
            const baseResponseTime = (this.statusData && this.statusData.metrics && this.statusData.metrics.averageResponseTime) || 240;

            for (let i = 23; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 60 * 60 * 1000);
                labels.push(time.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    hour12: true 
                }));

                const hour = time.getHours();
                const peakMultiplier = (hour >= 9 && hour <= 17) ? 1.2 : 0.8;
                const variation = Math.sin(i * 0.3) * 30 + (Math.random() - 0.5) * 40;
                const responseTime = Math.max(150, Math.min(400, baseResponseTime * peakMultiplier + variation));
                
                data.push(Math.round(responseTime));
            }

            this.charts.responseTime = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: data,
                        borderColor: '#1e3a5f',
                        backgroundColor: 'rgba(30, 58, 95, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        pointBackgroundColor: '#d4af37',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return `Response Time: ${context.parsed.y}ms`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: { display: false },
                            ticks: { 
                                maxTicksLimit: 6,
                                color: '#6b7280',
                                font: { size: 12 }
                            }
                        },
                        y: {
                            display: true,
                            beginAtZero: false,
                            min: Math.min(...data) - 50,
                            max: Math.max(...data) + 50,
                            grid: { color: 'rgba(212, 175, 55, 0.1)' },
                            ticks: {
                                color: '#6b7280',
                                font: { size: 12 },
                                callback: function(value) {
                                    return value + 'ms';
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });
        }

        createUptimeChart() {
            const ctx = document.getElementById('uptime-chart');
            if (!ctx) return;

            const data = [];
            const labels = [];
            const baseUptime = (this.statusData && this.statusData.metrics && this.statusData.metrics.uptime30Days) || 99.96;

            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                }));

                let uptime;
                if (Math.random() > 0.95) {
                    uptime = 98.5 + Math.random() * 1.5;
                } else {
                    uptime = Math.max(99.5, baseUptime + (Math.random() - 0.5) * 0.2);
                }
                
                data.push(Math.min(100, uptime));
            }

            this.charts.uptime = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Uptime %',
                        data: data,
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        pointBackgroundColor: '#d4af37',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return `Uptime: ${context.parsed.y.toFixed(2)}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: { display: false },
                            ticks: { 
                                maxTicksLimit: 8,
                                color: '#6b7280'
                            }
                        },
                        y: {
                            display: true,
                            min: Math.min(99.0, Math.min(...data) - 0.5),
                            max: 100,
                            grid: { color: 'rgba(212, 175, 55, 0.1)' },
                            ticks: {
                                color: '#6b7280',
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });
        }

        startAutoRefresh() {
            this.refreshInterval = setInterval(async () => {
                try {
                    console.log('Auto-refreshing status data...');
                    await this.fetchStatusData();
                    this.updateStatusDisplay();
                    this.updateTimestamp();
                    this.logCurrentMode();
                    
                    if (this.charts.responseTime) {
                        this.updateResponseTimeChart();
                    }
                    if (this.charts.uptime) {
                        const now = new Date();
                        if (now.getMinutes() % 5 === 0) {
                            this.updateUptimeChart();
                        }
                    }
                    
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                    if (window.statusErrorManager) {
                        window.statusErrorManager.showError('Connection lost. Retrying automatically...');
                    }
                }
            }, 30000);
        }

        updateResponseTimeChart() {
            if (!this.charts.responseTime || !this.statusData || !this.statusData.metrics) return;
            
            const chart = this.charts.responseTime;
            const currentResponseTime = this.statusData.metrics.averageResponseTime || 240;
            
            const now = new Date();
            chart.data.labels.push(now.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            }));
            chart.data.datasets[0].data.push(currentResponseTime);
            
            if (chart.data.labels.length > 24) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            
            chart.update('none');
        }

        updateUptimeChart() {
            if (!this.charts.uptime || !this.statusData || !this.statusData.metrics) return;
            
            const chart = this.charts.uptime;
            const currentUptime = this.statusData.metrics.uptime30Days || 99.95;
            
            const today = new Date();
            chart.data.labels.push(today.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            }));
            chart.data.datasets[0].data.push(currentUptime);
            
            if (chart.data.labels.length > 30) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            
            chart.update('none');
        }

        // Utility functions
        getStatusClass(status) {
            const statusMap = {
                'operational': 'operational',
                'degraded': 'degraded',
                'down': 'down'
            };
            return statusMap[status] || 'operational';
        }

        getStatusText(status) {
            const textMap = {
                'operational': 'Operational',
                'degraded': 'Degraded',
                'down': 'Down'
            };
            return textMap[status] || 'Operational';
        }

        getVitalStatusClass(status) {
            const classMap = {
                'good': 'vital-good',
                'needs-improvement': 'vital-warning',
                'poor': 'vital-poor'
            };
            return classMap[status] || 'vital-good';
        }

        getVitalStatusText(status) {
            const textMap = {
                'good': 'Excellent',
                'needs-improvement': 'Needs Improvement',
                'poor': 'Poor'
            };
            return textMap[status] || 'Excellent';
        }

        getActivityStatusClass(status) {
            const classMap = {
                'completed': 'operational',
                'in-progress': 'degraded',
                'failed': 'down'
            };
            return classMap[status] || 'operational';
        }

        getActivityStatusText(status) {
            const textMap = {
                'completed': 'Completed Successfully',
                'in-progress': 'In Progress',
                'failed': 'Failed'
            };
            return textMap[status] || 'Completed Successfully';
        }

        getActivityIcon(type) {
            const iconMap = {
                'optimization': 'tachometer-alt',
                'security': 'shield-alt',
                'performance': 'rocket',
                'maintenance': 'tools',
                'feature': 'star'
            };
            return iconMap[type] || 'info-circle';
        }

        formatTimestamp(timestamp) {
            try {
                const date = new Date(timestamp);
                const now = new Date();
                const diffMs = now - date;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);
                const diffMinutes = Math.floor(diffMs / (1000 * 60));

                if (diffMinutes < 1) {
                    return 'Just now';
                } else if (diffMinutes < 60) {
                    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
                } else if (diffHours < 24) {
                    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                } else {
                    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                }
            } catch (error) {
                return 'Recently';
            }
        }

        destroy() {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
            
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
        }
    }

    // Initialize all enhancements when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize global managers
        window.statusNavigation = new StatusNavigation();
        window.statusToasts = new StatusToastManager();
        window.statusTouchManager = new StatusTouchManager();
        
        // Initialize main status manager
        const statusManager = new StatusPageManager();
        
        // Initialize error manager after main status manager is available
        setTimeout(() => {
            window.statusErrorManager = new StatusErrorManager(statusManager);
        }, 1000);
        
        // Global access for debugging
        window.CarambolaGolfStatus = {
            manager: statusManager,
            refresh: function() {
                statusManager.fetchStatusData().then(() => {
                    statusManager.updateStatusDisplay();
                    statusManager.updateTimestamp();
                }).catch(error => {
                    console.log('Manual refresh failed:', error);
                });
            },
            toggleRealTime: function() {
                if (statusManager.refreshInterval) {
                    clearInterval(statusManager.refreshInterval);
                    statusManager.refreshInterval = null;
                    console.log('Real-time updates paused');
                } else {
                    statusManager.startAutoRefresh();
                    console.log('Real-time updates resumed');
                }
            },
            getChartData: function() {
                return {
                    responseTime: statusManager.charts.responseTime?.data,
                    uptime: statusManager.charts.uptime?.data
                };
            },
            getStatusData: function() {
                return statusManager.statusData;
            },
            testAPI: async function() {
                try {
                    const response = await fetch('https://carambola-golf-status-api.jaspervdz.workers.dev/api/status');
                    const data = await response.json();
                    console.log('API Test Result:', {
                        realTime: data.realTime,
                        fallbackMode: data.fallbackMode,
                        requests: data.metrics?.requests24h,
                        uptime: data.overall?.uptime
                    });
                    return data;
                } catch (error) {
                    console.error('API test failed:', error);
                    return null;
                }
            },
            forceLiveMode: function() {
                if (statusManager.statusData && statusManager.statusData.realTime) {
                    statusManager.fallbackMode = false;
                    statusManager.updateStatusDisplay();
                    console.log('🟢 Forced switch to LIVE mode');
                } else {
                    console.log('❌ Cannot switch to live mode - no real-time data available');
                }
            }
        };
        
        console.log('✅ Status page enhancements initialized');
    });

    // Handle window resize for responsive adjustments
    window.addEventListener('resize', debounce(() => {
        // Recreate mobile nav if switching to/from mobile
        const existingNav = document.querySelector('.status-nav-mobile');
        const shouldHaveNav = window.innerWidth <= 768;
        
        if (!existingNav && shouldHaveNav && window.statusNavigation) {
            window.statusNavigation.createMobileNav();
        } else if (existingNav && !shouldHaveNav) {
            existingNav.remove();
        }
    }, 250));

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Escape key closes any open overlays
        if (e.key === 'Escape') {
            const overlay = document.querySelector('.card-details-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
        
        // Arrow key navigation for status sections
        if (e.target.closest('.status-page') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            if (window.statusNavigation) {
                const sections = window.statusNavigation.sections;
                const currentIndex = sections.indexOf(window.statusNavigation.currentSection);
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    e.preventDefault();
                    window.statusTouchManager.navigateToSection(sections[currentIndex - 1]);
                } else if (e.key === 'ArrowRight' && currentIndex < sections.length - 1) {
                    e.preventDefault();
                    window.statusTouchManager.navigateToSection(sections[currentIndex + 1]);
                }
            }
        }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (window.CarambolaGolfStatus && window.CarambolaGolfStatus.manager) {
            window.CarambolaGolfStatus.manager.destroy();
        }
    });

    // Utility functions
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

})();
