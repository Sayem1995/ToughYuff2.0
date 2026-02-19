import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, Brand, FilterState, FlavorProfile } from '../types';
import { Filter, Search, MoreVertical, Edit, Trash } from 'lucide-react';
import { ProductService } from '../src/services/productService';
import AdminProductForm from '../components/AdminProductForm';
import { useStore } from '../src/context/StoreContext';
// import { ProductCard } from '../components/ProductCard'; // Removed
import { THCProductCard } from '../components/THCProductCard';

import { Category } from '../types';

interface CatalogProps {
  products: Product[];
  brands?: Brand[];
  categories?: Category[];
}

const Catalog: React.FC<CatalogProps> = ({ products, brands = [], categories = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBrand = searchParams.get('brand') || 'all';
  const initialCategory = searchParams.get('category') || 'all';
  const initialNic = searchParams.get('nicotine') as 'all' | 'zero' | 'nicotine' || 'all';

  const [filters, setFilters] = useState<FilterState & { category: string }>({
    brand: initialBrand,
    category: initialCategory,
    flavorProfile: 'all',
    nicotine: initialNic,
    // availability: false, // Removed filter, now enforced
  });

  // Sync URL with filters
  React.useEffect(() => {
    if (searchParams.get('category') !== filters.category) {
      setFilters(prev => ({ ...prev, category: searchParams.get('category') || 'all' }));
    }
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState('');

  // Admin Features
  const { currentStore } = useStore();
  const [isAdmin] = useState(() => localStorage.getItem('admin_auth') === 'true');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleEditProduct = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleDeleteProduct = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    if (confirm('Are you sure you want to delete this product?')) {
      await ProductService.deleteProduct(productId);
    }
  };

  const handleSaveProduct = async (data: Omit<Product, 'id'>) => {
    if (editingProduct && editingProduct.id) {
      await ProductService.updateProduct(editingProduct.id, data);
    }
    setShowEditForm(false);
    setEditingProduct(undefined);
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category Filter (NEW)
      if (filters.category !== 'all') {
        // If product has no category, it might belong to 'Disposable Vape' by default if we haven't migrated yet.
        // For now, loose match or strictly match if product.category exists.
        if (product.category !== filters.category) return false;
      }

      // Brand Filter
      if (filters.brand !== 'all' && product.brandId !== filters.brand) return false;

      // Flavor Profile
      if (filters.flavorProfile !== 'all' && !product.flavorProfile.includes(filters.flavorProfile)) return false;

      // Nicotine
      if (filters.nicotine === 'zero' && !product.isNicotineFree) return false;
      if (filters.nicotine === 'nicotine' && product.isNicotineFree) return false;

      // Availability - ALWAYS ENFORCE IN STOCK for frontend
      if (!product.inStock) return false;
      // if (filters.availability && !product.inStock) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (product.name || '').toLowerCase();
        const brand = (product.brandName || '').toLowerCase();
        return name.includes(q) || brand.includes(q);
      }

      return true;
    });
  }, [products, filters, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Strip */}
      <div className="pt-12 pb-12 px-6 border-b border-black/5 bg-elevated/50">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-text-primary">
            {filters.category !== 'all'
              ? categories.find(c => c.id === filters.category)?.name || 'Products'
              : 'All Vapes & Flavors'}
          </h1>
          <p className="text-text-secondary">Filter by brand, flavor profile, and nicotine level.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-xl border-b border-black/10 py-4 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-4 lg:items-center justify-between">

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <select
                className="appearance-none bg-surface border border-black/10 text-text-primary pl-4 pr-10 py-2 rounded-lg focus:border-gold focus:outline-none text-sm"
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              >
                <option value="all">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <Filter className="w-4 h-4 text-text-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-surface border border-black/10 text-text-primary pl-4 pr-10 py-2 rounded-lg focus:border-gold focus:outline-none text-sm"
                value={filters.flavorProfile}
                onChange={(e) => setFilters(prev => ({ ...prev, flavorProfile: e.target.value as any }))}
              >
                <option value="all">All Profiles</option>
                {['Fruity', 'Menthol', 'Dessert', 'Ice', 'Tobacco'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex bg-surface rounded-lg p-1 border border-black/10">
              <button
                onClick={() => setFilters(p => ({ ...p, nicotine: 'all' }))}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filters.nicotine === 'all' ? 'bg-black/10 text-text-primary' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilters(p => ({ ...p, nicotine: 'nicotine' }))}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filters.nicotine === 'nicotine' ? 'bg-black/10 text-text-primary' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                Nicotine
              </button>
              <button
                onClick={() => setFilters(p => ({ ...p, nicotine: 'zero' }))}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${filters.nicotine === 'zero' ? 'bg-black/10 text-text-primary' : 'text-text-tertiary hover:text-text-primary'}`}
              >
                Zero
              </button>
            </div>

            {/* Availability Filter Removed - Always In Stock */}
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search flavors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-black/10 text-text-primary pl-10 pr-4 py-2 rounded-lg focus:border-gold focus:outline-none text-sm placeholder:text-text-tertiary"
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
                setFilters({ brand: 'all', flavorProfile: 'all', nicotine: 'all', category: 'all' } as any);
                setSearchQuery('');
                setSearchParams({});
              }}
              className="mt-4 text-gold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              product.category === 'thc-disposables' ? (
                <THCProductCard key={product.id} product={product} />
              ) : (
                <Link to={`/product/${product.id}`} key={product.id} className="group relative bg-card-bg border border-black/5 rounded-xl p-8 transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg">
                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === product.id ? null : product.id);
                        }}
                        className="p-2 bg-white/50 hover:bg-white/80 text-text-primary rounded-full transition-colors backdrop-blur-sm shadow-sm"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === product.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-surface border border-black/10 rounded-lg shadow-xl overflow-hidden z-30">
                          <button
                            onClick={(e) => handleEditProduct(e, product)}
                            className="w-full text-left px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-black/5 flex items-center gap-2"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteProduct(e, product.id)}
                            className="w-full text-left px-4 py-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider">{product.brandName}</div>
                    {/* Stock Status Removed */}
                  </div>

                  <div className="aspect-square bg-black/5 rounded-lg mb-6 overflow-hidden flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>

                  <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-gold transition-colors">{product.name}</h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-6">{product.description}</p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-2 py-1 bg-elevated rounded border border-black/5 text-xs text-text-secondary">{product.puffCount} Puffs</span>
                    <span className={`px-2 py-1 bg-elevated rounded border text-xs ${product.isNicotineFree ? 'border-accent-blue/30 text-accent-blue' : 'border-black/5 text-text-secondary'}`}>{product.nicotine}</span>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </div>

      {/* Admin Edit Modal */}
      {
        showEditForm && (
          <AdminProductForm
            initialData={editingProduct}
            brands={brands}
            categories={categories}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowEditForm(false);
              setEditingProduct(undefined);
            }}
          />
        )
      }
    </div >
  );
};

export default Catalog;
