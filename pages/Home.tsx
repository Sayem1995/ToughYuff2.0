import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../src/context/CartContext';

interface HomeProps {
  brands?: any[];
  categories?: any[];
  products?: Product[];
}

/* Small wrapper so each card can track its own "just added" state */
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link to={`/product/${product.id}`} className="flex flex-col group">
      {/* Image container - Modern Card */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-soft transition-all duration-500 group-hover:shadow-large group-hover:border-primary/30">
        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
        )}
        
        {/* Product Image */}
        <img
          src={product.image || 'https://via.placeholder.com/400x500?text=No+Image'}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {!product.inStock && (
            <span className="inline-flex items-center px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          )}
          {product.features && product.features.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 bg-gradient-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-glow">
              Featured
            </span>
          )}
        </div>

        {/* Hover overlay with animated Add-to-Cart */}
        <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={handleAdd}
            className={`absolute bottom-4 left-4 right-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2
              transition-all duration-300 backdrop-blur-md
              ${added
                ? 'bg-success/90 text-white scale-95'
                : 'bg-white/90 text-slate-900 hover:bg-primary hover:text-white shadow-lg'
              }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 animate-bounce" /> Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="mt-3 flex flex-col items-center text-center">
        <h3 className="text-slate-900 dark:text-white text-sm md:text-base font-semibold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-primary font-bold mt-1.5 text-base">${product.price || '0.00'}</p>
      </div>
    </Link>
  );
};

const Home: React.FC<HomeProps> = ({ products = [], categories = [] }) => {
  return (
    <div className="pb-20 animate-fade-in">
      {/* Hero Banner - Modern Design */}
      <section className="px-4 md:px-8 py-8">
        <div className="relative w-full h-56 md:h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-gold/5 to-transparent dark:from-primary/20 dark:via-gold/10 flex items-center px-6 md:px-12 border border-black/5 shadow-medium">
          <div className="z-10 max-w-xs md:max-w-lg animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20 mb-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft"></span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Premium Collection</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-3">
              The <span className="text-gradient">Gold Standard</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-md">
              Experience premium craftsmanship in every puff. Curated selection of the finest products.
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-2/5 bg-cover bg-center opacity-90" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuByjSvh-iRHNa6NuA8YWqE8vvKh_f3_qqZeq2qXsBSsp3YlA2JRIayCJ9dlFPW532Vgv6N6BBBXGHIqdU7Jqro2rC1uFtE3PLYGtXAG4HG4fJH7zQh81AMyC0E8mUbSkTzokPznw61Wzxv3n1xWKH9lPz0s0O-YtYoK69wUOjZ9q065LcRUeU76HR-kBoRC6ayvG80CWOOsXVlI21NITPyy8Dj6Ex1BmfRjMCWrrgnhauE-mCEE9AfqmoO6oJcPczWgdfOAnD74FGA')" }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background-light via-background-light/90 to-transparent dark:from-background-dark dark:via-background-dark/90"></div>
        </div>
      </section>

      {/* Category Horizontal Scroll - Enhanced Pills */}
      <div className="flex gap-2.5 px-4 md:px-8 py-5 overflow-x-auto no-scrollbar scroll-smooth">
        <Link to="/catalog" className="flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-full bg-gradient-primary text-white px-6 transition-all duration-300 text-sm font-semibold shadow-glow hover:shadow-lg hover:scale-105 active:scale-95">
          All Products
        </Link>
        {categories.slice(0, 8).map((cat) => (
          <Link to={`/catalog?category=${cat.id}`} key={cat.id} className="flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 text-sm font-medium shadow-soft hover:shadow-md active:scale-95">
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Product Grid - Enhanced Cards */}
      <div className="px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Products</h3>
            <p className="text-sm text-slate-500 mt-1">Discover our top selections</p>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 group">
            View All
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
