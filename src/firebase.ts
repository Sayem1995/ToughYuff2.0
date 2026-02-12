import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBAKe0U2e04mVoAPRK4b59M0eqj9o9XhN8",
    authDomain: "toughyuff-db.firebaseapp.com",
    databaseURL: "https://toughyuff-db-default-rtdb.firebaseio.com",
    projectId: "toughyuff-db",
    storageBucket: "toughyuff-db.firebasestorage.app",
    messagingSenderId: "408665455799",
    appId: "1:408665455799:web:2fae30dfe9ce72a4f66132",
    measurementId: "G-8P21JZZY9C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
