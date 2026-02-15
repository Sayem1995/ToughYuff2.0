import React, { useState, useEffect } from 'react';
import { Product, Brand } from '../types';
import { Search, LogOut, Package, RefreshCw, Plus, Edit2, Trash2, CheckSquare, Square, Trash, BarChart, Filter as FilterIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../src/services/productService';
import { BrandService } from '../src/services/brandService';
import { SystemStatus } from '../components/SystemStatus';
import { migrateDataToFirestore } from '../src/utils/migration';

import AdminProductForm from '../components/AdminProductForm';
import AdminBrandForm from '../components/AdminBrandForm';

interface AdminDashboardProps {
  onLogout: () => void;
  isConnected: boolean;
  connectionError: string | null;
  products: Product[]; // Receive live products from App.tsx
}

interface FilterState {
  brand: string;
  status: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  sort: 'name' | 'priceHigh' | 'priceLow' | 'stockHigh' | 'stockLow';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, isConnected, connectionError, products }) => {
  const [search, setSearch] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

  // Note: We use 'products' from props directly.
  // App.tsx handles the fetching and real-time updates.

  // Bulk Actions & Filters
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    brand: 'all',
    status: 'all',
    sort: 'name'
  });

  // Modal State
  const [showForm, setShowForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [firebaseAuthStatus, setFirebaseAuthStatus] = useState<'pending' | 'authenticated' | 'error'>('pending');

  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const fetchedBrands = await BrandService.getAllBrands();
        setBrands(fetchedBrands);
      } catch (e) {
        console.error("Failed to load brands", e);
      }
    };
    loadBrands();
  }, []);


  const navigate = useNavigate();

  // No loadProducts needed! App.tsx handles it.


  // Filter & Sort Logic
  const filteredAndSorted = React.useMemo(() => {
    let result = products.filter(p => {
      // Search
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brandName.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      // Brand Filter
      if (filters.brand !== 'all' && p.brandId !== filters.brand) return false;

      // Status Filter
      if (filters.status === 'inStock' && !p.inStock) return false;
      if (filters.status === 'outOfStock' && (p.inStock && p.stockQuantity > 0)) return false;
      if (filters.status === 'lowStock' && (p.stockQuantity >= (p.lowStockThreshold || 10) || p.stockQuantity <= 0)) return false;

      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'priceHigh': return b.price - a.price;
        case 'priceLow': return a.price - b.price;
        case 'stockHigh': return b.stockQuantity - a.stockQuantity;
        case 'stockLow': return a.stockQuantity - b.stockQuantity;
        default: return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [products, search, filters]);

  // Bulk Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredAndSorted.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await ProductService.deleteProduct(id);
      // loadProducts(); // Handled by real-time listener
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} products? This cannot be undone.`)) {
      await ProductService.batchDeleteProducts(Array.from(selectedIds));
      setSelectedIds(new Set());
      // loadProducts(); // Handled by real-time listener
    }
  };

  const handleBulkStatusChange = async (inStock: boolean) => {
    await ProductService.batchUpdateStatus(Array.from(selectedIds), inStock);
    setSelectedIds(new Set());
    // loadProducts(); // Handled by real-time listener
  };

  const handleSaveProduct = async (data: Omit<Product, 'id'>) => {
    // If we have an editingProduct AND it has an ID, it's an update.
    // Otherwise (even if editingProduct is set for initial data), it's a creation.
    if (editingProduct && editingProduct.id) {
      await ProductService.updateProduct(editingProduct.id, data);
    } else {
      await ProductService.addProduct(data);
    }
    // loadProducts(); // Handled by real-time listener
    setShowForm(false);
  };

  const handleQuickStockToggle = async (product: Product) => {
    const newStock = product.inStock ? 0 : 100; // Reset to 100 if enabling, or 0 if disabling (simple logic for now)
    await ProductService.updateProduct(product.id, {
      inStock: !product.inStock,
      stockQuantity: newStock
    });
    // Optimistic Update not strictly needed if listener is fast, but good for UX. 
    // However, since we rely on props, we can't setProducts locally easily without desync.
    // Let's rely on the listener for consistency.
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleMigrateData = async () => {
    if (!confirm("WARNING: This will attempt to write initial data to Firestore. Use this only if your database is empty or you want to reset using the constants file.")) return;

    setIsMigrating(true);
    try {
      const result = await migrateDataToFirestore();
      if (result.success) {
        alert(`Migration Successful! Added ${result.count} products.`);
      } else {
        alert(`Migration Failed. Check console for details. Error: ${JSON.stringify(result.error)}`);
      }
    } catch (e) {
      alert("Migration failed with an exception.");
      console.error(e);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-surface border-r border-white/5 flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5 flex flex-col items-center">
          <div className="bg-black border border-white/10 rounded-lg p-2 mb-2">
            <img src="/logo.png?v=3" alt="ToughYuff" className="h-12 w-auto object-contain" />
          </div>
          <span className="text-xs block text-text-tertiary">Admin Console</span>
        </div>
        <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <button
              onClick={() => setFilters(p => ({ ...p, brand: 'all' }))}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${filters.brand === 'all'
                ? 'bg-gold text-surface'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
            >
              <Package className="w-4 h-4" /> All Products
            </button>
          </div>

          <div className="px-4 mb-2 text-xs font-bold text-text-tertiary uppercase tracking-wider">
            Filter by Brand
          </div>
          <div className="space-y-1">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => setFilters(p => ({ ...p, brand: brand.id }))}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${filters.brand === brand.id
                  ? 'bg-gold/10 text-gold border border-gold/20 font-medium'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
              >
                <span>{brand.name}</span>
                {filters.brand === brand.id && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
              </button>
            ))}
          </div>

          <div className="mt-4 px-4 pt-4 border-t border-white/5">
            <button
              onClick={() => setShowBrandForm(true)}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 border-dashed rounded-lg text-xs text-text-secondary hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add New Brand
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-white/5">
          <button onClick={onLogout} className="w-full text-left px-4 py-2 text-text-secondary hover:text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6 md:p-12 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Item Manager <span className="text-sm font-normal text-text-tertiary">({products.length} items)</span></h1>
          </div>
          <div className="flex gap-4 items-center">
            {connectionError && (
              <span className="text-xs text-red-400 bg-red-900/10 px-3 py-1 rounded-full border border-red-500/20">
                {connectionError}
              </span>
            )}
            <button
              onClick={handleMigrateData}
              disabled={isMigrating}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors"
            >
              {isMigrating ? "Initializing..." : "Initialize Database"}
            </button>
            <div className="md:hidden">
              <button onClick={onLogout} className="text-sm text-text-secondary">Log Out</button>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-grow w-full md:w-auto max-w-md">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-gold focus:outline-none text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <select
                value={filters.brand}
                onChange={(e) => setFilters(p => ({ ...p, brand: e.target.value }))}
                className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-text-secondary focus:border-gold outline-none"
              >
                <option value="all">All Brands</option>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(p => ({ ...p, status: e.target.value as any }))}
                className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-text-secondary focus:border-gold outline-none"
              >
                <option value="all">All Status</option>
                <option value="inStock">In Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>

              <select
                value={filters.sort}
                onChange={(e) => setFilters(p => ({ ...p, sort: e.target.value as any }))}
                className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-text-secondary focus:border-gold outline-none"
              >
                <option value="name">Name (A-Z)</option>
                <option value="priceHigh">Price (High-Low)</option>
                <option value="priceLow">Price (Low-High)</option>
                <option value="stockHigh">Stock (High-Low)</option>
                <option value="stockLow">Stock (Low-High)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Bulk Action Bar */}
        {/* Grouped Products View */}
        <div className="divide-y divide-white/5">
          {BRANDS.map(brand => {
            // Filter products for this brand from the global filtered list
            const brandProducts = filteredAndSorted.filter(p => p.brandId === brand.id);

            if (brandProducts.length === 0) return null;

            return (
              <div key={brand.id} className="p-6">
                {/* Brand Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {brand.image && <img src={brand.image} alt={brand.name} className="w-10 h-10 rounded-lg object-cover bg-white/5" />}
                    <div>
                      <h2 className="text-xl font-bold text-white">{brand.name}</h2>
                      <p className="text-xs text-text-secondary">{brand.tagline}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-gold/10 text-gold px-3 py-1 rounded-full border border-gold/20">
                    {brandProducts.length} Products
                  </span>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {brandProducts.map(product => (
                    <div
                      key={product.id}
                      className={`group relative p-4 rounded-xl border transition-all duration-300 ${product.inStock ? 'bg-white/5 border-white/5 hover:border-gold/30 hover:bg-white/10' : 'bg-red-900/10 border-red-500/20 opacity-75'}`}
                    >
                      {/* Status Indicator Dot */}
                      < div className={`absolute top-3 right-3 w-2 h-2 rounded-full z-10 ${product.inStock ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />

                      {/* Product Image */}
                      <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center relative group-hover:scale-[1.02] transition-transform">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : brand.image ? (
                          <img src={brand.image} alt={brand.name} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                          <div className="text-white/20 text-xs">No Image</div>
                        )}
                        {/* Overlay Edit Button */}
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <span className="bg-black/60 px-3 py-1 rounded text-xs backdrop-blur-sm border border-white/20">Edit Image</span>
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-3 pr-4">
                        <h3 className="font-bold text-white text-sm line-clamp-2 min-h-[2.5em]" title={product.name}>{product.name}</h3>
                      </div>

                      <div className="flex flex-col gap-3 mt-auto">
                        {/* Quick Stock Toggle */}
                        <button
                          onClick={() => handleQuickStockToggle(product)}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${product.inStock
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            }`}
                        >
                          {product.inStock ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                              IN STOCK
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                              OUT OF STOCK
                            </>
                          )}
                        </button>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-text-secondary hover:text-white transition-colors flex items-center justify-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-2 py-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Product Card */}
                  <button
                    onClick={() => {
                      setEditingProduct({
                        brandId: brand.id,
                        brandName: brand.name,
                        inStock: true
                      } as any);
                      setShowForm(true);
                    }}
                    className="group relative p-4 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold/30 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                      <Plus className="w-8 h-8 opacity-50 group-hover:opacity-100" />
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-white mb-1">Add Product</span>
                      <span className="text-xs text-text-tertiary">to {brand.name}</span>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Uncategorized Products (Fallback) */}
          {(() => {
            const knownBrandIds = new Set(BRANDS.map(b => b.id));
            const uncategorized = filteredAndSorted.filter(p => !knownBrandIds.has(p.brandId));
            if (uncategorized.length === 0) return null;

            return (
              <div key="uncategorized" className="p-6 bg-red-900/10 border-t border-red-500/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-red-400">Uncategorized / Mismatch</h2>
                    <p className="text-xs text-text-secondary">Products with unknown Brand IDs</p>
                  </div>
                  <span className="text-xs font-medium bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                    {uncategorized.length} Products
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {uncategorized.map(product => (
                    <div key={product.id} className="p-4 rounded-xl border bg-black/20 border-white/10 opacity-75">
                      <h3 className="font-bold text-white text-sm mb-2">{product.name}</h3>
                      <p className="text-xs text-text-tertiary">Brand ID: {product.brandId}</p>
                      <button onClick={() => handleDeleteProduct(product.id)} className="mt-2 text-red-500 text-xs flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Empty Filters State */}
          {filteredAndSorted.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-tertiary text-lg">No products found matching your filters.</p>
              <button onClick={() => { setSearch(''); setFilters({ brand: 'all', status: 'all', sort: 'name' }); }} className="mt-2 text-gold hover:underline text-sm">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Product Form Modal */}
      {
        showForm && (
          <AdminProductForm
            initialData={editingProduct}
            onCancel={() => { setShowForm(false); setEditingProduct(undefined); }}
            onSave={handleSaveProduct}
          />
        )
      }
      <SystemStatus />
    </div >
  );
};

export default AdminDashboard;
