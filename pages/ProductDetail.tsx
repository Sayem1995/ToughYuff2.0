import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, Battery, Zap, Droplet, Wind, Plus, Minus, Settings } from 'lucide-react';
import { THCProductDetail } from '../components/THCProductDetail';
import { EdiblesProductDetail } from '../components/EdiblesProductDetail';

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

  // Find related
  const related = products
    .filter(p => p.brandId === product.brandId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <Link to="/catalog" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <div className="aspect-square bg-surface border border-black/5 rounded-2xl flex items-center justify-center relative overflow-hidden group hover:border-gold/30 transition-colors shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent group-hover:from-black/10 transition-colors" />
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-8 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-black/5 text-gold text-xs font-bold px-3 py-1 rounded border border-gold/20 uppercase tracking-wider">
                {product.brandName}
              </span>
              {!product.inStock && (
                <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded border border-red-500/20 uppercase tracking-wider">
                  Out of Stock
                </span>
              )}
              {product.isNicotineFree && (
                <span className="bg-blue-50 text-accent-blue text-xs font-bold px-3 py-1 rounded border border-accent-blue/20 uppercase tracking-wider">
                  Zero Nicotine
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">{product.name}</h1>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-text-primary font-medium">{(product.puffCount || 0).toLocaleString()} Puffs</span>
              <span className="text-text-tertiary">|</span>
              <span className="text-text-primary font-medium">{product.nicotine}</span>
            </div>

            {/* Highlights Section */}
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FCAD62] flex-shrink-0">
                    <Battery className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-text-primary">Battery: {product.battery || 'Unknown'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#D55F2E] flex-shrink-0">
                    <Droplet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-text-primary">Nicotine: {product.nicotine}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F48AA4] flex-shrink-0">
                    <Wind className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-text-primary">
                    {product.brandName?.toLowerCase().includes('geek bar pulse')
                      ? '15000-19999 puffs'
                      : `${(product.puffCount || 0).toLocaleString()} puffs`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#5FB2A1] flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-text-primary">
                    {product.isRechargeable ? 'Rechargeable' : 'Non-Rechargeable'}
                  </span>
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
                <Link to={`/product/${rel.id}`} key={rel.id} className="block bg-surface border border-black/5 hover:border-gold/30 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:shadow-black/5">
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
