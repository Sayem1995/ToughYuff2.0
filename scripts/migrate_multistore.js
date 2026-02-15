import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

// --- Configuration (Same as manual_migrate.js) ---
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

const STORE_GOLDMINE = 'goldmine';
const STORE_TEN2TEN = 'ten2ten';

const migrate = async () => {
    console.log("Starting Multi-Store Migration...");

    try {
        // Helper to chunk array
        const chunkArray = (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        // --- 1. Products ---
        console.log("Fetching Products...");
        const productsSnapshot = await getDocs(collection(db, 'products'));
        console.log(`Found ${productsSnapshot.size} products.`);

        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const productChunks = chunkArray(products, 200); // Batch limit is 500 operations (writes/updates)

        for (const chunk of productChunks) {
            const batch = writeBatch(db);

            chunk.forEach(product => {
                // UPDATE existing to Goldmine
                const productRef = doc(db, 'products', product.id);
                batch.update(productRef, {
                    storeId: STORE_GOLDMINE,
                    updatedAt: serverTimestamp()
                });

                // CREATE copy for TEN 2 TEN
                // Generate new ID with prefix for traceability
                const newId = `ten2ten_${product.id}`;
                const newProductRef = doc(db, 'products', newId);

                const newProductData = {
                    ...product,
                    storeId: STORE_TEN2TEN,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };
                // Ensure ID in data matches doc ID if it's stored there
                if (newProductData.id) newProductData.id = newId;

                batch.set(newProductRef, newProductData);
            });

            await batch.commit();
            console.log(`Processed batch of ${chunk.length} products (Updated + Created copies).`);
        }

        // --- 2. Brands ---
        console.log("Fetching Brands...");
        const brandsSnapshot = await getDocs(collection(db, 'brands'));
        console.log(`Found ${brandsSnapshot.size} brands.`);

        const brands = brandsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const brandChunks = chunkArray(brands, 200);

        for (const chunk of brandChunks) {
            const batch = writeBatch(db);

            chunk.forEach(brand => {
                // UPDATE existing to Goldmine
                const brandRef = doc(db, 'brands', brand.id);
                batch.update(brandRef, {
                    storeId: STORE_GOLDMINE,
                    updatedAt: serverTimestamp()
                });

                // CREATE copy for TEN 2 TEN
                const newId = `ten2ten_${brand.id}`;
                const newBrandRef = doc(db, 'brands', newId);

                const newBrandData = {
                    ...brand,
                    storeId: STORE_TEN2TEN,
                    updatedAt: serverTimestamp()
                };
                if (newBrandData.id) newBrandData.id = newId;

                batch.set(newBrandRef, newBrandData);
            });

            await batch.commit();
            console.log(`Processed batch of ${chunk.length} brands (Updated + Created copies).`);
        }

        console.log("Migration Complete! Store IDs assigned.");
        process.exit(0);

    } catch (e) {
        console.error("Migration Failed:", e);
        process.exit(1);
    }
};

migrate();
