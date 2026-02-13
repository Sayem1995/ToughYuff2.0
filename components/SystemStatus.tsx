import React, { useEffect, useState } from 'react';
import { auth, storage } from '../src/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { Shield, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

export const SystemStatus: React.FC = () => {
    const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
    const [storageStatus, setStorageStatus] = useState<'checking' | 'ok' | 'error'>('checking');
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        // Check Auth
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setAuthStatus('authenticated');
                setUserEmail(user.email);
            } else {
                // Check if we are in simulated admin mode
                const isAdmin = localStorage.getItem('admin_auth') === 'true';
                if (isAdmin) {
                    setAuthStatus('authenticated'); // Treat as authenticated for UI purposes
                    setUserEmail('admin@local (Simulated)');
                } else {
                    setAuthStatus('unauthenticated');
                    setUserEmail(null);
                }
            }
        });

        // Check Storage (Simple Ping)
        // We just check if the root ref is valid, we can't easily "ping" without reading a file.
        // Instead, we just assume checking the reference doesn't crash.
        try {
            const rootRef = ref(storage, '/');
            setStorageStatus('ok');
        } catch (e) {
            setStorageStatus('error');
        }

        return () => unsubscribe();
    }, []);

    if (authStatus === 'authenticated' && storageStatus === 'ok') return null; // Hide if all good (or show small indicator)

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {authStatus === 'unauthenticated' && (
                <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-md flex items-center gap-3 animate-pulse">
                    <ShieldAlert className="w-5 h-5" />
                    <div className="text-xs">
                        <p className="font-bold">System Warning</p>
                        <p>Firebase Auth Disconnected. Uploads will fail.</p>
                    </div>
                </div>
            )}
            {authStatus === 'authenticated' && (
                <div className="bg-green-500/80 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <div className="text-[10px]">
                        <p className="font-bold">System Online</p>
                        <p>{userEmail}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
