import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreVertical, Edit, Trash } from 'lucide-react';
import { Category } from '../types';

interface SortableCategoryItemProps {
    category: Category;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isActive: boolean;
}

export const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({ category, onClick, onEdit, onDelete, isActive }) => {
    // Safety check
    if (!category || !category.id) return null;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-none mb-1">
            <div
                className={`w-full flex items-center justify-between rounded-lg text-sm transition-colors group relative ${isActive
                    ? 'bg-gold/10 text-gold border border-gold/20 font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
                    }`}
            >
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-2 cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-primary touch-none"
                    title="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {/* Clickable Area for Filtering */}
                <button
                    onClick={onClick}
                    className="flex-grow text-left py-2 flex items-center justify-between"
                >
                    <span>{category.name}</span>
                </button>

                {/* Status Indicator (Only if active) */}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold mr-2" />}

                {/* Actions */}
                <div className="flex items-center gap-1 pr-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-1.5 text-text-tertiary hover:text-gold hover:bg-gold/10 transition-colors rounded-md"
                        title="Edit Category (Add Image)"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors rounded-md"
                        title="Delete Category"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
