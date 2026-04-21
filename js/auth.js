// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    /**
     * Initialize authentication
     */
    init() {
        this.setupAuthStateListener();
        this.setupAuthEventListeners();
    }

    /**
     * Setup Firebase auth state listener
     */
    setupAuthStateListener() {
        try {
            if (typeof auth !== 'undefined' && auth && auth.onAuthStateChanged) {
                auth.onAuthStateChanged((firebaseUser) => {
                    if (firebaseUser) {
                        this.loadCurrentUserFromFirestore(firebaseUser.uid);
                    } else {
                        this.currentUser = null;
                    }
                });
            } else {
                console.warn('Firebase auth not available yet');
            }
        } catch (error) {
            console.error('Error setting up auth state listener:', error);
        }
    }

    /**
     * Load current user from Firestore
     */
    async loadCurrentUserFromFirestore(uid) {
        try {
            if (typeof db !== 'undefined') {
                const userDoc = await db.collection('users').doc(uid).get();
                if (userDoc.exists) {
                    this.currentUser = { id: uid, ...userDoc.data() };
                    localStorage.setItem('neighborknot_user', JSON.stringify(this.currentUser));
                }
            }
        } catch (error) {
            console.error('Error loading user from Firestore:', error);
        }
    }

    /**
     * Sign up new user
     * @param {Object} userData - User data object
     */
    async signUp(userData) {
        try {
            if (typeof auth === 'undefined' || typeof db === 'undefined') {
                throw new Error('Firebase not initialized');
            }

            // Create user in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
            const uid = userCredential.user.uid;

            // Create user document in Firestore
            const newUser = {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                bio: userData.bio || '',
                profileImage: userData.profileImage || '',
                location: userData.location || '',
                year: userData.year || new Date().getFullYear(),
                userType: userData.userType || 'learner',
                skills: [],
                tokens: 10, // Initial tokens
                rating: 0,
                reviews: [],
                totalSessions: 0,
                createdAt: new Date().toISOString()
            };

            await db.collection('users').doc(uid).set(newUser);

            this.currentUser = { id: uid, ...newUser };
            localStorage.setItem('neighborknot_user', JSON.stringify(this.currentUser));
            
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     */
    async login(email, password) {
        try {
            if (typeof auth === 'undefined') {
                throw new Error('Firebase not initialized');
            }

            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;
            
            // Load user data from Firestore
            await this.loadCurrentUserFromFirestore(uid);
            
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout user
     */
    logout() {
        if (typeof auth !== 'undefined') {
            auth.signOut().catch(error => console.error('Logout error:', error));
        }
        this.currentUser = null;
        localStorage.removeItem('neighborknot_user');
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Update user profile
     * @param {Object} updates - Updates to apply
     */
    async updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        try {
            if (typeof db !== 'undefined') {
                await db.collection('users').doc(this.currentUser.id).update(updates);
            }
            
            this.currentUser = { ...this.currentUser, ...updates };
            localStorage.setItem('neighborknot_user', JSON.stringify(this.currentUser));

            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Add skill to user
     * @param {Object} skill - Skill object
     */
    async addSkill(skill) {
        if (!this.currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        try {
            const newSkill = {
                id: this.generateId(),
                name: skill.name,
                description: skill.description,
                level: skill.level || 'Intermediate',
                tokensPerHour: skill.tokensPerHour || 5,
                availability: skill.availability || [],
                createdAt: new Date().toISOString()
            };

            const updatedSkills = [...(this.currentUser.skills || []), newSkill];
            return await this.updateProfile({ skills: updatedSkills });
        } catch (error) {
            console.error('Add skill error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove skill from user
     * @param {string} skillId - Skill ID
     */
    async removeSkill(skillId) {
        if (!this.currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        try {
            const updatedSkills = this.currentUser.skills.filter(s => s.id !== skillId);
            return await this.updateProfile({ skills: updatedSkills });
        } catch (error) {
            console.error('Remove skill error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all users from Firestore
     */
    async getAllUsers() {
        try {
            if (typeof db === 'undefined') {
                return [];
            }
            const snapshot = await db.collection('users').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Get all users error:', error);
            return [];
        }
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     */
    async getUserById(userId) {
        try {
            if (typeof db === 'undefined') {
                return null;
            }
            const userDoc = await db.collection('users').doc(userId).get();
            return userDoc.exists ? { id: userId, ...userDoc.data() } : null;
        } catch (error) {
            console.error('Get user by ID error:', error);
            return null;
        }
    }

    /**
     * Search users by skill
     * @param {string} skillName - Skill name to search
     */
    async searchUsersBySkill(skillName) {
        try {
            if (typeof db === 'undefined') {
                return [];
            }
            const snapshot = await db.collection('users').get();
            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user =>
                    user.skills && user.skills.some(skill =>
                        skill.name.toLowerCase().includes(skillName.toLowerCase())
                    )
                );
        } catch (error) {
            console.error('Search users by skill error:', error);
            return [];
        }
    }

    /**
     * Add review to user
     * @param {string} reviewerId - ID of reviewer
     * @param {number} rating - Rating (1-5)
     * @param {string} comment - Review comment
     */
    async addReview(reviewerId, rating, comment) {
        if (!this.currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        try {
            const review = {
                id: this.generateId(),
                reviewerId,
                rating,
                comment,
                createdAt: new Date().toISOString()
            };

            this.currentUser.reviews.push(review);

            // Update average rating
            const totalRating = this.currentUser.reviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRating / this.currentUser.reviews.length;

            return await this.updateProfile({
                reviews: this.currentUser.reviews,
                rating: Math.round(averageRating * 10) / 10
            });
        } catch (error) {
            console.error('Add review error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Transfer tokens between users
     * @param {string} recipientId - Recipient user ID
     * @param {number} amount - Amount of tokens
     * @param {string} reason - Reason for transfer
     */
    async transferTokens(recipientId, amount, reason = 'Session') {
        if (!this.currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        if (this.currentUser.tokens < amount) {
            return { success: false, error: 'Insufficient tokens' };
        }

        try {
            if (typeof db === 'undefined') {
                return { success: false, error: 'Firebase not initialized' };
            }

            // Update sender
            this.currentUser.tokens -= amount;
            await db.collection('users').doc(this.currentUser.id).update({ 
                tokens: this.currentUser.tokens 
            });

            // Update recipient
            const recipientDoc = await db.collection('users').doc(recipientId).get();
            if (!recipientDoc.exists) {
                return { success: false, error: 'Recipient not found' };
            }

            const recipientTokens = (recipientDoc.data().tokens || 0) + amount;
            await db.collection('users').doc(recipientId).update({ 
                tokens: recipientTokens 
            });

            return { success: true };
        } catch (error) {
            console.error('Transfer tokens error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Setup authentication event listeners
     */
    setupAuthEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    /**
     * Handle login form submission
     */
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = await this.login(email, password);
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            alert(result.error);
        }
    }

    /**
     * Handle signup form submission
     */
    async handleSignup(e) {
        e.preventDefault();
        
        const userData = {
            email: document.getElementById('signup-email').value,
            password: document.getElementById('signup-password').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            location: document.getElementById('location').value,
            bio: document.getElementById('bio').value,
            year: parseInt(document.getElementById('year').value),
            userType: document.getElementById('userType').value
        };

        const result = await this.signUp(userData);
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            alert(result.error);
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.logout();
        window.location.href = 'index.html';
    }
}

// Initialize auth manager after Firebase is ready
let authManager = null;

// Wait for Firebase to initialize
function initAuthManager() {
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        // Firebase not ready yet, try again
        setTimeout(initAuthManager, 100);
        return;
    }
    if (!authManager) {
        authManager = new AuthManager();
    }
}

// Start the initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthManager);
} else {
    initAuthManager();
}

// Global helper functions
function requireAuth() {
    if (!authManager) {
        window.location.href = 'login.html';
        return null;
    }
    const user = authManager.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
    }
    return user;
}

function getCurrentUser() {
    if (!authManager) {
        return null;
    }
    return authManager.getCurrentUser();
}
