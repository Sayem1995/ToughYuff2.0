import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

interface EdiblesProductCardProps {
    product: Product;
}

export const EdiblesProductCard: React.FC<EdiblesProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    // Build title: "Brand Name | (count) strength"
    const titleParts = [product.brandName || '', product.name || ''].filter(Boolean).join(' ');
    const specs = [
        product.count ? `(${product.count})` : '',
        product.strength || ''
    ].filter(Boolean).join(' ');
    const fullTitle = specs ? `${titleParts} | ${specs}` : titleParts;

    // Category subtitle
    const subtitle = product.description?.split('.')[0] || 'Edibles';

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="group cursor-pointer flex flex-col bg-surface rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
        >
            {/* Top Image Block */}
            <div className="aspect-square bg-white flex items-center justify-center p-6 relative group-hover:bg-[#FCFAFE] transition-colors">
                <img
                    src={product.image}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                {!product.inStock && (
                    <div className="absolute top-4 left-4 text-[10px] font-bold text-red-50 text-center uppercase tracking-widest bg-red-500 px-2 py-1 rounded z-10">
                        Out of Stock
                    </div>
                )}
            </div>

            {/* Bottom Info Block */}
            <div className="bg-[#F8F9FA] p-5 flex flex-col flex-grow">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-semibold">{product.brandName} - {product.puffCount || product.count || specs || 'N/A'}</div>
                <h3 className="text-lg font-medium text-text-primary mb-3 line-clamp-3 leading-snug">
                    {product.name}
                </h3>
                <div className="font-bold text-lg text-text-primary mt-auto">
                    ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                </div>
            </div>
        </div>
    );
};
