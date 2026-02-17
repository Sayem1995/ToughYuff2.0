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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
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

            // We don't handle order here, it's handled by list position or defaults to end
            const dataToSave = {
                name: name.trim(),
                slug,
                // Order will be handled by the caller or backend defaults
                // For simplicity, we can pass 0 or current max + 1 if needed, 
                // but usually resizing the list updates the order.
                // Let's assume the caller handles order if it's a new item, or preserves it if editing.
                order: initialData ? initialData.order : 999
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

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Category Name</label>
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
