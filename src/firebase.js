import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnQvQdeDxvpbEp4xCgIunYrxxWWaF_cQw",
  authDomain: "chatweb-d4e23.firebaseapp.com",
  projectId: "chatweb-d4e23",
  storageBucket: "chatweb-d4e23.firebasestorage.app",
  messagingSenderId: "1037342202993",
  appId: "1:1037342202993:web:78cb9a55b682189d374fd0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
