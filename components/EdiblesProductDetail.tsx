import React, { useState } from 'react';
import { Product } from '../types';
import { Star, ChevronLeft, ChevronRight, Truck, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EdiblesProductDetailProps {
    product: Product;
}

export const EdiblesProductDetail: React.FC<EdiblesProductDetailProps> = ({ product }) => {
    // All images: main image + gallery
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'loyalty'>('description');
    const [selectedOption, setSelectedOption] = useState('');

    const selectedImage = allImages[selectedImageIdx] || product.image;

    const goToPrev = () => setSelectedImageIdx(i => (i > 0 ? i - 1 : allImages.length - 1));
    const goToNext = () => setSelectedImageIdx(i => (i < allImages.length - 1 ? i + 1 : 0));

    // Title
    const specs = [
        product.count ? `(${product.count})` : '',
        product.strength || ''
    ].filter(Boolean).join(' ');
    const fullTitle = specs
        ? `${product.brandName || ''} ${product.name || ''} | ${specs}`
        : `${product.brandName || ''} ${product.name || ''}`;

    // Bullet points from features or generate defaults
    const bullets = product.features && product.features.length > 0
        ? product.features
        : [
            product.strength ? `${product.strength} Total Potency` : null,
            product.count ? `${product.count} Count Pack` : null,
            'Designed to support relaxation and rest',
            `Premium ${product.brandName || 'Brand'} Quality`
        ].filter(Boolean) as string[];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-400 flex items-center gap-2">
                <Link to="/" className="hover:text-[#2d1b69] transition-colors">Home</Link>
                <span>›</span>
                <Link to="/catalog?category=edibles" className="hover:text-[#2d1b69] transition-colors">Edibles</Link>
                <span>›</span>
                <span className="text-gray-700 font-medium">{product.name || 'Product'}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image with Arrows */}
                        <div className="relative aspect-[4/5] bg-[#fafafa] rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-8">
                            <img
                                src={selectedImage}
                                alt={product.name || 'Product Image'}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                            />
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={goToPrev}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={goToNext}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIdx(idx)}
                                        className={`w-20 h-20 rounded-lg border-2 flex-shrink-0 overflow-hidden p-1.5 bg-[#fafafa] transition-all ${selectedImageIdx === idx ? 'border-[#2d1b69]' : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-400">0 Reviews</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                            {fullTitle}
                        </h1>

                        {/* Price */}
                        <div className="text-2xl font-bold text-gray-900 mb-6 pb-6 border-b border-gray-100">
                            ${product.price ? product.price.toFixed(2) : '0.00'}
                        </div>

                        {/* Bullets */}
                        <ul className="space-y-2.5 mb-8 text-gray-600 text-sm">
                            {bullets.map((b, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d1b69]/40 mt-1.5 flex-shrink-0" />
                                    {b}
                                </li>
                            ))}
                        </ul>

                        {/* Flavor / Option Selection */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-[#2d1b69] uppercase tracking-widest mb-2">
                                Select Flavor
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-[#2d1b69] outline-none bg-white font-medium"
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            >
                                <option value="">Choose an option</option>
                                <option value="default">{product.name} {product.strength ? `- ${product.strength}` : ''}</option>
                            </select>
                        </div>

                        {/* Quantity + Add to Cart */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <div className="w-16 h-12 flex items-center justify-center font-bold text-sm border-x border-gray-300">
                                    {quantity}
                                </div>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <button className="flex-1 bg-[#2d1b69] hover:bg-[#3d2b79] text-white font-bold py-3.5 rounded-lg uppercase tracking-wider text-sm transition-colors">
                                Add to Cart
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
                            <p className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-gray-500">
                                <span>Secure checkout powered by</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-[10px] rounded font-bold text-gray-700">Bolt</span>
                            </p>
                            <p className="text-xs font-bold flex items-center gap-2 text-green-600">
                                <Truck className="w-4 h-4" />
                                ORDER NOW - SHIPS TODAY!{' '}
                                <span className="text-gray-400 underline font-normal cursor-pointer">terms apply</span>
                            </p>
                            <div className="text-xs text-gray-400 space-y-1">
                                <p><span className="font-bold text-gray-700">Categories:</span> Delta 9 Gummies, Delta-9 THC Products, Hemp THC Edibles</p>
                                <p><span className="font-bold text-gray-700">Brand:</span> {product.brandName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs: Description / Loyalty */}
                <div className="mt-16">
                    <div className="flex items-center gap-0 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'description'
                                    ? 'bg-[#2d1b69] text-white'
                                    : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'loyalty'
                                    ? 'bg-[#2d1b69] text-white'
                                    : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Loyalty Points
                        </button>
                    </div>
                    <div className="py-8 text-gray-600 leading-relaxed max-w-4xl">
                        {activeTab === 'description' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900">{fullTitle}</h3>
                                <p>{product.description || 'No description available.'}</p>
                                {product.aboutText && <p>{product.aboutText}</p>}
                                {product.features && product.features.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {product.features.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                )}
                            </div>
                        )}
                        {activeTab === 'loyalty' && (
                            <div>
                                <p>Earn points with every purchase at our store!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
