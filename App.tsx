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
import { ProductService } from './src/services/productService';
import { collection, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });

  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Sync with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      // Create products array
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

      if (productList.length === 0) {
        // If empty, it might be a fresh db or just no data.
        // We set products to empty array here, letting the Admin verify.
        // Or we can keep falling back to constants for demo purposes until data exists.
        // Let's stick to the fallback logic for now to keep the app usable,
        // BUT we set a flag so Admin knows it's using fallback data.
        console.warn("Firestore collection is empty. Using fallback data.");
        setProducts(INITIAL_PRODUCTS);
        // We don't necessarily call this an 'error', but we can track it as 'using fallback'.
        setConnectionError("Database is empty. Using static data.");
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
      setProducts(INITIAL_PRODUCTS);
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
