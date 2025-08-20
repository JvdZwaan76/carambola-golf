// Carambola Golf Club Blog Footer Status
// Enhanced footer status for blog pages

(function() {
    'use strict';

    // Prevent duplicate execution
    if (window.CarambolaBlogFooterInitialized) {
        return;
    }
    window.CarambolaBlogFooterInitialized = true;

    class BlogFooterStatus {
        constructor() {
            this.statusEndpoint = 'https://api.carambola.golf/status';
            this.fallbackData = {
                lastCheck: new Date().toISOString(),
                status: 'operational',
                uptime: '99.9%',
                services: {
                    website: 'operational',
                    blog: 'operational',
                    booking: 'operational'
                }
            };
            this.init();
        }

        init() {
            this.updateFooterStatus();
            
            // Update every 5 minutes
            setInterval(() => {
                this.updateFooterStatus();
            }, 5 * 60 * 1000);

            // Update immediately if page becomes visible
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.updateFooterStatus();
                }
            });

            console.log('📊 Blog footer status initialized');
        }

        async updateFooterStatus() {
            try {
                const statusData = await this.fetchStatus();
                this.renderStatus(statusData);
            } catch (error) {
                console.warn('Footer status update failed, using fallback:', error);
                this.renderStatus(this.fallbackData);
            }
        }

        async fetchStatus() {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(this.statusEndpoint, {
                    signal: controller.signal,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
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
            // Process the status data and ensure it has required fields
            return {
                lastCheck: data.lastCheck || new Date().toISOString(),
                status: data.overallStatus || data.status || 'operational',
                uptime: data.uptime || '99.9%',
                services: {
                    website: data.services?.website || 'operational',
                    blog: data.services?.blog || 'operational',
                    booking: data.services?.booking || 'operational',
                    ...data.services
                },
                responseTime: data.responseTime || null,
                location: data.location || 'Global'
            };
        }

        renderStatus(statusData) {
            this.updateLastCheck(statusData.lastCheck);
            this.updateOverallStatus(statusData.status);
            this.updateStatusIndicator(statusData.status);
            
            // Update any blog-specific status elements
            this.updateBlogStatus(statusData);
        }

        updateLastCheck(lastCheck) {
            const lastCheckElement = document.getElementById('footer-last-check');
            if (lastCheckElement) {
                const date = new Date(lastCheck);
                const timeAgo = this.getTimeAgo(date);
                lastCheckElement.textContent = timeAgo;
                lastCheckElement.setAttribute('title', date.toLocaleString());
            }
        }

        updateOverallStatus(status) {
            const statusElement = document.getElementById('footer-overall-status');
            if (statusElement) {
                // Remove existing status classes
                statusElement.classList.remove('operational', 'degraded', 'down');
                
                // Add current status class
                statusElement.classList.add(status);
                
                // Update text
                const statusText = {
                    'operational': 'All services operational',
                    'degraded': 'Some services degraded',
                    'down': 'Service issues detected'
                };
                
                statusElement.textContent = statusText[status] || 'Status unknown';
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
            }
            
            if (text) {
                text.textContent = status === 'operational' ? 'Live' : 
                                 status === 'degraded' ? 'Issues' : 'Down';
            }

            // Update indicator background
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
            }
        }

        updateBlogStatus(statusData) {
            // Update any blog-specific status elements
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
                    element.textContent = statusText[serviceStatus] || 'Unknown';
                }
            });

            // Show performance info if available
            if (statusData.responseTime) {
                this.updatePerformanceInfo(statusData.responseTime);
            }
        }

        updatePerformanceInfo(responseTime) {
            const perfElement = document.querySelector('.footer-performance-info');
            if (perfElement) {
                perfElement.textContent = `${responseTime}ms response time`;
                
                // Color code based on performance
                if (responseTime < 200) {
                    perfElement.style.color = '#16a34a'; // Green
                } else if (responseTime < 500) {
                    perfElement.style.color = '#d97706'; // Orange
                } else {
                    perfElement.style.color = '#dc2626'; // Red
                }
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

        // Public method to manually refresh status
        refresh() {
            this.updateFooterStatus();
        }

        // Get current status
        getCurrentStatus() {
            const statusElement = document.getElementById('footer-overall-status');
            if (statusElement) {
                if (statusElement.classList.contains('operational')) return 'operational';
                if (statusElement.classList.contains('degraded')) return 'degraded';
                if (statusElement.classList.contains('down')) return 'down';
            }
            return 'unknown';
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
        }

        addBlogStatusElements() {
            const footer = document.querySelector('.footer-status');
            if (!footer) return;

            // Add blog service status if not present
            if (!footer.querySelector('.blog-service-status')) {
                const blogStatus = document.createElement('p');
                blogStatus.className = 'blog-service-status';
                blogStatus.innerHTML = `
                    Blog service: <span data-blog-status="blog" data-status-text class="operational">Online</span>
                `;
                blogStatus.style.fontSize = '0.8rem';
                blogStatus.style.opacity = '0.8';
                blogStatus.style.margin = '0.25rem 0';
                
                footer.appendChild(blogStatus);
            }
        }

        enhanceStatusPageLink() {
            const statusLinks = document.querySelectorAll('a[href*="status.html"], a[href*="/status"]');
            
            statusLinks.forEach(link => {
                link.addEventListener('click', () => {
                    // Track status page navigation from blog
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'status_page_click', {
                            'event_category': 'navigation',
                            'event_label': 'footer_status_link',
                            'source_page': 'blog',
                            'page_location': window.location.pathname
                        });
                    }
                });
            });
        }

        addReadingStatus() {
            // Add reading time and progress to footer on article pages
            if (document.querySelector('.article-body')) {
                const footer = document.querySelector('.footer-status');
                if (footer && !footer.querySelector('.reading-status')) {
                    const readingStatus = document.createElement('p');
                    readingStatus.className = 'reading-status';
                    readingStatus.style.fontSize = '0.8rem';
                    readingStatus.style.opacity = '0.8';
                    readingStatus.style.margin = '0.25rem 0';
                    
                    // Calculate reading time
                    const wordCount = this.getWordCount();
                    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
                    
                    readingStatus.innerHTML = `
                        <i class="fas fa-clock"></i> 
                        ${readingTime} min read • 
                        <span id="reading-progress">0%</span> complete
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
            return text.trim().split(/\s+/).length;
        }

        trackReadingProgress() {
            const progressElement = document.getElementById('reading-progress');
            const article = document.querySelector('.article-body');
            
            if (!progressElement || !article) return;

            const updateProgress = () => {
                const articleTop = article.offsetTop;
                const articleHeight = article.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollTop = window.pageYOffset;

                const progress = Math.min(
                    100,
                    Math.max(0, ((scrollTop - articleTop + windowHeight / 3) / articleHeight) * 100)
                );

                progressElement.textContent = `${Math.round(progress)}%`;
            };

            window.addEventListener('scroll', updateProgress, { passive: true });
            updateProgress(); // Initial update
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBlogFooterStatus);
    } else {
        initializeBlogFooterStatus();
    }

    function initializeBlogFooterStatus() {
        try {
            // Initialize main blog footer status
            const blogFooterStatus = new BlogFooterStatus();
            
            // Initialize blog-specific enhancements
            new BlogStatusEnhancer();
            
            // Make status manager globally available
            window.BlogFooterStatus = blogFooterStatus;
            
            console.log('✅ Blog footer status initialized successfully');
            
        } catch (error) {
            console.error('❌ Blog footer status initialization failed:', error);
            
            // Fallback: still show basic status
            const statusElement = document.getElementById('footer-overall-status');
            if (statusElement) {
                statusElement.textContent = 'All services operational';
                statusElement.className = 'footer-overall-status operational';
            }
        }
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
        }
    };

})();