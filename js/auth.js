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
     * Login or Signup with Google
     */
    async signInWithGoogle() {
        try {
            if (typeof auth === 'undefined') {
                throw new Error('Firebase not initialized');
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await auth.signInWithPopup(provider);
            const user = userCredential.user;
            const uid = user.uid;

            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(uid).get();
            
            if (!userDoc.exists) {
                // This is a new user (Signup via Google)
                const nameParts = (user.displayName || '').split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
                
                const newUser = {
                    email: user.email,
                    firstName: firstName,
                    lastName: lastName,
                    bio: '',
                    profileImage: user.photoURL || '',
                    location: '',
                    userType: 'learner', // Default type
                    skills: [],
                    tokens: 10, // Initial tokens
                    rating: 0,
                    reviews: [],
                    totalSessions: 0,
                    createdAt: new Date().toISOString()
                };

                await db.collection('users').doc(uid).set(newUser);
                this.currentUser = { id: uid, ...newUser };
            } else {
                // Existing user
                this.currentUser = { id: uid, ...userDoc.data() };
            }

            localStorage.setItem('neighborknot_user', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Google Sign-In error:', error);
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
                category: skill.category || 'other',
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
     * Update skill for user
     * @param {string} skillId - Skill ID
     * @param {Object} updatedData - Updated skill data
     */
    async updateSkill(skillId, updatedData) {
        if (!this.currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        try {
            const updatedSkills = this.currentUser.skills.map(s => {
                if (s.id === skillId) {
                    return { ...s, ...updatedData };
                }
                return s;
            });
            return await this.updateProfile({ skills: updatedSkills });
        } catch (error) {
            console.error('Update skill error:', error);
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
            const newTokens = this.currentUser.tokens - amount;
            const updateResult = await this.updateProfile({ tokens: newTokens });
            if (!updateResult.success) {
                return { success: false, error: 'Failed to update local profile' };
            }

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
     * Create a new booking
     * @param {Object} bookingData - Booking details
     */
    async createBooking(bookingData) {
        if (!this.currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        try {
            if (typeof db === 'undefined') {
                return { success: false, error: 'Firebase not initialized' };
            }

            const newBooking = {
                id: this.generateId(),
                learnerId: this.currentUser.id,
                teacherId: bookingData.teacherId,
                skillId: bookingData.skillId,
                skillName: bookingData.skillName,
                date: bookingData.date,
                time: bookingData.time,
                tokensCost: bookingData.tokensCost,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };

            await db.collection('bookings').doc(newBooking.id).set(newBooking);

            // Update user total sessions count
            const newTotalSessions = (this.currentUser.totalSessions || 0) + 1;
            await this.updateProfile({ totalSessions: newTotalSessions });

            // Also update teacher total sessions
            const teacherDoc = await db.collection('users').doc(bookingData.teacherId).get();
            if (teacherDoc.exists) {
                const teacherSessions = (teacherDoc.data().totalSessions || 0) + 1;
                await db.collection('users').doc(bookingData.teacherId).update({ totalSessions: teacherSessions });
            }

            return { success: true, booking: newBooking };
        } catch (error) {
            console.error('Create booking error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user bookings
     * @param {string} userId - User ID
     */
    async getUserBookings(userId) {
        try {
            if (typeof db === 'undefined') {
                return { success: false, bookings: [] };
            }

            // Get bookings where user is learner
            const learnerSnapshot = await db.collection('bookings').where('learnerId', '==', userId).get();
            const learnerBookings = learnerSnapshot.docs.map(doc => doc.data());

            // Get bookings where user is teacher
            const teacherSnapshot = await db.collection('bookings').where('teacherId', '==', userId).get();
            const teacherBookings = teacherSnapshot.docs.map(doc => doc.data());

            // Combine and sort by date descending
            const allBookings = [...learnerBookings, ...teacherBookings].sort((a, b) => new Date(b.date) - new Date(a.date));

            // Fetch names for UI display
            for (let booking of allBookings) {
                if (booking.learnerId === userId) {
                    const teacher = await this.getUserById(booking.teacherId);
                    booking.displayName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher';
                    booking.role = 'Learner';
                } else {
                    const learner = await this.getUserById(booking.learnerId);
                    booking.displayName = learner ? `${learner.firstName} ${learner.lastName}` : 'Unknown Learner';
                    booking.role = 'Teacher';
                }
            }

            return { success: true, bookings: allBookings };
        } catch (error) {
            console.error('Get user bookings error:', error);
            return { success: false, bookings: [], error: error.message };
        }
    }

    /**
     * Update booking status
     * @param {string} bookingId - Booking ID
     * @param {string} status - New status
     */
    async updateBookingStatus(bookingId, status) {
        if (!this.currentUser) return { success: false, error: 'Not logged in' };
        
        try {
            if (typeof db === 'undefined') return { success: false, error: 'Firebase not initialized' };
            await db.collection('bookings').doc(bookingId).update({ status });
            return { success: true };
        } catch (error) {
            console.error('Update booking error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Chat: Get or Create Chat
     */
    async getOrCreateChat(otherUserId) {
        if (!this.currentUser) return { success: false, error: 'Not logged in' };
        if (typeof db === 'undefined') return { success: false, error: 'Firebase not initialized' };

        try {
            const chatId = [this.currentUser.id, otherUserId].sort().join('_');
            const chatRef = db.collection('chats').doc(chatId);
            const chatDoc = await chatRef.get();

            if (!chatDoc.exists) {
                // Fetch other user for initial metadata if desired
                await chatRef.set({
                    participants: [this.currentUser.id, otherUserId],
                    updatedAt: new Date().toISOString(),
                    lastMessage: 'Say hi!'
                });
            }

            return { success: true, chatId };
        } catch (error) {
            console.error('Get/Create Chat error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Chat: Send Message
     */
    async sendChatMessage(chatId, text) {
        if (!this.currentUser || typeof db === 'undefined') return { success: false };

        try {
            const timestamp = new Date().toISOString();
            const message = {
                senderId: this.currentUser.id,
                text: text,
                timestamp: timestamp
            };

            await db.collection('chats').doc(chatId).collection('messages').add(message);
            await db.collection('chats').doc(chatId).update({
                lastMessage: text,
                updatedAt: timestamp
            });
            return { success: true };
        } catch (error) {
            console.error('Send message error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Chat: Subscribe to real-time messages
     */
    subscribeToMessages(chatId, callback) {
        if (typeof db === 'undefined') return () => {};

        return db.collection('chats').doc(chatId).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(messages);
            }, error => {
                console.error("Message subscription error:", error);
            });
    }

    /**
     * Chat: Get user's active chats
     */
    subscribeToUserChats(callback) {
        if (!this.currentUser || typeof db === 'undefined') return () => {};

        return db.collection('chats')
            .where('participants', 'array-contains', this.currentUser.id)
            .orderBy('updatedAt', 'desc')
            .onSnapshot(async (snapshot) => {
                const chats = [];
                for (let doc of snapshot.docs) {
                    const data = doc.data();
                    const otherUserId = data.participants.find(id => id !== this.currentUser.id);
                    const otherUser = await this.getUserById(otherUserId);
                    chats.push({
                        id: doc.id,
                        ...data,
                        otherUser: otherUser || { firstName: 'Unknown', lastName: 'User', profileImage: '' }
                    });
                }
                callback(chats);
            }, error => {
                console.error("Chat subscription error:", error);
            });
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

        // Google Auth buttons
        const googleLoginBtn = document.getElementById('google-login-btn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', (e) => this.handleGoogleSignIn(e));
        }

        const googleSignupBtn = document.getElementById('google-signup-btn');
        if (googleSignupBtn) {
            googleSignupBtn.addEventListener('click', (e) => this.handleGoogleSignIn(e));
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
            // Clean up Firebase error message for display
            const friendlyError = result.error.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/.*\)\.$/, '');
            showNotification(friendlyError || 'Login failed. Please check your credentials.', 'error');
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
            userType: document.getElementById('userType').value
        };

        const result = await this.signUp(userData);
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            // Clean up Firebase error message for display
            const friendlyError = result.error.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/.*\)\.$/, '');
            showNotification(friendlyError || 'Signup failed. Please try again.', 'error');
        }
    }

    /**
     * Handle Google Sign-in click
     */
    async handleGoogleSignIn(e) {
        e.preventDefault();
        const result = await this.signInWithGoogle();
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            const friendlyError = result.error.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/.*\)\.$/, '');
            if (typeof showNotification === 'function') {
                showNotification(friendlyError || 'Google authentication failed.', 'error');
            } else {
                alert(friendlyError || 'Google authentication failed.');
            }
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
