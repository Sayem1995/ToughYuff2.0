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

import { db } from './src/firebase';
import { ref, onValue, set, update } from 'firebase/database';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });

  const [isConnected, setIsConnected] = useState(false);

  // Check Connection Status
  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");
    return onValue(connectedRef, (snap) => {
      setIsConnected(!!snap.val());
    });
  }, []);

  // Sync with Firebase
  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object back to array if needed, or just use as is if stored as array
        const productList = Array.isArray(data) ? data : Object.values(data);
        setProducts(productList as Product[]);
      } else {
        // Database is empty, seed it with initial data
        set(productsRef, INITIAL_PRODUCTS);
        setProducts(INITIAL_PRODUCTS);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    // Optimistic update (optional, but good for UI responsiveness)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    // Update in Firebase
    // Assuming products are stored as an array, keys are indices 0, 1, 2...
    // But we use 'prod-1', 'prod-2' IDs. 
    // To make it simple, we will find the index of the product in the array
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      const productRef = ref(db, `products/${productIndex}`);
      update(productRef, updates).catch((err) => {
        alert(`Failed to save update: ${err.message}. Check your Firebase Rules!`);
        // Revert the optimistic update since it failed
        setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !updates.inStock } : p));
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-gold">Loading vapes...</div>;
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
                products={products}
                onUpdateProduct={updateProduct}
                onLogout={handleLogout}
                isConnected={isConnected}
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
