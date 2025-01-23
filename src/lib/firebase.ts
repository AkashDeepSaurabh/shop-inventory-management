import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCPQ55b5S2j1dT07-ioiMgoningstbPVEA",
  authDomain: "hanuman-hardware.firebaseapp.com",
  projectId: "hanuman-hardware",
  storageBucket: "hanuman-hardware.firebasestorage.app",
  messagingSenderId: "1013931393809",
  appId: "1:1013931393809:web:6264fbcae271f1040d82b0",
  measurementId: "G-0HR4SF349Y"
};

let app;

try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase:", error);
}


export const auth = app ? getAuth(app) : null;
export const db = getFirestore(app);