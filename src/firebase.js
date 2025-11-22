// firebase.js (untuk Assistenku-Mitra)

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAMrnOnJIWWs8zWUMDoYYs-95xo-LAVBbc",
  authDomain: "assistenku-mitra.firebaseapp.com",
  projectId: "assistenku-mitra",
  storageBucket: "assistenku-mitra.firebasestorage.app",
  messagingSenderId: "84136573544",
  appId: "1:84136573544:web:c9b1a401e741799fbd59dd",
  measurementId: "G-4LY2FQLGK1"
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Export Auth supaya bisa dipakai login/daftar
export const auth = getAuth(app);

export default app;
