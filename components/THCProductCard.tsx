import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

interface THCProductCardProps {
    product: Product;
}

export const THCProductCard: React.FC<THCProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    // Build the card title: "Brand Name Product Name | size"
    const titleParts = [product.brandName, product.name].filter(Boolean).join(' ');
    const sizePart = [product.count, product.strength].filter(Boolean).join(' ');
    const fullTitle = sizePart ? `${titleParts} | ${sizePart}` : titleParts;

    // Category display label
    const categoryLabel =
        product.category === 'thc-disposables'
            ? 'THC Disposables'
            : product.category === 'thc-cartridges'
                ? 'THC Cartridges'
                : product.category || 'THC Products';

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
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!product.inStock && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                            Out of Stock
                        </span>
                    )}
                    {product.strength && (
                        <span className="bg-text-primary text-background text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {product.strength}
                        </span>
                    )}
                    {product.count && (
                        <span className="bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {product.count}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Star
                            key={i}
                            className="w-3.5 h-3.5 text-gold"
                            fill={i <= 4 ? '#C9A84C' : 'none'}
                        />
                    ))}
                    <span className="text-xs text-text-tertiary ml-2 font-medium">0 Reviews</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-text-primary leading-tight mb-2 line-clamp-2 min-h-[3rem] group-hover:text-gold transition-colors">
                    {fullTitle}
                </h3>

                {/* Category label */}
                <p className="text-sm font-medium text-text-secondary mb-4">{categoryLabel}</p>

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
