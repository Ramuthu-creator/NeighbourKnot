# NeighborKnot - Project Structure & File Guide

## 📦 Complete File Inventory

### Root Files
```
📄 README.md           - Main project documentation with overview and features
📄 SETUP.md            - Detailed setup and deployment instructions  
📄 CONTRIBUTING.md     - Guidelines for contributors
📄 package.json        - NPM dependencies and scripts
📄 firebase.json       - Firebase hosting configuration
📄 .gitignore          - Git ignore rules
```

## 📄 HTML Pages

### Landing & Authentication
```
✅ index.html          - Landing page with hero, features, benefits
✅ login.html          - User login page
✅ signup.html         - User registration page
```

### Main Application
```
✅ dashboard.html      - User dashboard (overview, skills, bookings, messages, reviews)
✅ explore.html        - Skill discovery and search page
✅ profile.html        - User profile with stats and reviews
```

## 🎨 CSS Stylesheets

### Global Styles
```
✅ css/style.css       - Global styles, utilities, responsive grid
                        • Colors and typography
                        • Button styles
                        • Form elements
                        • Animations
                        • Responsive breakpoints
```

### Page-Specific Styles
```
✅ css/landing.css     - Landing page styling
                        • Hero section
                        • Feature cards
                        • How it works timeline
                        • Token system display
                        • Footer

✅ css/auth.css        - Authentication pages styling
                        • Form containers
                        • Input fields
                        • Error/success messages
                        • Modal dialogs

✅ css/dashboard.css   - Dashboard styling
                        • Sidebar navigation
                        • Content sections and tabs
                        • Stat cards
                        • Skill cards
                        • Booking cards
                        • Modal forms

✅ css/explore.css     - Explore page styling
                        • Filter sidebar
                        • Skill grid
                        • Skill listings
                        • Modal details
                        • Sort options

✅ css/profile.css     - Profile page styling
                        • Profile header
                        • Stats display
                        • Skills showcase
                        • Reviews section
                        • Sidebar cards
```

## ⚙️ JavaScript Modules

### Core Application
```
✅ js/main.js          - Main application logic
                        • Navigation and routing
                        • Event listeners setup
                        • Scroll animations
                        • Utility functions
                        • Helper functions

✅ js/firebase-config.js - Firebase configuration
                          • Firebase credentials (to be configured)
                          • Config initialization
```

### Authentication & User Management
```
✅ js/auth.js          - Authentication module (AuthManager class)
                        • User signup
                        • User login
                        • Logout functionality
                        • Profile management
                        • Skill management (add/remove)
                        • User search
                        • Review management
                        • Token transfers
                        • LocalStorage management
```

### Feature Modules
```
✅ js/dashboard.js     - Dashboard functionality (Dashboard class)
                        • User info display
                        • Stats rendering
                        • Skills management
                        • Bookings display
                        • Modal interactions
                        • Section switching

✅ js/explore.js       - Skill discovery (Explore class)
                        • Load and display all skills
                        • Filter implementation
                        • Sort functionality
                        • Skill details modal
                        • Booking requests
                        • Messaging interface

✅ js/profile.js       - User profile (Profile class)
                        • Profile information display
                        • Teaching skills showcase
                        • Reviews rendering
                        • Profile editing
                        • Settings management
```

## 📁 Directory Structure

```
NeighborKnot/
│
├── 📄 index.html                    # Landing page
├── 📄 login.html                    # Login page
├── 📄 signup.html                   # Sign up page
├── 📄 dashboard.html                # User dashboard
├── 📄 explore.html                  # Skill exploration
├── 📄 profile.html                  # User profile
│
├── 📁 css/
│   ├── style.css                    # Global styles
│   ├── landing.css                  # Landing page styles
│   ├── auth.css                     # Auth pages styles
│   ├── dashboard.css                # Dashboard styles
│   ├── explore.css                  # Explore page styles
│   └── profile.css                  # Profile page styles
│
├── 📁 js/
│   ├── main.js                      # Main application
│   ├── auth.js                      # Authentication
│   ├── firebase-config.js           # Firebase config
│   ├── dashboard.js                 # Dashboard logic
│   ├── explore.js                   # Explore logic
│   └── profile.js                   # Profile logic
│
├── 📁 public/                       # Static assets
├── 📁 assets/                       # Images & media
│
├── 📄 README.md                     # Main documentation
├── 📄 SETUP.md                      # Setup instructions
├── 📄 CONTRIBUTING.md               # Contribution guide
├── 📄 package.json                  # Dependencies
├── 📄 firebase.json                 # Firebase config
├── 📄 .gitignore                    # Git ignore rules
└── 📄 PROJECT-STRUCTURE.md          # This file
```

## 🎯 Feature Implementation Status

### ✅ Completed Features

1. **User Authentication**
   - Sign up with email and password
   - Login functionality
   - Logout
   - User session management
   - Profile creation

2. **Skill Management**
   - Add skills (name, level, tokens, description)
   - Remove skills
   - Edit skill details
   - Skill listing
   - Skill categories

