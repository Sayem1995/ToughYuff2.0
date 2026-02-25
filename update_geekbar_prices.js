import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

// Firebase configuration from src/firebase.ts
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

async function updateGeekBarPrices() {
    try {
        console.log("Starting price update for Geek Bar Pulse products...");

        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("brandId", "==", "geekbar-pulse"));

        const snapshot = await getDocs(q);

        console.log(`Found ${snapshot.size} Geek Bar Pulse products.`);

        let updateCount = 0;

        for (const document of snapshot.docs) {
            const data = document.data();

            // Re-affirm we aren't accidentally updating Geekbar Pulse X ($25)
            if (data.brandId === 'geekbar-pulse' && data.price !== 20) {
                const docRef = doc(db, 'products', document.id);
                await updateDoc(docRef, {
                    price: 20.00
                });
                console.log(`Updated price for ${data.name} to $20.00`);
                updateCount++;
            }
        }

        console.log(`Successfully updated ${updateCount} products to $20.00.`);
        process.exit(0);

    } catch (error) {
        console.error("Error updating prices:", error);
        process.exit(1);
    }
}

updateGeekBarPrices();
