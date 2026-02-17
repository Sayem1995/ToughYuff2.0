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
    orderBy,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Category, StoreId } from '../../types';

const CATEGORIES_COLLECTION = 'categories';

export const DEFAULT_CATEGORIES = [
    'DISPOSABLE VAPE',
    'THC DISPOSABLES',
    'THC CARTRIDGES',
    'THC & DELTA GUMMIES',
    'PRE ROLLS',
    'HOOKAH FLAVORS',
    'NICOTINE POUCHES',
    'PODS',
    'WRAPS AND BLUNTS'
];

export const CategoryService = {
    // Fetch all categories for a store, ordered by 'order'
    getAllCategories: async (storeId: StoreId): Promise<Category[]> => {
        try {
            const q = query(
                collection(db, CATEGORIES_COLLECTION),
                where('storeId', '==', storeId),
                orderBy('order', 'asc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Category[];
        } catch (error) {
            console.error("Error fetching categories:", error);
            // Fallback if index is missing (Firestore requires index for compound queries)
            // Just fetch by storeId and sort in memory
            try {
                const qFallback = query(
                    collection(db, CATEGORIES_COLLECTION),
                    where('storeId', '==', storeId)
                );
                const querySnapshot = await getDocs(qFallback);
                const categories = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Category[];
                return categories.sort((a, b) => a.order - b.order);
            } catch (fallbackError) {
                console.error("Fallback fetch failed:", fallbackError);
                return [];
            }
        }
    },

    // Add new category
    addCategory: async (categoryData: Omit<Category, 'id'>): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
                ...categoryData,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding category:", error);
            throw error;
        }
    },

    // Update category
    updateCategory: async (id: string, updates: Partial<Category>): Promise<void> => {
        try {
            const docRef = doc(db, CATEGORIES_COLLECTION, id);
            await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error updating category:", error);
            throw error;
        }
    },

    // Delete category
    deleteCategory: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
        } catch (error) {
            console.error("Error deleting category:", error);
            throw error;
        }
    },

    // Reorder categories
    reorderCategories: async (orderedCategories: Category[]): Promise<void> => {
        try {
            const batch = writeBatch(db);
            orderedCategories.forEach((cat, index) => {
                const docRef = doc(db, CATEGORIES_COLLECTION, cat.id);
                batch.update(docRef, { order: index });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error reordering categories:", error);
            throw error;
        }
    },

    // Seed initial categories if empty
    seedInitialCategories: async (storeId: StoreId, initialNames: string[]): Promise<void> => {
        const existing = await CategoryService.getAllCategories(storeId);
        if (existing.length > 0) return;

        const batch = writeBatch(db);
        initialNames.forEach((name, index) => {
            const docRef = doc(collection(db, CATEGORIES_COLLECTION));
            batch.set(docRef, {
                storeId,
                name,
                slug: name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                order: index,
                createdAt: serverTimestamp()
            });
        });
    },


    // Ensure specific categories exist (add if missing)
    ensureCategories: async (storeId: StoreId, requiredNames: string[]): Promise<void> => {
        const existing = await CategoryService.getAllCategories(storeId);
        const existingNames = new Set(existing.map(c => c.name.toLowerCase()));

        const missing = requiredNames.filter(name => !existingNames.has(name.toLowerCase()));

        if (missing.length === 0) return;

        const batch = writeBatch(db);
        const startOrder = existing.length > 0 ? Math.max(...existing.map(c => c.order || 0)) + 1 : 0;

        missing.forEach((name, index) => {
            const docRef = doc(collection(db, CATEGORIES_COLLECTION));
            batch.set(docRef, {
                storeId,
                name,
                slug: name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                order: startOrder + index,
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
    }
};
