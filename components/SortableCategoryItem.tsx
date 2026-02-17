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
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
            >
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-2 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 touch-none"
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

                {/* Context Menu Trigger */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-2 text-text-tertiary hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onEdit();
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 flex items-center gap-2"
                            >
                                <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onDelete();
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                            >
                                <Trash className="w-3 h-3" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
