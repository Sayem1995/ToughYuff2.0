import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';

// --- Configuration ---
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
const db = getFirestore(app);

const migrate = async () => {
    console.log("Starting connection test...");
    const batch = writeBatch(db);
    const productsRef = collection(db, 'products');

    // Add a single test product to verify connection
    const testDoc = doc(productsRef, "test-connection-doc");
    batch.set(testDoc, {
        name: "Test Connection Product",
        brandName: "System Test",
        createdAt: new Date(),
        inStock: true
    });

    try {
        await batch.commit();
        console.log("Successfully connected and wrote test document!");
        process.exit(0);
    } catch (e) {
        console.error("Connection failed:", e);
        process.exit(1);
    }
};

migrate();
