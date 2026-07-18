document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const requestsGrid = document.getElementById('requests-grid');
    const requestModal = document.getElementById('request-modal');
    const postRequestBtn = document.getElementById('post-request-btn');
    const closeModalBtn = document.getElementById('close-request-modal');
    const cancelBtn = document.getElementById('cancel-request-btn');
    const postRequestForm = document.getElementById('post-request-form');

    let currentUser = null;
    let db = null;

    // Messaging Logic
    window.sendMessageFromRequest = function(userId) {
        localStorage.setItem('pending_chat_target', userId);
        window.location.href = 'dashboard.html';
    };

    // 1. Auth State & Initialization
    // Wait until firebase is available
    const initInterval = setInterval(() => {
        if (window.firebase && window.firebase.auth && window.firebase.firestore) {
            clearInterval(initInterval);
            db = window.firebase.firestore();
            
            window.firebase.auth().onAuthStateChanged((user) => {
                currentUser = user;
                // Fetch requests initially regardless of auth state
                fetchRequests();
            });
        }
    }, 100);

    // Modal Logic
    if (postRequestBtn) {
        postRequestBtn.addEventListener('click', () => {
            if (currentUser) {
                requestModal.classList.add('show');
            } else {
                window.showToast('Please login to post a request', 'error');
                setTimeout(() => window.location.href = 'login.html', 1500);
            }
        });
    }

    const closeModal = () => {
        if (requestModal) {
            requestModal.classList.remove('show');
        }
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === requestModal) closeModal();
    });

    // 2. Form Submission Logic
    if (postRequestForm) {
        postRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!currentUser) {
                window.showToast('Please login to post a request', 'error');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting...';

            try {
                // Extract values from the inputs
                const skillName = document.getElementById('request-skill-name').value;
                const description = document.getElementById('request-description').value;
                const category = document.getElementById('request-category').value;
                const tokens = parseInt(document.getElementById('request-tokens').value);

                // Get custom user data from auth.js if available, fallback to firebase auth data
                let userName = currentUser.displayName || 'User';
                let userAvatar = 'U';
                
                if (window.auth && window.auth.currentUser) {
                    userName = window.auth.currentUser.firstName + ' ' + window.auth.currentUser.lastName;
                    userAvatar = window.auth.currentUser.firstName.charAt(0) + window.auth.currentUser.lastName.charAt(0);
                }

                const formData = {
                    skillName: skillName,
                    description: description,
                    category: category,
                    tokens: tokens,
                    userId: currentUser.uid,
                    userName: userName,
                    userAvatar: userAvatar,
                    createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'open'
                };

                // Save data to Firestore
                await db.collection('skill_requests').add(formData);
                
                // 3. Success Handling
                postRequestForm.reset();
                closeModal();
                window.showToast('Request posted successfully!', 'success');
                fetchRequests();

            } catch (error) {
                // 5. Error Handling
                console.error("Error posting request:", error);
                window.showToast('Failed to post request. Please try again. Error: ' + error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // 4. Fetching Logic
    async function fetchRequests() {
        if (!requestsGrid || !db) return;
        
        try {
            const snapshot = await db.collection('skill_requests')
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                requestsGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <div style="width: 80px; height: 80px; margin: 0 auto 20px auto; background: rgba(56, 189, 248, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-hand-holding-heart" style="font-size: 32px; color: #38bdf8;"></i>
                        </div>
                        <h3 style="color: white; font-size: 24px; margin-bottom: 12px;">No skill requests yet</h3>
                        <p style="color: var(--text-muted); font-size: 16px; max-width: 400px; margin: 0 auto;">Be the first to ask the community! Whether you want to learn to bake bread or code in Python, someone here can help.</p>
                    </div>
                `;
                return;
            }

            requestsGrid.innerHTML = '';
            snapshot.forEach(doc => {
                const request = doc.data();
                requestsGrid.appendChild(createRequestCard(request, doc.id));
            });
        } catch (error) {
            console.error("Error fetching requests:", error);
            requestsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: #ef4444; margin-bottom: 16px;"></i>
                    <h3 style="color: white;">Failed to load requests</h3>
                    <p style="color: var(--text-muted);">Please check your connection and try again later.</p>
                </div>
            `;
            window.showToast('Error loading requests from server: ' + error.message, 'error');
        }
    }

    function createRequestCard(request, id) {
        const card = document.createElement('div');
        card.className = 'skill-listing';
        
        let dateStr = 'Recently';
        if (request.createdAt) {
            const date = request.createdAt.toDate();
            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        
        card.innerHTML = `
            <div class="skill-listing-header">
                <h3 class="skill-listing-title" style="margin: 0; font-size: 18px; color: var(--primary-color);">${request.skillName}</h3>
                <div class="skill-level" style="text-transform: capitalize;">${request.category}</div>
            </div>
            <div class="skill-listing-body">
                <p class="skill-listing-description">${request.description}</p>
                
                <div class="skill-listing-teacher">
                    <div class="teacher-avatar">${request.userAvatar || 'U'}</div>
                    <div class="teacher-info">
                        <h4>${request.userName || 'User'}</h4>
                        <p>Requested ${dateStr}</p>
                    </div>
                </div>

                <div class="skill-listing-meta" style="display: flex; justify-content: flex-end; margin-top: auto; padding-top: 16px;">
                    <div class="skill-tokens-cost"><i class="fa-solid fa-coins" style="color: #34d399; margin-right: 4px;"></i>${request.tokens} tokens/hr</div>
                </div>

                <div class="skill-listing-footer" style="justify-content: flex-end;">
                    <button class="book-btn" onclick="window.sendMessageFromRequest('${request.userId}')">Message User</button>
                </div>
            </div>
        `;
        return card;
    }
});
