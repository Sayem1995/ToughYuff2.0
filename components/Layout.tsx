import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert, Search, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import StoreSelector from '../src/components/StoreSelector';

import { Category } from '../types';

export const Navbar: React.FC<{ categories?: Category[] }> = ({ categories = [] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showShopMenu, setShowShopMenu] = React.useState(false);
  const location = useLocation();

  const links = [
    { name: 'Brands', path: '/catalog' },
    { name: 'Flavors', path: '/catalog?filter=flavor' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Login', path: '/login' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] h-[72px] bg-background/80 backdrop-blur-xl border-b border-gold/10 flex items-center">
      <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className="z-50 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png?v=3" alt="ToughYuff" className="h-[56px] w-auto object-contain block bg-white rounded-lg p-1.5 shadow-sm" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-gold ${isActive(link.path) ? 'text-gold' : 'text-text-secondary'
                }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="w-px h-6 bg-black/10 mx-2"></div>
          <StoreSelector />
        </div>

        {/* CTA -> Shop Dropdown */}
        <div
          className="hidden md:block relative group"
          onMouseEnter={() => setShowShopMenu(true)}
          onMouseLeave={() => setShowShopMenu(false)}
        >
          <button
            className="bg-gold text-white px-6 py-3 rounded-lg font-semibold text-sm hover:brightness-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center gap-2"
          >
            Shop <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showShopMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-64 bg-surface border border-black/5 rounded-xl shadow-2xl overflow-hidden py-2"
              >
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/catalog?category=${cat.id}`}
                      className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-xs text-text-tertiary">No categories found</div>
                )}
                <div className="border-t border-black/5 mt-2 pt-2">
                  <Link to="/catalog" className="block px-4 py-2 text-sm text-gold hover:text-yellow-600 font-bold">
                    View All Products
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-text-primary z-50 flex items-center gap-4"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Show store selector on mobile header explicitly or just in menu? Let's put in menu to save space, or here? */}
          {/* Actually, putting it here makes it accessible. */}
          <div onClick={(e) => e.stopPropagation()}>
            <StoreSelector />
          </div>
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Nav Overlay / Sidebar */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/20 z-[10000] md:hidden backdrop-blur-sm"
              />

              {/* Sidebar Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-surface border-r border-black/5 z-[10001] md:hidden overflow-y-auto shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                  <div className="flex flex-col items-center mx-auto">
                    <img src="/logo.png?v=3" alt="ToughYuff" className="h-20 w-auto object-contain bg-white rounded-xl p-2 mb-3 shadow-sm hover:opacity-90 transition-opacity" />
                    {/* Text Logo if needed, but image is likely enough based on ref */}
                    <div className="text-center">
                      <span className="block text-gold font-bold tracking-widest text-sm">TOUGH YUFF</span>
                      <span className="block text-[10px] text-text-tertiary tracking-[0.2em]">VAPE STORE</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for products..."
                      className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-full text-sm outline-none focus:border-gold/50 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Categories List */}
                <div className="flex-col px-6 py-2 space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/catalog?category=${cat.id}`} // Placeholder link
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-3 text-white/90 font-bold text-sm tracking-wide border-b border-white/5 last:border-0 hover:text-gold transition-colors group"
                    >
                      <span>{cat.name}</span>
                      <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-gold transition-transform -rotate-90 group-hover:rotate-0" />
                    </Link>
                  ))}

                  {/* View All */}
                  <Link
                    to="/catalog"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-3 text-gold font-bold text-sm tracking-wide border-b border-white/5 last:border-0 hover:text-white transition-colors group"
                  >
                    <span>VIEW ALL VAPES</span>
                    <ChevronDown className="w-4 h-4 text-gold group-hover:text-white transition-transform -rotate-90 group-hover:rotate-0" />
                  </Link>
                </div>

                {/* Footer / Extra Links */}
                <div className="mt-auto p-6 bg-black/20 border-t border-white/5">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center text-sm font-bold text-gold/80 mb-4 hover:text-gold tracking-widest">
                    LOGIN / REGISTER
                  </Link>
                  <div className="text-center text-[10px] text-gray-600">
                    © 2026 TOUGH YUFF
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-black/5 py-12 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="ToughYuff" className="h-20 w-auto object-contain bg-white rounded-xl p-2 shadow-sm" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-text-secondary">
          <Link to="/catalog" className="hover:text-gold transition-colors">Brands</Link>
          <Link to="/catalog" className="hover:text-gold transition-colors">Flavors</Link>
          <Link to="/about" className="hover:text-gold transition-colors">About</Link>
          <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
          <span className="hover:text-gold cursor-pointer transition-colors">Age Policy</span>
          <span className="hover:text-gold cursor-pointer transition-colors">Disclaimer</span>
        </div>

        <div className="text-xs text-text-tertiary text-center md:text-right">
          <p>© 2026 TooughYuff. All rights reserved.</p>
          <p className="mt-1 text-gold">For adults 21+ only.</p>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; categories?: Category[] }> = ({ children, categories = [] }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar categories={categories} />
      <main className="flex-grow pt-[72px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};
