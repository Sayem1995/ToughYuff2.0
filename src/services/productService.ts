import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    orderBy,
    increment,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../../types';

const PRODUCTS_COLLECTION = 'products';

export const ProductService = {
    // Fetch all products
    getAllProducts: async (): Promise<Product[]> => {
        try {
            const q = query(collection(db, PRODUCTS_COLLECTION));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error;
        }
    },

    // Fetch single product
    getProductById: async (id: string): Promise<Product | null> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Product;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            throw error;
        }
    },

    // Add new product
    addProduct: async (productData: Omit<Product, 'id'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
                ...productData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    },

    // Update product
    updateProduct: async (id: string, updates: Partial<Product>): Promise<void> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    },

    // Adjust stock atomically
    adjustStock: async (id: string, adjustment: number): Promise<void> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await updateDoc(docRef, {
                stockQuantity: increment(adjustment),
                updatedAt: serverTimestamp()
            });
            // Note: We might want to re-fetch or listen to changes to update local state logic about 'inStock'
            // Ideally, inStock should be a computed field in Firestore or updated via a trigger, 
            // but for now, the client or a separate update call handles it.
            // Actually, let's just make sure we don't go below 0 if possible, but Firestore increment allows negative.

        } catch (error) {
            console.error("Error adjusting stock:", error);
            throw error;
        }
    },

    // Delete product
    deleteProduct: async (id: string): Promise<void> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    },

    // Batch Delete
    batchDeleteProducts: async (ids: string[]): Promise<void> => {
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const docRef = doc(db, PRODUCTS_COLLECTION, id);
                batch.delete(docRef);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error batch deleting:", error);
            throw error;
        }
    },

    // Batch Update Status
    batchUpdateStatus: async (ids: string[], inStock: boolean): Promise<void> => {
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const docRef = doc(db, PRODUCTS_COLLECTION, id);
                batch.update(docRef, {
                    inStock,
                    updatedAt: serverTimestamp()
                });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error batch updating status:", error);
            throw error;
        }
    }
};
