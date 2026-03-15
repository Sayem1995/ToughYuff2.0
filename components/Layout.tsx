import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, Compass, User, ShoppingCart } from 'lucide-react';
import { Category } from '../types';

export const Navbar: React.FC<{ categories?: Category[] }> = ({ categories = [] }) => {
  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <button className="flex items-center justify-center p-2 text-slate-700 dark:text-slate-300">
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-900 dark:text-white">
            Toughyuff<span className="text-primary text-xs align-top">®</span>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center p-2 text-slate-700 dark:text-slate-300">
            <Search className="w-6 h-6" />
          </button>
          <button className="flex items-center justify-center p-2 text-slate-700 dark:text-slate-300 relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary transition-colors'}`}>
        <ShoppingBag className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Shop</span>
      </Link>
      <Link to="/catalog" className={`flex flex-col items-center gap-1 ${isActive('/catalog') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary transition-colors'}`}>
        <Compass className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Explore</span>
      </Link>
      <Link to="/cart" className={`flex flex-col items-center gap-1 ${isActive('/cart') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary transition-colors'}`}>
        <ShoppingCart className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Cart</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary transition-colors'}`}>
        <User className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
      </Link>
    </nav>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; categories?: Category[] }> = ({ children, categories = [] }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <Navbar categories={categories} />
      <main className="max-w-7xl mx-auto flex-grow w-full">
        {children}
      </main>
      <BottomNav />
      <div className="h-24"></div> {/* Spacer for fixed nav */}
    </div>
  );
};
