// Dashboard Module
class Dashboard {
    constructor() {
        requireAuth();
        this.user = getCurrentUser();
        this.activeChatId = null;
        this.chatUnsubscribe = null;
        this.editingSkillId = null;
        this.init();
    }

    async init() {
        this.renderUserInfo();
        this.setupEventListeners();
        this.renderStats();
        this.renderSkills();
        await this.renderBookings();
        await this.renderReviews();
        this.initMessaging();
        this.checkPendingChats();

        // Handle navigation from insufficient tokens alert
        if (localStorage.getItem('open_add_skill') === 'true') {
            localStorage.removeItem('open_add_skill');
            this.switchSection('my-skills');
            setTimeout(() => this.openAddSkillModal(), 300);
        }

        // Listen for real-time user updates
        document.addEventListener('userUpdated', (e) => {
            this.user = e.detail;
            this.renderUserInfo();
            this.renderStats();
            this.renderSkills();
            this.renderReviews();
        });
    }

    /**
     * Check for pending chats from other pages (like Explore)
     */
    checkPendingChats() {
        const pendingTeacherId = localStorage.getItem('pending_chat_target');
        if (pendingTeacherId) {
            localStorage.removeItem('pending_chat_target');
            // Give Firebase a moment to load
            setTimeout(() => {
                this.startNewChat(pendingTeacherId);
            }, 500);
        }
    }

    /**
     * Render user information in sidebar
     */
    renderUserInfo() {
        const avatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const welcomeName = document.getElementById('welcome-name');
        const tokenCount = document.getElementById('token-count');

        const initials = getInitials(this.user.firstName, this.user.lastName);
        avatar.textContent = initials;
        userName.textContent = `${this.user.firstName} ${this.user.lastName}`;
        welcomeName.textContent = this.user.firstName;
        tokenCount.textContent = this.user.tokens;
    }

    /**
     * Render dashboard statistics
     */
    renderStats() {
        document.getElementById('skills-count').textContent = this.user.skills ? this.user.skills.length : 0;
        document.getElementById('sessions-count').textContent = this.user.totalSessions || 0;
        document.getElementById('rating-value').textContent = (this.user.rating || 0).toFixed(1);
        document.getElementById('reviews-count').textContent = this.user.reviews ? this.user.reviews.length : 0;
    }

