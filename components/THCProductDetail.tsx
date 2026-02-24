import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Star, ChevronDown, ChevronRight as BreadcrumbArrow, Minus, Plus, Truck, Zap, Wind, Percent, Award, Battery, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper component for Accordion
const AccordionItem = ({ title, children, icon: Icon }: { title: React.ReactNode | string, children: React.ReactNode, icon?: React.ElementType }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-black/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left py-4 hover:bg-black/5 transition-colors px-2 -mx-2 rounded-lg"
            >
                <span className="flex items-center gap-3 font-semibold text-lg text-text-primary">
                    {Icon && <Icon className="w-5 h-5 text-text-secondary" />}
                    {title}
                </span>
                {isOpen ? <Minus className="w-5 h-5 text-text-secondary" /> : <Plus className="w-5 h-5 text-text-secondary" />}
            </button>
            {isOpen && <div className="pb-6 text-text-secondary leading-relaxed px-2">{children}</div>}
        </div>
    );
};

interface THCProductDetailProps {
    product: Product;
}

export const THCProductDetail: React.FC<THCProductDetailProps> = ({ product }) => {
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                                {/* Battery */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FCAD62] flex-shrink-0 shadow-sm">
                                        <Battery className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">Battery: {product.battery || '650mAh'}</span>
                                </div>

                                {/* Nicotine / Strength */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#D55F2E] flex-shrink-0 shadow-sm">
                                        <Percent className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">
                                        {product.strength ? `Strength: ${product.strength}` : `Nicotine: ${product.nicotine || '5%'}`}
                                    </span>
                                </div>

                                {/* Puffs / Count */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F48AA4] flex-shrink-0 shadow-sm">
                                        <Wind className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">
                                        {product.count
                                            ? `${product.count} count`
                                            : product.puffCount && product.puffCount > 0
                                                ? `${product.puffCount.toLocaleString()}+ puffs`
                                                : `${product.puffCount || '20,000'}+ puffs`}
                                    </span>
                                </div>

                                {/* Rechargeable */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#5FB2A1] flex-shrink-0 shadow-sm">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">
                                        {product.isRechargeable ?? true ? 'Rechargeable' : 'Non-Rechargeable'}
                                    </span>
                                </div>

                                {/* Award / Best Seller */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FCAD62] flex-shrink-0 shadow-sm">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">Best Seller</span>
                                </div>
                            </div>
                        </div>

                        {/* Accordions */}
                        <div className="space-y-1 border-t border-black/10 mt-6 lg:mr-12">
                            <AccordionItem
                                title={
                                    <div className="flex items-center gap-2">
                                        {product.brandName?.toLowerCase().includes('pulse') && <Settings className="w-5 h-5 text-text-secondary" />}
                                        <span>About {product.brandName || "Brand"}</span>
                                    </div>
                                }
                            >
                                <p className="text-text-secondary leading-relaxed">
                                    {product.aboutText || product.description || `Experience the premium quality of ${product.brandName}. This product delivers exceptional performance.`}
                                </p>
                            </AccordionItem>

                            <AccordionItem title="Flavor">
                                {product.flavorText || (
                                    <div>
                                        <p className="mb-4">{product.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(product.flavorProfile) ? product.flavorProfile : []).map(p => (
                                                <span key={p} className="text-xs font-medium bg-black/5 text-text-secondary px-3 py-1 rounded-full">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </AccordionItem>

                            <AccordionItem title="Features">
                                {Array.isArray(product.features) && product.features.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {product.features.map((feature, i) => (
                                            <li key={i}>{feature}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-text-tertiary italic">No specific features listed.</p>
                                )}
                            </AccordionItem>
                        </div>
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
