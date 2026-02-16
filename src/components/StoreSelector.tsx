import React from 'react';
import { useStore, STORE_NAMES, StoreId } from '../context/StoreContext';
import { Store, Check, ChevronDown } from 'lucide-react';

const StoreSelector: React.FC = () => {
    const { currentStore, switchStore, isSessionValid } = useStore();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        setIsAdmin(localStorage.getItem('admin_auth') === 'true');
    }, []);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.store-selector-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (storeId: StoreId) => {
        switchStore(storeId);
        setIsOpen(false);
    };

    // If session is valid, user is locked to the store.
    const isLocked = isSessionValid;

    return (
        <div className="relative store-selector-container z-50">
            <button
                // On mobile, disabled elements might still capture clicks or behave inconsistently.
                // pointer-events-none ensures it's dead to the DOM.
                onClick={() => !isLocked && setIsOpen(!isOpen)}
                disabled={isLocked}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-all text-sm group ${isLocked ? 'cursor-default opacity-80 pointer-events-none' : 'hover:border-gold/50 cursor-pointer'
                    }`}
            >
                <Store className="w-4 h-4 text-gold" />
                <span className="text-white font-medium">{STORE_NAMES[currentStore]}</span>
                {isLocked ? (
                    <div className="flex items-center gap-1 text-[10px] text-gold/70 bg-gold/10 px-1.5 py-0.5 rounded ml-1">
                        <span>LOCKED</span>
                    </div>
                ) : (
                    <>
                        {isAdmin && !isLocked && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded ml-1">
                                <span>ADMIN</span>
                            </div>
                        )}
                        <ChevronDown className={`w-3 h-3 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            {isOpen && !isLocked && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 space-y-1">
                        {(Object.keys(STORE_NAMES) as StoreId[]).map((storeId) => (
                            <button
                                key={storeId}
                                onClick={() => handleSelect(storeId)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${currentStore === storeId
                                    ? 'bg-gold/10 text-gold'
                                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span>{STORE_NAMES[storeId]}</span>
                                {currentStore === storeId && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                    <div className="px-3 py-2 bg-black/20 text-[10px] text-text-tertiary border-t border-white/5">
                        Switching stores will update inventory and product availability.
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreSelector;
