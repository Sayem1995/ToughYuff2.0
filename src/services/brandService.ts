import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { Brand } from '../../types';

const BRANDS_COLLECTION = 'brands';

export const BrandService = {
    // Fetch all brands
    getAllBrands: async (): Promise<Brand[]> => {
        try {
            const q = query(collection(db, BRANDS_COLLECTION)); // You might want to order by name eventually
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

    // Save brand order
    saveBrandOrder: async (order: string[]): Promise<void> => {
        try {
            const settingsRef = doc(db, 'settings', 'brandOrder');
            // Use setDoc with merge: true or just setDoc since it overwrites
            // We need to import setDoc first
            const { setDoc } = await import('firebase/firestore');
            await setDoc(settingsRef, { order }, { merge: true });
        } catch (error) {
            console.error("Error saving brand order:", error);
            throw error;
        }
    },

    // Get brand order
    getBrandOrder: async (): Promise<string[]> => {
        try {
            const settingsRef = doc(db, 'settings', 'brandOrder');
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
