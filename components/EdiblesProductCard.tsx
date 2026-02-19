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
            className="group cursor-pointer flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#2d1b69]/30"
        >
            {/* Image */}
            <div className="w-full aspect-square bg-[#fafafa] overflow-hidden flex items-center justify-center p-4">
                <img
                    src={product.image}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                        />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">0 Reviews</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
                    {fullTitle}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">{subtitle}</p>

                {/* Price */}
                <div className="font-bold text-base text-gray-900 mb-3">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                </div>

                {/* Button */}
                <button
                    className="w-full bg-[#2d1b69] hover:bg-[#3d2b79] text-white font-bold py-2.5 rounded text-xs uppercase tracking-widest transition-colors mt-auto"
                >
                    Select Options
                </button>
            </div>
        </div>
    );
};
