import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA1abBAV7KXxKRFy6TuBhaHF4zCES9khqs",
  authDomain: "dragonball-shopee-affiliate.firebaseapp.com",
  projectId: "dragonball-shopee-affiliate",
  storageBucket: "dragonball-shopee-affiliate.firebasestorage.app",
  messagingSenderId: "308236789476",
  appId: "1:308236789476:web:638ae73f7ed7cac03e2ef1",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
