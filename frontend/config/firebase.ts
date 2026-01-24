import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "echelon-99796.firebaseapp.com",
  projectId: "echelon-99796",
  storageBucket: "echelon-99796.firebasestorage.app",
  messagingSenderId: "846552054372",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);