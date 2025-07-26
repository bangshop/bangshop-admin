// admin/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0rrQcHyeIXDeyrav_OgvnygMy68ErkV0",
  authDomain: "bangshop-1492e.firebaseapp.com",
  projectId: "bangshop-1492e",
  storageBucket: "bangshop-1492e.appspot.com",
  messagingSenderId: "62304818184",
  appId: "1:62304818184:web:62d45a6ddf93f055ceadbd",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);