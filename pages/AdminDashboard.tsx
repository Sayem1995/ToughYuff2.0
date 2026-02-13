import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Search, LogOut, Package, RefreshCw, Plus, Edit2, Trash2, CheckSquare, Square, Trash, BarChart, Filter as FilterIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../src/services/productService';
import AdminProductForm from '../components/AdminProductForm';

import { BRANDS } from '../constants';

interface AdminDashboardProps {
  onLogout: () => void;
  isConnected: boolean;
  products: Product[]; // Receive live products from App.tsx
}

interface FilterState {
  brand: string;
  status: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  sort: 'name' | 'priceHigh' | 'priceLow' | 'stockHigh' | 'stockLow';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, isConnected, products }) => {
  // const [products, setProducts] = useState<Product[]>([]); // Removed local state
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false); // No longer loading on mount

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
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

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
    if (editingProduct) {
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-surface border-r border-white/5 flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5">
          <span className="font-bold text-gold text-xl">TooughYuff</span>
          <span className="text-xs block text-text-tertiary mt-1">Admin Console</span>
        </div>
        <div className="p-4 space-y-2 flex-grow">
          <button className="w-full text-left px-4 py-2 bg-white/5 text-white rounded-lg font-medium flex items-center gap-2">
            <Package className="w-4 h-4" /> Products
          </button>
        </div>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-text-secondary hover:text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6 md:p-12 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            {loading && <span className="text-xs text-gold animate-pulse">Syncing...</span>}
          </div>
          <div className="flex gap-4">
            <div className="md:hidden">
              <button onClick={handleLogout} className="text-sm text-text-secondary">Log Out</button>
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
        {selectedIds.size > 0 && (
          <div className="bg-gold/10 border-b border-gold/20 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-sm text-gold font-medium">
              <CheckSquare className="w-4 h-4" />
              {selectedIds.size} selected
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleBulkStatusChange(true)} className="px-3 py-1.5 bg-background border border-gold/20 hover:border-gold text-white text-xs rounded transition-colors">
                Mark In Stock
              </button>
              <button onClick={() => handleBulkStatusChange(false)} className="px-3 py-1.5 bg-background border border-gold/20 hover:border-gold text-white text-xs rounded transition-colors">
                Mark Out of Stock
              </button>
              <div className="w-px bg-gold/20 mx-1" />
              <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-900/20 border border-red-500/20 hover:bg-red-900/40 text-red-500 text-xs rounded transition-colors flex items-center gap-1">
                <Trash className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-text-tertiary uppercase tracking-wider items-center">
          <div className="col-span-1">
            <input
              type="checkbox"
              className="accent-gold w-4 h-4 rounded"
              checked={selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0}
              onChange={handleSelectAll}
            />
          </div>
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {filteredAndSorted.map(product => (
            <div key={product.id} className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group ${selectedIds.has(product.id) ? 'bg-gold/5' : ''}`}>
              <div className="col-span-1">
                <input
                  type="checkbox"
                  className="accent-gold w-4 h-4 rounded"
                  checked={selectedIds.has(product.id)}
                  onChange={() => handleSelectOne(product.id)}
                />
              </div>
              <div className="col-span-5">
                <div className="font-medium text-white">{product.name}</div>
                <div className="text-xs text-text-secondary">{product.brandName}</div>
              </div>

              <div className="col-span-2 text-sm text-text-secondary">
                ${product.price?.toFixed(2)}
              </div>

              <div className="col-span-2">
                <button
                  onClick={() => handleQuickStockToggle(product)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.inStock ? 'bg-green-500' : 'bg-gray-700'}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.inStock ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
                <span className="ml-2 text-xs text-text-secondary">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="col-span-2 flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditProduct(product)} className="p-1 hover:text-gold transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteProduct(product.id)} className="p-1 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredAndSorted.length === 0 && (
            <div className="p-8 text-center text-text-tertiary">
              {filteredAndSorted.length} products found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Product Form Modal */ }
  {
    showForm && (
      <AdminProductForm
        initialData={editingProduct}
        onSave={handleSaveProduct}
        onCancel={() => setShowForm(false)}
      />
    )
  }
    </div >
  );
};

export default AdminDashboard;
