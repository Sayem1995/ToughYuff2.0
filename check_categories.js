import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: "toughyuff-db.firebaseapp.com",
    projectId: "toughyuff-db",
    storageBucket: "toughyuff-db.firebasestorage.app",
    messagingSenderId: "542387140733",
    appId: "1:542387140733:web:9f8e4e9b674c9e422c53a8",
    measurementId: "G-FMW2L835BW",
    databaseURL: "https://toughyuff-db-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkBrands() {
    const brandsRef = collection(db, 'brands');
    const snapshot = await getDocs(brandsRef);

    console.log("--- BRANDS INCORRECTLY CATEGORIZED AS THC-DISPOSABLES ---");
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.category === 'thc-disposables' && data.name && parseInt(data.puffRange || '0') > 5000) {
            console.log(`Brand: ${data.name} (ID: ${document.id}) - Category: ${data.category}`);
        }
    });

    console.log("\n--- PRODUCTS INCORRECTLY CATEGORIZED AS THC-DISPOSABLES ---");
    const productsRef = collection(db, 'products');
    const pSnapshot = await getDocs(productsRef);

    let count = 0;
    pSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.category === 'thc-disposables' && data.brandName && (data.brandName.includes('Cali') || data.brandName.includes('Geek') || data.brandName.includes('Raz'))) {
            console.log(`Product: ${data.name} (Brand: ${data.brandName}) - Category: ${data.category}`);
            count++;
        }
    });
    console.log(`Found ${count} products.`);
    process.exit(0);
}

checkBrands();
