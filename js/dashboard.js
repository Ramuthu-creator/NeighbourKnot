// Dashboard Module
class Dashboard {
    constructor() {
        requireAuth();
        this.user = getCurrentUser();
        this.init();
    }

    init() {
        this.renderUserInfo();
        this.setupEventListeners();
        this.renderStats();
        this.renderSkills();
        this.renderBookings();
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
    renderBookings() {
        const upcomingBookings = document.getElementById('upcoming-bookings');
        const pastBookings = document.getElementById('past-bookings');

        // Mock bookings data
        const bookings = [
            {
                id: '1',
                skillName: 'Guitar Lessons',
                userName: 'John Doe',
                date: '2024-04-20',
                time: '10:00 AM',
                status: 'confirmed'
            }
        ];

        if (bookings.length === 0) {
            upcomingBookings.innerHTML = '<p class="empty-state">No upcoming bookings</p>';
        } else {
            upcomingBookings.innerHTML = bookings.map(booking => `
                <div class="booking-card">
                    <div>
                        <h3>${booking.skillName}</h3>
                        <div class="booking-details">
                            <div>👤 ${booking.userName}</div>
                            <div>📅 ${formatDate(booking.date)}</div>
                            <div>⏰ ${booking.time}</div>
                        </div>
                        <span class="booking-status">${booking.status}</span>
                    </div>
                    <div class="booking-actions">
                        <button onclick="dashboard.startSession('${booking.id}')">Start</button>
                        <button onclick="dashboard.rescheduleBooking('${booking.id}')">Reschedule</button>
                    </div>
                </div>
            `).join('');
        }
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
    handleAddSkill(e) {
        e.preventDefault();

        const skill = {
            name: document.getElementById('skill-name').value,
            description: document.getElementById('skill-description').value,
            level: document.getElementById('skill-level').value,
            tokensPerHour: parseInt(document.getElementById('tokens-per-hour').value)
        };

        const result = auth.addSkill(skill);
        
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
    deleteSkill(skillId) {
        if (confirm('Are you sure you want to delete this skill?')) {
            const result = auth.removeSkill(skillId);
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
