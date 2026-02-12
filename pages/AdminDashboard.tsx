import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Search, LogOut, Package, RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../src/services/productService';
import AdminProductForm from '../components/AdminProductForm';
import RestockModal from '../components/RestockModal';

interface AdminDashboardProps {
  // Props can be simplified now that it handles its own data
  onLogout: () => void;
  isConnected: boolean; // Keep for now as connection status check
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, isConnected }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const navigate = useNavigate();

  // Load Products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brandName.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // CRUD Handlers
  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await ProductService.deleteProduct(id);
      loadProducts();
    }
  };

  const handleSaveProduct = async (data: Omit<Product, 'id'>) => {
    if (editingProduct) {
      await ProductService.updateProduct(editingProduct.id, data);
    } else {
      await ProductService.addProduct(data);
    }
    loadProducts();
    setShowForm(false);
  };

  const handleQuickStockToggle = async (product: Product) => {
    const newStock = product.inStock ? 0 : 100; // Reset to 100 if enabling, or 0 if disabling (simple logic for now)
    await ProductService.updateProduct(product.id, {
      inStock: !product.inStock,
      stockQuantity: newStock
    });
    // Optimistic Update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, inStock: !p.inStock, stockQuantity: newStock } : p));
  };

  // Restock logic
  const [restockProduct, setRestockProduct] = useState<Product | undefined>(undefined);

  const handleRestockClick = (product: Product) => {
    setRestockProduct(product);
  };

  const handleConfirmRestock = async (id: string, quantity: number, cost: number) => {
    await ProductService.adjustStock(id, quantity);
    // Also update cost if changed
    if (cost !== restockProduct?.costPerUnit) {
      await ProductService.updateProduct(id, { costPerUnit: cost });
    }
    loadProducts();
    setRestockProduct(undefined); // Close modal after confirming
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
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-gold hover:bg-yellow-500 text-black font-bold rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
            <button
              onClick={async () => {
                if (confirm('Verify: Migrate data again?')) {
                  const { migrateDataToFirestore } = await import('../src/utils/migration');
                  await migrateDataToFirestore();
                  loadProducts();
                }
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-text-secondary rounded-lg text-sm font-medium transition-colors"
            >
              Migration Tool
            </button>
            <div className="md:hidden">
              <button onClick={handleLogout} className="text-sm text-text-secondary">Log Out</button>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/5 flex items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <div className="text-sm text-text-tertiary">
              {filtered.length} products
            </div>
            <button onClick={loadProducts} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <RefreshCw className="w-4 h-4 text-text-tertiary" />
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-text-tertiary uppercase tracking-wider">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {filtered.map(product => (
              <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                <div className="col-span-4">
                  <div className="font-medium text-white">{product.name}</div>
                  <div className="text-xs text-text-secondary">{product.brandName}</div>
                </div>

                <div className="col-span-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono ${product.stockQuantity < product.lowStockThreshold ? 'text-red-400 font-bold' : 'text-text-secondary'}`}>
                      {product.stockQuantity}
                    </span>
                    <button onClick={() => handleRestockClick(product)} className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px] text-text-tertiary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      +Add
                    </button>
                  </div>
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
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <AdminProductForm
          initialData={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Restock Modal */}
      {restockProduct && (
        <RestockModal
          product={restockProduct}
          onConfirm={handleConfirmRestock}
          onClose={() => setRestockProduct(undefined)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
