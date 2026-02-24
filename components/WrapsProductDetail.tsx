import React, { useState } from 'react';
import { Product } from '../types';
import { Star, ChevronLeft, ChevronRight, Truck, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WrapsProductDetailProps {
    product: Product;
}

export const WrapsProductDetail: React.FC<WrapsProductDetailProps> = ({ product }) => {
    // All images: main image + gallery
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'shipping'>('description');
    const [selectedFlavor, setSelectedFlavor] = useState('');

    const selectedImage = allImages[selectedImageIdx] || product.image;

    const goToPrev = () => setSelectedImageIdx(i => (i > 0 ? i - 1 : allImages.length - 1));
    const goToNext = () => setSelectedImageIdx(i => (i < allImages.length - 1 ? i + 1 : 0));

    // Title
    const specs = [
        product.count ? `${product.count}` : '',
        product.strength || ''
    ].filter(Boolean).join(' | ');

    const fullTitle = `${product.brandName || ''} ${product.name || ''}`;

    // Bullet points
    const bullets = product.features && product.features.length > 0
        ? product.features
        : [
            product.count ? `${product.count} per pack` : 'Premium quality wrap',
            'Freshness guaranteed seal',
            'Slow burning and consistent',
            `Authentic ${product.brandName || 'Brand'} experience`
        ].filter(Boolean) as string[];

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-text-secondary flex items-center gap-2">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <span>›</span>
                <Link to="/catalog?category=wraps-and-blunts" className="hover:text-gold transition-colors">Wraps & Blunts</Link>
                <span>›</span>
                <span className="text-text-primary font-medium">{product.brandName} {product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-black/5 flex items-center justify-center p-8 shadow-sm">
                            <img
                                src={selectedImage}
                                alt={product.name || 'Product Image'}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                            />
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={goToPrev}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm border border-black/10 hover:border-gold/50 rounded-full flex items-center justify-center shadow-md transition-colors text-text-secondary"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={goToNext}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm border border-black/10 hover:border-gold/50 rounded-full flex items-center justify-center shadow-md transition-colors text-text-secondary"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIdx(idx)}
                                        className={`w-20 h-20 rounded-lg border-2 flex-shrink-0 overflow-hidden p-1 bg-white transition-all ${selectedImageIdx === idx ? 'border-gold' : 'border-black/5 hover:border-gold/30'
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
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-gold uppercase tracking-[0.2em]">
                                {product.brandName}
                            </span>
                            {!product.inStock && (
                                <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 uppercase">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl font-bold text-text-primary mb-2 leading-tight">
                            {product.name}
                        </h1>

                        {specs && (
                            <div className="text-sm font-medium text-text-tertiary mb-6 uppercase tracking-wider">
                                {specs}
                            </div>
                        )}

                        <div className="text-3xl font-bold text-text-primary mb-8 flex items-baseline gap-2">
                            <span>${product.price ? product.price.toFixed(2) : '0.00'}</span>
                            {product.count && <span className="text-sm text-text-tertiary font-normal">/ {product.count}</span>}
                        </div>

                        <div className="space-y-6 mb-8">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Highlights</h3>
                                <ul className="grid grid-cols-1 gap-3">
                                    {bullets.map((b, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-text-secondary bg-black/5 p-3 rounded-lg border border-black/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                                    Select Options
                                </label>
                                <select
                                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none bg-surface font-medium text-text-primary shadow-sm"
                                    value={selectedFlavor}
                                    onChange={(e) => setSelectedFlavor(e.target.value)}
                                >
                                    <option value="">Choose a flavor/type</option>
                                    <option value="single">Single Pack</option>
                                    {product.count && <option value="box">Full Box ({product.count})</option>}
                                </select>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-black/10 rounded-xl overflow-hidden bg-surface shadow-sm h-14">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-14 flex items-center justify-center hover:bg-black/5 transition-colors text-text-primary"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <div className="w-14 flex items-center justify-center font-bold text-lg border-x border-black/10 text-text-primary bg-background/50">
                                        {quantity}
                                    </div>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-14 flex items-center justify-center hover:bg-black/5 transition-colors text-text-primary"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <button className="flex-1 bg-text-primary hover:bg-black/90 text-background font-bold h-14 rounded-xl uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-black/20 flex items-center justify-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-black/5">
                            <div className="flex items-center gap-4 text-xs text-text-tertiary">
                                <div className="flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-green-500" />
                                    <span>Fast Store Pickup</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-black/10" />
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4 text-gold" />
                                    <span>Authentic Product</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Tabs */}
                <div className="mt-16 bg-surface border border-black/5 rounded-2xl overflow-hidden">
                    <div className="flex border-b border-black/5">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'description'
                                ? 'text-gold border-b-2 border-gold -mb-px bg-background/50'
                                : 'text-text-tertiary hover:text-text-primary'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('shipping')}
                            className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'shipping'
                                ? 'text-gold border-b-2 border-gold -mb-px bg-background/50'
                                : 'text-text-tertiary hover:text-text-primary'
                                }`}
                        >
                            Shipping & Pickup
                        </button>
                    </div>
                    <div className="p-8 text-text-secondary leading-relaxed max-w-4xl">
                        {activeTab === 'description' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-text-primary">Product Details</h3>
                                <p className="text-lg">{product.description || `High quality ${product.brandName} wraps.`}</p>
                                {product.aboutText && <p>{product.aboutText}</p>}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">Features</h4>
                                        <ul className="space-y-2">
                                            {bullets.map((f, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <span className="text-gold font-bold mt-0.5">•</span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-black/5 rounded-xl p-6 border border-black/5">
                                        <h4 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">Specifications</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-text-tertiary">Brand</dt>
                                                <dd className="font-medium text-text-primary">{product.brandName}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-text-tertiary">Category</dt>
                                                <dd className="font-medium text-text-primary">Wraps & Blunts</dd>
                                            </div>
                                            {product.count && (
                                                <div className="flex justify-between">
                                                    <dt className="text-text-tertiary">Unit Count</dt>
                                                    <dd className="font-medium text-text-primary">{product.count}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'shipping' && (
                            <div className="space-y-4">
                                <p>Standard shipping and local pickup options are available for this product.</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Order online and pickup in-store within 1 hour.</li>
                                    <li>Same-day processing for all shipping orders.</li>
                                    <li>Safe and discreet packaging.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal CheckCircle to avoid import issues if not found in Lucide
const CheckCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
