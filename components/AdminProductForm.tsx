import React, { useState, useEffect } from 'react';
import { Product, Brand } from '../types';

import { X, Upload, Save, Loader2 } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// Note: importing storage from '../src/firebase' might be key if we want to use the initialized instance
import { storage } from '../src/firebase';

interface AdminProductFormProps {
    initialData?: Product;
    brands: Brand[]; // Pass dynamic brands
    onSave: (data: Omit<Product, 'id'>) => Promise<void>;
    onCancel: () => void;
}

const FLAVOR_PROFILES = ['Fruity', 'Menthol', 'Dessert', 'Tobacco', 'Ice', 'Drink', 'Candy'];

const AdminProductForm: React.FC<AdminProductFormProps> = ({ initialData, brands, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        brandId: brands[0]?.id || '',
        brandName: brands[0]?.name || '',
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
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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
        const brand = brands.find(b => b.id === brandId);
        setFormData(prev => ({
            ...prev,
            brandId,
            brandName: brand?.name || '',
            name: '' // Reset name on brand change
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

    const [uploadTask, setUploadTask] = useState<any>(null); // Store task to cancel

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (uploadTask) uploadTask.cancel();
        };
    }, [uploadTask]);

    const handleCancelUpload = () => {
        if (uploadTask) {
            uploadTask.cancel();
            setUploading(false);
            setUploadProgress(0);
            setUploadTask(null);
            alert("Upload cancelled.");
        }
    };

    const handleImageUpload = (file: File) => {
        if (!file) return;

        // 1. File Size Check (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large! Please upload an image under 5MB.");
            return;
        }

        setUploading(true);
        setUploadSuccess(false);
        setUploadProgress(0);

        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(storageRef, file);
        setUploadTask(task);

        // Timeout Watchdog (15 seconds)
        const watchdog = setTimeout(() => {
            if (task.snapshot.bytesTransferred === 0) {
                console.error("Upload timeout - no bytes transferred");
                task.cancel();
                alert("Upload timed out. Check your connection or firewall.");
                setUploading(false);
            }
        }, 15000);

        task.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(Math.round(progress));
                if (progress > 0) clearTimeout(watchdog); // Clear timeout if we have movement
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                clearTimeout(watchdog);
                console.error("Upload failed details:", error);

                // Don't alert if cancelled by user
                if (error.code !== 'storage/canceled') {
                    alert(`Upload failed: ${error.message || 'Unknown error'}`);
                }
                setUploading(false);
                setUploadTask(null);
            },
            () => {
                clearTimeout(watchdog);
                getDownloadURL(task.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    setFormData(prev => ({ ...prev, image: downloadURL }));
                    setUploadSuccess(true);
                    setUploading(false);
                    setUploadTask(null);
                });
            }
        );
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

            // Compute dataToSave
            const dataToSave = { ...formData };

            // Sanitize data to remove undefined values which Firestore hates
            const sanitizedData = Object.fromEntries(
                Object.entries(dataToSave).filter(([_, v]) => v !== undefined)
            );

            await onSave(sanitizedData as any);
            onCancel();
        } catch (error: any) {
            console.error("Error saving product:", error);
            alert(`Failed to save product: ${error.message || 'Unknown error'}`);
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
                                    placeholder="e.g. Strawberry Ice"
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
                                    {brands.map(b => (
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
                            <h3 className="text-gold font-bold text-sm uppercase tracking-wider border-b border-white/5 pb-2">Pricing & Availability</h3>

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
                                    <label className="block text-sm text-text-secondary mb-1">Stock Status</label>
                                    <div className="flex items-center gap-3 h-full">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="inStock"
                                                checked={formData.inStock}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        inStock: checked,
                                                        stockQuantity: checked ? 100 : 0 // Auto-set background quantity
                                                    }));
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            <span className="ml-3 text-sm font-medium text-white">
                                                {formData.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
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
                            <div className="w-24 h-24 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative group">
                                {formData.image ? (
                                    <>
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setFormData(prev => ({ ...prev, image: '' })); setUploadSuccess(false); }}
                                            disabled={uploading}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity disabled:opacity-0"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-text-tertiary">No Image</span>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-2 z-20">
                                        <Loader2 className="w-6 h-6 text-gold animate-spin mb-2" />
                                        <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="bg-gold h-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-white mb-2">{uploadProgress}%</span>
                                        <button
                                            type="button"
                                            onClick={handleCancelUpload}
                                            className="text-[10px] text-red-400 hover:text-white underline"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors ${uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                                    <Upload className="w-4 h-4" />
                                    {uploading ? 'Uploading...' : formData.image ? 'Change Image' : 'Upload Image'}
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
                                {uploadSuccess && !uploading && <p className="text-xs text-green-400 mt-1 flex items-center gap-1">Image uploaded successfully!</p>}
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
            </div >
        </div >
    );
};

export default AdminProductForm;
