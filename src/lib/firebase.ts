
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "medha-d6x6p",
  "appId": "1:22228714773:web:8157ad5277bc9a7afc551c",
  "storageBucket": "medha-d6x6p.firebasestorage.app",
  "apiKey": "AIzaSyDwaZ8YCvCAMBy0RKdjUXA3Zh0XVYgktMY",
  "authDomain": "medha-d6x6p.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "22228714773"
};

// Initialize Firebase
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(firebaseApp);
