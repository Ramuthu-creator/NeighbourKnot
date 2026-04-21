// Profile Module
class Profile {
    constructor() {
        requireAuth();
        this.user = getCurrentUser();
        this.init();
    }

    init() {
        this.renderProfile();
        this.setupEventListeners();
    }

    /**
     * Render profile information
     */
    async renderProfile() {
        const initials = getInitials(this.user.firstName, this.user.lastName);
        
        document.getElementById('profile-avatar').textContent = initials;
        document.getElementById('profile-name').textContent = `${this.user.firstName} ${this.user.lastName}`;
        document.getElementById('profile-location').textContent = `📍 ${this.user.location}`;
        document.getElementById('profile-bio').textContent = this.user.bio || 'No bio added yet.';
        document.getElementById('profile-rating').textContent = this.user.rating.toFixed(1);
        document.getElementById('profile-reviews').textContent = this.user.reviews.length;
        document.getElementById('profile-sessions').textContent = this.user.totalSessions || 0;
        
        // Member since
        const createdDate = new Date(this.user.createdAt);
        document.getElementById('member-since').textContent = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });

        // Teaching skills
        this.renderTeachingSkills();

        // Reviews
        await this.renderReviews();
    }

    /**
     * Render teaching skills
     */
    renderTeachingSkills() {
        const skillsContainer = document.getElementById('teaching-skills');

        if (this.user.skills.length === 0) {
            skillsContainer.innerHTML = '<p class="empty">No skills added yet. <a href="dashboard.html">Add skills</a></p>';
            return;
        }

        skillsContainer.innerHTML = this.user.skills.map(skill => `
            <div class="skill-showcase-card">
                <h3>${skill.name}</h3>
                <p><strong>Level:</strong> ${skill.level}</p>
                <p><strong>Price:</strong> ${skill.tokensPerHour} tokens/hr</p>
                <p>${skill.description}</p>
            </div>
        `).join('');
    }

    /**
     * Render reviews
     */
    async renderReviews() {
        const reviewsContainer = document.getElementById('profile-reviews-list');

        if (this.user.reviews.length === 0) {
            reviewsContainer.innerHTML = '<p class="empty">No reviews yet. Complete sessions to get reviews!</p>';
            return;
        }

        let reviewsHTML = '';
        for (const review of this.user.reviews) {
            const reviewer = await authManager.getUserById(review.reviewerId);
            reviewsHTML += `
                <div class="review-showcase-card">
                    <div class="review-author-name">${reviewer?.firstName || 'User'} ${reviewer?.lastName || ''}</div>
                    <div class="review-rating-stars">${'⭐'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    <div class="review-text">"${review.comment}"</div>
                    <div class="review-date">${formatDate(review.createdAt)}</div>
                </div>
            `;
        }
        reviewsContainer.innerHTML = reviewsHTML;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const editBtn = document.getElementById('edit-profile-btn');
        const modal = document.getElementById('edit-profile-modal');
        const form = document.getElementById('edit-profile-form');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-profile-btn');

        editBtn.addEventListener('click', () => this.openEditModal());
        closeBtn.addEventListener('click', () => this.closeEditModal());
        cancelBtn.addEventListener('click', () => this.closeEditModal());
        form.addEventListener('submit', (e) => this.handleSaveProfile(e));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditModal();
            }
        });
    }

    /**
     * Open edit profile modal
     */
    openEditModal() {
        document.getElementById('edit-firstName').value = this.user.firstName;
        document.getElementById('edit-lastName').value = this.user.lastName;
        document.getElementById('edit-location').value = this.user.location;
        document.getElementById('edit-bio').value = this.user.bio;
        
        document.getElementById('edit-profile-modal').classList.add('show');
    }

    /**
     * Close edit profile modal
     */
    closeEditModal() {
        document.getElementById('edit-profile-modal').classList.remove('show');
    }

    /**
     * Handle save profile
     */
    handleSaveProfile(e) {
        e.preventDefault();

        const updates = {
            firstName: document.getElementById('edit-firstName').value,
            lastName: document.getElementById('edit-lastName').value,
            location: document.getElementById('edit-location').value,
            bio: document.getElementById('edit-bio').value
        };

        const result = auth.updateProfile(updates);

        if (result.success) {
            this.user = result.user;
            this.renderProfile();
            this.closeEditModal();
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification(result.error, 'error');
        }
    }
}

// Initialize profile
let profile;
document.addEventListener('DOMContentLoaded', () => {
    profile = new Profile();
});
