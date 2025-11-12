// =============================================================================
// SHARED FIREBASE CONFIGURATION FOR INNOVITECH PLATFORM
// =============================================================================
// This configuration is used across all Innovitech projects:
// - TurboType Rally (Realtime Database)
// - PDF Tools Contact Form (Firestore)
// - Admin Panel (Authentication + Firestore)
// - Future projects...

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDYHmMD0BQHxxPR4Anzx4ZmZpFTgcs6RBQ",
    authDomain: "innovitech-tools.firebaseapp.com",
    databaseURL: "https://innovitech-tools-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "innovitech-tools",
    storageBucket: "innovitech-tools.firebasestorage.app",
    messagingSenderId: "229701728021",
    appId: "1:229701728021:web:614906807f7ee0dcf1db1c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const database = getDatabase(app);      // For TurboType Rally
export const firestore = getFirestore(app);   // For contact forms & admin
export const auth = getAuth(app);             // For admin authentication
export const googleProvider = new GoogleAuthProvider();

// Admin email for restricted access
export const ADMIN_EMAIL = 'innovitech0@gmail.com';

// Export the app instance
export default app;