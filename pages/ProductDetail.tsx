import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

interface ProductDetailProps {
  products: Product[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({ products }) => {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link to="/catalog" className="text-gold hover:underline">Back to Catalog</Link>
        </div>
      </div>
    );
  }

  // Find related
  const related = products
    .filter(p => p.brandId === product.brandId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <Link to="/catalog" className="inline-flex items-center text-text-secondary hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Placeholder */}
          <div className="aspect-square bg-card-bg border-2 border-dashed border-gold/30 rounded-2xl flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 rounded-2xl" />
             <div className="text-center p-8">
               <div className="text-gold font-bold text-xl mb-2">{product.brandName}</div>
               <div className="text-white text-3xl font-bold">{product.name}</div>
               <div className="mt-4 text-text-tertiary uppercase tracking-widest text-sm">Product Render Placeholder</div>
             </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-elevated text-gold text-xs font-bold px-3 py-1 rounded border border-gold/20 uppercase tracking-wider">
                {product.brandName}
              </span>
              {product.isNicotineFree && (
                <span className="bg-blue-900/20 text-accent-blue text-xs font-bold px-3 py-1 rounded border border-accent-blue/20 uppercase tracking-wider">
                  Zero Nicotine
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-8">
               {product.inStock ? (
                 <span className="flex items-center gap-2 text-green-400 font-medium bg-green-900/10 px-3 py-1.5 rounded-full border border-green-500/20">
                   <CheckCircle2 className="w-4 h-4" /> In Stock
                 </span>
               ) : (
                 <span className="flex items-center gap-2 text-text-tertiary font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                   <XCircle className="w-4 h-4" /> Out of Stock
                 </span>
               )}
               <span className="text-text-tertiary">|</span>
               <span className="text-white">{product.puffCount.toLocaleString()} Puffs</span>
               <span className="text-text-tertiary">|</span>
               <span className="text-white">{product.nicotine}</span>
            </div>

            <div className="space-y-8">
              <div className="bg-surface p-6 rounded-xl border border-white/5">
                <h3 className="text-lg font-semibold text-gold mb-3">Flavor Notes</h3>
                <p className="text-text-secondary leading-relaxed">{product.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Good For</h3>
                <div className="flex flex-wrap gap-2">
                  {product.flavorProfile.map(p => (
                    <span key={p} className="text-sm bg-white/5 text-text-secondary px-4 py-2 rounded-lg border border-white/5">
                      Fans of {p} flavors
                    </span>
                  ))}
                  <span className="text-sm bg-white/5 text-text-secondary px-4 py-2 rounded-lg border border-white/5">
                    All-day vaping
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-text-tertiary">
                *Product availability is subject to change. Visit our store to purchase. Must be 21+ with valid ID.
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-8">More from {product.brandName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {related.map(rel => (
                 <Link to={`/product/${rel.id}`} key={rel.id} className="block bg-card-bg border border-white/5 hover:border-gold/30 rounded-xl p-6 transition-colors">
                   <div className="text-lg font-bold text-white mb-1">{rel.name}</div>
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
