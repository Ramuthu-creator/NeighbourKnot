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
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const element = document.querySelector(href);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Login button
        const loginBtn = document.querySelector('.btn-login');
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
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#F43F5E' : type === 'success' ? '#10B981' : '#0EA5E9'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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

/**
 * Get current logged in user
 */
function getCurrentUser() {
    const user = localStorage.getItem('neighborknot_user');
    return user ? JSON.parse(user) : null;
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}
