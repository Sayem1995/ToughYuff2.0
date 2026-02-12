import React, { useState, useEffect } from 'react';
import { Product, Brand } from '../types';
import { BRANDS } from '../constants';
import { X, Upload, Save, Loader2 } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Note: importing storage from '../src/firebase' might be key if we want to use the initialized instance
import { storage } from '../src/firebase';

interface AdminProductFormProps {
    initialData?: Product;
    onSave: (data: Omit<Product, 'id'>) => Promise<void>;
    onCancel: () => void;
}

const FLAVOR_PROFILES = ['Fruity', 'Menthol', 'Dessert', 'Tobacco', 'Ice', 'Drink', 'Candy'];

const AdminProductForm: React.FC<AdminProductFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        brandId: BRANDS[0]?.id || '',
        brandName: BRANDS[0]?.name || '',
        puffCount: 5000,
        nicotine: '5%',
        isNicotineFree: false,
        flavorProfile: [],
        description: '',
        stockQuantity: 0,
        lowStockThreshold: 10,
        price: 0,
        costPerUnit: 0,
        image: '',
        channel: 'both',
        inStock: false
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'stockQuantity' || name === 'lowStockThreshold' || name === 'price' || name === 'costPerUnit' || name === 'puffCount') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const brandId = e.target.value;
        const brand = BRANDS.find(b => b.id === brandId);
        setFormData(prev => ({
            ...prev,
            brandId,
            brandName: brand?.name || ''
        }));
    };

    const handleFlavorProfileChange = (profile: string) => {
        setFormData(prev => {
            const current = prev.flavorProfile || [];
            if (current.includes(profile)) {
                return { ...prev, flavorProfile: current.filter(p => p !== profile) };
            } else {
                return { ...prev, flavorProfile: [...current, profile] };
            }
        });
    };

    const handleImageUpload = async (file: File) => {
        if (!file) return;
        setUploading(true);
        try {
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.brandId) {
                alert("Name and Brand are required");
                setLoading(false);
                return;
            }

            // Compute inStock
            const dataToSave = {
                ...formData,
                inStock: (formData.stockQuantity || 0) > 0
            } as Omit<Product, 'id'>;

            await onSave(dataToSave);
            onCancel();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-surface border-b border-white/10 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onCancel} className="text-text-tertiary hover:text-white p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-gold font-bold text-sm uppercase tracking-wider border-b border-white/5 pb-2">Basic Info</h3>

                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Brand</label>
                                <select
                                    name="brandId"
                                    value={formData.brandId}
                                    onChange={handleBrandChange}
                                    className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                >
                                    {BRANDS.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Puff Count</label>
                                    <input
                                        type="number"
                                        name="puffCount"
                                        value={formData.puffCount}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Nicotine</label>
                                    <input
                                        type="text"
                                        name="nicotine"
                                        value={formData.nicotine}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isNicotineFree"
                                    checked={formData.isNicotineFree}
                                    onChange={handleChange}
                                    className="accent-gold w-4 h-4"
                                />
                                <label className="text-sm text-text-secondary">Nicotine Free</label>
                            </div>
                        </div>

                        {/* Inventory & Pricing */}
                        <div className="space-y-4">
                            <h3 className="text-gold font-bold text-sm uppercase tracking-wider border-b border-white/5 pb-2">Inventory & Pricing</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stockQuantity"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        name="lowStockThreshold"
                                        value={formData.lowStockThreshold}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Cost Per Unit ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="costPerUnit"
                                        value={formData.costPerUnit}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Sales Channel</label>
                                <select
                                    name="channel"
                                    value={formData.channel}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                                >
                                    <option value="store">In-Store Only</option>
                                    <option value="online">Online Only</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Flavor Profile */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Flavor Profile</label>
                        <div className="flex flex-wrap gap-2">
                            {FLAVOR_PROFILES.map(profile => (
                                <button
                                    key={profile}
                                    type="button"
                                    onClick={() => handleFlavorProfileChange(profile)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${formData.flavorProfile?.includes(profile)
                                        ? 'bg-gold text-black border-gold'
                                        : 'bg-transparent text-text-secondary border-white/10 hover:border-gold/50'
                                        }`}
                                >
                                    {profile}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none resize-none"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Product Image</label>
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-text-tertiary">No Image</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                                    <Upload className="w-4 h-4" />
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                                        }}
                                        disabled={uploading}
                                    />
                                </label>
                                <p className="text-xs text-text-tertiary mt-2">Recommended: Square JPG/PNG, max 2MB.</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 text-text-secondary hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="px-6 py-2 bg-gold hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Product
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminProductForm;
