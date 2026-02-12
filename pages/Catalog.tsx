import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, Brand, FilterState, FlavorProfile } from '../types';
import { BRANDS } from '../constants';
import { Filter, Search } from 'lucide-react';

interface CatalogProps {
  products: Product[];
}

const Catalog: React.FC<CatalogProps> = ({ products }) => {
  const [searchParams] = useSearchParams();
  const initialBrand = searchParams.get('brand') || 'all';
  const initialNic = searchParams.get('nicotine') as 'all' | 'zero' | 'nicotine' || 'all';

  const [filters, setFilters] = useState<FilterState>({
    brand: initialBrand,
    flavorProfile: 'all',
    nicotine: initialNic,
    availability: false,
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Brand Filter
      if (filters.brand !== 'all' && product.brandId !== filters.brand) return false;

      // Flavor Profile
      if (filters.flavorProfile !== 'all' && !product.flavorProfile.includes(filters.flavorProfile)) return false;

      // Nicotine
      if (filters.nicotine === 'zero' && !product.isNicotineFree) return false;
      if (filters.nicotine === 'nicotine' && product.isNicotineFree) return false;

      // Availability
      if (filters.availability && !product.inStock) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return product.name.toLowerCase().includes(q) || product.brandName.toLowerCase().includes(q);
      }

      return true;
    });
  }, [products, filters, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Strip */}
      <div className="pt-12 pb-12 px-6 border-b border-white/5 bg-elevated/50">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-4xl font-bold mb-2">All Vapes & Flavors</h1>
          <p className="text-text-secondary">Filter by brand, flavor profile, and nicotine level.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-xl border-b border-white/10 py-4 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-4 lg:items-center justify-between">

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <select
                className="appearance-none bg-surface border border-white/10 text-white pl-4 pr-10 py-2 rounded-lg focus:border-gold focus:outline-none text-sm"
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              >
                <option value="all">All Brands</option>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <Filter className="w-4 h-4 text-text-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-surface border border-white/10 text-white pl-4 pr-10 py-2 rounded-lg focus:border-gold focus:outline-none text-sm"
                value={filters.flavorProfile}
                onChange={(e) => setFilters(prev => ({ ...prev, flavorProfile: e.target.value as any }))}
              >
                <option value="all">All Profiles</option>
                {['Fruity', 'Menthol', 'Dessert', 'Ice', 'Tobacco'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex bg-surface rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setFilters(p => ({ ...p, nicotine: 'all' }))}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filters.nicotine === 'all' ? 'bg-white/10 text-white' : 'text-text-tertiary hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilters(p => ({ ...p, nicotine: 'nicotine' }))}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filters.nicotine === 'nicotine' ? 'bg-white/10 text-white' : 'text-text-tertiary hover:text-white'}`}
              >
                Nicotine
              </button>
              <button
                onClick={() => setFilters(p => ({ ...p, nicotine: 'zero' }))}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filters.nicotine === 'zero' ? 'bg-white/10 text-white' : 'text-text-tertiary hover:text-white'}`}
              >
                Zero
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={filters.availability}
                onChange={(e) => setFilters(p => ({ ...p, availability: e.target.checked }))}
                className="accent-gold w-4 h-4"
              />
              <span className="text-sm text-text-secondary">In Stock Only</span>
            </label>
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search flavors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/10 text-white pl-10 pr-4 py-2 rounded-lg focus:border-gold focus:outline-none text-sm placeholder:text-text-tertiary"
            />
          </div>

        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-tertiary text-lg">No products found matching your filters.</p>
            <button
              onClick={() => {
                setFilters({ brand: 'all', flavorProfile: 'all', nicotine: 'all', availability: false });
                setSearchQuery('');
              }}
              className="mt-4 text-gold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="group bg-card-bg border border-gold-subtle rounded-xl p-8 transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider">{product.brandName}</div>
                  {product.stockQuantity <= 0 || !product.inStock ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-text-tertiary border border-white/10 uppercase">Out of Stock</span>
                  ) : product.stockQuantity < (product.lowStockThreshold || 10) ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase">Low Stock: {product.stockQuantity}</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase">In Stock</span>
                  )}
                </div>

                <div className="aspect-square bg-black/20 rounded-lg mb-6 overflow-hidden flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">{product.name}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-6">{product.description}</p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="px-2 py-1 bg-elevated rounded border border-white/5 text-xs text-text-secondary">{product.puffCount} Puffs</span>
                  <span className={`px-2 py-1 bg-elevated rounded border text-xs ${product.isNicotineFree ? 'border-accent-blue/30 text-accent-blue' : 'border-white/5 text-text-secondary'}`}>{product.nicotine}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