    /**
     * Render skills list
     */
    renderSkills() {
        const skillsList = document.getElementById('skills-list');
        
        if (this.user.skills.length === 0) {
            skillsList.innerHTML = '<p class="empty-state">You haven\'t added any skills yet. <a href="#" id="start-teaching">Start teaching</a></p>';
            return;
        }

        skillsList.innerHTML = this.user.skills.map(skill => `
            <div class="skill-card">
                <div class="skill-header">
                    <h3 class="skill-name">${skill.name}</h3>
                    <span class="skill-level">${skill.level}</span>
                </div>
                <p class="skill-description">${skill.description}</p>
                <div class="skill-meta">
                    <span class="skill-tokens">${skill.tokensPerHour} tokens/hr</span>
                    <div class="skill-actions">
                        <button class="edit-btn" onclick="dashboard.editSkill('${skill.id}')">Edit</button>
                        <button class="delete-btn" onclick="dashboard.deleteSkill('${skill.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render bookings
     */
    async renderBookings() {
        const upcomingBookings = document.getElementById('upcoming-bookings');
        const pastBookings = document.getElementById('past-bookings');

        if (!upcomingBookings || !pastBookings) return;

        const result = await authManager.getUserBookings(this.user.id);
        const bookings = result.success ? result.bookings : [];

        const upcoming = bookings.filter(b => b.status === 'confirmed' || !b.status);
        const past = bookings.filter(b => b.status === 'completed');

        const renderBookingCards = (bookingList, type) => {
            const learningList = bookingList.filter(b => b.learnerId === this.user.id);
            const teachingList = bookingList.filter(b => b.teacherId === this.user.id);

            const renderCard = (booking) => {
                const isLearner = booking.learnerId === this.user.id;
                const targetUserId = isLearner ? booking.teacherId : booking.learnerId;
                const hasReviewed = isLearner ? booking.reviewedByLearner : booking.reviewedByTeacher;
                
                return `
                <div class="booking-card">
                    <div>
                        <h3 style="color: var(--primary-color);">${booking.skillName}</h3>
                        <div class="booking-details" style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
                            <div><strong style="color:var(--text-secondary);">Role:</strong> ${booking.role}</div>
                            <div><strong style="color:var(--text-secondary);">With:</strong> ${booking.displayName}</div>
                            <div><strong style="color:var(--text-secondary);">Date:</strong> ${formatDate(booking.date)}</div>
                            <div><strong style="color:var(--text-secondary);">Time:</strong> ${booking.time}</div>
                            <div><strong style="color:var(--text-secondary);">Tokens:</strong> ${booking.tokensCost}</div>
                        </div>
                        <span class="booking-status" style="display:inline-block; margin-top:8px; padding:4px 8px; background:rgba(16,185,129,0.1); color:#10b981; border-radius:4px; font-size:12px;">${booking.status}</span>
                    </div>
                    <div class="booking-actions" style="display:flex; flex-direction:column; gap:8px;">
                        ${(booking.status === 'confirmed' || !booking.status) ? `
                            <button class="btn btn-primary" onclick="dashboard.startSession('${booking.id}')">Start</button>
                            <button class="btn btn-secondary" onclick="dashboard.startNewChat('${targetUserId}')">Message</button>
                            ${isLearner ? `<button class="btn btn-secondary" onclick="dashboard.completeSession('${booking.id}', '${targetUserId}', ${isLearner}, ${booking.tokensCost})">Complete Session</button>` : ''}
                        ` : `
                            <button class="btn btn-secondary" onclick="dashboard.startNewChat('${targetUserId}')">Message</button>
                            ${!hasReviewed ? `
                                <button class="btn btn-primary" onclick="dashboard.openReviewModal('${booking.id}', '${targetUserId}', ${isLearner})">Leave Review</button>
                            ` : `
                                <button class="btn btn-secondary" disabled>Completed & Reviewed</button>
                            `}
                        `}
                    </div>
                </div>
                `;
            };

            let html = '';

            // Sub-tabs toggle buttons
            html += `
            <div class="sub-tabs-container" style="display: flex; gap: 12px; margin-bottom: 24px; padding: 4px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; width: fit-content;">
                <button class="btn btn-primary" onclick="dashboard.toggleSubTab('${type}', 'learning')" id="${type}-learning-btn" style="border-radius: 20px; padding: 8px 24px; font-size: 14px; margin: 0; box-shadow: none;">Learning</button>
                <button class="btn" style="background: transparent; color: var(--text-secondary); border-radius: 20px; padding: 8px 24px; font-size: 14px; margin: 0; border: none;" onclick="dashboard.toggleSubTab('${type}', 'teaching')" id="${type}-teaching-btn">Teaching</button>
            </div>
            `;

            // Learning Section (Default visible)
            html += `<div id="${type}-learning-section" class="sub-tab-section">`;
            if (learningList.length === 0) {
                html += '<p class="empty-state">No learning sessions found</p>';
            } else {
                html += '<div style="display: flex; flex-direction: column; gap: 16px;">' + learningList.map(renderCard).join('') + '</div>';
            }
            html += `</div>`;

            // Teaching Section (Default hidden)
            html += `<div id="${type}-teaching-section" class="sub-tab-section" style="display: none;">`;
            if (teachingList.length === 0) {
                html += '<p class="empty-state">No teaching sessions found</p>';
            } else {
                html += '<div style="display: flex; flex-direction: column; gap: 16px;">' + teachingList.map(renderCard).join('') + '</div>';
            }
            html += `</div>`;

            return html;
        };

        upcomingBookings.innerHTML = renderBookingCards(upcoming, 'upcoming');
        pastBookings.innerHTML = renderBookingCards(past, 'past');
    }

    /**
     * Render user reviews
     */
    async renderReviews() {
        const reviewsList = document.getElementById('reviews-list');
        if (!reviewsList) return;

        const reviews = this.user.reviews || [];
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="empty-state">No reviews yet. Complete sessions to get reviews!</p>';
            return;
        }

        // Fetch reviewer names concurrently
        const reviewsWithReviewers = await Promise.all(reviews.map(async (review) => {
            const reviewer = await authManager.getUserById(review.reviewerId);
            return {
                ...review,
                reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Unknown User'
            };
        }));

        // Sort by date descending
        reviewsWithReviewers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        reviewsList.innerHTML = reviewsWithReviewers.map(review => `
            <div class="review-card" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <strong style="color: var(--text-primary); font-size: 16px;">${review.reviewerName}</strong>
                        <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">${new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div style="color: #fbbf24; font-size: 16px; letter-spacing: 2px;">
                        ${'★'.repeat(review.rating)}${'<span style="color: var(--glass-border)">★</span>'.repeat(5 - review.rating)}
                    </div>
                </div>
                <p style="color: var(--text-secondary); margin: 8px 0 0; line-height: 1.5; font-size: 14px;">${review.comment}</p>
            </div>
        `).join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Menu items & Bottom Nav items
        document.querySelectorAll('.menu-item, .bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(item.dataset.section);
            });
        });

        // Stat Cards Interactivity
        const statSkills = document.getElementById('stat-skills');
        if (statSkills) statSkills.addEventListener('click', () => this.switchSection('my-skills'));
        
        const statSessions = document.getElementById('stat-sessions');
        if (statSessions) statSessions.addEventListener('click', () => this.switchSection('bookings'));
        
        const statRating = document.getElementById('stat-rating');
        if (statRating) statRating.addEventListener('click', () => this.switchSection('reviews'));
        
        const statReviews = document.getElementById('stat-reviews');
        if (statReviews) statReviews.addEventListener('click', () => this.switchSection('reviews'));

        // Quick action buttons
        document.getElementById('add-skill-btn').addEventListener('click', () => {
            this.openAddSkillModal();
        });

        document.getElementById('explore-btn').addEventListener('click', () => {
            window.location.href = 'explore.html';
        });

        document.getElementById('message-btn').addEventListener('click', () => {
            this.switchSection('messages');
        });

        // Modal
        const modal = document.getElementById('add-skill-modal');
        const addSkillBtn = document.getElementById('add-skill-modal-btn');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-btn');
        const form = document.getElementById('add-skill-form');

        addSkillBtn.addEventListener('click', () => this.openAddSkillModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        form.addEventListener('submit', (e) => this.handleAddSkill(e));

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Review Modal
        const reviewModal = document.getElementById('review-modal');
        const reviewCloseBtn = document.getElementById('review-modal-close');
        const reviewCancelBtn = document.getElementById('cancel-review-btn');
        const reviewForm = document.getElementById('review-form');
        const stars = document.querySelectorAll('#star-rating-selector span');

        if (reviewModal) {
            reviewCloseBtn.addEventListener('click', () => this.closeReviewModal());
            reviewCancelBtn.addEventListener('click', () => this.closeReviewModal());
            reviewForm.addEventListener('submit', (e) => this.handleReviewSubmit(e));
            
            reviewModal.addEventListener('click', (e) => {
                if (e.target === reviewModal) {
                    this.closeReviewModal();
                }
            });

            stars.forEach(star => {
                star.addEventListener('mouseover', (e) => {
                    const rating = e.target.dataset.value;
                    stars.forEach(s => {
                        s.style.color = s.dataset.value <= rating ? '#fbbf24' : 'var(--glass-border)';
                    });
                });
                
                star.addEventListener('mouseout', () => {
                    const currentRating = document.getElementById('review-rating').value;
                    stars.forEach(s => {
                        s.style.color = currentRating && s.dataset.value <= currentRating ? '#fbbf24' : 'var(--glass-border)';
                    });
                });

                star.addEventListener('click', (e) => {
                    const rating = e.target.dataset.value;
                    document.getElementById('review-rating').value = rating;
                    stars.forEach(s => {
                        s.style.color = s.dataset.value <= rating ? '#fbbf24' : 'var(--glass-border)';
                        s.style.transform = s.dataset.value <= rating ? 'scale(1.2)' : 'scale(1)';
                        setTimeout(() => s.style.transform = 'scale(1)', 200);
                    });
                });
            });
        }

        // Chat Form
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => this.handleSendMessage(e));
        }
    }

    /**
     * Switch content section
     */
    switchSection(section) {
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
        });

        document.querySelectorAll('.menu-item, .bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        document.getElementById(section).classList.add('active');
        document.querySelectorAll(`[data-section="${section}"]`).forEach(item => {
            item.classList.add('active');
        });
    }

    /**
     * Switch tab
     */
    switchTab(tab) {
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
        });

        document.querySelectorAll('.bookings-list').forEach(list => {
            list.style.display = 'none';
        });

        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-bookings`).style.display = 'block';
    }

