// Explore Module
class Explore {
    constructor() {
        requireAuth();
        this.currentUser = getCurrentUser();
        this.filteredSkills = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadAndDisplaySkills();
    }

    /**
     * Load all skills from all users
     */
    async loadAndDisplaySkills() {
        const allUsers = await authManager.getAllUsers();
        const allSkills = [];

        allUsers.forEach(user => {
            if (user.id !== this.currentUser.id) { // Don't show own skills
                user.skills.forEach(skill => {
                    allSkills.push({
                        ...skill,
                        teacherId: user.id,
                        teacherName: `${user.firstName} ${user.lastName}`,
                        teacherRating: user.rating,
                        teacherReviews: user.reviews.length,
                        teacherInitials: getInitials(user.firstName, user.lastName)
                    });
                });
            }
        });

        this.filteredSkills = allSkills;
        this.renderSkills(allSkills);
    }

    /**
     * Render skills grid
     */
    renderSkills(skills) {
        const skillsGrid = document.getElementById('skills-grid');

        if (skills.length === 0) {
            skillsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No skills found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            return;
        }

        skillsGrid.innerHTML = skills.map(skill => `
            <div class="skill-listing" onclick="explore.showSkillDetails('${skill.id}', '${skill.teacherId}')">
                <div class="skill-listing-header">
                    <div class="skill-listing-title">${skill.name}</div>
                    <div class="skill-listing-level">${skill.level}</div>
                </div>
                <div class="skill-listing-body">
                    <p class="skill-listing-description">${skill.description}</p>
                    
                    <div class="skill-listing-teacher">
                        <div class="teacher-avatar">${skill.teacherInitials}</div>
                        <div class="teacher-info">
                            <h4>${skill.teacherName}</h4>
                            <p>${skill.teacherReviews} reviews</p>
                        </div>
                    </div>

                    <div class="skill-listing-meta">
                        <div class="skill-rating">
                            ${this.renderStars(skill.teacherRating)}
                            <span>${skill.teacherRating.toFixed(1)}</span>
                        </div>
                        <div class="skill-tokens-cost">${skill.tokensPerHour} tokens/hr</div>
                    </div>

                    <div class="skill-listing-footer">
                        <button class="book-btn">Book Session</button>
                        <button class="view-btn">View Profile</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render star rating
     */
    renderStars(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < Math.floor(rating)) {
                stars += '⭐';
            } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                stars += '⭐';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }

    /**
     * Show skill details modal
     */
    async showSkillDetails(skillId, teacherId) {
        const skill = this.filteredSkills.find(s => s.id === skillId);
        const teacher = await authManager.getUserById(teacherId);

        const modalBody = document.getElementById('skill-modal-body');
        modalBody.innerHTML = `
            <div class="skill-details">
                <div class="details-header">
                    <div class="details-avatar">${skill.teacherInitials}</div>
                    <div class="details-info">
                        <h2>${skill.name}</h2>
                        <p class="details-teacher">by ${skill.teacherName}</p>
                        <div class="details-rating">
                            ${this.renderStars(skill.teacherRating)}
                            <span>(${skill.teacherReviews} reviews)</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Description</h3>
                    <p class="details-description">${skill.description}</p>
                </div>

                <div class="details-section">
                    <h3>Details</h3>
                    <div class="details-schedule">
                        <div class="schedule-item">📚 Level: <span class="badge">${skill.level}</span></div>
                        <div class="schedule-item">🪙 Cost: <span class="highlight">${skill.tokensPerHour} tokens/hr</span></div>
                        <div class="schedule-item">👤 Students: ${Math.floor(Math.random() * 50) + 1}</div>
                    </div>
                </div>

                <div class="details-section">
                    <h3>About the Teacher</h3>
                    <p class="details-description">${teacher.bio || 'No bio available'}</p>
                    <p class="details-location">
                        📍 ${teacher.location || 'Location not specified'}
                    </p>
                </div>

                <div class="modal-buttons">
                    <button type="button" class="btn btn-secondary" onclick="explore.sendMessage('${teacherId}')">Message</button>
                    <button type="button" class="btn btn-primary" onclick="explore.bookSession('${skillId}', '${teacherId}')">Book Session</button>
                </div>
            </div>
        `;

        document.getElementById('skill-modal').classList.add('show');
    }

    /**
     * Book a session
     */
    async bookSession(skillId, teacherId) {
        const skill = this.filteredSkills.find(s => s.id === skillId);
        
        if (this.currentUser.tokens < skill.tokensPerHour) {
            showNotification('Insufficient tokens! You need ' + skill.tokensPerHour + ' tokens to book this session.', 'error');
            return;
        }

        const transferResult = await authManager.transferTokens(teacherId, skill.tokensPerHour, 'Booking: ' + skill.name);
        if (!transferResult.success) {
            showNotification('Failed to transfer tokens: ' + transferResult.error, 'error');
            return;
        }

        const bookingData = {
            teacherId: teacherId,
            skillId: skillId,
            skillName: skill.name,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
            tokensCost: skill.tokensPerHour
        };

        const bookingResult = await authManager.createBooking(bookingData);
        if (bookingResult.success) {
            this.currentUser.tokens -= skill.tokensPerHour;
            showNotification('Successfully booked session for ' + skill.name + '!', 'success');
            document.getElementById('skill-modal').classList.remove('show');
        } else {
            showNotification('Failed to create booking: ' + bookingResult.error, 'error');
        }
    }

    /**
     * Send message to teacher
     */
    sendMessage(teacherId) {
        // Store intent in localStorage to be picked up by dashboard
        localStorage.setItem('neighborknot_pending_chat', teacherId);
        window.location.href = 'dashboard.html';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close modal
        document.querySelector('.modal-close').addEventListener('click', () => {
            document.getElementById('skill-modal').classList.remove('show');
        });

        document.getElementById('skill-modal').addEventListener('click', (e) => {
            if (e.target.id === 'skill-modal') {
                document.getElementById('skill-modal').classList.remove('show');
            }
        });

        // Tokens range slider
        const tokensRange = document.getElementById('tokens-range');
        const tokensDisplay = document.getElementById('tokens-display');
        tokensRange.addEventListener('input', (e) => {
            tokensDisplay.textContent = `Up to ${e.target.value} tokens`;
        });

        // Sort by
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.sortSkills(e.target.value);
        });

        // Search input
        document.getElementById('search-input').addEventListener('input', debounce(() => {
            this.applyFilters();
        }, 300));
    }

    /**
     * Apply filters
     */
    applyFilters() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const selectedLevels = Array.from(document.querySelectorAll('input[name="level"]:checked')).map(el => el.value);
        const maxTokens = parseInt(document.getElementById('tokens-range').value);
        const minRating = parseFloat(document.querySelector('input[name="rating"]:checked').value || 0);

        let filtered = this.filteredSkills.filter(skill => {
            const matchesSearch = skill.name.toLowerCase().includes(searchTerm) ||
                                skill.description.toLowerCase().includes(searchTerm);
            const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(skill.level);
            const matchesTokens = skill.tokensPerHour <= maxTokens;
            const matchesRating = skill.teacherRating >= minRating;

            return matchesSearch && matchesLevel && matchesTokens && matchesRating;
        });

        this.filteredSkills = filtered;
        this.renderSkills(filtered);
    }

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('tokens-range').value = 50;
        document.getElementById('tokens-display').textContent = 'Up to 50 tokens';
        document.querySelectorAll('input[name="level"]').forEach(el => el.checked = false);
        document.querySelectorAll('input[name="rating"]').forEach(el => el.checked = false);
        document.querySelector('input[name="rating"]').checked = true;

        this.loadAndDisplaySkills();
    }

    /**
     * Sort skills
     */
    sortSkills(sortBy) {
        const skills = [...this.filteredSkills];

        switch(sortBy) {
            case 'recent':
                skills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'rating':
                skills.sort((a, b) => b.teacherRating - a.teacherRating);
                break;
            case 'price':
                skills.sort((a, b) => a.tokensPerHour - b.tokensPerHour);
                break;
            case 'popularity':
                skills.sort((a, b) => b.teacherReviews - a.teacherReviews);
                break;
        }

        this.filteredSkills = skills;
        this.renderSkills(skills);
    }
}

// Initialize explore
let explore;
document.addEventListener('DOMContentLoaded', () => {
    explore = new Explore();
});
