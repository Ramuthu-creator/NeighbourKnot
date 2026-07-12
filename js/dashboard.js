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
            this.user = getCurrentUser();
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
                this.user = getCurrentUser();
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
                this.user = getCurrentUser();
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
        const badge = document.getElementById('message-badge');
        if (badge) {
            badge.textContent = chats.length;
            badge.style.display = chats.length > 0 ? 'inline-block' : 'none';
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
            return `
            <div class="conversation-item ${this.activeChatId === chat.id ? 'active' : ''}" onclick="dashboard.openChat('${chat.id}', '${chat.otherUser.firstName}', '${chat.otherUser.lastName}')" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--glass-border); cursor: pointer; transition: background 0.2s ease;">
                <div class="user-avatar" style="width: 44px; height: 44px; font-size: 16px; flex-shrink: 0;">
                    ${getInitials(chat.otherUser.firstName, chat.otherUser.lastName)}
                </div>
                <div class="conversation-info" style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                        <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${chat.otherUser.firstName} ${chat.otherUser.lastName}</h4>
                        <span style="font-size: 11px; color: var(--text-muted); margin-left: 8px; flex-shrink: 0;">${timeStr}</span>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${chat.lastMessage || 'Start chatting!'}</p>
                </div>
            </div>
        `}).join('');
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
