import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert, Search, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import StoreSelector from '../src/components/StoreSelector';

import { Category } from '../types';

export const Navbar: React.FC<{ categories?: Category[] }> = ({ categories = [] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showShopMenu, setShowShopMenu] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Brands', path: '/catalog' },
    { name: 'Flavors', path: '/catalog?filter=flavor' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Login', path: '/login' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`sticky top-4 md:top-6 z-[9999] mx-auto h-[64px] md:h-[72px] w-[calc(100%-2rem)] max-w-[1200px] rounded-full flex items-center transition-all duration-500 border ${isScrolled ? 'bg-background/80 backdrop-blur-xl border-black/5 shadow-2xl' : 'bg-transparent border-transparent'}`}>
      <div className="w-full px-6 md:px-8 flex items-center justify-between h-full">
        {/* Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="z-50 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png?v=3" alt="ToughYuff" className="h-[40px] md:h-[48px] w-auto object-contain block bg-white rounded-lg p-1 shadow-sm" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8">
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
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-4 z-50">
          <StoreSelector />
          <div className="w-px h-6 bg-black/10"></div>

          {/* CTA -> Shop Dropdown */}
          <div
            className="relative group z-50"
            onMouseEnter={() => setShowShopMenu(true)}
            onMouseLeave={() => setShowShopMenu(false)}
          >
            <button
              className="bg-gold text-white px-6 py-2.5 rounded-full font-serif italic text-sm font-semibold hover:brightness-110 hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center gap-2"
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
                    <Link to="/" onClick={() => setIsOpen(false)}>
                      <div className="inline-block relative group">
                        <img src="/logo.png?v=3" alt="ToughYuff" className="h-20 w-auto object-contain bg-surface border border-black/5 rounded-xl p-2 mb-3 shadow-sm group-hover:shadow-md transition-all group-hover:border-gold/30" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl mix-blend-overlay"></div>
                      </div>
                    </Link>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                      type="text"
                      placeholder="Search for products..."
                      className="w-full bg-black/5 border border-black/10 text-text-primary pl-10 pr-4 py-3 rounded-full text-sm outline-none focus:border-gold/50 placeholder:text-text-tertiary"
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
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wide">ToughYuff Smoke Shop</p>
                  <div className="text-center text-[10px] text-text-secondary">
                    <p>123 Vapor Lane, Metro City, ST 90210</p>
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
