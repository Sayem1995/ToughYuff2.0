import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Star, ChevronDown, ChevronRight as BreadcrumbArrow } from 'lucide-react';
import { Link } from 'react-router-dom';

interface THCProductDetailProps {
    product: Product;
}

export const THCProductDetail: React.FC<THCProductDetailProps> = ({ product }) => {
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedFlavor, setSelectedFlavor] = useState('');

    const prevImage = () => setCurrentImageIndex(i => (i - 1 + allImages.length) % allImages.length);
    const nextImage = () => setCurrentImageIndex(i => (i + 1) % allImages.length);

    // Title: "Brand Name Product Name | (count) strength"
    const titleParts = [product.brandName, product.name].filter(Boolean).join(' ');
    const sizePart = [product.count ? `${product.count}` : '', product.strength || ''].filter(Boolean).join(' ');
    const fullTitle = sizePart ? `${titleParts} | ${sizePart}` : titleParts;

    const categoryLabel =
        product.category === 'thc-disposables'
            ? 'THC Disposables'
            : product.category === 'thc-cartridges'
                ? 'THC Cartridges'
                : 'THC Products';

    // Build feature bullets from features array, or fall back to auto-generated ones
    const featureBullets: string[] = [
        ...(Array.isArray(product.features) && product.features.length > 0
            ? product.features
            : [
                product.strength ? `${product.strength} Potency` : '',
                product.count ? `${product.count} Per Pack` : '',
                product.isRechargeable ? 'USB-C Rechargeable' : '',
                product.puffCount ? `${product.puffCount.toLocaleString()}+ Puffs` : '',
                `Premium ${product.brandName} Quality`,
            ].filter(Boolean)),
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                <Link to="/" className="hover:text-[#3b0764] transition-colors">Home</Link>
                <BreadcrumbArrow className="w-3 h-3 text-gray-400" />
                <Link to="/catalog" className="hover:text-[#3b0764] transition-colors">Shop</Link>
                <BreadcrumbArrow className="w-3 h-3 text-gray-400" />
                <Link to={`/catalog?category=${product.category}`} className="hover:text-[#3b0764] transition-colors">
                    {categoryLabel}
                </Link>
                <BreadcrumbArrow className="w-3 h-3 text-gray-400" />
                <span className="text-gray-800 font-medium">{fullTitle}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                    {/* ── LEFT: Image Slider ── */}
                    <div className="relative">
                        {/* Main image */}
                        <div className="aspect-square bg-[#f9f9f9] rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-100">
                            <img
                                src={allImages[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-contain p-8 transition-all duration-500"
                            />
                            {/* Prev / Next arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:border-[#3b0764]/30"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:border-[#3b0764]/30"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-[#f9f9f9] p-1 ${currentImageIndex === idx
                                                ? 'border-[#3b0764]'
                                                : 'border-gray-200 hover:border-[#3b0764]/40'
                                            }`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Product Info ── */}
                    <div className="flex flex-col">
                        {/* Star Rating */}
                        <div className="flex items-center gap-1.5 mb-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                    key={i}
                                    className="w-4 h-4 text-orange-400"
                                    fill={i <= 4 ? '#fb923c' : 'none'}
                                />
                            ))}
                            <span className="text-sm text-gray-500 ml-1">0 Reviews</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
                            {fullTitle}
                        </h1>

                        {/* Price */}
                        <div className="text-2xl font-bold text-gray-900 mb-6 pb-6 border-b border-gray-100">
                            ${product.price ? product.price.toFixed(2) : '0.00'}
                        </div>

                        {/* Feature Bullets */}
                        {featureBullets.length > 0 && (
                            <ul className="space-y-2 mb-8 text-sm text-gray-700">
                                {featureBullets.map((bullet, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3b0764] flex-shrink-0" />
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* SELECT FLAVOR */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-[#3b0764] uppercase tracking-widest mb-2">
                                Select Flavor
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedFlavor}
                                    onChange={(e) => setSelectedFlavor(e.target.value)}
                                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm text-gray-700 bg-white focus:border-[#3b0764] focus:ring-1 focus:ring-[#3b0764]/20 outline-none font-medium cursor-pointer"
                                >
                                    <option value="">Choose An Option</option>
                                    {/* Flavor profile options */}
                                    {Array.isArray(product.flavorProfile) && product.flavorProfile.map((flavor, i) => (
                                        <option key={i} value={flavor}>{flavor}</option>
                                    ))}
                                    {/* Fallback if no flavor profile */}
                                    {(!Array.isArray(product.flavorProfile) || product.flavorProfile.length === 0) && (
                                        <option value="default">{product.name}</option>
                                    )}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Category & Brand Meta */}
                        <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-100">
                            <p>
                                <span className="font-semibold text-gray-700">Category: </span>
                                {categoryLabel}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-700">Brand: </span>
                                {product.brandName}
                            </p>
                            {product.strength && (
                                <p>
                                    <span className="font-semibold text-gray-700">Strength: </span>
                                    {product.strength}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Description / About Tabs ── */}
                <div className="mt-16 border-t border-gray-200 pt-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{fullTitle}</h2>
                    {product.description && (
                        <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                    )}
                    {product.aboutText && (
                        <p className="text-gray-600 leading-relaxed mb-4">{product.aboutText}</p>
                    )}
                    {Array.isArray(product.features) && product.features.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            {product.features.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
