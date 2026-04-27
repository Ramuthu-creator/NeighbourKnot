// Dashboard Module
class Dashboard {
    constructor() {
        requireAuth();
        this.user = getCurrentUser();
        this.init();
    }

    async init() {
        this.renderUserInfo();
        this.setupEventListeners();
        this.renderStats();
        this.renderSkills();
        await this.renderBookings();
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

        const now = new Date();
        const upcoming = bookings.filter(b => new Date(b.date) >= now);
        const past = bookings.filter(b => new Date(b.date) < now);

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
                        <button class="btn btn-primary" onclick="dashboard.startSession('${booking.id}')">Start</button>
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
    }

    /**
     * Handle add skill form submission
     */
    async handleAddSkill(e) {
        e.preventDefault();

        const skill = {
            name: document.getElementById('skill-name').value,
            description: document.getElementById('skill-description').value,
            level: document.getElementById('skill-level').value,
            tokensPerHour: parseInt(document.getElementById('tokens-per-hour').value)
        };

        const result = await authManager.addSkill(skill);
        
        if (result.success) {
            showNotification('Skill added successfully!', 'success');
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
            document.getElementById('skill-level').value = skill.level;
            document.getElementById('tokens-per-hour').value = skill.tokensPerHour;
            
            // TODO: Update form submission to handle edit instead of add
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
     * Start session
     */
    startSession(bookingId) {
        // TODO: Implement video call or session start
        showNotification('Starting session...', 'info');
    }

    /**
     * Reschedule booking
     */
    rescheduleBooking(bookingId) {
        // TODO: Implement reschedule modal
        showNotification('Reschedule feature coming soon!', 'info');
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});
