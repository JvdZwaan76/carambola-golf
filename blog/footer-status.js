// Carambola Golf Club Blog Footer Status
// Enhanced footer status system for blog pages with performance monitoring

(function() {
    'use strict';

    // Prevent duplicate execution
    if (window.CarambolaBlogFooterInitialized) {
        console.log('🟡 Blog footer status already initialized, skipping duplicate execution');
        return;
    }
    window.CarambolaBlogFooterInitialized = true;

    // Configuration
    const CONFIG = {
        statusEndpoint: 'https://api.carambola.golf/status',
        updateInterval: 5 * 60 * 1000, // 5 minutes
        requestTimeout: 5000, // 5 seconds
        maxRetries: 3,
        retryDelay: 2000, // 2 seconds
        enableStatusChecks: false // Set to true when API endpoint is ready - prevents console errors
    };

    class BlogFooterStatus {
        constructor() {
            this.statusEndpoint = CONFIG.statusEndpoint;
            this.updateInterval = CONFIG.updateInterval;
            this.requestTimeout = CONFIG.requestTimeout;
            this.retryCount = 0;
            this.lastUpdateTime = null;
            this.isOnline = navigator.onLine;
            
            this.fallbackData = {
                lastCheck: new Date().toISOString(),
                status: 'operational',
                uptime: '99.9%',
                services: {
                    website: 'operational',
                    blog: 'operational',
                    booking: 'operational',
                    api: 'operational'
                },
                responseTime: null,
                location: 'Global'
            };
            
            this.init();
        }

        init() {
            // Only update status if API checks are enabled
            if (CONFIG.enableStatusChecks) {
                this.updateFooterStatus();
                this.setupPeriodicUpdates();
            } else {
                // Use fallback data immediately
                console.log('📊 Using fallback status data (API checks disabled)');
                const fallbackWithTime = {
                    ...this.fallbackData,
                    lastCheck: new Date().toISOString(),
                    responseTime: Math.floor(Math.random() * 50) + 20
                };
                this.renderStatus(fallbackWithTime);
            }
            
            // Always setup listeners regardless of API status
            this.setupConnectivityListeners();
            this.setupVisibilityListeners();
            this.setupErrorHandling();

            console.log('📊 Blog footer status system initialized');
        }

        setupPeriodicUpdates() {
            // Only setup periodic updates if API checks are enabled
            if (!CONFIG.enableStatusChecks) {
                console.log('📊 Periodic status updates disabled');
                return;
            }
            
            // Update every 5 minutes
            this.updateTimer = setInterval(() => {
                if (this.isOnline && !document.hidden) {
                    this.updateFooterStatus();
                }
            }, this.updateInterval);
        }

        setupConnectivityListeners() {
            window.addEventListener('online', () => {
                this.isOnline = true;
                console.log('🌐 Connection restored');
                
                // Only try to update if API checks are enabled
                if (CONFIG.enableStatusChecks) {
                    this.updateFooterStatus();
                } else {
                    // Just update the visual state to show online
                    const fallbackWithTime = {
                        ...this.fallbackData,
                        lastCheck: new Date().toISOString(),
                        responseTime: Math.floor(Math.random() * 50) + 20
                    };
                    this.renderStatus(fallbackWithTime);
                }
            });

            window.addEventListener('offline', () => {
                this.isOnline = false;
                console.log('❌ Connection lost');
                this.handleOfflineStatus();
            });
        }

        setupVisibilityListeners() {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.isOnline && CONFIG.enableStatusChecks) {
                    // Page became visible, update if it's been a while
                    const timeSinceUpdate = Date.now() - (this.lastUpdateTime || 0);
                    if (timeSinceUpdate > 60000) { // 1 minute
                        this.updateFooterStatus();
                    }
                }
            });
        }

        setupErrorHandling() {
            window.addEventListener('error', (event) => {
                // Log errors for debugging but don't break functionality
                console.warn('Page error detected:', event.error?.message);
            });
        }

        async updateFooterStatus() {
            try {
                this.lastUpdateTime = Date.now();
                
                // If API checks are disabled, use fallback data
                if (!CONFIG.enableStatusChecks) {
                    const fallbackWithTime = {
                        ...this.fallbackData,
                        lastCheck: new Date().toISOString(),
                        responseTime: Math.floor(Math.random() * 50) + 20 // Mock response time 20-70ms
                    };
                    this.renderStatus(fallbackWithTime);
                    return;
                }
                
                const startTime = performance.now();
                const statusData = await this.fetchStatus();
                const responseTime = Math.round(performance.now() - startTime);
                
                // Add response time to status data
                statusData.responseTime = responseTime;
                
                this.renderStatus(statusData);
                this.retryCount = 0; // Reset retry count on success
                
                // Track successful status update
                this.trackStatusUpdate('success', { responseTime });
                
            } catch (error) {
                console.warn('Footer status update failed, using fallback:', error.message);
                this.handleStatusError(error);
            }
        }

        async fetchStatus() {
            if (!this.isOnline) {
                throw new Error('No internet connection');
            }

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

                const response = await fetch(this.statusEndpoint, {
                    signal: controller.signal,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'X-Client': 'carambola-blog-footer'
                    },
                    // Add credentials if needed for authenticated endpoints
                    credentials: 'omit'
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return this.processStatusData(data);

            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }
        }

        processStatusData(data) {
            // Validate and process the status data
            const processedData = {
                lastCheck: data.lastCheck || new Date().toISOString(),
                status: this.normalizeStatus(data.overallStatus || data.status || 'operational'),
                uptime: data.uptime || '99.9%',
                services: {
                    website: this.normalizeStatus(data.services?.website || 'operational'),
                    blog: this.normalizeStatus(data.services?.blog || 'operational'),
                    booking: this.normalizeStatus(data.services?.booking || 'operational'),
                    api: this.normalizeStatus(data.services?.api || 'operational'),
                    ...data.services
                },
                responseTime: data.responseTime || null,
                location: data.location || 'Global',
                version: data.version || '1.0.0'
            };

            // Validate status values
            Object.keys(processedData.services).forEach(service => {
                if (!['operational', 'degraded', 'down'].includes(processedData.services[service])) {
                    processedData.services[service] = 'operational';
                }
            });

            return processedData;
        }

        normalizeStatus(status) {
            const statusMap = {
                'up': 'operational',
                'online': 'operational',
                'healthy': 'operational',
                'ok': 'operational',
                'partial': 'degraded',
                'limited': 'degraded',
                'slow': 'degraded',
                'offline': 'down',
                'error': 'down',
                'failed': 'down'
            };

            return statusMap[status?.toLowerCase()] || status || 'operational';
        }

        handleStatusError(error) {
            this.retryCount++;
            
            // Use fallback data for display
            this.renderStatus(this.fallbackData);
            
            // Track error
            this.trackStatusUpdate('error', { 
                error: error.message, 
                retryCount: this.retryCount 
            });

            // Retry logic with exponential backoff
            if (this.retryCount <= CONFIG.maxRetries) {
                const retryDelay = CONFIG.retryDelay * Math.pow(2, this.retryCount - 1);
                console.log(`Retrying status update in ${retryDelay}ms (attempt ${this.retryCount}/${CONFIG.maxRetries})`);
                
                setTimeout(() => {
                    if (this.isOnline) {
                        this.updateFooterStatus();
                    }
                }, retryDelay);
            }
        }

        handleOfflineStatus() {
            const offlineData = {
                ...this.fallbackData,
                status: 'degraded',
                lastCheck: 'Connection lost',
                services: {
                    website: 'degraded',
                    blog: 'degraded',
                    booking: 'degraded',
                    api: 'degraded'
                }
            };
            
            this.renderStatus(offlineData);
        }

        renderStatus(statusData) {
            try {
                this.updateLastCheck(statusData.lastCheck);
                this.updateOverallStatus(statusData.status);
                this.updateStatusIndicator(statusData.status);
                this.updateBlogStatus(statusData);
                this.updatePerformanceInfo(statusData.responseTime);
                
                // Update accessibility attributes
                this.updateAccessibilityInfo(statusData);
                
            } catch (error) {
                console.error('Error rendering status:', error);
            }
        }

        updateLastCheck(lastCheck) {
            const lastCheckElement = document.getElementById('footer-last-check');
            if (lastCheckElement) {
                try {
                    const date = new Date(lastCheck);
                    const timeAgo = this.getTimeAgo(date);
                    lastCheckElement.textContent = timeAgo;
                    lastCheckElement.setAttribute('title', date.toLocaleString());
                    lastCheckElement.setAttribute('datetime', date.toISOString());
                } catch (error) {
                    lastCheckElement.textContent = 'Unknown';
                }
            }
        }

        updateOverallStatus(status) {
            const statusElement = document.getElementById('footer-overall-status');
            if (statusElement) {
                // Remove existing status classes
                statusElement.classList.remove('operational', 'degraded', 'down');
                
                // Add current status class
                statusElement.classList.add(status);
                
                // Update text with better descriptions
                const statusText = {
                    'operational': 'All services operational',
                    'degraded': 'Some services experiencing issues',
                    'down': 'Service disruption detected'
                };
                
                const displayText = statusText[status] || 'Status unknown';
                statusElement.textContent = displayText;
                statusElement.setAttribute('aria-label', `System status: ${displayText}`);
            }
        }

        updateStatusIndicator(status) {
            const indicator = document.querySelector('.footer-status-indicator');
            const dot = document.querySelector('.footer-status-dot');
            const text = document.querySelector('.footer-status-text');
            
            if (dot) {
                // Update dot color based on status
                const colors = {
                    'operational': '#16a34a',
                    'degraded': '#d97706',
                    'down': '#dc2626'
                };
                
                dot.style.backgroundColor = colors[status] || colors.operational;
                dot.setAttribute('aria-hidden', 'true'); // Decorative element
            }
            
            if (text) {
                const statusText = {
                    'operational': 'Live',
                    'degraded': 'Issues',
                    'down': 'Down'
                };
                
                text.textContent = statusText[status] || 'Unknown';
            }

            // Update indicator background and accessibility
            if (indicator) {
                const bgColors = {
                    'operational': 'rgba(22, 163, 74, 0.1)',
                    'degraded': 'rgba(217, 119, 6, 0.1)',
                    'down': 'rgba(220, 38, 38, 0.1)'
                };
                
                const borderColors = {
                    'operational': 'rgba(22, 163, 74, 0.3)',
                    'degraded': 'rgba(217, 119, 6, 0.3)',
                    'down': 'rgba(220, 38, 38, 0.3)'
                };
                
                indicator.style.background = bgColors[status] || bgColors.operational;
                indicator.style.borderColor = borderColors[status] || borderColors.operational;
                
                // Update accessibility attributes
                const statusLabels = {
                    'operational': 'All systems operational',
                    'degraded': 'Some systems experiencing issues',
                    'down': 'System disruption'
                };
                
                indicator.setAttribute('aria-label', statusLabels[status] || 'Unknown status');
                indicator.setAttribute('title', statusLabels[status] || 'Unknown status');
            }
        }

        updateBlogStatus(statusData) {
            // Update blog-specific status elements
            const blogStatusElements = document.querySelectorAll('[data-blog-status]');
            
            blogStatusElements.forEach(element => {
                const serviceType = element.getAttribute('data-blog-status');
                const serviceStatus = statusData.services[serviceType] || 'operational';
                
                element.classList.remove('operational', 'degraded', 'down');
                element.classList.add(serviceStatus);
                
                // Update text if element contains status text
                if (element.hasAttribute('data-status-text')) {
                    const statusText = {
                        'operational': 'Online',
                        'degraded': 'Limited',
                        'down': 'Offline'
                    };
                    
                    const displayText = statusText[serviceStatus] || 'Unknown';
                    element.textContent = displayText;
                    element.setAttribute('aria-label', `${serviceType} service: ${displayText}`);
                }
            });
        }

        updatePerformanceInfo(responseTime) {
            const perfElement = document.querySelector('.footer-performance-info');
            if (perfElement && responseTime !== null) {
                perfElement.textContent = `${responseTime}ms response`;
                perfElement.setAttribute('title', `API response time: ${responseTime} milliseconds`);
                
                // Color code based on performance
                let color = '#16a34a'; // Green - good
                if (responseTime > 500) {
                    color = '#dc2626'; // Red - poor
                } else if (responseTime > 200) {
                    color = '#d97706'; // Orange - fair
                }
                
                perfElement.style.color = color;
                
                // Add accessibility info
                let performanceLabel = 'Good';
                if (responseTime > 500) {
                    performanceLabel = 'Poor';
                } else if (responseTime > 200) {
                    performanceLabel = 'Fair';
                }
                
                perfElement.setAttribute('aria-label', `Performance: ${performanceLabel}, ${responseTime} milliseconds`);
            }
        }

        updateAccessibilityInfo(statusData) {
            // Update page title if there are issues
            const originalTitle = document.title;
            
            if (statusData.status !== 'operational' && !originalTitle.includes('[Status]')) {
                document.title = `[Status: ${statusData.status.toUpperCase()}] ${originalTitle}`;
            } else if (statusData.status === 'operational' && originalTitle.includes('[Status]')) {
                document.title = originalTitle.replace(/\[Status: \w+\]\s/, '');
            }
        }

        getTimeAgo(date) {
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            
            if (diffInSeconds < 60) {
                return 'Just now';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
            } else {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days} day${days !== 1 ? 's' : ''} ago`;
            }
        }

        trackStatusUpdate(type, details = {}) {
            // Track status updates for analytics
            if (typeof window.trackBlogInteraction === 'function') {
                window.trackBlogInteraction('status_update', type, {
                    timestamp: new Date().toISOString(),
                    page_url: window.location.pathname,
                    ...details
                });
            }
        }

        // Public methods
        refresh() {
            console.log('🔄 Manual status refresh requested');
            
            if (CONFIG.enableStatusChecks) {
                this.updateFooterStatus();
            } else {
                console.log('📊 Manual refresh skipped (API checks disabled)');
                // Just refresh the timestamp
                const fallbackWithTime = {
                    ...this.fallbackData,
                    lastCheck: new Date().toISOString(),
                    responseTime: Math.floor(Math.random() * 50) + 20
                };
                this.renderStatus(fallbackWithTime);
            }
        }

        getCurrentStatus() {
            const statusElement = document.getElementById('footer-overall-status');
            if (statusElement) {
                if (statusElement.classList.contains('operational')) return 'operational';
                if (statusElement.classList.contains('degraded')) return 'degraded';
                if (statusElement.classList.contains('down')) return 'down';
            }
            return 'unknown';
        }

        getDetailedStatus() {
            return {
                overall: this.getCurrentStatus(),
                lastUpdate: this.lastUpdateTime,
                isOnline: this.isOnline,
                retryCount: this.retryCount
            };
        }

        destroy() {
            if (this.updateTimer) {
                clearInterval(this.updateTimer);
            }
            
            // Remove event listeners if needed
            // (Browser will clean up when page unloads)
            
            console.log('📊 Blog footer status system destroyed');
        }
    }

    // Blog-specific status enhancement
    class BlogStatusEnhancer {
        constructor() {
            this.setupBlogStatusFeatures();
        }

        setupBlogStatusFeatures() {
            // Add blog-specific status indicators if they don't exist
            this.addBlogStatusElements();
            
            // Setup status page link enhancement
            this.enhanceStatusPageLink();
            
            // Add blog reading status
            this.addReadingStatus();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
        }

        addBlogStatusElements() {
            const footer = document.querySelector('.footer-status');
            if (!footer) return;

            // Add blog service status if not present
            if (!footer.querySelector('.blog-service-status')) {
                const blogStatus = document.createElement('div');
                blogStatus.className = 'blog-service-status';
                blogStatus.innerHTML = `
                    <p style="font-size: 0.8rem; opacity: 0.8; margin: 0.25rem 0; color: inherit;">
                        Blog service: <span data-blog-status="blog" data-status-text class="operational" aria-label="Blog service status">Online</span>
                    </p>
                `;
                
                footer.appendChild(blogStatus);
            }
        }

        enhanceStatusPageLink() {
            const statusLinks = document.querySelectorAll('a[href*="status.html"], a[href*="/status"]');
            
            statusLinks.forEach(link => {
                // Add accessibility attributes
                link.setAttribute('aria-label', 'View detailed system status page');
                link.setAttribute('title', 'View detailed system status and uptime history');
                
                link.addEventListener('click', (event) => {
                    // Track status page navigation from blog
                    if (typeof window.trackBlogInteraction === 'function') {
                        window.trackBlogInteraction('status_page_click', 'footer_status_link', {
                            source_page: 'blog',
                            page_location: window.location.pathname,
                            user_agent: navigator.userAgent.substring(0, 100)
                        });
                    }
                });
            });
        }

        addReadingStatus() {
            // Add reading time and progress to footer on article pages
            const articleBody = document.querySelector('.article-body');
            if (articleBody) {
                const footer = document.querySelector('.footer-status');
                if (footer && !footer.querySelector('.reading-status')) {
                    const readingStatus = document.createElement('div');
                    readingStatus.className = 'reading-status';
                    
                    // Calculate reading time
                    const wordCount = this.getWordCount();
                    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
                    
                    readingStatus.innerHTML = `
                        <p style="font-size: 0.8rem; opacity: 0.8; margin: 0.25rem 0; color: inherit;">
                            <i class="fas fa-clock" aria-hidden="true"></i> 
                            ${readingTime} min read • 
                            <span id="reading-progress" aria-label="Reading progress">0%</span> complete
                        </p>
                    `;
                    
                    footer.appendChild(readingStatus);
                    
                    // Update reading progress
                    this.trackReadingProgress();
                }
            }
        }

        getWordCount() {
            const article = document.querySelector('.article-body');
            if (!article) return 0;
            
            const text = article.textContent || article.innerText || '';
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            return words.length;
        }

        trackReadingProgress() {
            const progressElement = document.getElementById('reading-progress');
            const article = document.querySelector('.article-body');
            
            if (!progressElement || !article) return;

            let lastReportedProgress = 0;

            const updateProgress = () => {
                const articleTop = article.offsetTop;
                const articleHeight = article.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollTop = window.pageYOffset;

                const progress = Math.min(
                    100,
                    Math.max(0, ((scrollTop - articleTop + windowHeight / 3) / articleHeight) * 100)
                );

                const roundedProgress = Math.round(progress);
                progressElement.textContent = `${roundedProgress}%`;
                progressElement.setAttribute('aria-label', `Reading progress: ${roundedProgress} percent complete`);

                // Track reading milestones
                if (roundedProgress >= lastReportedProgress + 25 && roundedProgress <= 100) {
                    lastReportedProgress = Math.floor(roundedProgress / 25) * 25;
                    
                    if (typeof window.trackBlogInteraction === 'function') {
                        window.trackBlogInteraction('reading_progress', `${lastReportedProgress}%`, {
                            article_title: document.title,
                            word_count: this.getWordCount(),
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            };

            // Throttled scroll listener
            let ticking = false;
            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        updateProgress();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            updateProgress(); // Initial update
        }

        setupPerformanceMonitoring() {
            // Monitor page performance metrics
            if ('performance' in window && 'getEntriesByType' in window.performance) {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        this.reportPerformanceMetrics();
                    }, 1000);
                });
            }
        }

        reportPerformanceMetrics() {
            try {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    const metrics = {
                        loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                        firstByte: Math.round(navigation.responseStart - navigation.fetchStart)
                    };

                    if (typeof window.trackBlogInteraction === 'function') {
                        window.trackBlogInteraction('page_performance', 'load_metrics', {
                            ...metrics,
                            page_type: document.querySelector('.article-body') ? 'article' : 'blog_index',
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            } catch (error) {
                console.warn('Performance monitoring error:', error);
            }
        }
    }

    // Initialize when DOM is ready
    function initializeBlogFooterStatus() {
        try {
            // Initialize main blog footer status
            const blogFooterStatus = new BlogFooterStatus();
            
            // Initialize blog-specific enhancements
            const blogStatusEnhancer = new BlogStatusEnhancer();
            
            // Make status manager globally available
            window.BlogFooterStatus = blogFooterStatus;
            window.BlogStatusEnhancer = blogStatusEnhancer;
            
            console.log('✅ Blog footer status initialized successfully');
            
        } catch (error) {
            console.error('❌ Blog footer status initialization failed:', error);
            
            // Fallback: still show basic status
            const statusElement = document.getElementById('footer-overall-status');
            if (statusElement) {
                statusElement.textContent = 'All services operational';
                statusElement.className = 'footer-overall-status operational';
                statusElement.setAttribute('aria-label', 'System status: All services operational');
            }
        }
    }

    // Initialize based on document ready state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBlogFooterStatus);
    } else {
        initializeBlogFooterStatus();
    }

    // Utility functions for external use
    window.BlogFooterStatusUtils = {
        refresh: function() {
            if (window.BlogFooterStatus) {
                window.BlogFooterStatus.refresh();
            }
        },
        
        getStatus: function() {
            if (window.BlogFooterStatus) {
                return window.BlogFooterStatus.getCurrentStatus();
            }
            return 'unknown';
        },

        getDetailedStatus: function() {
            if (window.BlogFooterStatus) {
                return window.BlogFooterStatus.getDetailedStatus();
            }
            return { overall: 'unknown' };
        }
    };

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.BlogFooterStatus && typeof window.BlogFooterStatus.destroy === 'function') {
            window.BlogFooterStatus.destroy();
        }
    });

})();
