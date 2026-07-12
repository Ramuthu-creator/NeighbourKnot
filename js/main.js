// Main Application Module
class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollAnimations();
    }

    /**
     * Setup event listeners for buttons and links
     */
    setupEventListeners() {
        // Get Started button
        const getStartedBtns = document.querySelectorAll('.btn-primary, .btn-large');
        getStartedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.textContent.includes('Get Started') || 
                    e.target.textContent.includes('Started Today')) {
                    this.redirectToSignup();
                }
            });
        });

        // Learn More button
        const learnMoreBtn = document.querySelector('.btn-secondary');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Navigation links
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#') && href.length > 1) {
                    e.preventDefault();
                    const element = document.querySelector(href);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Login button
        const loginBtn = document.querySelector('.btn-login:not(#logout-btn)');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToLogin();
            });
        }

        // Signup button in nav
        const signupBtn = document.querySelector('.btn-signup');
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToSignup();
            });
        }
    }

    /**
     * Setup scroll animations
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe cards and sections
        document.querySelectorAll('.card, .problem-card, .solution-card, .feature-card, .benefit-card, .step').forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        window.location.href = 'login.html';
    }

    /**
     * Redirect to signup page
     */
    redirectToSignup() {
        window.location.href = 'signup.html';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Utility Functions

/**
 * Format date
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time
 */
function formatTime(time) {
    return new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get initials from name
 */
function getInitials(firstName, lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

/**
 * Debounce function
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications to avoid stacking too many
    const existingNotifications = document.querySelectorAll('.custom-toast-notification');
    existingNotifications.forEach(n => {
        n.style.transform = 'translateY(-150%)';
        n.style.opacity = '0';
        setTimeout(() => n.remove(), 300);
    });

    const notification = document.createElement('div');
    notification.className = `custom-toast-notification toast-${type}`;
    
    // Select icon based on type
    let iconSvg = '';
    let bgColor = '';
    
    if (type === 'error') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        bgColor = 'rgba(244, 63, 94, 0.95)'; // Rose/Red
    } else if (type === 'success') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        bgColor = 'rgba(16, 185, 129, 0.95)'; // Emerald/Green
    } else {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        bgColor = 'rgba(14, 165, 233, 0.95)'; // Sky Blue
    }

    notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; background: rgba(255,255,255,0.2); margin-right: 12px;">
            ${iconSvg}
        </div>
        <div style="font-weight: 500; font-size: 15px; line-height: 1.4; letter-spacing: 0.3px;">
            ${message}
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        display: flex;
        align-items: center;
        width: max-content;
        max-width: 90vw;
        padding: 14px 24px;
        background: ${bgColor};
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: white;
        border-radius: 100px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        z-index: 99999;
        transform: translate(-50%, -150%);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    document.body.appendChild(notification);
    
    // Trigger reflow
    notification.offsetHeight;
    
    // Slide in and fade in
    notification.style.transform = 'translate(-50%, 0)';
    notification.style.opacity = '1';
    
    setTimeout(() => {
        notification.style.transform = 'translate(-50%, -150%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 400);
    }, 4500);
}

/**
 * Validate email
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate password
 */
function validatePassword(password) {
    return password.length >= 8;
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return localStorage.getItem('neighborknot_user') !== null;
}

