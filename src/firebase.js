// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQGetw58jZT5kgvBysxCvznitCOcsW_5Y",
  authDomain: "the-student-helper-10e5f.firebaseapp.com",
  projectId: "the-student-helper-10e5f",
  storageBucket: "the-student-helper-10e5f.firebasestorage.app",
  messagingSenderId: "995518297301",
  appId: "1:995518297301:web:47b16b12ba56d5658a5e5c",
  measurementId: "G-FPLNR3YE1X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

export { auth };