import React, { useState, useEffect } from 'react';
import { Product, Brand } from '../types';
import { X, Upload, Loader2, Trash2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../src/firebase';

interface AdminEdiblesProductFormProps {
    initialData?: Product;
    brands: Brand[];
    onSave: (data: Omit<Product, 'id'>) => Promise<void>;
    onCancel: () => void;
}

const AdminEdiblesProductForm: React.FC<AdminEdiblesProductFormProps> = ({ initialData, brands, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        brandId: brands[0]?.id || '',
        brandName: brands[0]?.name || '',
        description: '',
        stockQuantity: 0,
        lowStockThreshold: 10,
        price: 0,
        costPerUnit: 0,
        image: '',
        images: [],
        channel: 'both',
        inStock: false,
        category: 'edibles',
        strength: '',
        count: '',
        flavorText: '',
        aboutText: '',
        features: []
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                category: 'edibles'
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (['stockQuantity', 'lowStockThreshold', 'price', 'costPerUnit'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const brandId = e.target.value;
        const brand = brands.find(b => b.id === brandId);
        setFormData(prev => ({
            ...prev,
            brandId,
            brandName: brand?.name || '',
            category: 'edibles'
        }));
    };

    const handleImageUpload = (file: File, isGallery: boolean = false) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large! Max 5MB.");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const storageRef = ref(storage, `products/${isGallery ? 'gallery/' : ''}${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(storageRef, file);

        task.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(Math.round(progress));
            },
            (error) => {
                console.error("Upload failed:", error);
                alert("Upload failed.");
                setUploading(false);
            },
            () => {
                getDownloadURL(task.snapshot.ref).then((url) => {
                    if (isGallery) {
                        setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
                    } else {
                        setFormData(prev => ({ ...prev, image: url }));
                    }
                    setUploading(false);
                });
            }
        );
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name || !formData.brandId) {
                alert("Name and Brand are required");
                setLoading(false);
                return;
            }

            const dataToSave = { ...formData, category: 'edibles' };

            const sanitizedData = Object.fromEntries(
                Object.entries(dataToSave).filter(([_, v]) => v !== undefined)
            );

            await onSave(sanitizedData as any);
            onCancel();
        } catch (error: any) {
            console.error("Error saving product:", error);
            alert(`Failed to save product: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-black/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-surface border-b border-black/10 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-text-primary">
                        {initialData ? 'Edit Edible Product' : 'Add New Edible Product'}
                    </h2>
                    <button onClick={onCancel} className="text-text-tertiary hover:text-text-primary p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Details */}
                        <div className="space-y-6">
                            <h3 className="text-[#2d1b69] font-bold text-sm uppercase tracking-wider border-b border-black/5 pb-2">
                                Product Details
                            </h3>

                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Brand</label>
                                <select
                                    name="brandId"
                                    value={formData.brandId}
                                    onChange={handleBrandChange}
                                    className="w-full bg-background border border-black/10 rounded-lg px-3 py-3 text-text-primary focus:border-[#2d1b69] outline-none"
                                >
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Night-Night Wellness Gummies"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-black/10 rounded-lg px-3 py-3 text-text-primary focus:border-[#2d1b69] outline-none font-medium"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Strength / mg</label>
                                    <input
                                        type="text"
                                        name="strength"
                                        placeholder="e.g. 1860mg"
                                        value={formData.strength || ''}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-black/10 rounded-lg px-3 py-3 text-text-primary focus:border-[#2d1b69] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Count</label>
                                    <input
                                        type="text"
                                        name="count"
                                        placeholder="e.g. 30ct"
                                        value={formData.count || ''}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-black/10 rounded-lg px-3 py-3 text-text-primary focus:border-[#2d1b69] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-background border border-black/10 rounded-lg px-3 py-3 text-text-primary focus:border-[#2d1b69] outline-none resize-none"
                                    placeholder="Product description..."
                                />
                            </div>

                            {/* Key Features / Bullet Points */}
                            <div>
                                <label className="block text-sm text-text-secondary mb-2">Key Features (Bullet Points)</label>
                                <div className="space-y-2 mb-2">
                                    {(formData.features || []).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-black/5 rounded-lg px-3 py-2">
                                            <span className="flex-1 text-sm">{f}</span>
                                            <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        placeholder="e.g. 62mg Per Gummy"
                                        className="flex-1 bg-background border border-black/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:border-[#2d1b69] outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="px-4 py-2 bg-[#2d1b69] text-white rounded-lg text-xs font-bold"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Images & Inventory */}
                        <div className="space-y-6">
                            <h3 className="text-[#2d1b69] font-bold text-sm uppercase tracking-wider border-b border-black/5 pb-2">
                                Images & Inventory
                            </h3>

                            {/* Main Image */}
                            <div>
                                <label className="block text-sm text-text-secondary mb-2">Main Image</label>
                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-24 bg-black/5 rounded-lg border border-black/10 flex items-center justify-center overflow-hidden relative group">
                                        {formData.image ? (
                                            <>
                                                <img src={formData.image} alt="Main" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-xs text-text-tertiary">Main</span>
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-white border border-black/10 hover:bg-black/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Upload Main
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], false)}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Gallery - Multiple Flavor Images */}
                            <div>
                                <label className="block text-sm text-text-secondary mb-2">
                                    Flavor Gallery ({formData.images?.length || 0}) — Upload different flavor images
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(formData.images || []).map((img, idx) => (
                                        <div key={idx} className="aspect-square bg-black/5 rounded-lg border border-black/10 overflow-hidden relative group">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = [...(formData.images || [])];
                                                    newImages.splice(idx, 1);
                                                    setFormData(prev => ({ ...prev, images: newImages }));
                                                }}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square bg-black/5 hover:bg-black/10 border border-dashed border-black/20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors">
                                        <Upload className="w-5 h-5 text-text-tertiary" />
                                        <span className="text-[10px] text-text-tertiary mt-1">Add</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                {uploading && <div className="mt-2 text-xs text-[#2d1b69]">Uploading... {uploadProgress}%</div>}
                            </div>

                            {/* Price & Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-black/10 rounded-lg px-3 py-3 text-text-primary focus:border-[#2d1b69] outline-none font-bold"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.inStock ? 'bg-green-500' : 'bg-gray-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.inStock ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="inStock"
                                            checked={formData.inStock}
                                            onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked, stockQuantity: e.target.checked ? 100 : 0 }))}
                                            className="hidden"
                                        />
                                        <span className="text-sm font-medium">{formData.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-black/5 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 text-text-secondary hover:text-text-primary transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="px-8 py-2 bg-[#2d1b69] hover:bg-[#3d2b79] text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Edible Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEdiblesProductForm;