    /**
     * Toggle learning/teaching sub-tabs
     */
    toggleSubTab(type, tab) {
        // Hide both sections
        document.getElementById(`${type}-learning-section`).style.display = 'none';
        document.getElementById(`${type}-teaching-section`).style.display = 'none';

        // Update button styles
        const learningBtn = document.getElementById(`${type}-learning-btn`);
        const teachingBtn = document.getElementById(`${type}-teaching-btn`);
        
        if (tab === 'learning') {
            learningBtn.className = 'btn btn-primary';
            learningBtn.style.background = '';
            learningBtn.style.color = '';
            learningBtn.style.border = '';
            
            teachingBtn.className = 'btn';
            teachingBtn.style.background = 'transparent';
            teachingBtn.style.color = 'var(--text-secondary)';
            teachingBtn.style.border = 'none';
        } else {
            teachingBtn.className = 'btn btn-primary';
            teachingBtn.style.background = '';
            teachingBtn.style.color = '';
            teachingBtn.style.border = '';
            
            learningBtn.className = 'btn';
            learningBtn.style.background = 'transparent';
            learningBtn.style.color = 'var(--text-secondary)';
            learningBtn.style.border = 'none';
        }

        // Show active section
        document.getElementById(`${type}-${tab}-section`).style.display = 'block';
    }

