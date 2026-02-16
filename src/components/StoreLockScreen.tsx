import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

const StoreLockScreen: React.FC = () => {
    const { validateSession } = useStore();
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [shake, setShake] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (validateSession(passcode)) {
            // Success handled by context (state update will unmount this screen if App handles it right)
        } else {
            setError('Invalid Passcode');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setPasscode('');
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-center p-6">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536566482680-fca31930ed28?q=80&w=2500&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-xl"></div>

            <div className={`relative w-full max-w-md bg-surface/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center gap-8 ${shake ? 'animate-shake' : ''}`}>

                {/* Header */}
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                        <Lock className="w-8 h-8 text-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Store Access</h1>
                        <p className="text-text-secondary text-sm">
                            Please enter your store passcode to continue.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div className="space-y-2">
                        <div className="relative group">
                            <input
                                type="text"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                placeholder="Enter Passcode"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-center text-lg tracking-widest text-white placeholder:text-white/20 placeholder:tracking-normal focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all uppercase"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <div className="flex items-center justify-center gap-2 text-red-500 text-xs animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!passcode}
                        className="w-full bg-gold text-black font-bold py-4 rounded-xl hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        <span>Enter Store</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] text-text-tertiary mt-4">
                            Access expires after 5 minutes of inactivity.
                        </p>
                    </div>
                </form>
            </div>

            {/* CSS for Shake Animation */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
};

export default StoreLockScreen;
