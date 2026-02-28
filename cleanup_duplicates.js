import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";

// Firebase configuration (same as update_geekbar_prices.js)
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

/**
 * Cleanup Script: Remove duplicate products created by forceSync.
 * 
 * The forceSync effect created documents with IDs like:
 *   "{product.id}-goldmine" and "{product.id}-ten2ten"
 * 
 * Strategy:
 *   For each store, group products by (name + brandId).
 *   If there are multiple products with the same name + brandId in the same store,
 *   keep the one that was created first (or the one without a "-goldmine"/"-ten2ten" suffix),
 *   and delete the rest.
 */
async function cleanupDuplicates() {
    const stores = ['goldmine', 'ten2ten'];
    let totalDeleted = 0;

    for (const storeId of stores) {
        console.log(`\n=== Processing store: ${storeId} ===`);

        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("storeId", "==", storeId));
        const snapshot = await getDocs(q);

        console.log(`Found ${snapshot.size} total products in ${storeId}`);

        // Group by (name + brandId) to find duplicates
        const groups = {};

        snapshot.docs.forEach(document => {
            const data = document.data();
            const name = (data.name || '').toLowerCase().trim();
            const brandId = (data.brandId || '').toLowerCase().trim();
            const key = `${brandId}::${name}`;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push({
                docId: document.id,
                name: data.name,
                brandId: data.brandId,
                // Prefer keeping documents whose ID does NOT end with -goldmine or -ten2ten
                isSyncCopy: document.id.endsWith('-goldmine') || document.id.endsWith('-ten2ten'),
                createdAt: data.createdAt || data.updatedAt || null
            });
        });

        // Find duplicates and decide which to delete
        for (const [key, items] of Object.entries(groups)) {
            if (items.length <= 1) continue; // No duplicates

            console.log(`\nDuplicate group: "${key}" — ${items.length} copies found`);

            // Sort: keep originals (non-sync copies) first, then by createdAt
            items.sort((a, b) => {
                // Originals (non-sync) come first
                if (a.isSyncCopy !== b.isSyncCopy) return a.isSyncCopy ? 1 : -1;
                // Otherwise, older first
                return 0;
            });

            // Keep the first one, delete the rest
            const toKeep = items[0];
            const toDelete = items.slice(1);

            console.log(`  KEEPING: ${toKeep.docId} (${toKeep.name})`);

            for (const dup of toDelete) {
                console.log(`  DELETING: ${dup.docId} (${dup.name})`);
                const docRef = doc(db, 'products', dup.docId);
                await deleteDoc(docRef);
                totalDeleted++;
            }
        }
    }

    console.log(`\n=== CLEANUP COMPLETE ===`);
    console.log(`Deleted ${totalDeleted} duplicate products total.`);
    process.exit(0);
}

cleanupDuplicates().catch(err => {
    console.error("Cleanup failed:", err);
    process.exit(1);
});
