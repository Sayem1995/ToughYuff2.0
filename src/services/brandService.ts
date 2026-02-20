import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { Brand } from '../../types';

const BRANDS_COLLECTION = 'brands';

export const BrandService = {
    // Fetch all brands for a specific store
    getAllBrands: async (storeId: string): Promise<Brand[]> => {
        try {
            const q = query(collection(db, BRANDS_COLLECTION), where('storeId', '==', storeId));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Brand[];
        } catch (error) {
            console.error("Error fetching brands:", error);
            throw error;
        }
    },

    // Add new brand
    addBrand: async (brandData: Omit<Brand, 'id'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, BRANDS_COLLECTION), {
                ...brandData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding brand:", error);
            throw error;
        }
    },

    // Update brand
    updateBrand: async (id: string, updates: Partial<Brand>): Promise<void> => {
        try {
            const docRef = doc(db, BRANDS_COLLECTION, id);
            await setDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating brand:", error);
            throw error;
        }
    },

    // Delete brand
    deleteBrand: async (id: string): Promise<void> => {
        try {
            const docRef = doc(db, BRANDS_COLLECTION, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting brand:", error);
            throw error;
        }
    },

    // Save brand order (Per Store)
    saveBrandOrder: async (order: string[], storeId: string): Promise<void> => {
        try {
            const settingsRef = doc(db, 'settings', `brandOrder_${storeId}`);
            await setDoc(settingsRef, { order }, { merge: true });
        } catch (error) {
            console.error("Error saving brand order:", error);
            throw error;
        }
    },

    // Get brand order (Per Store)
    getBrandOrder: async (storeId: string): Promise<string[]> => {
        try {
            const settingsRef = doc(db, 'settings', `brandOrder_${storeId}`);
            const docSnap = await getDoc(settingsRef);

            if (docSnap.exists()) {
                return docSnap.data().order as string[];
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error fetching brand order:", error);
            return [];
        }
    },

    // Seed/Ensure brands exist
    ensureBrands: async (brands: Brand[], storeId: string): Promise<void> => {
        try {
            const existingBrands = await BrandService.getAllBrands(storeId);
            const existingIds = new Set(existingBrands.map(b => b.id));

            for (const brand of brands) {
                if (!existingIds.has(brand.id)) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...brandData } = brand;
                    // We want to preserve the ID if possible, or let Firestore generate one?
                    // Actually, for these specific brands, the ID in constants is 'muha-meds' etc.
                    // But addDoc generates a random ID.
                    // If we want to strictly keep IDs, we should use setDoc with specific ID.
                    // Existing addBrand uses addDoc.
                    // Let's modify logic to use setDoc if we want valid IDs, OR just let it generate.
                    // The 'id' in constants is useful for matching. 
                    // Let's use setDoc to enforce the ID from constants.

                    const { setDoc, doc } = await import('firebase/firestore');
                    const docRef = doc(db, BRANDS_COLLECTION, brand.id); // Use the ID from the constant
                    await setDoc(docRef, {
                        ...brandData,
                        storeId,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
            }
        } catch (error) {
            console.error("Error seeding brands:", error);
            throw error;
        }
    }
};
