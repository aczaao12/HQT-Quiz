// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdE7K96Ywpm5v9IUQ77tGq8FB4jGNwSpE",
  authDomain: "hqt-quiz.firebaseapp.com",
  projectId: "hqt-quiz",
  storageBucket: "hqt-quiz.firebasestorage.app",
  messagingSenderId: "397903706468",
  appId: "1:397903706468:web:11a0368be8e45bc58f2271",
  measurementId: "G-HPVCPBRK4W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // Initialize Firestore

export { auth, provider, db }; // Export db