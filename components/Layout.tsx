import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
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
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-background/80 backdrop-blur-xl border-b border-gold-subtle flex items-center">
      <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className="z-50 flex items-center gap-2">
          {/* Logo Box - Forces black background */}
          <div className="bg-black border border-white/10 rounded-lg p-1">
            <img src="/logo.png?v=3" alt="ToughYuff" className="h-[48px] w-auto object-contain block" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-gold ${isActive(link.path) ? 'text-gold' : 'text-white/80'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <Link
            to="/catalog"
            className="bg-gold text-background px-6 py-3 rounded-lg font-semibold text-sm hover:brightness-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300"
          >
            Browse Vapes
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full h-screen bg-background flex flex-col items-center justify-center gap-8 md:hidden"
            >
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-medium text-white hover:text-gold"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/catalog"
                onClick={() => setIsOpen(false)}
                className="mt-4 bg-gold text-background px-8 py-4 rounded-lg font-bold text-lg"
              >
                Browse Vapes
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/10 py-12 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ToughYuff" className="h-16 w-auto object-contain" />
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

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};