    /**
     * Open add skill modal
     */
    openAddSkillModal() {
        document.getElementById('add-skill-modal').classList.add('show');
    }

    /**
     * Close add skill modal
     */
    closeModal() {
        document.getElementById('add-skill-modal').classList.remove('show');
        document.getElementById('add-skill-form').reset();
        this.editingSkillId = null;
        const modalTitle = document.querySelector('#add-skill-modal .modal-header h2');
        if (modalTitle) modalTitle.textContent = 'Add New Skill';
    }

    openReviewModal(bookingId, targetUserId, isLearner) {
        document.getElementById('review-booking-id').value = bookingId;
        document.getElementById('review-target-id').value = targetUserId;
        document.getElementById('review-is-learner').value = isLearner;
        document.getElementById('review-modal').classList.add('show');
    }

    closeReviewModal() {
        const modal = document.getElementById('review-modal');
        const content = modal.querySelector('.modal-content');
        
        modal.style.animation = 'none';
        modal.offsetHeight; // trigger reflow
        modal.style.animation = 'fadeIn 0.3s ease-out reverse';
        
        if (content) {
            content.style.animation = 'none';
            content.offsetHeight;
            content.style.animation = 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
        }

        setTimeout(() => {
            modal.classList.remove('show');
            modal.style.animation = '';
            if (content) content.style.animation = '';
            document.getElementById('review-form').reset();
            document.querySelectorAll('#star-rating-selector span').forEach(s => {
                s.style.color = 'var(--glass-border)';
                s.style.transform = 'scale(1)';
            });
            document.getElementById('review-rating').value = '';
        }, 280);
    }

