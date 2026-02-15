import React, { createContext, useContext, useState, useEffect } from 'react';

export type StoreId = 'goldmine' | 'ten2ten';

interface StoreContextType {
    currentStore: StoreId;
    switchStore: (storeId: StoreId) => void;
    storeName: string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const STORE_NAMES: Record<StoreId, string> = {
    goldmine: 'Goldmine',
    ten2ten: 'TEN 2 TEN'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize from localStorage or default to 'goldmine'
    const [currentStore, setCurrentStore] = useState<StoreId>(() => {
        const saved = localStorage.getItem('toughyuff_store_id');
        return (saved === 'goldmine' || saved === 'ten2ten') ? saved : 'goldmine';
    });

    const switchStore = (storeId: StoreId) => {
        setCurrentStore(storeId);
        localStorage.setItem('toughyuff_store_id', storeId);
        // Optional: reload page to ensure clean state if needed, but React state should handle it
        // window.location.reload(); 
    };

    useEffect(() => {
        // Ensure we have a valid value in storage
        localStorage.setItem('toughyuff_store_id', currentStore);
    }, [currentStore]);

    return (
        <StoreContext.Provider value={{
            currentStore,
            switchStore,
            storeName: STORE_NAMES[currentStore]
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
