// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOT1K1wP81oww4fWXvMss9VKrPX0zDg4Y",
  authDomain: "splitwise-clone-272e5.firebaseapp.com",
  projectId: "splitwise-clone-272e5",
  storageBucket: "splitwise-clone-272e5.firebasestorage.app",
  messagingSenderId: "1054280158995",
  appId: "1:1054280158995:web:133e1108c627a86c25d4e6",
  measurementId: "G-P9LYEXM9SG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
