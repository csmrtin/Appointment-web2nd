// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBZMhKYwymSZRrzZx2T6cfvfzZ5iDhpAw8",
  authDomain: "orvosi-idopontfoglalo-87377.firebaseapp.com",
  projectId: "orvosi-idopontfoglalo-87377",
  storageBucket: "orvosi-idopontfoglalo-87377.firebasestorage.app",
  messagingSenderId: "624330198667",
  appId: "1:624330198667:web:cbbdcbe1b4d21bb347ce8e",
  measurementId: "G-B624XEHHBH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
