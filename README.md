# NeighborKnot - Learn, Teach, and Grow Without Money

NeighborKnot is a community-driven skill exchange platform that enables people to learn and teach skills using a token-based system instead of money. Break financial barriers and build meaningful connections in your neighborhood.

## 🎯 Project Overview

### Problem
- Many people want to learn new skills but cannot afford courses
- Many people have valuable skills but no way to share them  
- Community interaction is very limited

### Solution
A web platform where users exchange skills using tokens instead of money, making learning accessible and community-driven.

## ✨ Key Features

### 1. **User Profiles**
- Create verified local profiles
- Showcase skills and expertise
- Display ratings and reviews
- Manage personal information

### 2. **Skill Listings**
- List skills you want to teach
- Include skill level (Beginner to Expert)
- Set token pricing per hour
- Add detailed descriptions

### 3. **Search & Discovery**
- Search for skills by name
- Filter by level, tokens, and rating
- Sort by rating, price, or popularity
- Find skilled teachers in your area

### 4. **Booking System**
- Schedule sessions with teachers
- Manage upcoming and past bookings
- Automatic token transfer after sessions
- Session confirmation and tracking

### 5. **Messaging System**
- Direct messaging between users
- Coordinate session details
- Build community connections
- Real-time notifications

### 6. **Ratings & Reviews**
- Rate teachers after sessions
- Leave detailed reviews
- Build reputation through feedback
- Maintain platform quality

### 7. **Token System**
- Earn tokens by teaching
- Spend tokens to learn
- Bonus rewards for achievements
- Fair and balanced ecosystem

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Responsive design and animations
- **JavaScript (ES6+)** - Interactive functionality

### Backend & Database
- **Firebase** - Authentication and real-time database
- **Firebase Storage** - User profile images
- **Firebase Cloud Functions** - Business logic

### Architecture
- Client-side storage (localStorage) for demo
- Modular JavaScript architecture
- Responsive design for all devices

## 📁 Project Structure

```
NeighborKnot/
├── index.html              # Landing page
├── login.html              # Login page
├── signup.html             # Sign up page
├── dashboard.html          # User dashboard
├── explore.html            # Skill discovery page
├── profile.html            # User profile page
│
├── css/
│   ├── style.css           # Global styles
│   ├── landing.css         # Landing page styles
│   ├── auth.css            # Authentication pages styles
│   ├── dashboard.css       # Dashboard styles
│   ├── explore.css         # Explore page styles
│   └── profile.css         # Profile page styles
│
├── js/
│   ├── main.js             # Main application logic
│   ├── auth.js             # Authentication module
│   ├── firebase-config.js  # Firebase configuration
│   ├── dashboard.js        # Dashboard functionality
│   ├── explore.js          # Explore/discovery logic
│   └── profile.js          # Profile management
│
├── public/                 # Static assets
├── assets/                 # Images and media
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (for production deployment)
- Node.js (optional, for local development server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NeighborKnot.git
   cd NeighborKnot
   ```

2. **Set up Firebase Configuration**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Get your Firebase configuration
   - Update `js/firebase-config.js`:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

3. **Set up Firebase Authentication**
   - Enable Email/Password authentication
   - Configure Firestore Database
   - Set up Security Rules

### Running the Application

#### Option 1: Using a Local Server
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server
```

Then open `http://localhost:8000` in your browser.

#### Option 2: Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📖 Usage Guide

### For New Users

1. **Sign Up**
   - Click "Sign Up" on the landing page
   - Fill in your details (name, email, location)
   - Choose your role (Learner, Teacher, or Both)
   - Create your account

2. **Create Profile**
   - Add a bio and profile picture
   - Join your community

### For Teachers

1. **Add Skills**
   - Go to Dashboard → My Skills
   - Click "Add Skill"
   - Enter skill name, description, level, and token price
   - Save skill

2. **Manage Bookings**
   - View incoming booking requests
   - Accept or reschedule sessions
   - Mark sessions as complete

3. **Earn Tokens**
   - Complete teaching sessions
   - Receive tokens from students
   - Earn bonus rewards

### For Learners

1. **Search Skills**
   - Go to "Explore Skills"
   - Search or filter by category
   - View teacher profiles and ratings

2. **Book Sessions**
   - Click "Book Session"
   - Select date and time
   - Confirm booking (tokens deducted)
   - Attend session or reschedule

3. **Leave Reviews**
   - After session completion
   - Rate teacher 1-5 stars
   - Leave detailed feedback

## 🔐 Security Features

- Password hashing and encryption
- Email verification
- User authentication with sessions
- Secure token transfers
- Data validation and sanitization
- Protected API endpoints

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, mobile
- **Accessibility** - WCAG 2.1 compliant
- **Loading States** - Smooth transitions and feedback
- **Error Handling** - User-friendly error messages
- **Dark Mode Ready** - Easy to implement
- **Animations** - Smooth micro-interactions

## 📊 Database Schema

### Users Collection
```
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  bio: string,
  location: string,
  profileImage: string,
  skills: [Skill],
  tokens: number,
  rating: number,
  reviews: [Review],
  totalSessions: number,
  createdAt: timestamp
}
```

### Skills Collection
```
{
  id: string,
  name: string,
  description: string,
  level: string (Beginner|Intermediate|Advanced|Expert),
  tokensPerHour: number,
  availability: [Time],
  createdAt: timestamp
}
```

### Bookings Collection
```
{
  id: string,
  studentId: string,
  teacherId: string,
  skillId: string,
  date: date,
  time: time,
  status: string (pending|confirmed|completed|cancelled),
  tokensAmount: number,
  createdAt: timestamp
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## 📝 Future Enhancements

- [ ] Video calling integration (Agora/Twilio)
- [ ] Real-time notifications
- [ ] Advanced profiles with certifications
- [ ] Group sessions support
- [ ] Mobile app (React Native)
- [ ] Payment integration for token purchases
- [ ] AI recommendation engine
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Accessibility improvements

## 🐛 Known Issues

- Demo uses localStorage (not persistent across browsers)
- Video conferencing not yet implemented
- Email notifications pending Firebase setup
- Real-time messaging coming soon

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Team

- **Kalana Neranjana** (A-0003) - Product Design & Strategy
- **Ramuthu Theniya** (A-0006) - Development & Backend
- **Thrilakshi** (B-0001) - UI/UX Design

## 📞 Support

For support, email support@neighborknot.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Firebase for backend services
- Community feedback and testing
- Open-source libraries and resources

---

**Skills are a currency.** We believe in empowering communities through skill sharing. Join NeighborKnot today!

