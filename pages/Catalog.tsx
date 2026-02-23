import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, Brand, FilterState, FlavorProfile } from '../types';
import { Filter, Search, MoreVertical, Edit, Trash, ArrowLeft, Tag } from 'lucide-react';
import { ProductService } from '../src/services/productService';
import AdminProductForm from '../components/AdminProductForm';
import { useStore } from '../src/context/StoreContext';
import { THCProductCard } from '../components/THCProductCard';
import { EdiblesProductCard } from '../components/EdiblesProductCard';
import { Category } from '../types';

interface CatalogProps {
  products: Product[];
  brands?: Brand[];
  categories?: Category[];
}

const Catalog: React.FC<CatalogProps> = ({ products, brands = [], categories: rawCategories = [] }) => {
  // Deduplicate categories by normalized name to prevent showing duplicates from the database
  const categories = useMemo(() => {
    const sorted = [...rawCategories].sort((a, b) => (a.order || 0) - (b.order || 0) || (a.name || '').localeCompare(b.name || ''));
    const seenNames = new Set<string>();
    return sorted.filter(cat => {
      let name = (cat.name || '').toLowerCase().trim();
      // Normalize plurals (e.g., 'disposable vapes' -> 'disposable vape')
      if (name.endsWith('s')) name = name.slice(0, -1);

      if (seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    });
  }, [rawCategories]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBrand = searchParams.get('brand') || 'all';
  const initialCategory = searchParams.get('category') || 'all';
  const initialNic = searchParams.get('nicotine') as 'all' | 'zero' | 'nicotine' || 'all';

  const [filters, setFilters] = useState<FilterState & { category: string }>({
    brand: initialBrand,
    category: initialCategory,
    flavorProfile: 'all',
    nicotine: initialNic,
  });

  // Sync URL with filters
  React.useEffect(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const urlBrand = searchParams.get('brand') || 'all';
    if (urlCategory !== filters.category || urlBrand !== filters.brand) {
      setFilters(prev => ({ ...prev, category: urlCategory, brand: urlBrand }));
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

  // Helper: does a product belong to a given category?
  const productMatchesCategory = (product: Product, categoryId: string) => {
    if (categoryId === 'all') return true;
    const selectedCat = categories.find(c => c.id === categoryId);
    if (!selectedCat) return false;

    const slug = selectedCat.slug || '';
    const catName = (selectedCat.name || '').toLowerCase();
    const productCat = (product.category || '').toLowerCase();

    // Direct matches: product.category matches the category ID or slug
    if (product.category === categoryId || product.category === slug) return true;

    // For 'disposable vape(s)' categories: match products whose category contains 'disposable-vape' or 'disposable_vape'
    // but NOT 'thc-disposable' (those belong to their own category)
    if (catName.includes('disposable vape')) {
      if (!productCat) return true; // Legacy products with no category default to disposable vapes
      const isDisposableVape = productCat.includes('disposable-vape') || productCat.includes('disposable_vape') || productCat.includes('disposable vape');
      const isTHC = productCat.includes('thc');
      return isDisposableVape && !isTHC;
    }

    // For 'thc disposables' categories: match products whose category contains 'thc'
    if (catName.includes('thc')) {
      return productCat.includes('thc');
    }

    // For 'edibles' categories
    if (catName.includes('edible')) {
      return productCat.includes('edible');
    }

    // For 'cigarettes' categories
    if (catName.includes('cigarette')) {
      return productCat.includes('cigarette');
    }

    return false;
  };

  // Brands visible for the selected category
  const availableBrands = useMemo(() => {
    if (filters.category === 'all') return brands;
    const selectedCategory = categories.find(c => c.id === filters.category);
    const isDisposable = selectedCategory?.slug?.includes('disposable');

    const categoryProductBrandIds = new Set(
      products.filter(p => productMatchesCategory(p, filters.category)).map(p => p.brandId)
    );

    return brands.filter(b => {
      if (!b.category && isDisposable) return true;
      if (selectedCategory && b.category === selectedCategory.slug) return true;
      if (b.category === filters.category) return true;
      return categoryProductBrandIds.has(b.id);
    });
  }, [brands, products, filters.category, categories]);

  // Filtered products (only when a brand is selected)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!productMatchesCategory(product, filters.category)) return false;
      if (filters.brand !== 'all' && product.brandId !== filters.brand) return false;
      if (filters.flavorProfile !== 'all' && !product.flavorProfile.includes(filters.flavorProfile)) return false;
      if (filters.nicotine === 'nicotine' && product.isNicotineFree) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (product.name || '').toLowerCase();
        const brand = (product.brandName || '').toLowerCase();
        return name.includes(q) || brand.includes(q);
      }
      return true;
    });
  }, [products, filters, searchQuery, categories]);

  const selectedBrandObj = brands.find(b => b.id === filters.brand);
  const selectedCategoryObj = categories.find(c => c.id === filters.category);

  // View mode:
  // 'categories' - no category selected and no brand selected → show category cards
  // 'brands'     - category selected but no brand → show brand cards
  // 'products'   - brand selected (regardless of category) → show products
  const viewMode = filters.brand !== 'all'
    ? 'products'
    : filters.category === 'all'
      ? 'categories'
      : 'brands';

  const handleCategorySelect = (categoryId: string) => {
    setFilters(prev => ({ ...prev, category: categoryId, brand: 'all' }));
    const params = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    params.delete('brand');
    setSearchParams(params);
  };

  const handleBrandSelect = (brandId: string) => {
    setFilters(prev => ({ ...prev, brand: brandId }));
    const params = new URLSearchParams(searchParams);
    if (brandId === 'all') {
      params.delete('brand');
    } else {
      params.set('brand', brandId);
    }
    setSearchParams(params);
  };

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.id] = products.filter(p => productMatchesCategory(p, cat.id)).length;
    });
    return counts;
  }, [products, categories]);

  // Count products per brand for the brand cards
  const productCountByBrand = useMemo(() => {
    const counts: Record<string, number> = {};
    availableBrands.forEach(brand => {
      counts[brand.id] = products.filter(
        p => p.brandId === brand.id && productMatchesCategory(p, filters.category)
      ).length;
    });
    return counts;
  }, [products, availableBrands, filters.category]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Strip */}
      <div className="pt-12 pb-12 px-6 border-b border-black/5 bg-elevated/50">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          {viewMode !== 'categories' && (
            <div className="flex items-center gap-2 text-sm text-text-tertiary mb-3">
              <button onClick={() => handleCategorySelect('all')} className="hover:text-gold transition-colors">
                All Categories
              </button>
              {selectedCategoryObj && (
                <>
                  <span>/</span>
                  <button
                    onClick={() => handleBrandSelect('all')}
                    className={`hover:text-gold transition-colors ${viewMode === 'brands' ? 'text-text-primary font-medium' : ''}`}
                  >
                    {selectedCategoryObj.name}
                  </button>
                </>
              )}
              {viewMode === 'products' && selectedBrandObj && (
                <>
                  <span>/</span>
                  <span className="text-text-primary font-medium">{selectedBrandObj.name}</span>
                </>
              )}
            </div>
          )}

          <h1 className="text-4xl font-bold mb-2 text-text-primary">
            {viewMode === 'categories' && 'Browse by Category'}
            {viewMode === 'brands' && (selectedCategoryObj?.name || 'Brands')}
            {viewMode === 'products' && (selectedBrandObj?.name || 'Products')}
          </h1>
          <p className="text-text-secondary">
            {viewMode === 'categories' && 'Choose a category to explore available brands.'}
            {viewMode === 'brands' && 'Choose a brand to see all available products.'}
            {viewMode === 'products' && `All ${selectedBrandObj?.name || ''} products.`}
          </p>
        </div>
      </div>

      {/* Filter Bar — only shown in products view */}
      {viewMode === 'products' && (
        <div className="sticky top-[88px] md:top-[104px] z-40 bg-background/95 backdrop-blur-xl border-b border-black/10 py-4 px-6">
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-4 lg:items-center justify-between">

            <div className="flex flex-wrap gap-3 items-center">
              {/* Back to brands/categories button */}
              <button
                onClick={() => handleBrandSelect('all')}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-gold transition-colors border border-black/10 px-3 py-2 rounded-lg bg-surface"
              >
                <ArrowLeft className="w-4 h-4" />
                {filters.category === 'all' ? 'Back to Categories' : 'Back to Brands'}
              </button>


            </div>

            {/* Search */}
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
      )}

      {/* Brands view: back button in a lighter bar */}
      {viewMode === 'brands' && (
        <div className="sticky top-[88px] md:top-[104px] z-40 bg-background/95 backdrop-blur-xl border-b border-black/10 py-3 px-6">
          <div className="max-w-[1200px] mx-auto">
            <button
              onClick={() => handleCategorySelect('all')}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">

        {/* CATEGORIES VIEW: show category cards */}
        {viewMode === 'categories' && (
          categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary text-lg">No categories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group bg-surface border border-black/5 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-xl hover:shadow-black/5 text-left flex flex-col"
                >
                  {/* Category image or icon placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-black/5 to-transparent rounded-xl mb-6 overflow-hidden flex items-center justify-center p-4 group-hover:bg-gradient-to-br group-hover:from-black/10 group-hover:to-transparent transition-colors">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                        <Tag className="w-10 h-10 opacity-40" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-gold transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{category.description}</p>
                  )}
                  <p className="text-xs text-text-tertiary mt-2">
                    {productCountByCategory[category.id] ?? 0} products
                  </p>
                </button>
              ))}
            </div>
          )
        )}

        {/* BRANDS VIEW: category selected, show brand cards */}
        {viewMode === 'brands' && (
          availableBrands.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary text-lg">No brands found for this category.</p>
              <button onClick={() => handleCategorySelect('all')} className="mt-4 text-gold hover:underline">
                Back to categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {availableBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand.id)}
                  className="group bg-surface border border-black/5 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-xl hover:shadow-black/5 text-left flex flex-col"
                >
                  <div className="aspect-square bg-gradient-to-br from-black/5 to-transparent rounded-xl mb-6 overflow-hidden flex items-center justify-center p-4 group-hover:bg-gradient-to-br group-hover:from-black/10 group-hover:to-transparent transition-colors">
                    <img src={brand.image} alt={brand.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-gold transition-colors">{brand.name}</h3>
                  {brand.puffRange && (
                    <p className="text-xs text-text-tertiary mt-1">{brand.puffRange}</p>
                  )}
                  {brand.tagline && (
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{brand.tagline}</p>
                  )}
                  <p className="text-xs text-text-tertiary mt-2 font-medium">
                    {productCountByBrand[brand.id] ?? 0} products
                  </p>
                </button>
              ))}
            </div>
          )
        )}

        {/* PRODUCTS VIEW: category + brand selected, show products */}
        {viewMode === 'products' && (
          filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary text-lg">No products found matching your filters.</p>
              <button
                onClick={() => {
                  setFilters({ brand: filters.brand, flavorProfile: 'all', nicotine: 'all', category: filters.category } as any);
                  setSearchQuery('');
                }}
                className="mt-4 text-gold hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProducts.map((product) => (
                (product.category === 'thc-disposables' || product.category === 'thc-cartridges') ? (
                  <THCProductCard key={product.id} product={product} />
                ) : product.category === 'edibles' ? (
                  <EdiblesProductCard key={product.id} product={product} />
                ) : (
                  <Link to={`/product/${product.id}`} key={product.id} className="group relative bg-surface border border-black/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-xl hover:shadow-black/5 flex flex-col">
                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === product.id ? null : product.id);
                          }}
                          className="p-2 bg-black/5 text-text-primary rounded-full transition-colors hover:bg-black/10"
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
                              className="w-full text-left px-4 py-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-2 py-1 rounded">{product.brandName}</div>
                        {!product.inStock && (
                          <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">Out of Stock</div>
                        )}
                      </div>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-black/5 to-transparent rounded-xl mb-6 overflow-hidden flex items-center justify-center p-4 group-hover:bg-gradient-to-br group-hover:from-black/10 group-hover:to-transparent transition-colors">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-gold transition-colors leading-tight line-clamp-2">{product.name}</h3>
                    <div className="font-bold text-xl text-text-primary mb-4 pb-4 border-b border-black/5 mt-auto flex-grow flex items-end">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-black/5 rounded text-[10px] uppercase tracking-wider font-bold text-text-secondary font-mono">{product.puffCount} Puffs</span>
                      <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold font-mono ${product.isNicotineFree ? 'bg-blue-50 text-accent-blue' : 'bg-black/5 text-text-secondary'}`}>{product.nicotine}</span>
                    </div>
                  </Link>
                )
              ))}
            </div>
          )
        )}

      </div>

      {/* Admin Edit Modal */}
      {showEditForm && (
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
      )}
    </div>
  );
};

export default Catalog;
