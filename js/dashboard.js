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
        this.initMessaging();
        this.checkPendingChats();
    }

    /**
     * Check for pending chats from other pages (like Explore)
     */
    checkPendingChats() {
        const pendingTeacherId = localStorage.getItem('neighborknot_pending_chat');
        if (pendingTeacherId) {
            localStorage.removeItem('neighborknot_pending_chat');
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
        document.getElementById('skills-count').textContent = this.user.skills.length;
        document.getElementById('sessions-count').textContent = this.user.totalSessions || 0;
        document.getElementById('rating-value').textContent = this.user.rating.toFixed(1);
        document.getElementById('reviews-count').textContent = this.user.reviews.length;
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

        const renderBookingCards = (bookingList) => {
            if (bookingList.length === 0) {
                return '<p class="empty-state">No bookings found</p>';
            }
            return bookingList.map(booking => `
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
                            <button class="btn btn-secondary" onclick="dashboard.startNewChat('${booking.learnerId === this.user.id ? booking.teacherId : booking.learnerId}')">Message</button>
                            <button class="btn btn-secondary" onclick="dashboard.completeSession('${booking.id}')">Complete Session</button>
                        ` : `
                            <button class="btn btn-secondary" onclick="dashboard.startNewChat('${booking.learnerId === this.user.id ? booking.teacherId : booking.learnerId}')">Message</button>
                            <button class="btn btn-secondary" disabled>Completed</button>
                        `}
                    </div>
                </div>
            `).join('');
        };

        upcomingBookings.innerHTML = renderBookingCards(upcoming);
        pastBookings.innerHTML = renderBookingCards(past);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(item.dataset.section);
            });
        });

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

        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        document.getElementById(section).classList.add('active');
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
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
            showNotification(this.editingSkillId ? 'Skill updated successfully!' : 'Skill added successfully!', 'success');
            this.closeModal();
            this.renderSkills();
            this.renderStats();
        } else {
            showNotification(result.error, 'error');
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
                showNotification('Skill deleted successfully!', 'success');
                this.renderSkills();
                this.renderStats();
            } else {
                showNotification(result.error, 'error');
            }
        }
    }

    /**
     * Complete session
     */
    async completeSession(bookingId) {
        if (confirm('Are you sure you want to mark this session as completed?')) {
            const result = await authManager.updateBookingStatus(bookingId, 'completed');
            if (result.success) {
                showNotification('Session marked as completed!', 'success');
                this.renderBookings();
                this.renderStats();
            } else {
                showNotification(result.error, 'error');
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
        showNotification('Joining live session room...', 'success');
    }

    /**
     * Reschedule booking
     */
    rescheduleBooking(bookingId) {
        // TODO: Implement reschedule modal
        showNotification('Reschedule feature coming soon!', 'info');
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
        const list = document.getElementById('conversations-list');
        if (!list) return;

        if (chats.length === 0) {
            list.innerHTML = '<p class="empty-state">No conversations yet</p>';
            return;
        }

        list.innerHTML = chats.map(chat => `
            <div class="conversation-item ${this.activeChatId === chat.id ? 'active' : ''}" onclick="dashboard.openChat('${chat.id}', '${chat.otherUser.firstName}', '${chat.otherUser.lastName}')">
                <div class="user-avatar" style="width: 40px; height: 40px; font-size: 14px;">
                    ${getInitials(chat.otherUser.firstName, chat.otherUser.lastName)}
                </div>
                <div class="conversation-info">
                    <h4>${chat.otherUser.firstName} ${chat.otherUser.lastName}</h4>
                    <p>${chat.lastMessage || 'Start chatting!'}</p>
                </div>
            </div>
        `).join('');
    }

    async openChat(chatId, firstName, lastName) {
        this.activeChatId = chatId;
        
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
                chatMessages.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-muted);">Say hello!</div>';
                return;
            }

            chatMessages.innerHTML = messages.map(msg => {
                const isSentByMe = msg.senderId === this.user.id;
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `
                    <div class="chat-bubble ${isSentByMe ? 'sent' : 'received'}">
                        <div>${msg.text}</div>
                        <div class="chat-time">${timeStr}</div>
                    </div>
                `;
            }).join('');

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
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
            showNotification('Failed to send message', 'error');
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
            showNotification('Could not start chat', 'error');
        }
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});
