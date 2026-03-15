import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../src/context/CartContext';

interface HomeProps {
  brands?: any[];
  categories?: any[];
  products?: Product[];
}

const Home: React.FC<HomeProps> = ({ products = [], categories = [] }) => {
  const { addToCart } = useCart();

  return (
    <div className="pb-20">
      {/* Hero Banner Subtle */}
      <section className="px-6 py-8">
        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center px-6 md:px-10 border border-slate-200 dark:border-slate-800">
          <div className="z-10 max-w-xs md:max-w-md">
            <h2 className="text-2xl md:text-4xl font-light leading-tight">The Gold <br/><span className="font-bold">Standard</span></h2>
            <p className="text-slate-500 text-xs md:text-sm mt-2">Experience premium craftsmanship in every puff.</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuByjSvh-iRHNa6NuA8YWqE8vvKh_f3_qqZeq2qXsBSsp3YlA2JRIayCJ9dlFPW532Vgv6N6BBBXGHIqdU7Jqro2rC1uFtE3PLYGtXAG4HG4fJH7zQh81AMyC0E8mUbSkTzokPznw61Wzxv3n1xWKH9lPz0s0O-YtYoK69wUOjZ9q065LcRUeU76HR-kBoRC6ayvG80CWOOsXVlI21NITPyy8Dj6Ex1BmfRjMCWrrgnhauE-mCEE9AfqmoO6oJcPczWgdfOAnD74FGA')" }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background-light via-background-light/80 to-transparent dark:from-background-dark dark:via-background-dark/80"></div>
        </div>
      </section>

      {/* Category Horizontal Scroll */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar scroll-smooth">
        <Link to="/catalog" className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 transition-all duration-300 text-sm font-semibold">
          All
        </Link>
        {categories.map((cat) => (
          <Link to={`/catalog?category=${cat.id}`} key={cat.id} className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 text-slate-600 dark:text-slate-300 hover:border-primary transition-all duration-300 text-sm font-medium">
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {products.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="flex flex-col group">
            <div className="relative w-full aspect-[4/5] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-transform duration-500 group-hover:shadow-lg">
              <div 
                className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-110" 
                style={{ backgroundImage: `url(${product.image || 'https://via.placeholder.com/400x500?text=No+Image'})` }}
              ></div>
              {!product.inStock && (
                <div className="absolute top-3 left-3 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Out of Stock</div>
              )}
              {product.features && product.features.length > 0 && (
                <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Featured</div>
              )}
            </div>
            <div className="mt-4 flex flex-col items-center text-center">
              <h3 className="text-slate-900 dark:text-white text-base font-semibold tracking-tight line-clamp-1">{product.name}</h3>
              <p className="text-primary font-bold mt-1">${product.price || '0.00'}</p>
              <div className="mt-3 flex gap-2 w-full">
                <Link to={`/product/${product.id}`} className="flex-1 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all duration-300 uppercase tracking-widest text-center">
                  Details
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                  className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-3 h-3" /> Cart
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
