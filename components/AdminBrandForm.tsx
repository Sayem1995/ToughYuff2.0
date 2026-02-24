import React, { useState, useEffect } from 'react';
import { Brand, Category } from '../types';
import { X, Upload, Save, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../src/firebase';

interface AdminBrandFormProps {
    initialData?: Brand;
    categories?: Category[];
    onSave: (data: Omit<Brand, 'id'>) => Promise<void>;
    onCancel: () => void;
}

const AdminBrandForm: React.FC<AdminBrandFormProps> = ({ initialData, onSave, onCancel, categories = [] }) => {
    const [formData, setFormData] = useState<Partial<Brand>>({
        name: '',
        category: 'disposable-vapes',
        tagline: '',
        puffRange: '',
        description: '',
        image: ''
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (file: File) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large! Max 2MB.");
            return;
        }

        setUploading(true);
        setUploadSuccess(false);
        setUploadProgress(0);

        const storageRef = ref(storage, `brands/${Date.now()}_${file.name}`);
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
                getDownloadURL(task.snapshot.ref).then((downloadURL) => {
                    setFormData(prev => ({ ...prev, image: downloadURL }));
                    setUploadSuccess(true);
                    setUploading(false);
                });
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name) {
                alert("Brand Name is required");
                setLoading(false);
                return;
            }

            await onSave(formData as any);
            onCancel();
        } catch (error: any) {
            console.error("Error saving brand:", error);
            alert(`Failed to save brand: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-black/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-surface border-b border-black/10 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-text-primary">{initialData ? 'Edit Disposable Vape' : 'Add New Disposable Vape'}</h2>
                    <button onClick={onCancel} className="text-text-tertiary hover:text-text-primary p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-background border border-black/10 rounded px-3 py-2 text-text-primary focus:border-gold outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category || 'disposable-vapes'}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-background border border-black/10 rounded px-3 py-2 text-text-primary focus:border-gold outline-none text-sm"
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Tagline</label>
                        <input
                            type="text"
                            name="tagline"
                            value={formData.tagline}
                            onChange={handleChange}
                            className="w-full bg-background border border-black/10 rounded px-3 py-2 text-text-primary focus:border-gold outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Puff Range (e.g. 5000 Puffs)</label>
                        <input
                            type="text"
                            name="puffRange"
                            value={formData.puffRange}
                            onChange={handleChange}
                            className="w-full bg-background border border-black/10 rounded px-3 py-2 text-text-primary focus:border-gold outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-background border border-black/10 rounded px-3 py-2 text-text-primary focus:border-gold outline-none resize-none"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Logo/Image</label>
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 bg-black/5 rounded-lg border border-black/10 flex items-center justify-center overflow-hidden relative group">
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
                                        <Loader2 className="w-6 h-6 text-gold animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black/10 border border-black/10 rounded-lg text-sm text-text-primary transition-colors ${uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
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
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
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
                            className="px-6 py-2 bg-gold hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Disposable Vape
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBrandForm;
