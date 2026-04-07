import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../src/context/AuthContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const CustomerAuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // Modal will auto-close via auth state change in AuthContext
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const errorCode = err.code || (err.originalError && err.originalError.code) || 'auth/unknown';
      
      if (errorCode === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Try again.');
      } else if (errorCode === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else if (errorCode === 'auth/unauthorized-domain') {
        setError('Google Sign-In is not configured for this domain. Contact support.');
      } else if (errorCode === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please enable it in Firebase Console.');
      } else if (errorCode === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9000]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[9001] p-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-6 pt-8 pb-10 text-center">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Logo area */}
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                  <LogIn className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Welcome to ToughYuff</h2>
                <p className="text-slate-400 text-sm">Sign in to track your orders & save your favorites</p>
              </div>

              {/* Negative overlap card effect */}
              <div className="-mt-4 relative z-10 bg-white dark:bg-slate-900 rounded-t-2xl px-6 pt-6 pb-8">
                {/* Benefits */}
                <div className="space-y-2 mb-6">
                  {[
                    '⚡ One-click checkout',
                    '📦 Track your orders',
                    '🔔 Restock alerts',
                    '🎁 Exclusive member deals',
                  ].map((benefit) => (
                    <div
                      key={benefit}
                      className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2"
                    >
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 py-2 px-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                    {error}
                  </div>
                )}

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
                </button>

                <p className="text-center text-xs text-slate-400 mt-4">
                  By signing in, you agree to our terms. Must be 21+ to use this site.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomerAuthModal;
