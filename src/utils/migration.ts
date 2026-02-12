import { writeBatch, doc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_PRODUCTS } from '../../constants';
import { Product } from '../../types';

export const migrateDataToFirestore = async () => {
    try {
        const batch = writeBatch(db);
        const productsRef = collection(db, 'products');

        console.log(`Starting migration of ${INITIAL_PRODUCTS.length} products...`);

        INITIAL_PRODUCTS.forEach((product) => {
            const newDocRef = doc(productsRef); // Auto-generate ID or use product.id if unique

            const newProductData: Omit<Product, 'id'> = {
                brandId: product.brandId,
                name: product.name,
                brandName: product.brandName,
                puffCount: product.puffCount,
                nicotine: product.nicotine,
                isNicotineFree: product.isNicotineFree,
                flavorProfile: product.flavorProfile,
                description: product.description,
                image: product.image,

                // Default values for new fields
                stockQuantity: 100, // Default stock
                inStock: true,
                lowStockThreshold: 10,
                price: 19.99, // Default price
                costPerUnit: 10.00, // Default cost
                channel: 'both',
                category: 'Disposable',

                createdAt: new Date(),
                updatedAt: new Date()
            };

            batch.set(newDocRef, newProductData);
        });

        await batch.commit();
        console.log("Migration completed successfully!");
        return { success: true, count: INITIAL_PRODUCTS.length };
    } catch (error) {
        console.error("Migration failed:", error);
        return { success: false, error };
    }
};
