import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AgeGate } from './components/AgeGate';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { INITIAL_PRODUCTS } from './constants';
import { Product } from './types';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import { db, isFirebaseInitialized } from './src/firebase';
import { ProductService } from './src/services/productService';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useStore } from './src/context/StoreContext';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentStore, switchStore } = useStore();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });

  // Enforce Admin Store Context
  useEffect(() => {
    if (isAdminAuthenticated) {
      const adminStore = localStorage.getItem('toughyuff_admin_store') as any;
      if (adminStore && adminStore !== currentStore) {
        console.log(`App: Enforcing admin store context to ${adminStore}`);
        switchStore(adminStore);
      }
    }
  }, [isAdminAuthenticated, currentStore, switchStore]);

  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Sync with Firestore
  useEffect(() => {
    if (!isFirebaseInitialized) {
      setLoading(false);
      return;
    }

    // Filter by currentStore
    const q = query(collection(db, 'products'), where('storeId', '==', currentStore));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Create products array
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

      if (productList.length === 0) {
        // If empty, it might be a fresh db or just no data.
        // We set products to empty array here, letting the Admin verify.
        // Or we can keep falling back to constants for demo purposes until data exists.
        // Let's stick to the fallback logic for now to keep the app usable,
        // BUT we set a flag so Admin knows it's using fallback data.
        console.warn(`Firestore collection is empty for store: ${currentStore}. Using fallback data.`);

        // IMPORTANT: Fallback data needs to be filtered effectively or just show nothing?
        // If we show nothing, it proves the filter works. If we show all constants, it's confusing.
        // Let's show empty for now to prove isolation, unless it's genuinely empty (new store).
        // Actually, preventing "Using fallback data" for TEN 2 TEN if we just migrated it is key.
        // Since we migrated, it SHOULD have data.

        setProducts([]);
        // setProducts(INITIAL_PRODUCTS); // Disable fallback for multi-store clarity
        // setConnectionError("Database is empty. Using static data.");
      } else {
        setProducts(productList);
        setConnectionError(null); // Clear error if we got data
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setConnectionError(`Connection Error: ${error.message}`);
      setLoading(false);
      // Fallback to offline mode/constants
      const fallbackProducts = INITIAL_PRODUCTS.filter(p => p.storeId === currentStore);
      setProducts(fallbackProducts);
    });

    return () => unsubscribe();
  }, [currentStore]);

  const handleLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-gold">Loading vapes...</div>;
  }

  if (!isFirebaseInitialized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="max-w-xl bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Configuration Error</h1>
          <p className="text-lg mb-6">The application could not start because the Firebase configuration is missing.</p>

          <div className="bg-black/30 p-4 rounded-lg text-left text-sm font-mono text-text-secondary mb-6 overflow-x-auto">
            <p className="text-gold mb-2">// Missing Environment Variables in Vercel:</p>
            <p>VITE_FIREBASE_API_KEY=...</p>
            <p>VITE_FIREBASE_PROJECT_ID=...</p>
            <p>...</p>
          </div>

          <p className="text-text-tertiary text-sm">
            Please go to <strong>Vercel Project Settings {'>'} Environment Variables</strong> and add your <code>.env</code> values.
          </p>
          <p className="text-text-tertiary text-xs mt-4">
            Then click <strong>Redeploy</strong> in the Deployments tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <AgeGate />

      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/catalog" element={<Layout><Catalog products={products} /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductDetail products={products} /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />

        {/* Login Route (No Layout) */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Protected Admin Route (No Layout) */}
        <Route
          path="/admin"
          element={
            isAdminAuthenticated ? (
              <AdminDashboard
                onLogout={handleLogout}
                isConnected={!connectionError}
                connectionError={connectionError}
                products={products}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
