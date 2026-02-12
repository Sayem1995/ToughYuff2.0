import React, { useState } from 'react';
import { Product } from '../types';
import { X, Loader2 } from 'lucide-react';

interface RestockModalProps {
    product: Product;
    onConfirm: (id: string, quantity: number, cost: number) => Promise<void>;
    onClose: () => void;
}

const RestockModal: React.FC<RestockModalProps> = ({ product, onConfirm, onClose }) => {
    const [quantity, setQuantity] = useState<number>(0);
    const [cost, setCost] = useState<number>(product.costPerUnit || 0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity === 0) return;

        setLoading(true);
        try {
            await onConfirm(product.id, quantity, cost);
            onClose();
        } catch (error) {
            console.error("Restock failed", error);
            alert("Restock failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-white/10 rounded-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">Restock {product.name}</h3>
                    <button onClick={onClose} className="text-text-tertiary hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-sm text-text-secondary">Quantity to Add</label>
                            <span className="text-xs text-text-tertiary">Current: {product.stockQuantity}</span>
                        </div>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Cost Per Unit ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={cost}
                            onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                            className="w-full bg-background border border-white/10 rounded px-3 py-2 text-white focus:border-gold outline-none"
                        />
                        <p className="text-xs text-text-tertiary mt-1">Updates the cost for this batch and future tracking.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-text-secondary hover:text-white transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || quantity <= 0}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                            Confirm Restock
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestockModal;
