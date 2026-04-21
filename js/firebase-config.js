// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzLxm2qCCltE2iSTGWMSkhMOL_93D4zm4",
  authDomain: "neighbourknot.firebaseapp.com",
  projectId: "neighbourknot",
  storageBucket: "neighbourknot.firebasestorage.app",
  messagingSenderId: "907110306753",
  appId: "1:907110306753:web:66a026574d38a0ee4c9540",
  measurementId: "G-CRP07D6F7T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const db = firebase.firestore();
const auth = firebase.auth();