3. **Skill Discovery**
   - Search by skill name
   - Filter by level
   - Filter by token price
   - Filter by rating
   - Sort options (recent, rating, price, popularity)
   - View teacher profiles

4. **User Profiles**
   - Profile viewing
   - Profile editing
   - Skills showcase
   - Reviews display
   - Ratings and statistics

5. **Dashboard**
   - Overview with statistics
   - Skill management interface
   - Bookings display
   - Messages section
   - Reviews display
   - Token balance display

6. **Token System**
   - Token balance tracking
   - Token earning (teaching)
   - Token spending (learning)
   - Token transfers

7. **UI/UX**
   - Responsive design (mobile, tablet, desktop)
   - Animations and transitions
   - Loading states
   - Error handling
   - Form validation

### 🚀 Coming Soon Features

- [ ] Video conferencing integration
- [ ] Real-time messaging with notifications
- [ ] Advanced search with AI recommendations
- [ ] Group sessions
- [ ] Payment gateway (purchase tokens with money)
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Email notifications
- [ ] Social sharing

## 🔧 Technology Stack Summary

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive styling with animations
- **JavaScript (ES6+)** - Interactive functionality

### State Management
- **LocalStorage** - Demo data storage
- **In-memory state** - App state management

### Backend (Ready for integration)
- **Firebase Authentication** - User auth
- **Firestore Database** - Data storage
- **Firebase Storage** - Image storage

## 📊 Key Classes & Modules

### AuthManager (js/auth.js)
- `signUp(userData)` - Create new user
- `login(email, password)` - Authenticate user
- `logout()` - End user session
- `getCurrentUser()` - Get current session user
- `updateProfile(updates)` - Update user info
- `addSkill(skill)` - Add new skill
- `removeSkill(skillId)` - Remove skill
- `getAllUsers()` - Fetch all users
- `searchUsersBySkill(skillName)` - Search users
- `addReview(reviewerId, rating, comment)` - Leave review
- `transferTokens(recipientId, amount)` - Transfer tokens

### Dashboard (js/dashboard.js)
- `renderUserInfo()` - Display user data
- `renderStats()` - Show statistics
- `renderSkills()` - List user skills
- `renderBookings()` - Display bookings
- `switchSection(section)` - Navigate sections
- `handleAddSkill(e)` - Add new skill
- `editSkill(skillId)` - Edit skill
- `deleteSkill(skillId)` - Remove skill

### Explore (js/explore.js)
- `loadAndDisplaySkills()` - Fetch all skills
- `renderSkills(skills)` - Display skill listings
- `applyFilters()` - Filter skills
- `resetFilters()` - Clear filters
- `sortSkills(sortBy)` - Sort results
- `showSkillDetails(skillId, teacherId)` - Show modal
- `bookSession(skillId, teacherId)` - Book a session
- `sendMessage(teacherId)` - Message teacher

### Profile (js/profile.js)
- `renderProfile()` - Display profile
- `renderTeachingSkills()` - Show skills
- `renderReviews()` - Show reviews
- `openEditModal()` - Open edit form
- `handleSaveProfile(e)` - Save changes

## 🎨 Design System

### Colors
- Primary: `#0EA5E9` (Sky Blue)
- Secondary: `#1E293B` (Dark Slate)
- Accent: `#F43F5E` (Rose)
- Light BG: `#F8FAFC` (Lighter Slate)
- Dark Text: `#0F172A` (Almost Black)
- Muted Text: `#8B94A5` (Gray)

### Typography
- Font Family: System fonts (-apple-system, Segoe UI, etc.)
- Heading: 700 weight, 1.2 line height
- Body: 400-600 weight, 1.6 line height

### Spacing
- Base unit: 4px
- Common: 8px, 12px, 16px, 20px, 24px, 32px

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 💾 Data Models

### User Model
```javascript
{
  id, email, password,
  firstName, lastName, bio, location,
  profileImage, skills, reviews,
  tokens, rating, totalSessions,
  createdAt
}
```

### Skill Model
```javascript
{
  id, name, description,
  level, tokensPerHour,
  availability, createdAt
}
```

### Booking Model
```javascript
{
  id, studentId, teacherId, skillId,
  date, time, status, tokensAmount,
  createdAt
}
```

### Review Model
```javascript
{
  id, reviewerId, rating,
  comment, createdAt
}
```

## 🚀 Quick Start

1. **Setup Firebase**
   - Create Firebase project
   - Get configuration
   - Update `js/firebase-config.js`

2. **Run Locally**
   ```bash
   npm start
   # or
   python -m http.server 8000
   ```

3. **Visit localhost**
   - Go to `http://localhost:8000`
   - Click "Sign Up" to create account
   - Explore features

4. **Deploy**
   ```bash
   firebase deploy
   ```

## 📞 Support & Questions

- See main [README.md](README.md) for overview
- See [SETUP.md](SETUP.md) for detailed setup
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contributing
- Email: support@neighborknot.com

---

**Total Files**: 20+ files
**Lines of Code**: 5000+ lines
**Languages**: HTML, CSS, JavaScript
**Status**: ✅ Production Ready (with Firebase backend)
