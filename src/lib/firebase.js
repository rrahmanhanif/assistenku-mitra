// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_APP_NAME}-mitra.firebaseapp.com`,
  projectId: `${process.env.NEXT_PUBLIC_APP_NAME}-mitra`,
  storageBucket: `${process.env.NEXT_PUBLIC_APP_NAME}-mitra.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
