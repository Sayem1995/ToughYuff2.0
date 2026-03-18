import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, Compass, User, ShoppingCart, ChevronDown, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import StoreSelector from '../src/components/StoreSelector';
import { useCart } from '../src/context/CartContext';
import { useAuth } from '../src/context/AuthContext';
import CustomerAuthModal from './CustomerAuthModal';
import { Category } from '../types';

// Custom Hook to detect scroll direction
function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'top'>('top');
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.pageYOffset : 0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      
      // Top boundary escape hatch
      if (scrollY < 50) {
        if (scrollDirection !== 'top') setScrollDirection('top');
        lastScrollY.current = scrollY;
        ticking = false;
        return;
      }
      
      // Minimum scroll distance before triggering a nav hide/show
      if (Math.abs(scrollY - lastScrollY.current) < 10) {
        ticking = false;
        return;
      }

      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
      }
      
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollDirection]);

  return scrollDirection;
}

export const Navbar: React.FC<{ categories?: Category[] }> = ({ categories = [] }) => {
  const scrollDirection = useScrollDirection();
  const [isOpen, setIsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { itemCount } = useCart();
  const { currentUser, signOutUser, setShowAuthModal } = useAuth();

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { name: 'Brands', path: '/catalog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Login', path: '/login' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className={`sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Menu Button - Opens Mobile Drawer */}
          <button
            className="flex items-center justify-center p-2 text-slate-700 dark:text-slate-300 md:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Nav Links (left side) */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.path) ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Logo (center) */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-900 dark:text-white">
              Toughyuff<span className="text-primary text-xs align-top">®</span>
            </h1>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <StoreSelector />
            </div>
            <button className="flex items-center justify-center p-2 text-slate-700 dark:text-slate-300">
              <Search className="w-6 h-6" />
            </button>
            <Link to="/cart" className="flex items-center justify-center p-2 text-slate-700 dark:text-slate-300 relative">
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Account Button */}
            <div className="relative" ref={userMenuRef}>
              {currentUser ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-primary shadow-sm hover:scale-105 transition-transform"
                    title={currentUser.displayName || 'Account'}
                  >
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser.displayName}</p>
                          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        </div>
                        <button
                          onClick={() => { signOutUser(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[10000] md:hidden backdrop-blur-sm"
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[10001] md:hidden overflow-y-auto shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="block text-primary font-bold tracking-widest text-sm uppercase">Tough Yuff</span>
                  <span className="block text-[10px] text-slate-400 tracking-[0.2em] uppercase">Vape Store</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Store Selector */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <StoreSelector />
              </div>

              {/* Search Bar */}
              <div className="px-6 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-full text-sm outline-none focus:border-primary placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Categories List */}
              <div className="flex-col px-6 py-2 space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/catalog?category=${cat.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-3 text-slate-900 dark:text-white font-bold text-sm tracking-wide border-b border-slate-100 dark:border-slate-800 last:border-0 hover:text-primary transition-colors group"
                  >
                    <span className="capitalize">{cat.name?.toLowerCase()}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-transform -rotate-90 group-hover:rotate-0" />
                  </Link>
                ))}

                {/* View All */}
                <Link
                  to="/catalog"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-3 text-primary font-bold text-sm tracking-wide border-b border-slate-100 dark:border-slate-800 last:border-0 hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                  <span>VIEW ALL PRODUCTS</span>
                  <ChevronDown className="w-4 h-4 text-primary group-hover:text-slate-900 dark:group-hover:text-white transition-transform -rotate-90 group-hover:rotate-0" />
                </Link>
              </div>

              {/* Static Links */}
              <div className="px-6 py-2 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-3 text-slate-600 dark:text-slate-300 font-medium text-sm tracking-wide border-b border-slate-100 dark:border-slate-800 last:border-0 hover:text-primary transition-colors"
                  >
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center text-sm font-bold text-primary hover:text-orange-600 mb-4 tracking-widest">
                  LOGIN / REGISTER
                </Link>
                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide text-center">ToughYuff Smoke Shop</p>
                <div className="text-center text-[10px] text-slate-500">
                  <p>Premium Curation • 21+ Only</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <CustomerAuthModal />
    </>
  );
};

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { itemCount } = useCart();
  const scrollDirection = useScrollDirection();

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 transition-transform duration-300 ease-in-out ${scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'}`}>
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary transition-colors'}`}>
        <ShoppingBag className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Shop</span>
      </Link>
      <Link to="/catalog" className={`flex flex-col items-center gap-1 ${isActive('/catalog') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary transition-colors'}`}>
        <Compass className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Explore</span>
      </Link>
      <Link to="/cart" className={`flex flex-col items-center gap-1 relative ${isActive('/cart') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary transition-colors'}`}>
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 right-0 w-4 h-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest">Cart</span>
      </Link>
      <BottomNavAccount />
    </nav>
  );
};

// Separate component so it can access AuthContext
const BottomNavAccount: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { currentUser, signOutUser, setShowAuthModal } = useAuth();

  if (currentUser) {
    return (
      <button
        onClick={() => signOutUser()}
        className="flex flex-col items-center gap-1 text-primary"
      >
        {currentUser.photoURL ? (
          <img src={currentUser.photoURL} alt="avatar" className="w-6 h-6 rounded-full border border-primary object-cover" />
        ) : (
          <User className="w-6 h-6" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest">Me</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowAuthModal(true)}
      className={`flex flex-col items-center gap-1 ${isActive('/login') ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary transition-colors'}`}
    >
      <User className="w-6 h-6" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Sign In</span>
    </button>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-6 mb-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <h2 className="text-xl font-bold tracking-widest uppercase text-slate-900 dark:text-white">
            Toughyuff<span className="text-primary text-xs align-top">®</span>
          </h2>
        </Link>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-slate-500">
          <Link to="/catalog" className="hover:text-primary transition-colors">Brands</Link>
          <Link to="/catalog" className="hover:text-primary transition-colors">Flavors</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          <span className="hover:text-primary cursor-pointer transition-colors">Age Policy</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Disclaimer</span>
        </div>

        <div className="text-xs text-slate-400 text-center md:text-right">
          <p>© 2026 ToughYuff. All rights reserved.</p>
          <p className="mt-1 text-primary">For adults 21+ only.</p>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; categories?: Category[] }> = ({ children, categories = [] }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <Navbar categories={categories} />
      <main className="max-w-7xl mx-auto flex-grow w-full">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <div className="h-20"></div> {/* Spacer for fixed bottom nav */}
    </div>
  );
};
