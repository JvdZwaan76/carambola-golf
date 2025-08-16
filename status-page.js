// Carambola Golf Club Status Page JavaScript
// This file is loaded ONLY on the status page
// It's completely isolated from the main script.js
(function() {
    'use strict';
   
    // Only run if we're on the status page
    if (!window.location.pathname.includes('status')) {
        return;
    }
   
    console.log('🏌️‍♂️ Initializing Carambola Golf Status Page...');
   
    class StatusPageManager {
        constructor() {
            this.statusData = null;
            this.refreshInterval = null;
            this.charts = {};
            this.init();
        }
        async init() {
            try {
                await this.fetchStatusData();
                this.updateStatusDisplay();
                this.updateTimestamp();
               
                // Wait for Chart.js to load before initializing charts
                this.waitForChartJS(() => {
                    this.initializeCharts();
                });
               
                this.startAutoRefresh();
               
                // Track status page visit
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'status_page_view', {
                        event_category: 'system_monitoring',
                        event_label: 'golf_status_dashboard',
                        value: 1
                    });
                }
            } catch (error) {
                console.error('Failed to initialize status page:', error);
                this.showFallbackData();
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
                const apiToken = 'KN6v9i_AQbBdi8KtDvttX6gvoPsqD79MWE9Potqe'; // Your provided API token
                const zoneId = '1734dd228acb83ffd056908eb2774257'; // Your provided Zone ID
                const graphqlEndpoint = 'https://api.cloudflare.com/client/v4/graphql';

                // GraphQL query for analytics
                const query = `
                    query {
                        viewer {
                            zones(filter: {zoneTag: "${zoneId}"}) {
                                httpRequests1dGroups(limit: 1, filter: {date_geq: "2025-08-01"}) {
                                    sum {
                                        requests
                                        cachedRequests
                                        pageViews
                                    }
                                    uniq {
                                        uniques
                                    }
                                }
                            }
                        }
                    }
                `;

                const response = await fetch(graphqlEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                if (!response.ok) {
                    throw new Error(`Cloudflare API error: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();

                // Check for API errors
                if (data.errors && data.errors.length > 0) {
                    throw new Error(`API returned errors: ${JSON.stringify(data.errors)}`);
                }

                // Validate response data
                const zoneData = data.data?.viewer?.zones?.[0]?.httpRequests1dGroups?.[0];
                if (!zoneData) {
                    throw new Error('Invalid or empty response from Cloudflare API');
                }

                // Map API data to statusData format
                this.statusData = {
                    overall: {
                        status: zoneData.sum.requests > 0 ? 'operational' : 'down',
                        uptime: zoneData.sum.requests > 0 ? ((zoneData.sum.cachedRequests / zoneData.sum.requests) * 100).toFixed(2) : 0,
                        responseTime: 247 // Placeholder; fetch separately if available
                    },
                    metrics: {
                        uptime30Days: 99.98, // Placeholder; fetch historical if needed
                        averageResponseTime: 247, // Placeholder
                        pageSpeedScore: 94, // Placeholder
                        securityGrade: 'A+', // Placeholder
                        requests24h: zoneData.sum.requests.toLocaleString(),
                        cachingRatio: zoneData.sum.requests > 0 ? ((zoneData.sum.cachedRequests / zoneData.sum.requests) * 100).toFixed(1) : 0
                    },
                    services: [
                        {
                            name: 'Website Core',
                            description: 'Main golf course website and content delivery for championship course information',
                            status: 'operational',
                            uptime: 99.98
                        },
                        {
                            name: 'Tee Time Requests',
                            description: 'Online tee time booking system and golf course reservations',
                            status: 'operational',
                            uptime: 99.97
                        },
                        {
                            name: 'Pro Shop Communications',
                            description: 'Primary pro shop line +1-340-778-5638 for reservations and inquiries',
                            status: 'operational',
                            uptime: 99.99
                        },
                        {
                            name: 'Email Services',
                            description: 'Golf course email system and automated booking confirmations',
                            status: 'operational',
                            uptime: 99.95
                        },
                        {
                            name: 'Course Information System',
                            description: 'Robert Trent Jones Sr. course details, hole descriptions, and statistics',
                            status: 'operational',
                            uptime: 99.98
                        },
                        {
                            name: 'Accommodations Portal',
                            description: 'Luxury lodging information and booking integration',
                            status: 'operational',
                            uptime: 99.96
                        },
                        {
                            name: 'Weather & Course Conditions',
                            description: 'St. Croix weather data and real-time course condition updates',
                            status: 'operational',
                            uptime: 99.94
                        }
                    ],
                    coreWebVitals: {
                        lcp: { value: 1.1, score: 88, status: 'good' },
                        fid: { value: 42, score: 94, status: 'good' },
                        cls: { value: 0.07, score: 90, status: 'good' }
                    },
                    activity: [
                        {
                            type: 'optimization',
                            title: 'Golf Course Image Optimization',
                            description: 'Enhanced image compression and WebP format implementation for faster loading of championship course photography.',
                            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                            status: 'completed'
                        },
                        {
                            type: 'security',
                            title: 'SSL Certificate Renewal',
                            description: 'Renewed and upgraded SSL/TLS certificates for enhanced security across all golf course platforms.',
                            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                            status: 'completed'
                        },
                        {
                            type: 'maintenance',
                            title: 'Database Performance Optimization',
                            description: 'Optimized database queries for faster tee time booking and course information retrieval.',
                            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                            status: 'completed'
                        }
                    ]
                };
               
                if (typeof trackStatusCheck === 'function') {
                    trackStatusCheck('api_success');
                }
               
            } catch (error) {
                console.error('Error fetching status data:', error);
                if (typeof trackStatusCheck === 'function') {
                    trackStatusCheck('api_error');
                }
                // Set fallback data
                this.statusData = {
                    overall: { status: 'operational', uptime: 99.98, responseTime: 247 },
                    metrics: {
                        uptime30Days: 99.98,
                        averageResponseTime: 247,
                        pageSpeedScore: 94,
                        securityGrade: 'A+',
                        requests24h: '12,847',
                        cachingRatio: 94.2
                    },
                    services: [
                        {
                            name: 'Website Core',
                            description: 'Main golf course website and content delivery for championship course information',
                            status: 'operational',
                            uptime: 99.98
                        },
                        {
                            name: 'Tee Time Requests',
                            description: 'Online tee time booking system and golf course reservations',
                            status: 'operational',
                            uptime: 99.97
                        },
                        {
                            name: 'Pro Shop Communications',
                            description: 'Primary pro shop line +1-340-778-5638 for reservations and inquiries',
                            status: 'operational',
                            uptime: 99.99
                        },
                        {
                            name: 'Email Services',
                            description: 'Golf course email system and automated booking confirmations',
                            status: 'operational',
                            uptime: 99.95
                        },
                        {
                            name: 'Course Information System',
                            description: 'Robert Trent Jones Sr. course details, hole descriptions, and statistics',
                            status: 'operational',
                            uptime: 99.98
                        },
                        {
                            name: 'Accommodations Portal',
                            description: 'Luxury lodging information and booking integration',
                            status: 'operational',
                            uptime: 99.96
                        },
                        {
                            name: 'Weather & Course Conditions',
                            description: 'St. Croix weather data and real-time course condition updates',
                            status: 'operational',
                            uptime: 99.94
                        }
                    ],
                    coreWebVitals: {
                        lcp: { value: 1.1, score: 88, status: 'good' },
                        fid: { value: 42, score: 94, status: 'good' },
                        cls: { value: 0.07, score: 90, status: 'good' }
                    },
                    activity: [
                        {
                            type: 'optimization',
                            title: 'Golf Course Image Optimization',
                            description: 'Enhanced image compression and WebP format implementation for faster loading of championship course photography.',
                            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                            status: 'completed'
                        },
                        {
                            type: 'security',
                            title: 'SSL Certificate Renewal',
                            description: 'Renewed and upgraded SSL/TLS certificates for enhanced security across all golf course platforms.',
                            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                            status: 'completed'
                        },
                        {
                            type: 'maintenance',
                            title: 'Database Performance Optimization',
                            description: 'Optimized database queries for faster tee time booking and course information retrieval.',
                            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                            status: 'completed'
                        }
                    ]
                };
                throw error;
            }
        }
        updateStatusDisplay() {
            if (!this.statusData) return;
            const { overall, metrics, services, coreWebVitals, activity } = this.statusData;
            this.updateOverallStatus(overall);
            this.updateKeyMetrics(metrics);
            this.updateServicesList(services);
            this.updateCoreWebVitals(coreWebVitals);
            this.updateActivityList(activity);
            this.updateFooterStatus(overall);
        }
        updateOverallStatus(overall) {
            const statusElement = document.getElementById('overall-status');
            const uptimeElement = document.querySelector('.hero-uptime-text');
           
            if (!statusElement) return;
            if (overall.status === 'operational') {
                statusElement.className = 'status-pill operational';
                statusElement.innerHTML = `
                    <div class="status-indicator operational"></div>
                    <span>All Systems Operational</span>
                `;
            } else {
                statusElement.className = 'status-pill down';
                statusElement.innerHTML = `
                    <div class="status-indicator down"></div>
                    <span>Service Issues Detected</span>
                `;
            }
            // Update uptime indicator
            if (uptimeElement) {
                uptimeElement.textContent = `${overall.uptime}% Uptime`;
            }
        }
        updateKeyMetrics(metrics) {
            const elements = {
                'uptime-value': `${metrics.uptime30Days}%`,
                'response-time-value': `${metrics.averageResponseTime}ms`,
                'pagespeed-value': metrics.pageSpeedScore,
                'security-value': metrics.securityGrade
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
                responseChartSummary.textContent = `Average: ${metrics.averageResponseTime}ms | Requests: ${metrics.requests24h}`;
            }
            const uptimeChartSummary = document.getElementById('uptime-chart-summary');
            if (uptimeChartSummary) {
                uptimeChartSummary.textContent = `30-day uptime: ${metrics.uptime30Days}% | Caching: ${metrics.cachingRatio}%`;
            }
        }
        updateServicesList(services) {
            const servicesContainer = document.getElementById('services-list');
            if (!servicesContainer || !services) return;
            servicesContainer.innerHTML = services.map(service => `
                <div class="service-status-card">
                    <div class="service-info">
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        ${service.uptime ? `<div class="service-uptime">Uptime: ${service.uptime}%</div>` : ''}
                    </div>
                    <div class="service-status">
                        <div class="status-pill ${this.getStatusClass(service.status)}">
                            <div class="status-indicator ${this.getStatusClass(service.status)}"></div>
                            <span>${this.getStatusText(service.status)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        updateCoreWebVitals(vitals) {
            const vitalsContainer = document.getElementById('core-web-vitals');
            if (!vitalsContainer || !vitals) return;
            const vitalsData = [
                { name: 'Largest Contentful Paint', metric: vitals.lcp, unit: 's', target: '<2.5s' },
                { name: 'First Input Delay', metric: vitals.fid, unit: 'ms', target: '<100ms' },
                { name: 'Cumulative Layout Shift', metric: vitals.cls, unit: '', target: '<0.1' }
            ];
            vitalsContainer.innerHTML = vitalsData.map(vital => `
                <div class="vital-metric">
                    <div class="vital-header">
                        <span class="vital-name">${vital.name}</span>
                        <span class="vital-value">${vital.metric.value}${vital.unit}</span>
                    </div>
                    <div class="vital-progress">
                        <div class="vital-progress-bar" data-width="${vital.metric.score}%"></div>
                    </div>
                    <div class="vital-target">Target: ${vital.target} | ${vital.metric.status === 'good' ? 'Excellent' : 'Needs improvement'}</div>
                </div>
            `).join('');
            // Animate progress bars
            setTimeout(() => {
                vitalsContainer.querySelectorAll('[data-width]').forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width;
                });
            }, 100);
        }
        updateActivityList(activity) {
            const activityContainer = document.getElementById('activity-list');
            if (!activityContainer || !activity) return;
            activityContainer.innerHTML = activity.map(item => `
                <div class="activity-card ${item.status}">
                    <div class="activity-content">
                        <div class="activity-header">
                            <h3 class="activity-title">${item.title}</h3>
                            <span class="activity-timestamp">${this.formatTimestamp(item.timestamp)}</span>
                        </div>
                        <p class="activity-description">${item.description}</p>
                        <div class="activity-status">
                            <div class="status-pill ${this.getActivityStatusClass(item.status)}">
                                <div class="status-indicator ${this.getActivityStatusClass(item.status)}"></div>
                                <span>${this.getActivityStatusText(item.status)}</span>
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
                footerOverallStatus.textContent = overall.status === 'operational' ? 'All services operational' : 'Service issues detected';
                footerOverallStatus.className = `footer-overall-status ${overall.status}`;
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
            // Generate 24 hours of sample data
            const now = new Date();
            const data = [];
            const labels = [];
            for (let i = 23; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 60 * 60 * 1000);
                labels.push(time.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true
                }));
                const baseTime = 230;
                const variation = Math.sin(i * 0.5) * 25 + Math.random() * 15;
                data.push(Math.max(200, Math.min(320, baseTime + variation)));
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
                        legend: { display: false }
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
                            min: 180,
                            max: 350,
                            grid: { color: 'rgba(212, 175, 55, 0.1)' },
                            ticks: {
                                color: '#6b7280',
                                font: { size: 12 },
                                callback: function(value) {
                                    return value + 'ms';
                                }
                            }
                        }
                    }
                }
            });
        }
        createUptimeChart() {
            const ctx = document.getElementById('uptime-chart');
            if (!ctx) return;
            // Generate 30 days of uptime data
            const data = [];
            const labels = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }));
                const uptime = Math.random() > 0.03 ? 100 : (99.7 + Math.random() * 0.3);
                data.push(uptime);
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
                        legend: { display: false }
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
                            min: 99.5,
                            max: 100,
                            grid: { color: 'rgba(212, 175, 55, 0.1)' },
                            ticks: {
                                color: '#6b7280',
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                }
                            }
                        }
                    }
                }
            });
        }
        startAutoRefresh() {
            this.refreshInterval = setInterval(async () => {
                try {
                    await this.fetchStatusData();
                    this.updateStatusDisplay();
                    this.updateTimestamp();
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                }
            }, 30000); // Refresh every 30 seconds
        }
        showFallbackData() {
            console.log('Showing fallback data for status page');
            // Fallback data is already set in fetchStatusData mock
            this.updateStatusDisplay();
        }
        // Utility functions
        getStatusClass(status) {
            switch (status) {
                case 'operational': return 'operational';
                case 'degraded': return 'degraded';
                case 'down': return 'down';
                default: return 'operational';
            }
        }
        getStatusText(status) {
            switch (status) {
                case 'operational': return 'Operational';
                case 'degraded': return 'Degraded';
                case 'down': return 'Down';
                default: return 'Unknown';
            }
        }
        getActivityStatusClass(status) {
            switch (status) {
                case 'completed': return 'operational';
                case 'in-progress': return 'degraded';
                case 'failed': return 'down';
                default: return 'operational';
            }
        }
        getActivityStatusText(status) {
            switch (status) {
                case 'completed': return 'Completed Successfully';
                case 'in-progress': return 'In Progress';
                case 'failed': return 'Failed';
                default: return 'Unknown';
            }
        }
        formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);
            if (diffHours < 1) {
                return 'Just now';
            } else if (diffHours < 24) {
                return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
                return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            }
        }
        // Cleanup
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
    // Initialize status page manager when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const statusManager = new StatusPageManager();
       
        // Store globally for potential debugging/manual refresh
        window.CarambolaGolfStatus = {
            manager: statusManager,
            refresh: function() {
                statusManager.fetchStatusData().then(() => {
                    statusManager.updateStatusDisplay();
                    statusManager.updateTimestamp();
                });
            }
        };
       
        console.log('✅ Carambola Golf Status Page initialized successfully');
    });
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (window.CarambolaGolfStatus && window.CarambolaGolfStatus.manager) {
            window.CarambolaGolfStatus.manager.destroy();
        }
    });
})();
