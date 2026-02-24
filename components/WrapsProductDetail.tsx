import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Store, ShieldCheck, Percent, Wind, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WrapsProductDetailProps {
    product: Product;
}

export const WrapsProductDetail: React.FC<WrapsProductDetailProps> = ({ product }) => {
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Default to the first flavor if available, or just an empty string
    const defaultFlavor = product.flavorProfile && product.flavorProfile.length > 0 ? product.flavorProfile[0] : '';
    const [selectedFlavor, setSelectedFlavor] = useState(defaultFlavor);

    const selectedImage = allImages[selectedImageIdx] || product.image;

    const goToPrev = () => setSelectedImageIdx(i => (i > 0 ? i - 1 : allImages.length - 1));
    const goToNext = () => setSelectedImageIdx(i => (i < allImages.length - 1 ? i + 1 : 0));

    // Handle price display
    const basePrice = product.price || 0;
    const totalPrice = basePrice * quantity;

    return (
        <div className="min-h-screen bg-[#0a0f12] text-gray-200 font-sans selection:bg-amber-500/30">
            {/* Dark, sleek navigation breadcrumb */}
            <div className="w-full bg-black/40 border-b border-white/5 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 text-xs tracking-widest font-medium text-gray-400 uppercase">
                    <Link className="hover:text-amber-400 transition-colors" to="/">Home</Link>
                    <span className="text-gray-700">/</span>
                    <Link className="hover:text-amber-400 transition-colors" to="/catalog?category=wraps-and-blunts">Wraps Vault</Link>
                    <span className="text-gray-700">/</span>
                    <span className="text-gray-100">{product.brandName} {product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
                <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">

                    {/* Left Showcase (Images) */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6">
                        <div className="relative aspect-[4/5] sm:aspect-square bg-gradient-to-b from-[#161a1d] to-[#0a0f12] rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center p-8 group shadow-2xl">
                            {/* Stylish Background Glow */}
                            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />

                            <img
                                src={selectedImage}
                                alt={product.name || 'Wrap Product'}
                                className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transform z-10 transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
                                    <button onClick={goToPrev} className="pointer-events-auto w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-400 transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
                                        <ChevronLeft className="w-6 h-6 ml-[-2px]" />
                                    </button>
                                    <button onClick={goToNext} className="pointer-events-auto w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-400 transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                                        <ChevronRight className="w-6 h-6 mr-[-2px]" />
                                    </button>
                                </div>
                            )}

                            {/* Badge */}
                            <div className="absolute top-6 left-6 z-20 flex gap-2">
                                <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                                    Premium
                                </span>
                            </div>
                        </div>

                        {/* Visual Filmstrip Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIdx(idx)}
                                        className={`w-24 h-24 rounded-2xl flex-shrink-0 bg-[#161a1d] p-3 transition-all duration-300 relative overflow-hidden group ${selectedImageIdx === idx
                                            ? 'ring-2 ring-amber-500 ring-offset-4 ring-offset-[#0a0f12] scale-105'
                                            : 'border border-white/5 hover:border-white/20 hover:scale-105'
                                            }`}
                                    >
                                        <img src={img} alt={`Variant ${idx + 1}`} className="w-full h-full object-contain filter drop-shadow-lg group-hover:brightness-110 transition-all" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Panel (Details & Purchase) */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <div className="mb-8">
                            <h2 className="text-amber-500 font-black tracking-[0.3em] uppercase text-sm mb-4 flex items-center gap-4">
                                {product.brandName}
                                <span className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></span>
                            </h2>
                            <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-4">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 text-sm font-medium text-gray-400 uppercase tracking-widest">
                                {product.count && <span>{product.count}</span>}
                                {product.count && product.strength && <span className="w-1 h-1 rounded-full bg-gray-600" />}
                                {product.strength && <span>{product.strength}</span>}
                            </div>
                        </div>

                        {/* Checkout elements removed as per user request */}

                        {/* Description & Specs Accordion/List */}
                        <div className="space-y-6">
                            {/* Highlights Section */}
                            <div className="bg-[#161a1d]/50 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Highlights
                                </h3>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    {/* Strength */}
                                    {product.strength && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#D55F2E] flex-shrink-0 shadow-sm border border-white/5">
                                                <Percent className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-300">{product.strength} Total Potency</span>
                                        </div>
                                    )}

                                    {/* Count */}
                                    {product.count && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F48AA4] flex-shrink-0 shadow-sm border border-white/5">
                                                <Wind className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-300">{product.count} Count Pack</span>
                                        </div>
                                    )}

                                    {/* Quality Guarantee */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FCAD62] flex-shrink-0 shadow-sm border border-white/5">
                                            <Award className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-300">Premium {product.brandName || 'Brand'} Quality</span>
                                    </div>

                                    {/* Authentic Guarantee */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#5FB2A1] flex-shrink-0 shadow-sm border border-white/5">
                                            <ShieldCheck className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-300">100% Genuine</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">About</h4>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {product.description || `Experience the ultimate in smoothness with ${product.brandName || 'our'}'s premium selection. Crafted for perfect burns and rich flavor profiles.`}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#161a1d]/50 rounded-2xl p-5 border border-white/5 flex items-start gap-4">
                                    <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Authentic</h4>
                                        <p className="text-xs text-gray-500">100% Genuine product guarantee</p>
                                    </div>
                                </div>
                                <div className="bg-[#161a1d]/50 rounded-2xl p-5 border border-white/5 flex items-start gap-4">
                                    <Store className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Available</h4>
                                        <p className="text-xs text-gray-500">Ready for store pickup today</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
