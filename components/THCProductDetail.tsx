import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../src/context/StoreContext';
import { ChevronRight, Star, Truck, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface THCProductDetailProps {
    product: Product;
}

export const THCProductDetail: React.FC<THCProductDetailProps> = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState(product.image);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'loyalty'>('description');
    const [selectedFlavor, setSelectedFlavor] = useState<string>("");

    const allImages = [product.image, ...(product.images || [])];

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans">
            {/* Breadcrumb - Optional */}
            <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-text-tertiary flex items-center gap-2">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to="/catalog?category=thc-disposables" className="hover:text-gold transition-colors">THC Disposables</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-text-primary font-medium">{product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left: Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-[4/5] bg-[#fafafa] rounded-3xl overflow-hidden border border-black/5 relative flex items-center justify-center p-8">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-20 h-20 rounded-xl border-2 flex-shrink-0 overflow-hidden p-2 bg-[#fafafa] transition-all ${selectedImage === img ? 'border-[#3b0764]' : 'border-transparent hover:border-black/10'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-orange-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-sm text-text-tertiary">4 Reviews</span>
                        </div>

                        <h1 className="text-4xl font-bold text-text-primary mb-2 leading-tight">
                            {product.brandName} {product.name} | {product.count ? `(${product.count})` : ''} {product.strength}
                        </h1>

                        <div className="text-2xl font-bold text-text-primary mb-6 border-b border-black/5 pb-6">
                            ${product.price ? product.price.toFixed(2) : '0.00'}
                        </div>

                        {/* Bullets */}
                        <ul className="space-y-2 mb-8 text-text-secondary text-sm">
                            {product.strength && <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold/50" />{product.strength} Potency</li>}
                            {product.count && <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold/50" />{product.count} Count Jar/Pack</li>}
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold/50" />Designed to support relaxation and rest</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold/50" />Premium {product.brandName} Quality</li>
                        </ul>

                        {/* Flavor Selection Mockup */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-[#3b0764] uppercase tracking-wider mb-2">Select Option</label>
                            <select
                                className="w-full border border-black/20 rounded-lg px-4 py-3 text-sm focus:border-[#3b0764] outline-none bg-white font-medium"
                                value={selectedFlavor}
                                onChange={(e) => setSelectedFlavor(e.target.value)}
                            >
                                <option value="">Choose an option</option>
                                {/* Mock options or real if we had sub-variants */}
                                <option value="default">{product.name} - {product.strength}</option>
                            </select>
                        </div>

                        {/* Quantity & Cart (Visual only for now if requested to avoid functional cart, but UI shows it in reference) */}
                        {/* User asked to "avoid cart option and cart related opitons". 
                    However, the reference image has "Add to Cart". 
                    I will hide the functional Add to Cart and maybe replace with a "In Store Only" or just purely informational view as requested?
                    "For this section only you can make a new edit product section ... determine availability ... avoid cart option"
                    I will OMIT the Add to Cart button to strictly follow "avoid cart option".
                */}

                        {/* Extra Trust Badges */}
                        <div className="mt-auto pt-8 border-t border-black/5 space-y-4">
                            <p className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <span>{(product.brandName || '').toLowerCase().replace(/\s+/g, '-')}</span>
                                <span className="px-2 py-0.5 bg-black/5 text-[10px] rounded">Bolt</span>
                            </p>
                            <p className="text-xs font-bold flex items-center gap-2 text-green-600">
                                <Truck className="w-4 h-4" /> ORDER NOW! SHIPS TOMORROW <span className="text-text-tertiary underline font-normal cursor-pointer">terms apply</span>
                            </p>
                            <div className="text-xs text-text-tertiary space-y-1">
                                <p><span className="font-bold text-text-primary">Categories:</span> Delta 9 Gummies, Delta-9 THC Products, Hemp THC Edibles</p>
                                <p><span className="font-bold text-text-primary">Brand:</span> {product.brandName}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-16">
                    <div className="flex items-center gap-8 border-b border-black/10">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'description' ? 'border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-text-tertiary hover:text-text-primary'}`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'loyalty' ? 'border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-text-tertiary hover:text-text-primary'}`}
                        >
                            Loyalty Points
                        </button>
                    </div>
                    <div className="py-8 text-text-secondary leading-relaxed max-w-4xl">
                        {activeTab === 'description' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-text-primary">{product.name}</h3>
                                <p>{product.description}</p>
                                {product.aboutText && <p>{product.aboutText}</p>}
                                {product.features && (
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