    async handleReviewSubmit(e) {
        e.preventDefault();
        
        const bookingId = document.getElementById('review-booking-id').value;
        const targetUserId = document.getElementById('review-target-id').value;
        const isLearner = document.getElementById('review-is-learner').value === 'true';
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value;

        if (!rating) {
            window.showToast('Please select a rating', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const result = await authManager.addReviewToUser(targetUserId, bookingId, rating, comment, isLearner);
            if (result.success) {
                window.showToast('Review submitted successfully!', 'success');
                this.closeReviewModal();
                this.renderBookings(); // Refresh bookings to update button state
            } else {
                window.showToast(result.error || 'Failed to submit review', 'error');
            }
        } catch (error) {
            window.showToast('An error occurred', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
        }
    }

    /**
     * Handle add skill form submission
     */
    async handleAddSkill(e) {
        e.preventDefault();

        const skill = {
            name: document.getElementById('skill-name').value,
            description: document.getElementById('skill-description').value,
            category: document.getElementById('skill-category').value,
            level: document.getElementById('skill-level').value,
            tokensPerHour: parseInt(document.getElementById('tokens-per-hour').value)
        };

        let result;
        if (this.editingSkillId) {
            result = await authManager.updateSkill(this.editingSkillId, skill);
        } else {
            result = await authManager.addSkill(skill);
        }
        
        if (result.success) {
            this.user = getCurrentUser();
            window.showToast(this.editingSkillId ? 'Skill updated successfully!' : 'Skill added successfully!', 'success');
            this.closeModal();
            this.renderSkills();
            this.renderStats();
        } else {
            window.showToast(result.error, 'error');
        }
    }

    /**
     * Edit skill
     */
    editSkill(skillId) {
        const skill = this.user.skills.find(s => s.id === skillId);
        if (skill) {
            // Fill form with skill data
            document.getElementById('skill-name').value = skill.name;
            document.getElementById('skill-description').value = skill.description;
            document.getElementById('skill-category').value = skill.category || '';
            document.getElementById('skill-level').value = skill.level;
            document.getElementById('tokens-per-hour').value = skill.tokensPerHour;
            
            this.editingSkillId = skillId;
            const modalTitle = document.querySelector('#add-skill-modal .modal-header h2');
            if (modalTitle) modalTitle.textContent = 'Edit Skill';
            this.openAddSkillModal();
        }
    }

    /**
     * Delete skill
     */
    async deleteSkill(skillId) {
        if (confirm('Are you sure you want to delete this skill?')) {
            const result = await authManager.removeSkill(skillId);
            if (result.success) {
                this.user = getCurrentUser();
                window.showToast('Skill deleted successfully!', 'success');
                this.renderSkills();
                this.renderStats();
            } else {
                window.showToast(result.error, 'error');
            }
        }
    }

    /**
     * Complete session
     */
    async completeSession(bookingId, targetUserId, isLearner, tokensCost) {
        if (confirm('Are you sure you want to mark this session as completed?')) {
            const result = await authManager.completeBooking(bookingId, targetUserId, tokensCost);
            if (result.success) {
                this.user = getCurrentUser();
                window.showToast('Session marked as completed and tokens transferred!', 'success');
                this.renderBookings();
                this.renderStats();
                
                // Automatically prompt user to leave a review
                if (targetUserId !== undefined && isLearner !== undefined) {
                    this.openReviewModal(bookingId, targetUserId, isLearner);
                }
            } else {
                window.showToast(result.error, 'error');
            }
        }
    }

    /**
     * Start session (Live Video Call)
     */
    startSession(bookingId) {
        // Automatically create a secure, unique video room for this exact booking using Jitsi Meet
        const meetingUrl = `https://meet.jit.si/NeighborKnot_${bookingId}`;
        window.open(meetingUrl, '_blank');
        window.showToast('Joining live session room...', 'success');
    }

    /**
     * Reschedule booking
     */
    rescheduleBooking(bookingId) {
        // TODO: Implement reschedule modal
        window.showToast('Reschedule feature coming soon!', 'info');
    }

    // ==========================================
    // Messaging Logic
    // ==========================================

    initMessaging() {
        authManager.subscribeToUserChats((chats) => {
            this.renderConversations(chats);
        });
    }

    renderConversations(chats) {
        const unreadChatsCount = chats.filter(c => c.unreadCounts && c.unreadCounts[this.user.id] > 0).length;
        
        const badge = document.getElementById('message-badge');
        if (badge) {
            badge.textContent = unreadChatsCount;
            badge.style.display = unreadChatsCount > 0 ? 'inline-block' : 'none';
        }

        const list = document.getElementById('conversations-list');
        if (!list) return;

        if (chats.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 20px; text-align: center;">
                    <div class="empty-state-icon" style="font-size: 32px; margin-bottom: 12px;">💬</div>
                    <h3 style="margin: 0 0 8px;">No conversations yet</h3>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">Start a chat with a neighbor!</p>
                </div>`;
            return;
        }

        list.innerHTML = chats.map(chat => {
            const timeStr = chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
            const unreadCount = chat.unreadCounts && chat.unreadCounts[this.user.id] ? chat.unreadCounts[this.user.id] : 0;
            const isUnread = unreadCount > 0;
            
            return `
            <div class="conversation-item ${this.activeChatId === chat.id ? 'active' : ''}" onclick="dashboard.openChat('${chat.id}', '${chat.otherUser.firstName}', '${chat.otherUser.lastName}')" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--glass-border); cursor: pointer; transition: background 0.2s ease; ${isUnread ? 'background: rgba(16, 185, 129, 0.05); border-left: 3px solid var(--primary-color);' : ''}">
                <div class="user-avatar" style="width: 44px; height: 44px; font-size: 16px; flex-shrink: 0; ${isUnread ? 'border: 2px solid var(--primary-color);' : ''}">
                    ${getInitials(chat.otherUser.firstName, chat.otherUser.lastName)}
                </div>
                <div class="conversation-info" style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                        <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${isUnread ? 'font-weight: 700;' : ''}">${chat.otherUser.firstName} ${chat.otherUser.lastName}</h4>
                        <span style="font-size: 11px; color: ${isUnread ? 'var(--primary-color)' : 'var(--text-muted)'}; margin-left: 8px; flex-shrink: 0; ${isUnread ? 'font-weight: bold;' : ''}">${timeStr}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <p style="margin: 0; font-size: 13px; color: ${isUnread ? 'var(--text-primary)' : 'var(--text-secondary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${isUnread ? 'font-weight: 500;' : ''}">${chat.lastMessage || 'Start chatting!'}</p>
                        ${isUnread ? `<span style="background: var(--primary-color); color: white; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; margin-left: 8px; flex-shrink: 0;">${unreadCount}</span>` : ''}
                    </div>
                </div>
            </div>
        `}).join('');
    }

    async openChat(chatId, firstName, lastName) {
        this.activeChatId = chatId;
        
        // Mark as read immediately
        authManager.markChatAsRead(chatId);

        // Update UI
        document.getElementById('chat-header').style.display = 'flex';
        document.getElementById('chat-input-area').style.display = 'block';
        document.getElementById('chat-header-name').textContent = `${firstName} ${lastName}`;
        document.getElementById('chat-header-avatar').textContent = getInitials(firstName, lastName);
        
        // Highlight active conversation
        document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
        const activeItem = Array.from(document.querySelectorAll('.conversation-item')).find(item => item.innerHTML.includes(firstName));
        if (activeItem) activeItem.classList.add('active');

        // Unsubscribe from previous chat
        if (this.chatUnsubscribe) {
            this.chatUnsubscribe();
        }

        // Subscribe to new chat messages
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;">Loading messages...</div>';

        this.chatUnsubscribe = authManager.subscribeToMessages(chatId, (messages) => {
            if (messages.length === 0) {
                chatMessages.innerHTML = `
                    <div class="chat-placeholder" style="display:flex; flex-direction:column; height:100%; align-items:center; justify-content:center; color:var(--text-muted);">
                        <div style="font-size: 48px; margin-bottom: 16px;">👋</div>
                        <h3 style="margin: 0 0 8px; color: var(--text-primary);">Say hello!</h3>
                        <p style="margin: 0; text-align: center; max-width: 200px;">Send the first message to start the conversation.</p>
                    </div>`;
                return;
            }

            chatMessages.innerHTML = messages.map((msg, index) => {
                const isSentByMe = msg.senderId === this.user.id;
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                let dateDivider = '';
                if (index === 0 || new Date(messages[index-1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString()) {
                    const dateStr = new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
                    dateDivider = `<div class="chat-date-divider" style="text-align: center; margin: 20px 0 10px; color: var(--text-muted); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;"><span>${dateStr}</span></div>`;
                }

                return `
                    ${dateDivider}
                    <div class="chat-bubble ${isSentByMe ? 'sent' : 'received'}" style="animation: slideInUp 0.3s ease forwards; transform-origin: ${isSentByMe ? 'bottom right' : 'bottom left'};">
                        <div style="margin-bottom: 2px;">${msg.text}</div>
                        <div class="chat-time" style="font-size: 10px; opacity: 0.6; text-align: ${isSentByMe ? 'right' : 'left'}; margin-top: 4px;">${timeStr}</div>
                    </div>
                `;
            }).join('');

            // Add keyframes for animation if not present
            if (!document.getElementById('chat-animations')) {
                const style = document.createElement('style');
                style.id = 'chat-animations';
                style.innerHTML = `
                    @keyframes slideInUp {
                        from { opacity: 0; transform: translateY(10px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .conversation-item:hover { background: rgba(255,255,255,0.05) !important; }
                    .conversation-item.active { background: rgba(255,255,255,0.1) !important; border-left: 3px solid var(--primary-color); }
                `;
                document.head.appendChild(style);
            }

            // Scroll to bottom
            setTimeout(() => {
                chatMessages.scrollTo({
                    top: chatMessages.scrollHeight,
                    behavior: 'smooth'
                });
            }, 50);
        });
    }

    async handleSendMessage(e) {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        
        if (!text || !this.activeChatId) return;
        
        // Optimistic clear
        input.value = '';
        
        const result = await authManager.sendChatMessage(this.activeChatId, text);
        if (!result.success) {
            window.showToast('Failed to send message', 'error');
        }
    }

    /**
     * Start chat from booking or explore
     */
    async startNewChat(otherUserId) {
        const result = await authManager.getOrCreateChat(otherUserId);
        if (result.success) {
            this.switchSection('messages');
            const otherUser = await authManager.getUserById(otherUserId);
            if (otherUser) {
                this.openChat(result.chatId, otherUser.firstName, otherUser.lastName);
            }
        } else {
            window.showToast('Could not start chat', 'error');
        }
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});
