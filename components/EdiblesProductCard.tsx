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
            {/* Image */}
            <div className="w-full aspect-square bg-black/5 overflow-hidden flex items-center justify-center p-4 relative group-hover:bg-black/10 transition-colors">
                <img
                    src={product.image}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                {!product.inStock && (
                    <div className="absolute top-2 left-2 text-[10px] font-bold text-red-50 text-center uppercase tracking-widest bg-red-500 px-2 py-1 rounded z-10">
                        Out of Stock
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-grow">
                <div className="text-xs text-text-secondary mb-1 leading-none">{product.brandName}</div>
                <h3 className="text-base font-medium text-text-primary mb-1 line-clamp-2 group-hover:text-gold transition-colors">
                    {product.name}
                </h3>
                <div className="font-bold text-lg text-text-primary mt-auto">
                    ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                </div>
            </div>
        </div>
    );
};
