import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkBrands() {
    console.log("Fetching brands from Firestore...");
    const qs = await getDocs(collection(db, 'brands'));
    const brands = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${brands.length} brands in Firestore.\n`);

    const caliBrands = brands.filter(b => b.id.includes('cali'));
    console.log("Cali Brands in Firestore:");
    console.log(JSON.stringify(caliBrands, null, 2));

    process.exit(0);
}

checkBrands();
