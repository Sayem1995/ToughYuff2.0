import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { X, Upload, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../src/firebase';

interface AdminCategoryFormProps {
    initialData?: Category;
    onSave: (data: Omit<Category, 'id'>) => Promise<void>;
    onCancel: () => void;
    allCategories?: Category[];
}

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({ initialData, onSave, onCancel, allCategories }) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Upload states
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setImage(initialData.image || '');
            setDescription(initialData.description || '');
        }
    }, [initialData]);

    const handleImageUpload = (file: File) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large! Max 2MB.");
            return;
        }

        setUploading(true);
        setUploadSuccess(false);
        setUploadProgress(0);

        const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
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
                    setImage(downloadURL);
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
            if (!name.trim()) {
                alert("Category Name is required");
                setLoading(false);
                return;
            }

            // Auto-generate slug
            const slug = name.toLowerCase()
                .replace(/&/g, 'and')
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '');

            const dataToSave = {
                name: name.trim(),
                slug,
                order: initialData ? initialData.order : (allCategories ? allCategories.length : 999),
                ...(image.trim() ? { image: image.trim() } : {}),
                ...(description.trim() ? { description: description.trim() } : {}),
            } as any;

            await onSave(dataToSave);
            onCancel();
        } catch (error: any) {
            console.error("Error saving category:", error);
            alert(`Failed to save category: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-black/10 rounded-xl w-full max-w-sm shadow-2xl">
                <div className="sticky top-0 bg-surface border-b border-black/10 p-4 flex justify-between items-center z-10 rounded-t-xl">
                    <h2 className="text-xl font-bold text-text-primary">{initialData ? 'Edit Category' : 'Add Category'}</h2>
                    <button onClick={onCancel} className="text-text-tertiary hover:text-text-primary p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Category Name */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Category Name <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Disposable Vapes"
                            className="w-full bg-background border border-black/10 rounded px-3 py-2 text-text-primary focus:border-gold outline-none"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Category Image <span className="text-text-tertiary text-xs">(optional)</span></label>
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 bg-black/5 rounded-lg border border-black/10 flex items-center justify-center overflow-hidden relative group">
                                {image ? (
                                    <>
                                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setImage(''); setUploadSuccess(false); }}
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
                                    {uploading ? 'Uploading...' : image ? 'Change Image' : 'Upload Image'}
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

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Description <span className="text-text-tertiary text-xs">(optional)</span></label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A short description of this category..."
                            rows={3}
                            className="w-full bg-background border border-black/10 rounded px-3 py-2 text-text-primary focus:border-gold outline-none resize-none text-sm"
                        />
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
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCategoryForm;
