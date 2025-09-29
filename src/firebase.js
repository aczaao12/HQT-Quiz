// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBk9LkgrHXdSy7nio6BDVsoaoMVW4HmNsY",
  authDomain: "kt-vh-ceft.firebaseapp.com",
  projectId: "kt-vh-ceft",
  storageBucket: "kt-vh-ceft.firebasestorage.app",
  messagingSenderId: "696846053887",
  appId: "1:696846053887:web:c8a8a9ad639c6c303437ca",
  measurementId: "G-5E2MHDXC10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
