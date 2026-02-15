import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableBrandItemProps {
    id: string;
    name: string;
    isActive: boolean;
    onClick: () => void;
}

export const SortableBrandItem: React.FC<SortableBrandItemProps> = ({ id, name, isActive, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' as 'relative', // Explicitly cast to valid CSS position
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-none mb-1">
            <div
                className={`w-full flex items-center justify-between rounded-lg text-sm transition-colors group ${isActive
                    ? 'bg-gold/10 text-gold border border-gold/20 font-medium'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
            >
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-2 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 touch-none"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {/* Clickable Area for Filtering */}
                <button
                    onClick={onClick}
                    className="flex-grow text-left py-2 pr-4 flex items-center justify-between"
                >
                    <span>{name}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
                </button>
            </div>
        </div>
    );
};
