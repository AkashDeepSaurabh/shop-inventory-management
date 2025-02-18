import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCPQ55b5S2j1dT07-ioiMgoningstbPVEA",
  authDomain: "hanuman-hardware.firebaseapp.com",
  projectId: "hanuman-hardware",
  storageBucket: "hanuman-hardware.firebasestorage.app",
  messagingSenderId: "1013931393809",
  appId: "1:1013931393809:web:6264fbcae271f1040d82b0",
  measurementId: "G-0HR4SF349Y"
};

// Initialize Firebase
let app;

try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Firebase Auth and Firestore
export const auth = app ? getAuth(app) : null;
export const db = getFirestore(app);


// Google Authentication provider
export const googleProvider = new GoogleAuthProvider();

// // Function to set up reCAPTCHA
// export const setUpRecaptcha = (containerId) => {
//   if (!auth) {
//     console.error('Firebase Auth instance is not available.');
//     return null;
//   }
  
//   try {
//     // Create the reCAPTCHA verifier
//     const recaptchaVerifier = new RecaptchaVerifier(containerId, {
//       size: 'invisible', // Invisible reCAPTCHA
//       callback: (response) => {
//         console.log('reCAPTCHA verified:', response);
//       },
//       defaultCountry: 'US', // Optional: Set default country code for phone numbers
//     }, auth);
    
//     return recaptchaVerifier;
//   } catch (error) {
//     console.error('Error setting up reCAPTCHA:', error);
//     return null;
//   }
// };

// // Function to handle OTP-based sign-in
// export const signInWithOtp = async (phoneNumber, recaptchaVerifier) => {
//   if (!auth) {
//     throw new Error('Firebase Auth instance is not available.');
//   }
//   try {
//     const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
//     return confirmationResult;
//   } catch (error) {
//     console.error('Error during phone number sign-in:', error);
//     throw new Error('Phone sign-in failed');
//   }
// };

// Function to verify OTP and complete sign-in
// export const verifyOtp = async (confirmationResult, otp) => {
//   try {
//     const userCredential = await confirmationResult.confirm(otp);
//     return userCredential;
//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     throw new Error('OTP verification failed');
//   }
// };

// {
//   "hosting": {
//     "public": "build",  // the folder with your build files
//     "headers": [
//       {
//         "source": "/**",
//         "headers": [
//           {
//             "key": "Cross-Origin-Opener-Policy",
//             "value": "same-origin"
//           },
//           {
//             "key": "Cross-Origin-Embedder-Policy",
//             "value": "require-corp"
//           }
//         ]
//       }
//     ]
//   }
// }
