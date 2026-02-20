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
            className="group cursor-pointer flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#3b0764]/30"
        >
            {/* Image */}
            <div className="w-full aspect-square bg-[#fafafa] overflow-hidden flex items-center justify-center p-4 relative">
                <img
                    src={product.image}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badges */}
                {(product.strength || product.count) && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.strength && (
                            <span className="bg-[#3b0764]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                {product.strength}
                            </span>
                        )}
                        {product.count && (
                            <span className="bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                {product.count}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Star
                            key={i}
                            className="w-3 h-3 text-orange-400"
                            fill={i <= 4 ? '#fb923c' : 'none'}
                        />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">0 Reviews</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-gray-900 leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
                    {fullTitle}
                </h3>

                {/* Category label */}
                <p className="text-xs text-gray-500 mb-2">{categoryLabel}</p>

                {/* Price */}
                <div className="font-bold text-base text-gray-900 mb-3">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                </div>

                {/* Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                    className="w-full bg-[#3b0764] hover:bg-[#4c1d95] text-white font-bold py-2.5 rounded text-xs uppercase tracking-widest transition-colors mt-auto"
                >
                    Select Options
                </button>
            </div>
        </div>
    );
};
