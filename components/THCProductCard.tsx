import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface THCProductCardProps {
    product: Product;
}

export const THCProductCard: React.FC<THCProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="group cursor-pointer flex flex-col items-center bg-surface rounded-[2rem] p-6 transition-all duration-300 hover:shadow-xl border border-transparent hover:border-purple-100"
        >
            {/* Strain/Flavor Label if applicable */}
            {/* Image */}
            <div className="w-full aspect-[4/5] mb-6 relative overflow-hidden rounded-2xl bg-[#fafafa]">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                {/* Quick Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.strength && (
                        <span className="bg-black/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                            {product.strength}
                        </span>
                    )}
                    {product.count && (
                        <span className="bg-purple-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                            {product.count}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="text-center w-full space-y-2">
                {/* Rating or Brand */}
                <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <svg key={i} className="w-3 h-3 text-orange-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">4 Reviews</span>
                </div>

                <h3 className="font-bold text-lg text-text-primary leading-tight min-h-[3rem] line-clamp-2">
                    {product.brandName} {product.name}
                    {product.strength ? ` | ${product.strength}` : ''}
                </h3>

                <p className="text-text-secondary text-sm">{product.category === 'thc-disposables' ? 'THC Edibles & Vapes' : 'Product'}</p>

                <div className="font-bold text-lg text-text-primary py-1">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                </div>

                {/* Select Options Button */}
                <button
                    className="w-full bg-[#3b0764] hover:bg-[#581c87] text-white font-bold py-3 rounded-lg uppercase tracking-wider text-sm transition-colors mt-2"
                >
                    Select Options
                </button>
            </div>
        </div>
    );
};
