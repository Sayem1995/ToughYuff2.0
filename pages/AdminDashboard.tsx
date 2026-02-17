import React, { useState, useEffect } from 'react';
import { Product, Brand, Category } from '../types';
import { Search, LogOut, Package, CheckSquare, Plus, Edit2, Trash2, BarChart, Filter as FilterIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../src/services/productService';
import { BrandService } from '../src/services/brandService';
import { SystemStatus } from '../components/SystemStatus';
import { migrateDataToFirestore } from '../src/utils/migration';

import AdminProductForm from '../components/AdminProductForm';
import AdminBrandForm from '../components/AdminBrandForm';
import AdminCategoryForm from '../components/AdminCategoryForm';
import { SortableBrandItem } from '../components/SortableBrandItem';
import { SortableCategoryItem } from '../components/SortableCategoryItem';
import { CategoryService } from '../src/services/categoryService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BRANDS } from '../constants';

import { useStore } from '../src/context/StoreContext';

interface AdminDashboardProps {
  onLogout: () => void;
  isConnected: boolean;
  connectionError: string | null;
  products: Product[]; // Receive live products from App.tsx
  categories: Category[]; // Receive live categories from App.tsx
}

interface FilterState {
  brand: string;
  status: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  sort: 'name' | 'priceHigh' | 'priceLow' | 'stockHigh' | 'stockLow';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, isConnected, connectionError, products, categories }) => {
  const { currentStore, switchStore } = useStore();
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
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [firebaseAuthStatus, setFirebaseAuthStatus] = useState<'pending' | 'authenticated' | 'error'>('pending');

  const [dynamicBrands, setDynamicBrands] = useState<Brand[]>([]);
  const [brandOrder, setBrandOrder] = useState<string[]>([]);

  // Use props.categories directly
  // Sort them by order for display
  const dynamicCategories = React.useMemo(() => {
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
  }, [categories]);

  // Sensors for Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // View State - activeTab can be 'products', 'categories', or a category slug
  // Default to 'disposable-vape' if it exists, else 'products'
  const [activeTab, setActiveTab] = useState<string>('disposable-vapes');

  // Combine static BRANDS with dynamic ones
  const allBrands = React.useMemo(() => {
    // Create a map to avoid duplicates if migration ran and added static brands to DB
    const brandMap = new Map<string, Brand>();

    // Add static brands first
    BRANDS.forEach(b => brandMap.set(b.id, b));

    // Add/Overwrite with dynamic brands
    dynamicBrands.forEach(b => brandMap.set(b.id, b));

    return Array.from(brandMap.values()) as Brand[];
  }, [dynamicBrands]);

  // Sidebar Brands Sorted by Custom Order
  const sidebarBrands = React.useMemo(() => {
    if (brandOrder.length === 0) return allBrands;

    const sorted = [...allBrands].sort((a, b) => {
      const indexA = brandOrder.indexOf(a.id);
      const indexB = brandOrder.indexOf(b.id);

      // If both are in the order list, sort by index
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;

      // If only A is in list, A comes first
      if (indexA !== -1) return -1;

      // If only B is in list, B comes first
      if (indexB !== -1) return 1;

      // If neither, sort alphabetical
      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [allBrands, brandOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      if (!over) return;

      if (activeTab === 'categories') {
        if (active.id !== over.id) {
          const oldIndex = dynamicCategories.findIndex((c) => c.id === active.id);
          const newIndex = dynamicCategories.findIndex((c) => c.id === over.id);

          const newOrderedCategories = arrayMove(dynamicCategories, oldIndex, newIndex);
          // With props, we can't set state locally. We just fire the service call.
          // App.tsx will update props when Firestore updates.

          // Update order property and save
          const reorderedForSave = newOrderedCategories.map((cat, index) => ({
            ...cat,
            order: index,
          }));
          CategoryService.reorderCategories(reorderedForSave);
        }
      } else if (activeTab !== 'products') {
        // Brand Reordering
        if (active.id !== over.id) {
          const oldIndex = sidebarBrands.findIndex((b) => b.id === active.id);
          const newIndex = sidebarBrands.findIndex((b) => b.id === over.id);

          const newOrderBrands = arrayMove(sidebarBrands, oldIndex, newIndex) as Brand[];
          const newOrderIds = newOrderBrands.map(b => b.id);

          setBrandOrder(newOrderIds); // Optimistic UI
          BrandService.saveBrandOrder(newOrderIds, currentStore);
        }
      }
    }
  };

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const [fetchedBrands, fetchedOrder] = await Promise.all([
          BrandService.getAllBrands(currentStore),
          BrandService.getBrandOrder(currentStore)
        ]);
        setDynamicBrands(fetchedBrands);
        setBrandOrder(fetchedOrder);
      } catch (e) {
        console.error("Failed to load brands", e);
      }
    };
    loadBrands();
  }, [currentStore]);


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
      await ProductService.addProduct({ ...data, storeId: currentStore });
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

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setShowBrandForm(true);
  };

  const handleSaveBrand = async (data: Omit<Brand, 'id'>) => {
    if (editingBrand) {
      await BrandService.updateBrand(editingBrand.id, data);
    } else {
      await BrandService.addBrand({ ...data, storeId: currentStore });
    }
    const fetchedBrands = await BrandService.getAllBrands(currentStore);
    setDynamicBrands(fetchedBrands);
    setShowBrandForm(false);
    setEditingBrand(undefined);
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (confirm('Are you sure you want to delete this brand? Products associated with it might be orphaned.')) {
      try {
        await BrandService.deleteBrand(brandId);
        // Refresh brands
        const [fetchedBrands, fetchedOrder] = await Promise.all([
          BrandService.getAllBrands(currentStore),
          BrandService.getBrandOrder(currentStore)
        ]);
        setDynamicBrands(fetchedBrands);
        setBrandOrder(fetchedOrder); // Maintain order or update it? Deleting might shift things.
      } catch (e) {
        console.error("Failed to delete brand", e);
        alert("Failed to delete brand");
      }
    }
  };

  // Category Handlers
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await CategoryService.deleteCategory(id);
    }
  };

  const handleSaveCategory = async (data: Omit<Category, 'id'>) => {
    if (editingCategory) {
      await CategoryService.updateCategory(editingCategory.id, data);
    } else {
      // Assign an order to new categories
      const newOrder = dynamicCategories.length > 0 ? Math.max(...dynamicCategories.map(c => c.order || 0)) + 1 : 0;
      await CategoryService.addCategory({ ...data, storeId: currentStore, order: newOrder });
    }
    setShowCategoryForm(false);
    setEditingCategory(undefined);
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

  const handleRepairCategories = async () => {
    if (!confirm("This will ensure all default categories exist. Continue?")) return;
    try {
      const { DEFAULT_CATEGORIES, CategoryService } = await import('../src/services/categoryService');
      await CategoryService.ensureCategories(currentStore as any, DEFAULT_CATEGORIES);
      alert("Categories repaired successfully! The sidebar should update shortly.");
    } catch (e) {
      console.error(e);
      alert("Failed to repair categories.");
    }
  };

  const handleBrandClick = (brandId: string) => {
    setFilters(prev => ({ ...prev, brand: brandId }));
    setActiveTab('products');
  };

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/5 bg-surface flex flex-col">

        {/* Sidebar Header */}
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
            <h1 className="text-lg font-bold text-gold tracking-widest">ADMIN</h1>
          </div>
          <p className="text-xs text-text-tertiary uppercase tracking-wider">{currentStore === 'goldmine' ? 'Goldmine Vape' : 'Ten 2 Ten'}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="p-4 space-y-2">
          {dynamicCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.slug)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === category.slug ? 'bg-gold text-black' : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}`}
            >
              <Package className="w-4 h-4" />
              {/* Format Name: Title Case if all caps */}
              <span className="capitalize">{category.name.toLowerCase()}</span>
            </button>
          ))}

          <div className="my-2 border-t border-black/5 mx-4" />

          {/* Fallback/Utility for All Products if needed, or just Manage Categories */}
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-gold text-black' : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}`}
          >
            <CheckSquare className="w-4 h-4" /> All Items (Inventory)
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-gold text-black' : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}`}
          >
            <BarChart className="w-4 h-4" /> Manage Categories
          </button>
        </div>



        <div className="p-4 mt-auto border-t border-black/5 space-y-2">
          <button onClick={handleRepairCategories} className="w-full flex items-center gap-2 text-text-secondary hover:text-gold text-xs">
            <BarChart className="w-3 h-3" /> Repair Categories
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside >

      {/* Main Content */}
      < main className="flex-1 flex flex-col min-w-0" >
        {/* Header */}
        < header className="h-[72px] border-b border-black/5 flex items-center justify-between px-8 bg-surface/50 backdrop-blur-sm" >
          <h2 className="text-xl font-bold text-text-primary capitalize">
            {activeTab === 'products' ? 'Products Management' :
              activeTab === 'categories' ? 'Category Management' :
                `${dynamicCategories.find(c => c.slug === activeTab)?.name || 'Item'} Management`}
          </h2>
          <div className="flex items-center gap-4">
            {activeTab === 'products' && (
              <button
                onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
                className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}
            {activeTab !== 'products' && activeTab !== 'categories' && (
              <button
                onClick={() => {
                  const currentCat = dynamicCategories.find(c => c.slug === activeTab);
                  setEditingBrand({ category: currentCat?.slug } as any); // Pre-fill category
                  setShowBrandForm(true);
                }}
                className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-500 transition-colors"
                title={`Add ${dynamicCategories.find(c => c.slug === activeTab)?.name || 'Item'}`}
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )}
            {activeTab === 'categories' && (
              <button
                onClick={() => { setEditingCategory(undefined); setShowCategoryForm(true); }}
                className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            )}
          </div>
        </header >

        {/* Content Area */}
        < div className="flex-1 overflow-y-auto p-8" >

          {/* PRODUCT VIEW */}
          {
            activeTab === 'products' && (
              <>
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
                      className="px-4 py-2 bg-black/5 hover:bg-black/10 text-text-primary text-sm font-medium rounded-lg border border-black/10 transition-colors"
                    >
                      {isMigrating ? "Initializing..." : "Initialize Database"}
                    </button>
                    <div className="md:hidden">
                      <button onClick={onLogout} className="text-sm text-text-secondary">Log Out</button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-xl border border-black/5 overflow-hidden">
                  {/* Toolbar */}
                  <div className="p-4 border-b border-black/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-grow w-full md:w-auto max-w-md">
                      <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background border border-black/10 rounded-lg pl-10 pr-4 py-2 text-text-primary focus:border-gold focus:outline-none text-sm"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                      <select
                        value={filters.brand}
                        onChange={(e) => setFilters(p => ({ ...p, brand: e.target.value }))}
                        className="bg-background border border-black/10 rounded-lg px-3 py-2 text-sm text-text-secondary focus:border-gold outline-none"
                      >
                        <option value="all">All Brands</option>
                        {allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>

                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(p => ({ ...p, status: e.target.value as any }))}
                        className="bg-background border border-black/10 rounded-lg px-3 py-2 text-sm text-text-secondary focus:border-gold outline-none"
                      >
                        <option value="all">All Status</option>
                        <option value="inStock">In Stock</option>
                        <option value="lowStock">Low Stock</option>
                        <option value="outOfStock">Out of Stock</option>
                      </select>

                      <select
                        value={filters.sort}
                        onChange={(e) => setFilters(p => ({ ...p, sort: e.target.value as any }))}
                        className="bg-background border border-black/10 rounded-lg px-3 py-2 text-sm text-text-secondary focus:border-gold outline-none"
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
                <div className="divide-y divide-black/5">
                  {allBrands.map(brand => {
                    // Filter products for this brand from the global filtered list
                    const brandProducts = filteredAndSorted.filter(p => p.brandId === brand.id);

                    // If a brand filter is active, only show that brand.
                    // If we are filtering by brand, and this brand is not it, return null.
                    if (filters.brand !== 'all' && filters.brand !== brand.id) return null;

                    // If we have products, show them.
                    // OR if we are explicitly filtering for this brand (and it has no products), show the header so we can add products.
                    if (brandProducts.length === 0 && filters.brand !== brand.id) return null;

                    return (
                      <div key={brand.id} className="p-6">
                        {/* Brand Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            {brand.image && <img src={brand.image} alt={brand.name} className="w-10 h-10 rounded-lg object-cover bg-black/5" />}
                            <div>
                              <h2 className="text-xl font-bold text-text-primary">{brand.name}</h2>
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
                              className={`group relative p-4 rounded-xl border transition-all duration-300 ${product.inStock ? 'bg-surface border-black/5 shadow-sm hover:border-gold/30 hover:shadow-md' : 'bg-red-50 border-red-200 opacity-75'}`}
                            >
                              {/* Status Indicator Dot */}
                              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full z-10 ${product.inStock ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />

                              {/* Product Image */}
                              <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-black/5 flex items-center justify-center relative group-hover:scale-[1.02] transition-transform">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : brand.image ? (
                                  <img src={brand.image} alt={brand.name} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                                ) : (
                                  <div className="text-text-tertiary text-xs">No Image</div>
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
                                <h3 className="font-bold text-text-primary text-sm line-clamp-2 min-h-[2.5em]" title={product.name}>{product.name}</h3>
                              </div>

                              <div className="flex flex-col gap-3 mt-auto">
                                {/* Quick Stock Toggle */}
                                <button
                                  onClick={() => handleQuickStockToggle(product)}
                                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${product.inStock
                                    ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                    }`}
                                >
                                  {product.inStock ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                      IN STOCK
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                      OUT OF STOCK
                                    </>
                                  )}
                                </button>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="flex-1 py-1.5 bg-black/5 hover:bg-black/10 border border-black/5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Edit2 className="w-3 h-3" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="px-2 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add New Product Card - Directly at the end of the grid */}
                          <button
                            onClick={() => {
                              setEditingProduct({
                                brandId: brand.id,
                                brandName: brand.name,
                                inStock: true
                              } as any);
                              setShowForm(true);
                            }}
                            className="group relative p-4 rounded-xl border border-dashed border-black/10 bg-black/5 hover:bg-black/10 hover:border-gold/30 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] gap-4"
                          >
                            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                              <Plus className="w-8 h-8 opacity-50 group-hover:opacity-100" />
                            </div>
                            <div className="text-center">
                              <span className="block font-bold text-text-primary mb-1">Add Product</span>
                              <span className="text-xs text-text-tertiary">to {brand.name}</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Uncategorized Products (Fallback) */}
                  {(() => {
                    const knownBrandIds = new Set(allBrands.map(b => b.id));
                    const uncategorized = filteredAndSorted.filter(p => !knownBrandIds.has(p.brandId));
                    if (uncategorized.length === 0) return null;

                    return (
                      <div key="uncategorized" className="p-6 bg-red-50 border-t border-red-200">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-xl font-bold text-red-500">Uncategorized / Mismatch</h2>
                            <p className="text-xs text-text-secondary">Products with unknown Brand IDs</p>
                          </div>
                          <span className="text-xs font-medium bg-red-100 text-red-600 px-3 py-1 rounded-full border border-red-200">
                            {uncategorized.length} Products
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {uncategorized.map(product => (
                            <div key={product.id} className="p-4 rounded-xl border bg-white border-red-200 opacity-75">
                              <h3 className="font-bold text-text-primary text-sm mb-2">{product.name}</h3>
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
              </>
            )
          }

          {/* BRANDS VIEW */}
          {
            activeTab !== 'products' && activeTab !== 'categories' && (
              <div className="bg-surface rounded-xl border border-black/5 p-6">
                <h3 className="text-xl font-bold mb-4">
                  Manage {dynamicCategories.find(c => c.slug === activeTab)?.name} Items ({
                    sidebarBrands.filter(b => b.category === activeTab || (!b.category && activeTab === 'disposable-vape')).length
                  })
                </h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sidebarBrands.filter(b => b.category === activeTab || (!b.category && activeTab === 'disposable-vape')).map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {sidebarBrands
                        .filter(b => b.category === activeTab || (!b.category && activeTab === 'disposable-vape')) // Default legacy brands to disposable-vape
                        .map(brand => (
                          <SortableBrandItem
                            key={brand.id}
                            id={brand.id}
                            name={brand.name}
                            isActive={false}
                            onClick={() => handleBrandClick(brand.id)}
                            onEdit={() => handleEditBrand(brand)}
                            onDelete={() => handleDeleteBrand(brand.id)}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )
          }

          {/* CATEGORIES VIEW */}
          {
            activeTab === 'categories' && (
              <div className="bg-surface rounded-xl border border-black/5 p-6">
                <h3 className="text-xl font-bold mb-4">Manage Categories ({dynamicCategories.length})</h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={dynamicCategories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {dynamicCategories.map(category => (
                        <SortableCategoryItem
                          key={category.id}
                          id={category.id}
                          name={category.name}
                          onEdit={() => handleEditCategory(category)}
                          onDelete={() => handleDeleteCategory(category.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )
          }
        </div >
      </main >

      {/* Modals */}
      {
        showForm && (
          <AdminProductForm
            initialData={editingProduct}
            brands={sidebarBrands}
            categories={dynamicCategories}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(undefined);
            }}
          />
        )
      }

      {
        showBrandForm && (
          <AdminBrandForm
            initialData={editingBrand}
            onCancel={() => {
              setShowBrandForm(false);
              setEditingBrand(undefined);
            }}
          />
        )
      }

      <SystemStatus />
    </div >
  );
};

export default AdminDashboard;
