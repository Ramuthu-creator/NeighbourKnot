# NeighborKnot - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Get the Code
```bash
git clone https://github.com/yourusername/NeighborKnot.git
cd NeighborKnot
```

### 2. Start Server
```bash
# Using Python
python -m http.server 8000

# Or using Node
npm start
```

### 3. Open Browser
```
http://localhost:8000
```

### 4. Test the App
- **Sign Up** → Create test account
- **Add Skill** → Go to Dashboard → Add skill
- **Browse Skills** → Go to Explore Skills
- **Book Session** → Book from another account

## 🔧 Firebase Setup (10 minutes)

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" → Create New Project
3. Click Project Settings icon
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Copy the `apiKey` and `projectId`
7. Open `js/firebase-config.js`
8. Paste your credentials:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_KEY_HERE",
    projectId: "YOUR_PROJECT_ID",
    // ... other fields
};
```

## 📱 Browser Testing

### Desktop
- Open `http://localhost:8000` in Chrome

### Mobile Simulation
1. Press `F12` or Right-click → "Inspect"
2. Click mobile device icon (top-left of DevTools)
3. Select device (iPhone, iPad, Android)

### Different Accounts
Use incognito/private window to test multi-user features

## 🎮 Demo Flow

### As Teacher:
1. Sign Up with name "Teacher"
2. Dashboard → My Skills
3. Click "+ Add Skill"
4. Enter: Guitar Playing, Level: Intermediate, 5 tokens/hr
5. Click "Add Skill"

### As Learner (New Incognito Window):
1. Sign Up with name "Learner"
2. Click "Explore Skills"
3. Find Guitar Playing skill
4. Click "Book Session"
5. Complete booking

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't access `localhost:8000` | Check if port is in use, try 8001 |
| Page not loading | Clear cache (Ctrl+Shift+Delete) |
| Login not working | Check localStorage didn't break |
| Firebase errors | Verify config in firebase-config.js |
| Styles look broken | Hard refresh (Ctrl+Shift+R) |

## 📂 File Structure Quick Reference

```
Root/
├── index.html          ← Landing page
├── login.html          ← Login page
├── signup.html         ← Sign up page
├── dashboard.html      ← Main app (need login)
├── explore.html        ← Find skills
├── profile.html        ← User profile
├── css/                ← All styles
└── js/                 ← All code
```

## 🔑 Key Files to Know

| File | What it does |
|------|-------------|
| `js/auth.js` | User login, sign up, skills |
| `js/dashboard.js` | Dashboard display & logic |
| `js/explore.js` | Search and filter skills |
| `js/profile.js` | User profile page |
| `js/main.js` | Global functions & utils |

## 💡 Common Tasks

### Add a New Page
1. Create `newpage.html`
2. Copy HTML from `index.html`
3. Update `<title>`
4. Add your content
5. Link from navbar

### Add a New Style
1. Open `css/style.css`
2. Add your CSS at bottom
3. Use color variables like `var(--primary-color)`

### Add a New Feature
1. Add function to appropriate `js/module.js`
2. Add CSS to `css/module.css`
3. Add HTML to relevant `.html` file
4. Test in browser

### Change Colors
Open `css/style.css` and modify `:root` colors:
```css
--primary-color: #0EA5E9;     /* Change this to new color */
--accent-color: #F43F5E;      /* Change this to new color */
```

## 📡 Deployment (1 minute)

```bash
# Login to Firebase
firebase login

# Deploy to Firebase Hosting
firebase deploy

# Your app is now live at https://YOUR_PROJECT.web.app
```

## 🧪 Testing Checklist

- [ ] Sign up creates new user
- [ ] Login works
- [ ] Can add skill
- [ ] Can delete skill
- [ ] Can search skills
- [ ] Can filter by level
- [ ] Mobile layout looks good
- [ ] No console errors (F12)

## 🔗 Important Links

- Firebase: https://firebase.google.com
- Repository: https://github.com/yourusername/NeighborKnot
- Issues: https://github.com/yourusername/NeighborKnot/issues
- Docs: README.md or SETUP.md in repo

## 💬 Need Help?

1. **Check docs**: README.md, SETUP.md
2. **Check code comments**: Well-documented
3. **Browser console**: F12 → Console tab
4. **Email support**: support@neighborknot.com

## 🎯 Next Steps

- [ ] Configure Firebase properly
- [ ] Add your own content
- [ ] Customize colors & branding
- [ ] Test all features
- [ ] Deploy to production
- [ ] Share with community

## 🚀 Features Checklist

✅ User Accounts
✅ Add Skills
✅ Search Skills
✅ Filter Skills
✅ User Profiles
✅ Reviews
✅ Token System
✅ Responsive Design
❌ Video Calls (coming soon)
❌ Real-time Chat (coming soon)

## 📊 Project Stats

- **Pages**: 6 HTML files
- **Styles**: 6 CSS files  
- **Code**: 4 JS modules + main.js
- **Lines of Code**: 5000+
- **Features**: 20+
- **Browsers**: All modern browsers

## 🎨 Quick Customization

### Change App Logo
Find this in every HTML file's navbar:
```html
<h1>Neighbor<span class="logo-knot">Knot</span></h1>
```
Replace with your branding.

### Change App Colors
Edit `css/style.css` `:root` section (lines 1-15)

### Change Buttons
Modify `css/style.css` `.btn` class

### Add Navigation Links
Edit navbar in each HTML file

## 📞 Contact

- **Website**: [coming soon]
- **Email**: support@neighborknot.com
- **GitHub**: https://github.com/yourusername/NeighborKnot
- **Issues**: Use GitHub Issues

---

**Happy Coding!** 🚀💚

*For detailed setup, see SETUP.md*
*For contribution guidelines, see CONTRIBUTING.md*
