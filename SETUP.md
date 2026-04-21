# NeighborKnot Setup Guide

This guide will help you set up and run the NeighborKnot application locally or deploy it to production.

## Prerequisites

Before you begin, ensure you have:
- A modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Git installed on your machine
- Node.js and npm (optional, for using npm scripts)
- A Firebase account

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/NeighborKnot.git
cd NeighborKnot
```

### Step 2: Install Dependencies

```bash
npm install
```

Or if you only want Firebase tools:

```bash
npm install -g firebase-tools
```

### Step 3: Configure Firebase

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add Project"
   - Follow the setup wizard
   - Enable Google Analytics (optional)

2. **Get Your Firebase Config**
   - In Firebase Console, go to Project Settings
   - Click on your web app
   - Copy the configuration object

3. **Update Firebase Config**
   - Open `js/firebase-config.js`
   - Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 4: Set Up Firebase Services

1. **Enable Authentication**
   - Go to Firebase Console → Authentication
   - Click "Get Started"
   - Enable "Email/Password"
   - Click "Anonymous" (optional, for testing)

2. **Set Up Firestore Database**
   - Go to Firebase Console → Firestore Database
   - Click "Create Database"
   - Start in "Test Mode" (development)
   - Choose your region
   - Click "Create"

3. **Set Up Storage** (for profile images)
   - Go to Firebase Console → Storage
   - Click "Get Started"
   - Keep default settings
   - Click "Done"

### Step 5: Run the Development Server

Use one of these methods:

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js with http-server:**
```bash
npm start
```

Or manually install and run:
```bash
npx http-server
```

**Using Live Server VSCode Extension:**
- Install "Live Server" extension in VSCode
- Right-click `index.html`
- Select "Open with Live Server"

### Step 6: Open in Browser

Visit: `http://localhost:8000`

## Testing the Application

### Create Test Accounts

1. **Sign Up as Teacher**
   - Go to Sign Up
   - Fill in details (e.g., John Teacher, john@teacher.com)
   - Select "Both" or "Teacher"
   - Click Submit

2. **Sign Up as Student**
   - Open incognito/private window (or different browser)
   - Go to Sign Up
   - Fill in different details (e.g., Jane Learner, jane@learner.com)
   - Select "Learner"
   - Click Submit

3. **Test the Flow**
   - Log in as Teacher
   - Add a skill (Dashboard → My Skills)
   - Log out and switch to Student account
   - Explore skills (Explore Skills page)
   - Book a session

### Demo Data

The app uses localStorage for demo purposes. Test data includes:
- Sample users
- Sample skills
- Sample bookings
- Token transfers

To reset, clear browser localStorage:
```javascript
// In browser console
localStorage.clear();
```

## Production Deployment

### Deploy to Firebase Hosting

1. **Initialize Firebase Project**
```bash
firebase init hosting
```

2. **Configure Firebase**
   - Select your Firebase project
   - Set public directory to `.` (root)
   - Configure rewrites for single-page app: Yes
   - Don't overwrite existing files

3. **Deploy**
```bash
firebase deploy --only hosting
```

### Deploy to Other Platforms

**GitHub Pages:**
```bash
# Push to gh-pages branch
git checkout -b gh-pages
git push -u origin gh-pages
```

**Netlify:**
- Connect your Git repository
- Set build command: (leave empty)
- Set publish directory: `.`
- Deploy

**Vercel:**
- Import your repository
- Configure project settings
- Deploy

## Environment Variables

Create a `.env` file for local development:

```
FIREBASE_APIKEY=YOUR_API_KEY
FIREBASE_AUTHDOMAIN=YOUR_AUTH_DOMAIN
FIREBASE_PROJECTID=YOUR_PROJECT_ID
```

Load in your app:
```javascript
const apiKey = process.env.FIREBASE_APIKEY;
```

## Firestore Security Rules

For production, update your Firestore rules:

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /skills/{skillId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.teacherId;
    }
    match /bookings/{bookingId} {
      allow read: if request.auth.uid in [resource.data.studentId, resource.data.teacherId];
      allow write: if request.auth.uid == resource.data.studentId || request.auth.uid == resource.data.teacherId;
    }
  }
}
```

## Database Backup

To backup your Firestore data:

```bash
firebase firestore:export ./backups/$(date +%s)
```

To restore:

```bash
firebase firestore:import ./backups/{TIMESTAMP}
```

## Debugging

### Enable Debug Mode
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

### Check Firebase Status
```javascript
// In browser console
firebase.auth().onAuthStateChanged(user => {
  console.log('User:', user);
});
```

### View Logs
```bash
firebase functions:log
```

## Troubleshooting

### Firebase Not Connecting
- Verify Firebase config in `js/firebase-config.js`
- Check Firebase project settings
- Ensure authentication is enabled
- Clear browser cache and localStorage

### Port 8000 Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port
python -m http.server 8001
```

### CORS Issues
- Ensure Firebase config is correct
- Check Firebase security rules
- Verify authentication settings

### User Data Not Saving
- Check browser's localStorage size limit
- Verify Firestore rules allow writes
- Check browser console for errors

## Performance Optimization

1. **Enable Gzip Compression**
   - Firebase hosting does this automatically

2. **Minify CSS/JS**
   - Use tools like UglifyJS and csso

3. **Image Optimization**
   - Compress images before uploading
   - Use WebP format where possible

4. **Lazy Loading**
   - Implement intersection observer for images
   - Load components on demand

## Security Checklist

- [ ] Firebase config uses only public API keys
- [ ] Sensitive data not in localStorage
- [ ] HTTPS enabled on production
- [ ] Firestore security rules configured
- [ ] Input validation on all forms
- [ ] XSS protection implemented
- [ ] CSRF tokens for state-changing operations
- [ ] Rate limiting configured
- [ ] User data encrypted at rest
- [ ] Regular security audits performed

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new GitHub issue
- Contact: support@neighborknot.com
- Read the main [README.md](README.md)

## Next Steps

1. Customize branding and colors
2. Connect to real backend service
3. Implement additional features
4. Set up monitoring and analytics
5. Configure email notifications
6. Deploy to production

---

Happy coding! 🚀
