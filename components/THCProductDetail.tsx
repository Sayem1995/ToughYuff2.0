import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Star, ChevronDown, ChevronRight as BreadcrumbArrow, Minus, Plus, Truck, Zap, Wind, Percent, Award } from 'lucide-react';
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
        <div className="min-h-screen bg-background text-text-primary">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-text-secondary flex items-center gap-1.5 flex-wrap">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <BreadcrumbArrow className="w-3 h-3 text-text-tertiary" />
                <Link to="/catalog" className="hover:text-gold transition-colors">Products</Link>
                <BreadcrumbArrow className="w-3 h-3 text-text-tertiary" />
                <span className="text-text-primary font-medium">{fullTitle}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                    {/* ── LEFT: Image Slider ── */}
                    <div className="relative">
                        {/* Main image */}
                        <div className="aspect-square bg-gradient-to-br from-black/5 to-transparent rounded-2xl overflow-hidden flex items-center justify-center relative border border-black/5">
                            <img
                                src={allImages[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-contain p-8 transition-all duration-500 drop-shadow-xl"
                            />
                            {/* Prev / Next arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-surface border border-black/10 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:border-gold/50"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-text-secondary" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-surface border border-black/10 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:border-gold/50"
                                    >
                                        <ChevronRight className="w-5 h-5 text-text-secondary" />
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
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-surface p-1 shadow-sm ${currentImageIndex === idx
                                            ? 'border-gold'
                                            : 'border-black/5 hover:border-gold/50'
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
                        {/* Star Rating & Out of Stock */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        className="w-4 h-4 text-gold"
                                        fill={i <= 5 ? '#C9A84C' : 'none'}
                                    />
                                ))}
                                <span className="text-sm text-text-tertiary ml-1 font-medium">2 Reviews</span>
                            </div>
                            {!product.inStock && (
                                <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded border border-red-500/20 uppercase tracking-wider">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight mb-4">
                            {fullTitle}
                        </h1>

                        {/* Price */}
                        <div className="text-2xl font-bold text-text-primary mb-6 pb-6 border-b border-black/10">
                            ${product.price ? product.price.toFixed(2) : '0.00'}
                        </div>

                        {/* Highlights Section */}
                        <div className="mb-10 lg:pr-12">
                            <h3 className="text-xl font-bold text-text-primary mb-6">Highlights</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                {/* Battery / Rechargeable */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#5FB2A1] flex-shrink-0 shadow-sm">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">
                                        {product.isRechargeable ?? true ? 'USB-C Rechargeable' : 'Non-Rechargeable'}
                                    </span>
                                </div>

                                {/* Puffs / Count */}
                                {(product.puffCount || product.count) && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F48AA4] flex-shrink-0 shadow-sm">
                                            <Wind className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-text-primary">
                                            {product.puffCount ? `${product.puffCount.toLocaleString()}+ Puffs` : `${product.count} Per Pack`}
                                        </span>
                                    </div>
                                )}

                                {/* Strength */}
                                {product.strength && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#D55F2E] flex-shrink-0 shadow-sm">
                                            <Percent className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-text-primary">{product.strength} Potency</span>
                                    </div>
                                )}

                                {/* Quality Guarantee */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FCAD62] flex-shrink-0 shadow-sm">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">Premium {product.brandName} Quality</span>
                                </div>
                            </div>
                        </div>

                        {/* Checkout elements removed as per user request */}
                    </div>
                </div>

                {/* ── Description / Loyalty Tabs ── */}
                <div className="mt-16">
                    <div className="flex items-center gap-0 border-b border-black/10">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors rounded-t-lg ${activeTab === 'description'
                                ? 'bg-text-primary text-background'
                                : 'bg-black/5 text-text-tertiary hover:text-text-primary'
                                }`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors rounded-t-lg ${activeTab === 'loyalty'
                                ? 'bg-text-primary text-background'
                                : 'bg-black/5 text-text-tertiary hover:text-text-primary'
                                }`}
                        >
                            Loyalty Points
                        </button>
                    </div>
                    <div className="py-8 text-text-secondary leading-relaxed max-w-4xl">
                        {activeTab === 'description' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-text-primary">{fullTitle}</h3>
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
                        <h2 className="text-xl font-semibold text-text-primary mb-6">Available Strains</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {strainGroups.map((group, gIdx) => (
                                <div
                                    key={gIdx}
                                    className="border border-black/10 rounded-lg p-4 space-y-1 bg-surface"
                                >
                                    {group.map((strain, sIdx) => (
                                        <React.Fragment key={sIdx}>
                                            <p className="text-sm text-text-primary font-medium">{strain}</p>
                                            {sIdx < group.length - 1 && (
                                                <div className="border-b border-black/5 my-1" />
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
