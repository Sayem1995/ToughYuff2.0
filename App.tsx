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

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });

  const handleLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

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
