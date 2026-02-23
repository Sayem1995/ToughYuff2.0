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
            className="group cursor-pointer flex flex-col bg-surface rounded-2xl border border-black/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 hover:border-gold/30"
        >
            {/* Image */}
            <div className="w-full aspect-square bg-gradient-to-br from-black/5 to-transparent overflow-hidden flex items-center justify-center p-4 relative group-hover:bg-gradient-to-br group-hover:from-black/10 group-hover:to-transparent transition-colors">
                <img
                    src={product.image}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i <= 4 ? 'text-gold fill-gold' : 'text-text-tertiary'}`}
                        />
                    ))}
                    <span className="text-xs text-text-tertiary ml-2 font-medium">0 Reviews</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-text-primary leading-tight mb-2 line-clamp-2 min-h-[3rem] group-hover:text-gold transition-colors">
                    {fullTitle}
                </h3>

                {/* Subtitle */}
                <p className="text-sm font-medium text-text-secondary mb-4 line-clamp-1">{subtitle}</p>

                {/* Price */}
                <div className="font-bold text-xl text-text-primary mb-6">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                </div>

                {/* Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                    className="w-full bg-surface border border-black/10 hover:border-gold/50 hover:bg-gold/5 text-text-primary hover:text-gold font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all mt-auto shadow-sm"
                >
                    Select Options
                </button>
            </div>
        </div>
    );
};
