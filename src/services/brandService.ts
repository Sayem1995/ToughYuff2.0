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
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
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
            const { setDoc } = await import('firebase/firestore');
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
    }
};
