import React, { useState } from 'react';
import { Product } from '../types';
import { Search, LogOut, Package, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onLogout: () => void;
  isConnected: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onUpdateProduct, onLogout, isConnected }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brandName.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    onLogout();
    navigate('/login');
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
            <h1 className="text-3xl font-bold">Product Availability</h1>
            {!isConnected && (
              <div className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Disconnected - Check Firebase Rules?
              </div>
            )}
            {isConnected && (
              <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Database Connected
              </div>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={handleLogout} className="text-sm text-text-secondary">Log Out</button>
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
              {filtered.length} products found
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-text-tertiary uppercase tracking-wider">
            <div className="col-span-4">Product</div>
            <div className="col-span-3">Brand</div>
            <div className="col-span-2">Puffs</div>
            <div className="col-span-3 text-right">Availability</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {filtered.map(product => (
              <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                <div className="col-span-4 font-medium text-white">{product.name}</div>
                <div className="col-span-3 text-sm text-text-secondary">{product.brandName}</div>
                <div className="col-span-2 text-sm text-text-tertiary">{product.puffCount}</div>
                <div className="col-span-3 flex justify-end">
                  <button
                    onClick={() => onUpdateProduct(product.id, { inStock: !product.inStock })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background ${product.inStock ? 'bg-green-500' : 'bg-gray-700'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.inStock ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
