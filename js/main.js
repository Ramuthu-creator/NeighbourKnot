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
window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    
    // Icon based on type
    let icon = '<i class="fa-solid fa-circle-info"></i>';
    let color = '#38bdf8'; // blue for info
    if (type === 'success') {
        icon = '<i class="fa-solid fa-circle-check"></i>';
        color = '#34d399'; // green
    } else if (type === 'error') {
        icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
        color = '#ef4444'; // red
    }

    // Glassmorphism styling & positioning
    toast.style.position = 'fixed';
    toast.style.top = '24px';
    toast.style.right = '24px';
    toast.style.background = 'rgba(15, 23, 42, 0.85)';
    toast.style.backdropFilter = 'blur(16px)';
    toast.style.webkitBackdropFilter = 'blur(16px)';
    toast.style.border = `1px solid ${color}`;
    toast.style.borderLeft = `4px solid ${color}`;
    toast.style.borderRadius = '12px';
    toast.style.padding = '16px 24px';
    toast.style.color = 'white';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
    toast.style.zIndex = '9999';
    toast.style.fontFamily = 'inherit';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
    toast.style.opacity = '0';
    
    toast.innerHTML = `
        <span style="color: ${color}; font-size: 18px;">${icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Trigger animation out after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 400); // Wait for transition
    }, 3000);
};

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
