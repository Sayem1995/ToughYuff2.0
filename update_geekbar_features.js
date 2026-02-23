import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newFeatures = [
    "✨ 5% Nicotine – enjoy pure flavor with 5% nicotine at all",
    "🔥 Up to 15,000 puffs in Regular Mode for long-lasting enjoyment",
    "⚡ Pulse Mode: 7,500 puffs for a stronger, more responsive hit",
    "📱 World’s first full-screen disposable vape – futuristic and eye-catching",
    "💨 Dual mesh coil for smooth, rich, and consistent vapor",
    "🔋 650mAh rechargeable battery (Type-C) – reliable power anytime",
    "🧠 Dual-core control system for stable performance",
    "👜 Compact, stylish, and easy to carry anywhere"
];

async function updateGeekBarPulseProducts() {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef);
        const snapshot = await getDocs(q);

        let updatedCount = 0;

        for (const document of snapshot.docs) {
            const data = document.data();
            const brandId = (data.brandId || '').toLowerCase();
            const brandName = (data.brandName || '').toLowerCase();
            const name = (data.name || '').toLowerCase();

            // Check if it's a Geek Bar Pulse product
            if (brandId.includes('geek-bar-pulse') || brandName.includes('geek bar pulse') || name.includes('geek bar pulse')) {
                console.log(`Updating product: ${data.name} (${document.id})`);
                await updateDoc(doc(db, 'products', document.id), {
                    features: newFeatures
                });
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} Geek Bar Pulse products!`);
        process.exit(0);
    } catch (error) {
        console.error("Error updating products:", error);
        process.exit(1);
    }
}

updateGeekBarPulseProducts();
