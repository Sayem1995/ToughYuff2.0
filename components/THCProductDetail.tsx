import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Star, ChevronDown, ChevronRight as BreadcrumbArrow, Minus, Plus, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface THCProductDetailProps {
    product: Product;
}

export const THCProductDetail: React.FC<THCProductDetailProps> = ({ product }) => {
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedFlavor, setSelectedFlavor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'loyalty'>('description');

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

    // Group strains into chunks of 3 for the grid display
    const strains = product.strains || [];
    const strainGroups: string[][] = [];
    for (let i = 0; i < strains.length; i += 3) {
        strainGroups.push(strains.slice(i, i + 3));
    }

    // Get current day name for shipping message
    const getShippingDay = () => {
        const now = new Date();
        const day = now.getDay(); // 0=Sun, 1=Mon...6=Sat
        // If before Fri 5pm, ships same/next business day. Weekend → Monday
        if (day === 5) return 'Monday'; // Friday → Monday
        if (day === 6) return 'Monday'; // Saturday → Monday
        if (day === 0) return 'Monday'; // Sunday → Monday
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[(day + 1) % 7]; // Next day
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                <Link to="/" className="hover:text-[#3b0764] transition-colors">Home</Link>
                <BreadcrumbArrow className="w-3 h-3 text-gray-400" />
                <Link to="/catalog" className="hover:text-[#3b0764] transition-colors">Products</Link>
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
                                    fill={i <= 5 ? '#fb923c' : 'none'}
                                />
                            ))}
                            <span className="text-sm text-[#fb923c] ml-1 font-medium">2 Reviews</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-[#2d1b69] leading-tight mb-4">
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
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-white bg-[#3b0764] uppercase tracking-widest mb-2 px-3 py-1.5 w-fit rounded-sm">
                                Select Flavor
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedFlavor}
                                    onChange={(e) => setSelectedFlavor(e.target.value)}
                                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm text-gray-700 bg-white focus:border-[#3b0764] focus:ring-1 focus:ring-[#3b0764]/20 outline-none font-medium cursor-pointer"
                                >
                                    <option value="">CHOOSE AN OPTION</option>
                                    {Array.isArray(product.flavorProfile) && product.flavorProfile.map((flavor, i) => (
                                        <option key={i} value={flavor}>{flavor}</option>
                                    ))}
                                    {(!Array.isArray(product.flavorProfile) || product.flavorProfile.length === 0) && (
                                        <option value="default">{product.name}</option>
                                    )}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
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

                            <button className="flex-1 bg-[#3b0764] hover:bg-[#4c1d95] text-white font-bold py-3.5 rounded-lg uppercase tracking-wider text-sm transition-colors shadow-md hover:shadow-lg">
                                Add to Cart
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-5 border-t border-gray-100 space-y-3">
                            <p className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-gray-500">
                                <span>Secure checkout powered by</span>
                                <span className="px-2 py-0.5 bg-gray-900 text-white text-[10px] rounded font-bold tracking-wider">→ Bolt</span>
                            </p>
                            <p className="text-xs font-bold flex items-center gap-2 text-green-600">
                                <Truck className="w-4 h-4" />
                                ORDER NOW! SHIPS ON {getShippingDay().toUpperCase()}
                                {' '}
                                <span className="text-gray-400 underline font-normal cursor-pointer">terms apply</span>
                            </p>
                        </div>

                        {/* Category & Brand Meta */}
                        <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-100 mt-4">
                            <p>
                                <span className="font-semibold text-gray-700">Categories: </span>
                                Disposable Vapes, THC-A Products, Vapes
                            </p>
                            <p>
                                <span className="font-semibold text-gray-700">Brand: </span>
                                {product.brandName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Description / Loyalty Tabs ── */}
                <div className="mt-16">
                    <div className="flex items-center gap-0 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors rounded-t-lg ${activeTab === 'description'
                                ? 'bg-[#3b0764] text-white'
                                : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors rounded-t-lg ${activeTab === 'loyalty'
                                ? 'bg-[#3b0764] text-white'
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
                                {product.description && <p>{product.description}</p>}
                                {product.aboutText && <p>{product.aboutText}</p>}
                                {Array.isArray(product.features) && product.features.length > 0 && (
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

                {/* ── Available Strains Grid ── */}
                {strains.length > 0 && (
                    <div className="mt-12 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Strains</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {strainGroups.map((group, gIdx) => (
                                <div
                                    key={gIdx}
                                    className="border border-gray-200 rounded-lg p-4 space-y-1"
                                >
                                    {group.map((strain, sIdx) => (
                                        <React.Fragment key={sIdx}>
                                            <p className="text-sm text-gray-800 font-medium">{strain}</p>
                                            {sIdx < group.length - 1 && (
                                                <div className="border-b border-gray-100 my-1" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
