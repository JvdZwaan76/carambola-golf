// Carambola Golf Club Blog JavaScript
// Extends main site functionality with blog-specific features

(function() {
    'use strict';

    // Prevent duplicate execution
    if (window.CarambolaBlogInitialized) {
        console.log('🟡 Blog script already initialized, skipping duplicate execution');
        return;
    }
    window.CarambolaBlogInitialized = true;

    // Blog-specific analytics tracking
    function trackBlogEvent(action, article, details = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'Blog Engagement',
                event_label: article,
                blog_category: details.category || 'general',
                article_type: details.type || 'guide',
                ...details
            });
        }
    }

    // Enhanced reading progress tracker
    class ReadingProgressTracker {
        constructor() {
            this.article = document.querySelector('.article-body');
            this.progressBar = this.createProgressBar();
            this.maxProgress = 0;
            this.thresholds = [25, 50, 75, 100];
            this.hitThresholds = new Set();
            this.init();
        }

        createProgressBar() {
            const progressBar = document.createElement('div');
            progressBar.className = 'reading-progress-bar';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, #d4af37, #1e3a5f);
                z-index: 1000;
                transition: width 0.3s ease;
            `;
            document.body.appendChild(progressBar);
            return progressBar;
        }

        init() {
            if (!this.article) return;

            window.addEventListener('scroll', () => {
                this.updateProgress();
            }, { passive: true });

            console.log('📊 Reading progress tracker initialized');
        }

        updateProgress() {
            const articleTop = this.article.offsetTop;
            const articleHeight = this.article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;

            const progress = Math.min(
                100,
                Math.max(0, ((scrollTop - articleTop + windowHeight / 3) / articleHeight) * 100)
            );

            this.progressBar.style.width = `${progress}%`;

            // Track reading milestones
            this.thresholds.forEach(threshold => {
                if (progress >= threshold && !this.hitThresholds.has(threshold)) {
                    this.hitThresholds.add(threshold);
                    trackBlogEvent('reading_progress', `${threshold}%`, {
                        article_title: document.title,
                        reading_depth: threshold
                    });
                }
            });

            this.maxProgress = Math.max(this.maxProgress, progress);
        }

        getMaxProgress() {
            return this.maxProgress;
        }
    }

    // Article share functionality
    class ShareManager {
        constructor() {
            this.setupShareButtons();
            this.setupCopyToClipboard();
        }

        setupShareButtons() {
            document.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const platform = btn.classList.contains('facebook') ? 'facebook' :
                                   btn.classList.contains('twitter') ? 'twitter' :
                                   btn.classList.contains('linkedin') ? 'linkedin' :
                                   btn.classList.contains('email') ? 'email' : 'unknown';
                    
                    this.shareArticle(platform);
                });
            });
        }

        setupCopyToClipboard() {
            // Add copy link button if not exists
            const shareSection = document.querySelector('.share-section');
            if (shareSection && !shareSection.querySelector('.share-btn.copy-link')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'share-btn copy-link';
                copyBtn.innerHTML = '<i class="fas fa-link"></i> Copy Link';
                copyBtn.style.background = '#6b7280';
                copyBtn.style.color = 'white';
                
                copyBtn.addEventListener('click', () => {
                    this.copyToClipboard();
                });
                
                shareSection.querySelector('.share-buttons').appendChild(copyBtn);
            }
        }

        shareArticle(platform) {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            const description = encodeURIComponent(
                document.querySelector('meta[name="description"]')?.content || 
                'Read this article from Carambola Golf Club'
            );
            
            let shareUrl = '';
            
            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${title}&body=Check out this article: ${url}`;
                    break;
            }
            
            if (platform === 'email') {
                window.location.href = shareUrl;
            } else {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
            
            trackBlogEvent('article_shared', platform, {
                article_title: document.title,
                share_method: platform
            });
        }

        async copyToClipboard() {
            try {
                await navigator.clipboard.writeText(window.location.href);
                this.showCopySuccess();
                trackBlogEvent('article_shared', 'copy_link', {
                    article_title: document.title
                });
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                // Fallback for older browsers
                this.fallbackCopyToClipboard();
            }
        }

        fallbackCopyToClipboard() {
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showCopySuccess();
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            
            document.body.removeChild(textArea);
        }

        showCopySuccess() {
            const copyBtn = document.querySelector('.share-btn.copy-link');
            if (copyBtn) {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.background = '#16a34a';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = '#6b7280';
                }, 2000);
            }
        }
    }

    // Table of Contents generator
    class TableOfContents {
        constructor() {
            this.article = document.querySelector('.article-body');
            this.headings = [];
            this.toc = null;
            this.init();
        }

        init() {
            if (!this.article) return;

            this.findHeadings();
            if (this.headings.length > 2) {
                this.createTOC();
                this.setupScrollSpy();
            }
        }

        findHeadings() {
            this.headings = Array.from(this.article.querySelectorAll('h2, h3, h4'))
                .map((heading, index) => {
                    const id = heading.id || `heading-${index}`;
                    heading.id = id;
                    return {
                        element: heading,
                        id: id,
                        text: heading.textContent,
                        level: parseInt(heading.tagName.charAt(1))
                    };
                });
        }

        createTOC() {
            const tocContainer = document.createElement('div');
            tocContainer.className = 'table-of-contents';
            tocContainer.innerHTML = `
                <div class="toc-header">
                    <h4><i class="fas fa-list"></i> Table of Contents</h4>
                    <button class="toc-toggle" aria-label="Toggle table of contents">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
                <nav class="toc-nav">
                    <ul class="toc-list">
                        ${this.headings.map(heading => `
                            <li class="toc-item toc-level-${heading.level}">
                                <a href="#${heading.id}" class="toc-link">${heading.text}</a>
                            </li>
                        `).join('')}
                    </ul>
                </nav>
            `;

            // Add CSS
            const style = document.createElement('style');
            style.textContent = `
                .table-of-contents {
                    background: #f9fafb;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    margin: 2rem 0;
                    overflow: hidden;
                }
                .toc-header {
                    background: #1e3a5f;
                    color: white;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .toc-header h4 {
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .toc-toggle {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0.25rem;
                }
                .toc-nav {
                    padding: 1rem;
                    max-height: 300px;
                    overflow-y: auto;
                    transition: max-height 0.3s ease;
                }
                .toc-nav.collapsed {
                    max-height: 0;
                    padding: 0 1rem;
                }
                .toc-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                .toc-item {
                    margin-bottom: 0.5rem;
                }
                .toc-level-3 {
                    margin-left: 1rem;
                }
                .toc-level-4 {
                    margin-left: 2rem;
                }
                .toc-link {
                    color: #1e3a5f;
                    text-decoration: none;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    display: block;
                    transition: all 0.2s ease;
                }
                .toc-link:hover,
                .toc-link.active {
                    background: #d4af37;
                    color: #1e3a5f;
                }
            `;
            document.head.appendChild(style);

            // Insert TOC after first paragraph
            const firstParagraph = this.article.querySelector('p');
            if (firstParagraph) {
                firstParagraph.after(tocContainer);
            } else {
                this.article.prepend(tocContainer);
            }

            this.toc = tocContainer;
            this.setupTOCEvents();
        }

        setupTOCEvents() {
            // Toggle functionality
            const toggle = this.toc.querySelector('.toc-toggle');
            const nav = this.toc.querySelector('.toc-nav');
            
            toggle.addEventListener('click', () => {
                nav.classList.toggle('collapsed');
                const icon = toggle.querySelector('i');
                icon.classList.toggle('fa-chevron-up');
                icon.classList.toggle('fa-chevron-down');
            });

            // Smooth scroll for TOC links
            this.toc.querySelectorAll('.toc-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    
                    if (target) {
                        const navbar = document.querySelector('.navbar');
                        const offset = navbar ? navbar.offsetHeight + 20 : 20;
                        
                        window.scrollTo({
                            top: target.offsetTop - offset,
                            behavior: 'smooth'
                        });

                        trackBlogEvent('toc_navigation', targetId, {
                            article_title: document.title
                        });
                    }
                });
            });
        }

        setupScrollSpy() {
            const tocLinks = this.toc.querySelectorAll('.toc-link');
            const headingElements = this.headings.map(h => h.element);

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Remove active class from all links
                        tocLinks.forEach(link => link.classList.remove('active'));
                        
                        // Add active class to current link
                        const activeLink = this.toc.querySelector(`[href="#${entry.target.id}"]`);
                        if (activeLink) {
                            activeLink.classList.add('active');
                        }
                    }
                });
            }, {
                rootMargin: '-20% 0px -35% 0px'
            });

            headingElements.forEach(heading => {
                observer.observe(heading);
            });
        }
    }

    // Newsletter signup handler
    class NewsletterManager {
        constructor() {
            this.setupNewsletterForm();
        }

        setupNewsletterForm() {
            const forms = document.querySelectorAll('.newsletter-form, form[class*="newsletter"]');
            
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleNewsletterSubmit(form);
                });
            });
        }

        handleNewsletterSubmit(form) {
            const email = form.querySelector('input[type="email"]')?.value;
            const name = form.querySelector('input[name="name"]')?.value;

            if (!email) {
                this.showMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            submitBtn.disabled = true;

            // Simulate newsletter signup (replace with actual implementation)
            setTimeout(() => {
                this.showMessage('Thank you for subscribing! Check your email for confirmation.', 'success');
                form.reset();
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                trackBlogEvent('newsletter_signup', 'blog_form', {
                    source: 'blog_newsletter_form',
                    has_name: !!name
                });
            }, 1500);
        }

        showMessage(message, type = 'info') {
            const messageEl = document.createElement('div');
            messageEl.className = `newsletter-message ${type}`;
            messageEl.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#1e3a5f'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 1000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 300px;
            `;
            messageEl.textContent = message;

            document.body.appendChild(messageEl);

            // Show message
            setTimeout(() => {
                messageEl.style.transform = 'translateX(0)';
            }, 100);

            // Hide message after 5 seconds
            setTimeout(() => {
                messageEl.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    messageEl.remove();
                }, 300);
            }, 5000);

            // Click to dismiss
            messageEl.addEventListener('click', () => {
                messageEl.style.transform = 'translateX(400px)';
                setTimeout(() => messageEl.remove(), 300);
            });
        }
    }

    // Blog-specific initialization
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📚 Initializing Carambola Golf Blog features...');

        try {
            // Initialize blog components
            new ReadingProgressTracker();
            new ShareManager();
            new TableOfContents();
            new NewsletterManager();

            // Track blog page view
            trackBlogEvent('blog_page_view', window.location.pathname, {
                page_title: document.title,
                referrer: document.referrer
            });

            // Enhanced link tracking for blog
            document.querySelectorAll('a').forEach(link => {
                if (link.href.includes('mailto:') || link.href.includes('tel:')) {
                    link.addEventListener('click', () => {
                        trackBlogEvent('contact_click', link.href.split(':')[0], {
                            link_text: link.textContent.trim()
                        });
                    });
                }
            });

            // Track time on page
            let startTime = Date.now();
            let maxTimeOnPage = 0;

            const updateTimeOnPage = () => {
                maxTimeOnPage = Math.max(maxTimeOnPage, Date.now() - startTime);
            };

            setInterval(updateTimeOnPage, 5000);

            window.addEventListener('beforeunload', () => {
                const timeOnPage = Math.round(maxTimeOnPage / 1000);
                if (timeOnPage > 10) { // Only track if spent more than 10 seconds
                    trackBlogEvent('time_on_page', `${timeOnPage}s`, {
                        article_title: document.title,
                        engagement_time: timeOnPage
                    });
                }
            });

            console.log('✅ Blog features initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing blog features:', error);
        }
    });

    // Global blog utilities
    window.CarambolaBlog = {
        trackEvent: trackBlogEvent,
        
        shareArticle: function(platform) {
            const shareManager = new ShareManager();
            shareManager.shareArticle(platform);
        },
        
        scrollToSection: function(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                const navbar = document.querySelector('.navbar');
                const offset = navbar ? navbar.offsetHeight + 20 : 20;
                
                window.scrollTo({
                    top: section.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        }
    };

})();