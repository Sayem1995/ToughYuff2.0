import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: "toughyuff-db.firebaseapp.com",
    projectId: "toughyuff-db",
    storageBucket: "toughyuff-db.firebasestorage.app",
    messagingSenderId: "542387140733",
    appId: "1:542387140733:web:9f8e4e9b674c9e422c53a8",
    databaseURL: "https://toughyuff-db-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    console.log("Checking cali-ul8000 in brands...");
    try {
        const docRef = doc(db, 'brands', 'cali-ul8000');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("EXISTS. Data:", docSnap.data());
        } else {
            console.log("DOES NOT EXIST");
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
