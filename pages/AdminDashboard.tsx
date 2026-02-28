import React, { useState, useEffect } from 'react';
import { Product, Brand, Category } from '../types';
import { Search, LogOut, Package, CheckSquare, Plus, Edit2, Trash2, BarChart, Filter as FilterIcon, Menu, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductService } from '../src/services/productService';
import { BrandService } from '../src/services/brandService';
import { SystemStatus } from '../components/SystemStatus';
import { migrateDataToFirestore } from '../src/utils/migration';

import AdminProductForm from '../components/AdminProductForm';
import AdminTHCProductForm from '../components/AdminTHCProductForm';
import AdminEdiblesProductForm from '../components/AdminEdiblesProductForm';
import AdminBrandForm from '../components/AdminBrandForm';
import { syncGeekBarFlavors } from '../src/utils/syncFlavors';

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


// ... (existing imports)


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
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [showTHCForm, setShowTHCForm] = useState(false);
  const [showEdiblesForm, setShowEdiblesForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [firebaseAuthStatus, setFirebaseAuthStatus] = useState<'pending' | 'authenticated' | 'error'>('pending');

  const [dynamicBrands, setDynamicBrands] = useState<Brand[]>([]);
  const [brandOrder, setBrandOrder] = useState<string[]>([]);

  // Sort them by order for display and deduplicate by name globally for the sidebar
  const sidebarCategories = React.useMemo(() => {
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0) || (a.name || '').localeCompare(b.name || ''));

    const seenNames = new Set();
    return sorted.filter(cat => {
      let name = (cat.name || '').toLowerCase().trim();
      // Normalize plurals (e.g., 'disposable vapes' -> 'disposable vape')
      if (name.endsWith('s')) name = name.slice(0, -1);

      if (seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    });
  }, [categories]);

  // Use the full list of categories for the management view so admins can edit/delete all of them
  const allCategories = React.useMemo(() => {
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0) || (a.name || '').localeCompare(b.name || ''));
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

  // Combine static BRANDS with dynamic ones and deduplicate by Name
  const allBrands = React.useMemo(() => {
    const brandMap = new Map<string, Brand>();
    const nameMap = new Map<string, string>(); // name.toLowerCase() -> master ID

    // Add static brands first
    BRANDS.forEach(b => {
      const nameKey = (b.name || '').toLowerCase().trim();
      brandMap.set(b.id, { ...b }); // Clone to allow merging later
      nameMap.set(nameKey, b.id);
    });

    // Add/Overwrite with dynamic brands, merging duplicates
    dynamicBrands.forEach(b => {
      if (!b.name) return;
      const nameKey = b.name.toLowerCase().trim();
      const existingId = nameMap.get(nameKey);

      if (existingId) {
        // Found a duplicate brand or exact match! Merge dynamic properties into the master.
        const master = brandMap.get(existingId);
        if (master) {
          // Merge dynamic data (like images) over the static data
          // Prioritize non-empty string values from the dynamic brand
          if (b.image) master.image = b.image;
          if (b.tagline) master.tagline = b.tagline;
          if (b.description) master.description = b.description;
          if (b.puffRange) master.puffRange = b.puffRange;

          if (existingId !== b.id) {
            (master as any).duplicateIds = (master as any).duplicateIds || [];
            if (!(master as any).duplicateIds.includes(b.id)) {
              (master as any).duplicateIds.push(b.id);
            }
          }
        }
      } else {
        brandMap.set(b.id, b);
        nameMap.set(nameKey, b.id);
      }
    });

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
          const oldIndex = allCategories.findIndex((c) => c.id === active.id);
          const newIndex = allCategories.findIndex((c) => c.id === over.id);

          const newOrderedCategories = arrayMove(allCategories, oldIndex, newIndex);
          // With props, we can't set state locally. We just fire the service call.
          // App.tsx will update props when Firestore updates.

          // Update order property and save
          const reorderedForSave = newOrderedCategories.map((cat: any, index: number) => ({
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
      const searchLower = search.toLowerCase();
      const nameMatch = (p.name || '').toLowerCase().includes(searchLower);
      const brandMatch = (p.brandName || '').toLowerCase().includes(searchLower);

      const matchesSearch = nameMatch || brandMatch;
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
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      const stockA = a.stockQuantity || 0;
      const stockB = b.stockQuantity || 0;
      const nameA = a.name || '';
      const nameB = b.name || '';

      switch (filters.sort) {
        case 'priceHigh': return priceB - priceA;
        case 'priceLow': return priceA - priceB;
        case 'stockHigh': return stockB - stockA;
        case 'stockLow': return stockA - stockB;
        default: return nameA.localeCompare(nameB);
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
      // Create product in the current store
      await ProductService.addProduct({ ...data, storeId: currentStore });

      // Determine the other store
      const otherStore = currentStore === 'goldmine' ? 'ten2ten' : 'goldmine';
      // Add a sync copy to the other store, forced out-of-stock
      await ProductService.addProduct({
        ...data,
        storeId: otherStore,
        inStock: false,
        stockQuantity: 0
      });
    }
    // loadProducts(); // Handled by real-time listener
    setShowForm(false);
    setShowTHCForm(false);
    setShowEdiblesForm(false);
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

    // Initial check against product category slug
    const productCategory = (product.category || '').toLowerCase();
    let isTHC = productCategory === 'thc-disposables' || productCategory === 'thc-cartridges' || productCategory.includes('thc');
    let isEdibles = productCategory === 'edibles' || productCategory.includes('edible');

    // Try verifying against the master categories list to prevent naming bleed
    if (!isEdibles && !isTHC && product.category) {
      const cat = allCategories.find(c => c.slug === product.category);
      if (cat) {
        const catSlug = (cat.slug || '').toLowerCase();
        if (catSlug === 'edibles' || catSlug.includes('edible')) isEdibles = true;
        if (catSlug === 'thc-disposables' || catSlug === 'thc-cartridges' || catSlug.includes('thc')) isTHC = true;
      }
    }

    // Fallback: Check Brand if Product Category is missing/mismatch
    if (!isTHC && !isEdibles && product.brandId) {
      const brand = allBrands.find(b => b.id === product.brandId);
      const brandCat = (brand?.category || '').toLowerCase();
      if (brandCat === 'edibles' || brandCat.includes('edible')) isEdibles = true;
      if (brandCat === 'thc-disposables' || brandCat === 'thc-cartridges' || brandCat.includes('thc')) isTHC = true;
    }

    // Safely enforce that Disposable Vapes or similar don't falsely flag as edibles
    if (productCategory === 'disposable-vapes' ||
      (product.brandId && allBrands.find(b => b.id === product.brandId)?.category === 'disposable-vapes')) {
      isEdibles = false;
    }

    // Isolate form state properly
    if (isEdibles) {
      setShowForm(false);
      setShowTHCForm(false);
      setShowEdiblesForm(true);
    } else if (isTHC) {
      setShowForm(false);
      setShowEdiblesForm(false);
      setShowTHCForm(true);
    } else {
      setShowEdiblesForm(false);
      setShowTHCForm(false);
      setShowForm(true);
    }
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setShowBrandForm(true);
  };

  const handleSaveBrand = async (data: Omit<Brand, 'id'>) => {
    if (editingBrand) {
      // Ensure storeId is included in case this is the first time a static brand is being saved to Firestore
      await BrandService.updateBrand(editingBrand.id, { ...data, storeId: currentStore });
    } else {
      await BrandService.addBrand({ ...data, storeId: currentStore });

      // Sync to other store
      const otherStore = currentStore === 'goldmine' ? 'ten2ten' : 'goldmine';
      await BrandService.addBrand({ ...data, storeId: otherStore });
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
      const newOrder = allCategories.length > 0 ? Math.max(...allCategories.map(c => c.order || 0)) + 1 : 0;
      await CategoryService.addCategory({ ...data, storeId: currentStore, order: newOrder });

      // Sync to other store
      const otherStore = currentStore === 'goldmine' ? 'ten2ten' : 'goldmine';
      await CategoryService.addCategory({ ...data, storeId: otherStore, order: newOrder });
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
    if (!confirm("This will rename 'Gummies' to 'Edibles' and ensure 'Cigarettes' exists. Continue?")) return;
    try {
      const { DEFAULT_CATEGORIES, CategoryService } = await import('../src/services/categoryService');

      // 1. Try to rename Gummies -> Edibles
      await CategoryService.renameCategoryByName(currentStore as any, 'THC & DELTA GUMMIES', 'EDIBLES');

      // 2. Ensure all defaults (including Cigarettes) exist
      await CategoryService.ensureCategories(currentStore as any, DEFAULT_CATEGORIES);

      alert("Categories updated successfully! Please refresh the page to see changes.");
    } catch (e) {
      console.error(e);
      alert("Failed to repair categories.");
    }
  };

  const handleSeedTHCBrands = async () => {
    if (!confirm("Add default THC brands (Muha Meds, Mellow Fellow, etc.)?")) return;
    try {
      const { THC_BRANDS } = await import('../constants');
      await BrandService.ensureBrands(THC_BRANDS, currentStore as any);

      // Refresh brands
      const fetchedBrands = await BrandService.getAllBrands(currentStore as any);
      const fetchedOrder = await BrandService.getBrandOrder(currentStore as any);
      setDynamicBrands(fetchedBrands);
      setBrandOrder(fetchedOrder);

      alert("Brands added successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to add brands.");
    }
  };

  const handleSeedEdibleBrands = async () => {
    if (!confirm("Add default Edible brands (4ever Gummies, Truemoola, Fun Cube, Polka Dot Shroom Bar)?")) return;
    try {
      const { EDIBLE_BRANDS } = await import('../constants');
      await BrandService.ensureBrands(EDIBLE_BRANDS, currentStore as any);

      // Refresh brands
      const fetchedBrands = await BrandService.getAllBrands(currentStore as any);
      const fetchedOrder = await BrandService.getBrandOrder(currentStore as any);
      setDynamicBrands(fetchedBrands);
      setBrandOrder(fetchedOrder);

      alert("Edible brands added successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to add edible brands.");
    }
  };

  const handleSeedWrapsBrands = async () => {
    if (!confirm("Add default Wraps & Blunts brands (Sweet Wood, Backwood, Dutch Master, etc.)?")) return;
    try {
      const { WRAPS_BRANDS } = await import('../constants');
      await BrandService.ensureBrands(WRAPS_BRANDS, currentStore as any);

      // Refresh brands
      const fetchedBrands = await BrandService.getAllBrands(currentStore as any);
      const fetchedOrder = await BrandService.getBrandOrder(currentStore as any);
      setDynamicBrands(fetchedBrands);
      setBrandOrder(fetchedOrder);

      alert("Wraps brands added successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to add wraps brands.");
    }
  };

  const handleFixAllProducts = async () => {
    console.log("DEBUG: handleFixAllProducts called");
    if (!window.confirm("This will find all products (including Cali Bar, Geek Bar, etc.) that are out of stock or using the old 'Disposable' category, and fix them. Continue?")) return;
    try {
      // Find the actual disposable category slug from the database
      const disposableCat = categories.find(c => c.name.toLowerCase().includes('disposable vape') || c.name.toLowerCase().includes('disposables'));
      const targetCategorySlug = disposableCat ? (disposableCat.slug || disposableCat.id) : 'disposable-vapes';

      // Find products that need fixing:
      // 1. Any Cali products out of stock
      // 2. Any product using the old 'Disposable' category (case-insensitive)
      // 3. Any Geek Bar Pulse X product (since they are new and might have sync issues)
      // 4. Any product accidentally categorized as 'thc-disposables' that shouldn't be
      const disposableBrandsList = ['cali', 'geekbar', 'raz', 'airbar', 'tyson', 'lava', 'flair'];

      const toUpdate = products.filter(p => {
        const isCali = p.brandId?.includes('cali');
        const isGeekBar = p.brandId?.includes('geekbar');
        const isOldCategory = p.category?.toLowerCase() === 'disposable';
        const isMissingCategory = !p.category;
        const isOutOfStock = !p.inStock;

        const isWronglyTHC = p.category === 'thc-disposables' &&
          disposableBrandsList.some(b => p.brandId?.toLowerCase().includes(b) || p.brandName?.toLowerCase().includes(b));

        return (isCali && isOutOfStock) || isOldCategory || isMissingCategory || (isGeekBar && p.category !== targetCategorySlug) || isWronglyTHC;
      });

      console.log(`DEBUG: Found ${toUpdate.length} products to fix.`);

      // Also fix Brands directly in Firestore if they are wrong
      let brandsFixedCount = 0;
      try {
        const { collection: fbCollection, getDocs: fbGetDocs, doc: fbDoc, updateDoc: fbUpdateDoc } = await import('firebase/firestore');
        const { db: fbDb } = await import('../src/firebase');
        const brandsSnapshot = await fbGetDocs(fbCollection(fbDb, 'brands'));

        for (const bDoc of brandsSnapshot.docs) {
          const data = bDoc.data();
          if (data.category === 'thc-disposables' && disposableBrandsList.some(b => data.id?.toLowerCase().includes(b) || data.name?.toLowerCase().includes(b))) {
            await fbUpdateDoc(fbDoc(fbDb, 'brands', bDoc.id), { category: 'disposable-vapes' });
            brandsFixedCount++;
          }
        }
      } catch (err) {
        console.error("Failed to fix brands:", err);
      }

      if (toUpdate.length === 0 && brandsFixedCount === 0) {
        alert("All products and brands look good!");
        return;
      }

      for (const p of toUpdate) {
        if (!p.id) continue;
        await ProductService.updateProduct(p.id, {
          inStock: true,
          category: targetCategorySlug
        });
      }
      alert(`Successfully fixed ${toUpdate.length} products!`);
    } catch (e) {
      console.error("DEBUG: Fix All error:", e);
      alert("Error fixing products. Check console.");
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!window.confirm("This will scan ALL products and remove duplicates (keeping the original). Continue?")) return;
    try {
      const stores = ['goldmine', 'ten2ten'];
      let totalDeleted = 0;

      for (const storeId of stores) {
        // Fetch all products for this store directly from Firestore
        const { collection: fbCollection, query: fbQuery, where: fbWhere, getDocs: fbGetDocs, doc: fbDoc, deleteDoc: fbDeleteDoc } = await import('firebase/firestore');
        const { db: fbDb } = await import('../src/firebase');

        const q = fbQuery(fbCollection(fbDb, 'products'), fbWhere('storeId', '==', storeId));
        const snapshot = await fbGetDocs(q);

        console.log(`[Cleanup] Found ${snapshot.size} products in ${storeId}`);

        // Group by (brandId + name)
        const groups: Record<string, { docId: string; name: string; isSyncCopy: boolean }[]> = {};

        snapshot.docs.forEach(document => {
          const data = document.data();
          const name = (data.name || '').toLowerCase().trim();
          const brandId = (data.brandId || '').toLowerCase().trim();
          const key = `${brandId}::${name}`;

          if (!groups[key]) groups[key] = [];
          groups[key].push({
            docId: document.id,
            name: data.name,
            isSyncCopy: document.id.endsWith('-goldmine') || document.id.endsWith('-ten2ten')
          });
        });

        // Delete duplicates
        for (const [key, items] of Object.entries(groups)) {
          if (items.length <= 1) continue;

          // Sort: keep originals first (non-sync copies)  
          items.sort((a, b) => {
            if (a.isSyncCopy !== b.isSyncCopy) return a.isSyncCopy ? 1 : -1;
            return 0;
          });

          // Keep first, delete rest
          const toDelete = items.slice(1);
          for (const dup of toDelete) {
            console.log(`[Cleanup] Deleting duplicate: ${dup.docId} (${dup.name})`);
            const docRef = fbDoc(fbDb, 'products', dup.docId);
            await fbDeleteDoc(docRef);
            totalDeleted++;
          }
        }
      }

      alert(`Cleanup complete! Deleted ${totalDeleted} duplicate products.`);
    } catch (e) {
      console.error("Cleanup error:", e);
      alert("Error during cleanup. Check console.");
    }
  };

  const handleBrandClick = (brandId: string) => {
    setFilters(prev => ({ ...prev, brand: brandId }));
    setActiveTab('products');
  };

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 transform 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 border-r border-black/5 bg-surface flex flex-col shadow-2xl md:shadow-none
      `}>

        {/* Sidebar Header */}
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
            <h1 className="text-lg font-bold text-gold tracking-widest">ADMIN</h1>
          </div>
          <p className="text-xs text-text-tertiary uppercase tracking-wider">{currentStore === 'goldmine' ? 'Goldmine Vape' : 'Ten 2 Ten'}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          {(() => {
            return sidebarCategories.map(category => (
              <button
                key={category.id}
                onClick={() => { setActiveTab(category.slug); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === category.slug ? 'bg-gold text-black' : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}`}
              >
                <Package className="w-4 h-4" />
                <span className="capitalize">{(category.name || '').toLowerCase()}</span>
              </button>
            ));
          })()}

          <div className="my-2 border-t border-black/5 mx-4" />

          {/* Fallback/Utility for All Products if needed, or just Manage Categories */}
          <button
            onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-gold text-black' : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}`}
          >
            <CheckSquare className="w-4 h-4" /> All Items (Inventory)
          </button>

          <button
            onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-gold text-black' : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}`}
          >
            <BarChart className="w-4 h-4" /> Manage Categories
          </button>

          <button
            onClick={() => { setActiveTab('brands'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'brands' ? 'bg-gold text-black' : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}`}
          >
            <Package className="w-4 h-4" /> Manage Brands
          </button>
        </div>



        <div className="p-4 mt-auto border-t border-black/5 space-y-2">
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside >

      {/* Main Content */}
      < main className="flex-1 flex flex-col min-w-0" >
        {/* Header */}
        <header className="h-[72px] border-b border-black/5 flex items-center justify-between px-4 md:px-8 bg-surface/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-text-secondary hover:text-text-primary md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-text-primary capitalize truncate max-w-[200px] md:max-w-none">
              {activeTab === 'products' ? 'Products Management' :
                activeTab === 'categories' ? 'Category Management' :
                  activeTab === 'brands' ? 'Brand Management' :
                    `${sidebarCategories.find(c => c.slug === activeTab)?.name || 'Item'} Management`}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {activeTab === 'products' && (
              <button
                onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
                className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}
            {activeTab !== 'products' && activeTab !== 'categories' && (
              <>
                {activeTab === 'thc-disposables' && (
                  <button
                    onClick={handleSeedTHCBrands}
                    className="bg-black/5 text-text-primary border border-black/10 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Default Brands
                  </button>
                )}
                {(() => {
                  const activeCatName = (sidebarCategories.find(c => c.slug === activeTab)?.name || '').toLowerCase();
                  return activeCatName.includes('edible');
                })() && (
                    <button
                      onClick={handleSeedEdibleBrands}
                      className="bg-black/5 text-text-primary border border-black/10 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Default Brands
                    </button>
                  )}
                {activeTab === 'wraps-and-blunts' && (
                  <button
                    onClick={handleSeedWrapsBrands}
                    className="bg-black/5 text-text-primary border border-black/10 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Default Brands
                  </button>
                )}
                <button
                  onClick={() => {
                    const currentCat = sidebarCategories.find(c => c.slug === activeTab);
                    const catName = (currentCat?.name || '').toLowerCase();
                    setEditingProduct({ category: currentCat?.slug } as any);

                    if (activeTab === 'thc-disposables') {
                      setShowTHCForm(true);
                    } else if (catName.includes('edible') || activeTab.toLowerCase().includes('edible')) {
                      setShowEdiblesForm(true);
                    } else {
                      setShowForm(true);
                    }
                  }}
                  className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-500 transition-colors"
                  title={`Add ${sidebarCategories.find(c => c.slug === activeTab)?.name || 'Item'}`}
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </>
            )}
            {activeTab === 'categories' && (
              <button
                onClick={() => { setEditingCategory(undefined); setShowCategoryForm(true); }}
                className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            )}
            {activeTab === 'brands' && (
              <button
                onClick={() => { setEditingBrand(undefined); setShowBrandForm(true); }}
                className="bg-gold text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Brand
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">

          {/* PRODUCT VIEW */}
          {
            activeTab === 'products' && (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Item Manager <span className="text-sm font-normal text-text-tertiary">({products.length} items)</span></h1>
                  </div>
                  <div className="flex gap-4 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {connectionError && (
                      <span className="text-xs text-red-400 bg-red-900/10 px-3 py-1 rounded-full border border-red-500/20">
                        {connectionError}
                      </span>
                    )}
                    <button
                      onClick={handleFixAllProducts}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-bold"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Fix All Products
                    </button>
                    <button
                      onClick={handleCleanupDuplicates}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cleanup Duplicates
                    </button>
                    <button
                      onClick={async () => {
                        console.log("DEBUG: Sync started");
                        if (!products || products.length === 0) {
                          console.log("DEBUG: No products found.");
                          return;
                        }

                        setIsSyncing(true);
                        try {
                          const res = await syncGeekBarFlavors(products);
                          setIsSyncing(false);
                          if (res.success) {
                            console.log(`DEBUG: Success. Updated ${res.count}`);
                            // Flash button style or something to show success? 
                            // We can rely on the user seeing the terminal/console or just the UI updating 
                            // But for now, since alert might be blocked, let's just log.
                          } else {
                            console.error("DEBUG: Sync failed.");
                          }
                        } catch (err) {
                          console.error("DEBUG: Sync error:", err);
                          setIsSyncing(false);
                        }
                      }}
                      disabled={isSyncing}
                      className={`px-4 py-2 ${isSyncing ? 'bg-green-100 text-green-700 border-green-200' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'} font-bold text-sm rounded-lg transition-colors disabled:opacity-50 cursor-pointer`}
                    >
                      {isSyncing ? 'Processing...' : 'Sync Geek Bar Pulse Flavors Now'}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Update pricing for all specified brands?")) return;
                        try {
                          setIsSyncing(true);
                          const { db } = await import('../src/firebase');
                          const { writeBatch, doc } = await import('firebase/firestore');

                          const batch = writeBatch(db);
                          let count = 0;

                          products.forEach(p => {
                            let newPrice = null;
                            if (p.brandId === 'cali-ul8000') newPrice = 20.00;
                            else if (p.brandId === 'cali-20000') newPrice = 25.00;
                            else if (p.brandId === 'geekbar-pulse') newPrice = 20.00;
                            else if (p.brandId === 'geekbar-pulsex') newPrice = 25.00;
                            else if (p.brandId === 'airbar-diamond') newPrice = 10.00;
                            else if (p.brandId === '4ever-gummies') newPrice = 10.00;
                            else if (p.brandId === 'fun-cube') newPrice = 5.00;

                            // fallback mapping by name if brandId doesn't match
                            if (!newPrice && p.brandName) {
                              const bName = p.brandName.toLowerCase();
                              if (bName.includes('cali ul 8000')) newPrice = 20.00;
                              else if (bName.includes('cali 20000')) newPrice = 25.00;
                              else if (bName.includes('geek bar pulse x') || bName.includes('geekbar pulse x')) newPrice = 25.00;
                              else if (bName.includes('geek bar pulse') || bName.includes('geekbar pulse')) newPrice = 20.00;
                              else if (bName.includes('airbar diamond') || bName.includes('air bar diamond')) newPrice = 10.00;
                              else if (bName.includes('4ever gummies')) newPrice = 10.00;
                              else if (bName.includes('fun cube')) newPrice = 5.00;
                            }

                            if (newPrice !== null && p.price !== newPrice && p.id) {
                              const docRef = doc(db, 'products', p.id);
                              batch.update(docRef, { price: newPrice });
                              count++;
                            }
                          });

                          if (count > 0) {
                            await batch.commit();
                            alert(`Successfully updated prices for ${count} products!`);
                          } else {
                            alert("No prices needed updating.");
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Failed to update prices.");
                        } finally {
                          setIsSyncing(false);
                        }
                      }}
                      disabled={isSyncing}
                      className="px-4 py-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-sm rounded-lg transition-colors cursor-pointer"
                    >
                      Update Database Prices
                    </button>
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
                    if (!brand || !brand.id) return null; // Safe check
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
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
                          {brandProducts.map(product => {
                            if (!product) return null;
                            return (
                              <div
                                key={product.id || Math.random()}
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
                            );
                          })}

                          {/* Add New Product Card - Directly at the end of the grid */}
                          <button
                            onClick={() => {
                              setEditingProduct({
                                brandId: brand.id,
                                brandName: brand.name,
                                inStock: true
                              } as any);
                              // Route to the correct form based on brand category
                              const brandCat = (brand.category || '').toLowerCase();
                              if (brandCat.includes('edible')) {
                                setShowEdiblesForm(true);
                              } else if (brandCat.includes('thc')) {
                                setShowTHCForm(true);
                              } else {
                                setShowForm(true);
                              }
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
                    // Safe mapping
                    const knownBrandIds = new Set(allBrands.filter(b => b && b.id).map(b => b.id));
                    const uncategorized = filteredAndSorted.filter(p => p && p.brandId && !knownBrandIds.has(p.brandId));
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
                            <div key={product.id || Math.random()} className="p-4 rounded-xl border bg-white border-red-200 opacity-75">
                              <h3 className="font-bold text-text-primary text-sm mb-2">{product.name || 'Unknown Product'}</h3>
                              <p className="text-xs text-text-tertiary">Brand ID: {product.brandId || 'N/A'}</p>
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
            activeTab !== 'products' && activeTab !== 'categories' && (() => {
              const currentCategoryObj = sidebarCategories.find(c => c.slug === activeTab);
              const isDisposable = activeTab.includes('disposable');

              // Get all brands that should be shown under this tab
              // 1. Explicitly tagged brands
              // 2. Untagged brands (default to disposables)
              // 3. Brands that have products in this category (dynamic inference)
              const activeBrands = sidebarBrands.filter(b => {
                if (b.category === activeTab) return true;
                // Only default uncategorized brands to 'disposable-vapes', NOT 'thc-disposables' or other tabs
                if (!b.category && activeTab === 'disposable-vapes') return true;

                // If the brand has products belonging to this category, show the brand
                const hasProductsInCat = products.some(p => {
                  const pCat = (p.category || '').toLowerCase();
                  const matchesCategory = pCat === activeTab || pCat === currentCategoryObj?.id;

                  // For the main disposable vapes tab, catch products that have NO category or explicitly 'disposable-vapes'
                  const isLegacyDisposableMatch = activeTab === 'disposable-vapes' &&
                    (pCat === '' || pCat === 'disposable-vapes' || pCat === 'disposables');

                  const matchesBrand = p.brandId === b.id || p.brandName?.toLowerCase() === b.name?.toLowerCase();
                  return matchesBrand && (matchesCategory || isLegacyDisposableMatch);
                });

                return hasProductsInCat;
              });

              return (
                <div className="bg-surface rounded-xl border border-black/5 p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Manage {currentCategoryObj?.name || activeTab.replace(/-/g, ' ')} Items ({activeBrands.length})
                  </h3>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={activeBrands.map(b => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {activeBrands.map(brand => (
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

                        {/* Add Brand Placeholder Button */}
                        <button
                          onClick={() => { setEditingBrand(undefined); setShowBrandForm(true); }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-dashed border-2 border-dashed border-black/10 rounded-xl text-black/40 hover:text-gold hover:border-gold hover:bg-gold/5 transition-all outline-none focus:ring-2 focus:ring-gold/50 font-bold tracking-wide uppercase text-sm"
                        >
                          <Plus className="w-5 h-5" />
                          Add Brand
                        </button>
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              );
            })()
          }

          {/* BRANDS MANAGEMENT VIEW */}
          {
            activeTab === 'brands' && (() => {
              // Group brands by category ID
              const groupedBrands: Record<string, Brand[]> = {};

              // Pre-deduplicate categories to find the normalized names
              const categoryMap = new Map<string, string>(); // slug/id -> name
              allCategories.forEach(c => {
                if (c.slug) categoryMap.set(c.slug, c.name);
                if (c.id) categoryMap.set(c.id, c.name);
              });

              allBrands.forEach(brand => {
                let catId = brand.category;
                if (!catId) catId = 'uncategorized';

                let catName = categoryMap.get(catId) || (catId === 'uncategorized' ? 'Uncategorized / Legacy' : (catId.charAt(0).toUpperCase() + catId.slice(1).replace(/-/g, ' ')));

                if (!groupedBrands[catName]) {
                  groupedBrands[catName] = [];
                }
                groupedBrands[catName].push(brand);
              });

              return (
                <div className="bg-surface rounded-xl border border-black/5 p-6">
                  <h3 className="text-xl font-bold mb-6">Manage Brands ({allBrands.length})</h3>
                  {allBrands.length === 0 ? (
                    <p className="text-text-tertiary text-center py-12">No brands found. Click "Add Brand" to create one.</p>
                  ) : (
                    <div className="space-y-12">
                      {Object.entries(groupedBrands).sort(([a], [b]) => a.includes('Uncategorized') ? 1 : b.includes('Uncategorized') ? -1 : a.localeCompare(b)).map(([groupName, groupBrands]) => (
                        <div key={groupName}>
                          <h4 className="text-sm font-bold tracking-[0.2em] uppercase mb-6 text-text-tertiary flex items-center gap-4">
                            <span>{groupName}</span>
                            <div className="flex-1 h-px bg-black/5"></div>
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {groupBrands.map(brand => (
                              <div key={brand.id} className="group bg-background border border-black/5 rounded-xl overflow-hidden hover:border-gold/30 hover:shadow-md transition-all">
                                {/* Brand Image */}
                                <div className="aspect-square bg-black/5 overflow-hidden flex items-center justify-center relative">
                                  {brand.image ? (
                                    <img src={brand.image} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1 text-text-tertiary">
                                      <Package className="w-8 h-8 opacity-30" />
                                      <span className="text-xs opacity-50">No Image</span>
                                    </div>
                                  )}
                                  {/* Overlay edit shortcut */}
                                  <button
                                    onClick={() => handleEditBrand(brand)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                                  >
                                    Edit Image
                                  </button>
                                </div>
                                {/* Info */}
                                <div className="p-3">
                                  <h4 className="font-bold text-sm text-text-primary truncate">{brand.name}</h4>
                                  {brand.category && (
                                    <p className="text-xs text-text-tertiary mt-0.5 truncate capitalize">{brand.category.replace(/-/g, ' ')}</p>
                                  )}
                                  {/* Actions */}
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => handleEditBrand(brand)}
                                      className="flex-1 py-1.5 bg-black/5 hover:bg-black/10 border border-black/5 rounded text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-1"
                                    >
                                      <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBrand(brand.id)}
                                      className="px-2 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-500 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()
          }

          {/* CATEGORIES VIEW */}
          {
            activeTab === 'categories' && (
              <div className="bg-surface rounded-xl border border-black/5 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Manage Categories ({allCategories.length})</h3>
                  <button
                    onClick={handleRepairCategories}
                    className="flex items-center gap-2 px-3 py-1.5 bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg text-xs font-bold transition-colors"
                  >
                    <BarChart className="w-3 h-3" /> Repair Defaults
                  </button>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={allCategories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {allCategories.map(category => (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                          isActive={false}
                          onClick={() => { }}
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
            brands={allBrands} // Use allBrands which includes dynamic ones
            categories={allCategories}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(undefined);
            }}
          />
        )
      }

      {
        showTHCForm && (
          <AdminTHCProductForm
            initialData={editingProduct}
            brands={allBrands}
            categories={allCategories}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowTHCForm(false);
              setEditingProduct(undefined);
            }}
          />
        )
      }

      {
        showEdiblesForm && (
          <AdminEdiblesProductForm
            initialData={editingProduct}
            brands={allBrands}
            categories={allCategories}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowEdiblesForm(false);
              setEditingProduct(undefined);
            }}
          />
        )
      }

      {
        showBrandForm && (
          <AdminBrandForm
            initialData={editingBrand}
            categories={allCategories}
            onSave={handleSaveBrand}
            onCancel={() => {
              setShowBrandForm(false);
              setEditingBrand(undefined);
            }}
          />
        )
      }

      {
        showCategoryForm && (
          <AdminCategoryForm
            initialData={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => {
              setShowCategoryForm(false);
              setEditingCategory(undefined);
            }}
            allCategories={allCategories}
          />
        )
      }
      <SystemStatus />
    </div >
  );
};

export default AdminDashboard;
