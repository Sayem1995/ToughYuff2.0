import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { X, Loader2 } from 'lucide-react';

interface AdminCategoryFormProps {
    initialData?: Category;
    onSave: (data: Omit<Category, 'id'>) => Promise<void>;
    onCancel: () => void;
}

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({ initialData, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setImage(initialData.image || '');
            setDescription(initialData.description || '');
        }
    }, [initialData]);

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
                order: initialData ? initialData.order : 999,
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

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Image URL <span className="text-text-tertiary text-xs">(optional)</span></label>
                        <input
                            type="url"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-background border border-black/10 rounded px-3 py-2 text-text-primary focus:border-gold outline-none"
                        />
                        {image && (
                            <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-black/10 bg-black/5">
                                <img src={image} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                        )}
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
                            disabled={loading}
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
