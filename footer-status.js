// Footer Status Integration - Safe integration for existing pages
// This file adds status functionality to the footer without breaking existing design
(function() {
    'use strict';
    
    // Only run if we're NOT on the status page (to avoid conflicts)
    if (window.location.pathname.includes('status')) {
        return;
    }
    
    // Only log in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔗 Initializing Footer Status Integration...');
    }
    
    class FooterStatusIntegration {
        constructor() {
            this.statusData = null;
            this.cache = new Map();
            this.cacheExpiry = 60000; // 1 minute cache for footer
            this.apiEndpoint = 'https://carambola-golf-status-api.jaspervdz.workers.dev/api/status';
            this.init();
        }

        async init() {
            try {
                // Set initial safe fallback
                this.setFallbackStatus();
                
                // Try to fetch real status
                await this.fetchStatus();
                
                // Update footer display
                this.updateFooterStatus();
                
                // Set up periodic updates (every 2 minutes)
                setInterval(() => {
                    this.fetchStatus().then(() => {
                        this.updateFooterStatus();
                    }).catch(() => {
                        // Silent fail - keep using cached or fallback data
                    });
                }, 120000);
                
            } catch (error) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('Footer status integration using fallback data');
                }
                this.setFallbackStatus();
                this.updateFooterStatus();
            }
        }

        setFallbackStatus() {
            this.statusData = {
                overall: {
                    status: 'operational',
                    uptime: 99.98
                },
                realTime: false,
                fallbackMode: true,
                lastUpdated: new Date().toISOString()
            };
        }

        async fetchStatus() {
            try {
                // Check cache first
                const cached = this.cache.get('footer_status');
                if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
                    this.statusData = cached.data;
                    return;
                }

                const response = await fetch(this.apiEndpoint, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.statusData = data;
                    
                    // Cache the result
                    this.cache.set('footer_status', {
                        data: this.statusData,
                        timestamp: Date.now()
                    });
                } else {
                    throw new Error(`API response: ${response.status}`);
                }

            } catch (error) {
                // Use fallback on error
                this.setFallbackStatus();
                throw error;
            }
        }

        updateFooterStatus() {
            const footerLastCheck = document.getElementById('footer-last-check');
            const footerOverallStatus = document.getElementById('footer-overall-status');
            const footerStatusIndicator = document.querySelector('.footer-status-indicator');

            // Update last check time
            if (footerLastCheck) {
                const now = new Date();
                footerLastCheck.textContent = now.toLocaleTimeString('en-US', {
                    timeZone: 'America/St_Thomas',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
            }

            // Update overall status
            if (footerOverallStatus && this.statusData) {
                const status = this.statusData.overall?.status || 'operational';
                const statusText = {
                    'operational': 'All services operational',
                    'degraded': 'Some services degraded',
                    'down': 'Service issues detected'
                };
                
                footerOverallStatus.textContent = statusText[status];
                footerOverallStatus.className = `footer-overall-status ${status}`;
            }

            // Update status indicator styling
            if (footerStatusIndicator && this.statusData) {
                const isRealTime = this.statusData.realTime && !this.statusData.fallbackMode;
                const statusDot = footerStatusIndicator.querySelector('.footer-status-dot');
                const statusText = footerStatusIndicator.querySelector('.footer-status-text');
                
                if (statusDot && statusText) {
                    if (isRealTime) {
                        statusText.textContent = 'Live';
                        statusDot.style.background = '#16a34a';
                        footerStatusIndicator.style.background = 'rgba(22, 163, 74, 0.1)';
                        footerStatusIndicator.style.borderColor = 'rgba(22, 163, 74, 0.3)';
                    } else {
                        statusText.textContent = 'Cached';
                        statusDot.style.background = '#f59e0b';
                        footerStatusIndicator.style.background = 'rgba(245, 158, 11, 0.1)';
                        footerStatusIndicator.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                    }
                }
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new FooterStatusIntegration();
        });
    } else {
        new FooterStatusIntegration();
    }

})();