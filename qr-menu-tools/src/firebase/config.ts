import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Innovitech Tools Firebase Configuration
// Shared project with TurboType Rally (Realtime DB) and PDF Tools (Firestore)
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
