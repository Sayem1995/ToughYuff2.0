import React, { createContext, useContext, useState, useEffect } from 'react';

export type StoreId = 'goldmine' | 'ten2ten';

interface StoreContextType {
    currentStore: StoreId;
    switchStore: (storeId: StoreId) => void;
    storeName: string;
    isSessionValid: boolean;
    validateSession: (passcode: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const STORE_NAMES: Record<StoreId, string> = {
    goldmine: 'Goldmine',
    ten2ten: 'TEN 2 TEN'
};

const PASSCODES: Record<string, StoreId> = {
    'GM2026': 'goldmine',
    'TT2026': 'ten2ten'
};

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize from localStorage or default to 'goldmine'
    const [currentStore, setCurrentStore] = useState<StoreId>(() => {
        const saved = localStorage.getItem('toughyuff_store_id');
        // Default to 'goldmine' if not set, but effectively locked out until auth
        return (saved === 'goldmine' || saved === 'ten2ten') ? saved : 'goldmine';
    });

    const [isSessionValid, setIsSessionValid] = useState<boolean>(false);

    useEffect(() => {
        checkSessionExpiry();
        // Set up a timer to check every minute or on focus?
        const interval = setInterval(checkSessionExpiry, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const checkSessionExpiry = () => {
        const timestamp = localStorage.getItem('toughyuff_session_timestamp');
        const savedStore = localStorage.getItem('toughyuff_store_id');

        if (!timestamp || !savedStore) {
            setIsSessionValid(false);
            return;
        }

        const now = Date.now();
        const sessionTime = parseInt(timestamp, 10);

        if (now - sessionTime > SESSION_TIMEOUT_MS) {
            console.log('Session expired');
            setIsSessionValid(false);
            localStorage.removeItem('toughyuff_session_timestamp');
        } else {
            setIsSessionValid(true);
        }
    };

    const validateSession = (passcode: string): boolean => {
        const targetStore = PASSCODES[passcode];
        if (targetStore) {
            const now = Date.now();
            localStorage.setItem('toughyuff_store_id', targetStore);
            localStorage.setItem('toughyuff_session_timestamp', now.toString());
            setCurrentStore(targetStore);
            setIsSessionValid(true);
            return true;
        }
        return false;
    };

    const switchStore = (storeId: StoreId) => {
        // If we are in a valid session, we shouldn't really be switching stores manually
        // via this method unless it's a "Force Switch" or Admin override.
        // But for the sake of the existing code, we update the state.
        // However, if the user picks a store, they are "locked" to it.
        // So this might be disabled in UI, but logic remains.
        setCurrentStore(storeId);
        localStorage.setItem('toughyuff_store_id', storeId);
    };

    useEffect(() => {
        // Ensure we have a valid value in storage
        localStorage.setItem('toughyuff_store_id', currentStore);
    }, [currentStore]);

    return (
        <StoreContext.Provider value={{
            currentStore,
            switchStore,
            storeName: STORE_NAMES[currentStore],
            isSessionValid,
            validateSession
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
