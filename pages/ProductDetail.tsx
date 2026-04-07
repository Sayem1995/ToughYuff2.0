import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, Battery, Zap, Droplet, Wind, Plus, Minus, Settings, ChevronDown, Percent, Award, ShoppingCart } from 'lucide-react';
import { useCart } from '../src/context/CartContext';
import { THCProductDetail } from '../components/THCProductDetail';
import { EdiblesProductDetail } from '../components/EdiblesProductDetail';
import { WrapsProductDetail } from '../components/WrapsProductDetail';

// Helper component for Accordion
const AccordionItem = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: React.ElementType }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-black/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left py-4 hover:bg-black/5 transition-colors px-2 -mx-2 rounded-lg"
      >
        <span className="flex items-center gap-3 font-semibold text-lg text-text-primary">
          {Icon && <Icon className="w-5 h-5 text-text-secondary" />}
          {title}
        </span>
        {isOpen ? <Minus className="w-5 h-5 text-text-secondary" /> : <Plus className="w-5 h-5 text-text-secondary" />}
      </button>
      {isOpen && <div className="pb-6 text-text-secondary leading-relaxed px-2">{children}</div>}
    </div>
  );
};

interface ProductDetailProps {
  products: Product[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ products = [] }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Existing state for standard view
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setSelectedImage(found.image);
    }
    setLoading(false);
  }, [id, products]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  // THC View Check — covers both disposables and cartridges
  if (product.category === 'thc-disposables' || product.category === 'thc-cartridges') {
    return <THCProductDetail product={product} />;
  }

  // Edibles View Check
  if (product.category === 'edibles') {
    return <EdiblesProductDetail product={product} />;
  }

  // Wraps View Check
  if (product.category && product.category.toLowerCase().includes('wrap')) {
    return <WrapsProductDetail product={product} />;
  }

  // Find related
  const related = products
    .filter(p => p.brandId === product.brandId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <Link to="/catalog" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors group gap-2 px-3 py-2 rounded-xl hover:bg-black/5 w-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Image - Enhanced */}
          <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl flex items-center justify-center relative overflow-hidden group shadow-large border border-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-gold/5 group-hover:from-primary/10 group-hover:to-gold/10 transition-all duration-500" />
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-12 drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Details - Enhanced */}
          <div className="animate-slide-up">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="badge badge-gold">
                {product.brandName}
              </span>
              {!product.inStock && (
                <span className="badge badge-error">
                  <XCircle className="w-3 h-3" /> Out of Stock
                </span>
              )}
              {product.isNicotineFree && (
                <span className="badge badge-primary">
                  <Droplet className="w-3 h-3" /> Zero Nicotine
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight mb-4">{product.name}</h1>

            {/* Price */}
            <div className="text-3xl font-bold text-gradient mb-6 pb-6 border-b border-black/10">
              ${product.price ? product.price.toFixed(2) : '0.00'}
            </div>

            {/* Add to Cart - Enhanced */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center bg-surface border border-black/10 rounded-xl shadow-soft overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-3 font-bold text-slate-900 dark:text-white border-x border-black/10 min-w-[50px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => { addToCart(product, quantity); setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2000); }}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-soft ${
                  addedToCart 
                    ? 'bg-success text-white shadow-lg scale-95' 
                    : 'bg-gradient-primary text-white hover:shadow-glow hover:scale-105 active:scale-95'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {addedToCart ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 animate-bounce" /> Added to Cart!
                  </>
                ) : 'Add to Cart'}
              </button>
            </div>

            {/* Highlights Section - Enhanced */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-gold" />
                Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-[#FCAD62]/10 to-transparent rounded-xl border border-[#FCAD62]/20 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FCAD62] to-[#F48A29] flex-shrink-0 shadow-md">
                    <Battery className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Battery</p>
                    <p className="text-sm font-semibold text-text-primary">{product.battery || '650mAh'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-[#D55F2E]/10 to-transparent rounded-xl border border-[#D55F2E]/20 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#D55F2E] to-[#C44E1D] flex-shrink-0 shadow-md">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Nicotine</p>
                    <p className="text-sm font-semibold text-text-primary">{product.nicotine || '5%'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-[#F48AA4]/10 to-transparent rounded-xl border border-[#F48AA4]/20 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#F48AA4] to-[#E07A94] flex-shrink-0 shadow-md">
                    <Wind className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Puff Count</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {product.puffCount && product.puffCount > 0
                        ? `${product.puffCount.toLocaleString()}+ puffs`
                        : product.brandName?.toLowerCase().includes('pulse') ? '15000+ puffs' : 'View details'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-[#5FB2A1]/10 to-transparent rounded-xl border border-[#5FB2A1]/20 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#5FB2A1] to-[#4E9E8D] flex-shrink-0 shadow-md">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Charging</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {product.isRechargeable ?? true ? 'Rechargeable (USB-C)' : 'Non-Rechargeable'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-1 border-t border-black/10">
              <AccordionItem
                title={
                  <div className="flex items-center gap-2">
                    {product.brandName?.toLowerCase().includes('geek bar pulse') && <Settings className="w-5 h-5 text-text-secondary" />}
                    <span>About {product.brandName?.toLowerCase().includes('geek bar pulse') ? 'Geek Bar Pulse 15000' : product.brandName}</span>
                  </div>
                }
              >
                {product.brandName?.toLowerCase().includes('geek bar pulse') ? (
                  <p className="text-text-secondary leading-relaxed">
                    The Geek Bar Pulse 15000 {product.name.replace(/geek bar pulse 15000|geek bar pulse/i, '').trim()} disposable vape offers a whopping 15000 puffs and features a convenient USB-C charging port. It's powered by a 650mAh battery and has a comfortable duckbill mouthpiece.
                  </p>
                ) : (
                  product.aboutText || product.description || `Experience the premium quality of ${product.brandName}. This product delivers exceptional performance and flavor.`
                )}
              </AccordionItem>

              <AccordionItem title="Flavor">
                {product.flavorText || (
                  <div>
                    <p className="mb-4">{product.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(product.flavorProfile) ? product.flavorProfile : []).map(p => (
                        <span key={p} className="text-xs font-medium bg-black/5 text-text-secondary px-3 py-1 rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionItem>

              <AccordionItem title="Features">
                {Array.isArray(product.features) && product.features.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {product.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-tertiary italic">No specific features listed.</p>
                )}
              </AccordionItem>
            </div>

            <div className="mt-12 pt-8 border-t border-black/10">
              <p className="text-sm text-text-tertiary">
                *Product availability is subject to change. Visit our store to purchase. Must be 21+ with valid ID.
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-8 text-text-primary">More from {product.brandName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(rel => (
                <Link to={`/product/${rel.id}`} key={rel.id} className="block bg-surface rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:shadow-black/5">
                  <div className="text-lg font-bold text-text-primary mb-1">{rel.name}</div>
                  <div className="text-sm text-text-secondary">{rel.nicotine} • {rel.puffCount} puffs</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
