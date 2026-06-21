import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, FileImage, ArrowUpDown, GripVertical } from 'lucide-react';
import type { QueuedImage } from '../hooks/usePDFGenerator';

interface ImageQueueProps {
  images: QueuedImage[];
  onRemove: (id: string) => void;
  onReorder: (newOrder: QueuedImage[]) => void;
  onCreatePDF: () => void;
  onClearAll: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ImageQueue({
  images,
  onRemove,
  onReorder,
  onCreatePDF,
  onClearAll,
}: ImageQueueProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const dragItemIndex = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    try {
      console.log('Drag start:', index);
      dragItemIndex.current = index;
      setIsDraggingItem(true);
      e.dataTransfer.effectAllowed = 'move';
      // Transparent drag ghost
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(img, 0, 0);
    } catch (err) {
      console.error('Drag start error:', err);
      dragItemIndex.current = null;
      setIsDraggingItem(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    try {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      console.log('Drag over:', index, 'from:', dragItemIndex.current);
      if (dragItemIndex.current !== null && dragItemIndex.current !== index) {
        setDragOverIndex(index);
      }
    } catch (err) {
      console.error('Drag over error:', err);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    try {
      // Only clear if truly leaving the item, not entering a child
      const target = e.currentTarget as HTMLElement;
      if (target && !target.contains(e.relatedTarget as Node)) {
        console.log('Drag leave');
        setDragOverIndex(null);
      }
    } catch (err) {
      console.error('Drag leave error:', err);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      
      const fromIndex = dragItemIndex.current;
      console.log('Drop: from', fromIndex, 'to', dropIndex, 'total images:', images.length);
      
      dragItemIndex.current = null;
      setDragOverIndex(null);
      setIsDraggingItem(false);
      
      // Only reorder if valid source and different from drop target
      if (fromIndex !== null && fromIndex !== dropIndex) {
        console.log('Performing reorder');
        const newImages = [...images];
        const [moved] = newImages.splice(fromIndex, 1);
        newImages.splice(dropIndex, 0, moved);
        console.log('New order:', newImages.map((img, idx) => `${idx}: ${img.id}`));
        onReorder(newImages);
      } else {
        console.log('Skipping reorder:', { fromIndex, dropIndex });
      }
    } catch (error) {
      console.error('Drop error:', error);
      dragItemIndex.current = null;
      setDragOverIndex(null);
      setIsDraggingItem(false);
    }
  }, [images, onReorder]);

  const handleDragEnd = useCallback(() => {
    dragItemIndex.current = null;
    setDragOverIndex(null);
    setIsDraggingItem(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col px-4 sm:px-8 py-6 overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <FileImage size={18} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-blue-900">
              {images.length} {images.length === 1 ? 'Image' : 'Images'}
            </h2>
            <p className="text-slate-400 text-xs flex items-center gap-1">
              <GripVertical size={10} />
              Drag to reorder or use arrows
            </p>
          </div>
        </div>

        <button
          onClick={onClearAll}
          className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400
                     hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          Clear All
        </button>
      </motion.div>

      {/* Image Grid */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-1 pb-4"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              total={images.length}
              isDragOver={dragOverIndex === index}
              onRemove={onRemove}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              animate={!isDraggingItem}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-4 flex justify-center"
      >
        <div className="bg-white rounded-2xl p-2 shadow-lg shadow-blue-100/50 border border-blue-100
                        flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 text-slate-400 text-xs">
            <ArrowUpDown size={12} className="text-blue-400" />
            <span className="font-medium">{images.length} pages</span>
          </div>
          <div className="w-px h-6 bg-blue-100" />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCreatePDF}
            className="btn-primary flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Create PDF
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Extracted card component to keep render logic clean
interface ImageCardProps {
  image: QueuedImage;
  index: number;
  total: number;
  isDragOver: boolean;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  animate: boolean;
}

function ImageCard({
  image, index, isDragOver,
  onRemove,
  onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
  animate,
}: ImageCardProps) {
  const cardClass = `
    group relative aspect-square rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing
    bg-white border transition-all duration-200
    ${isDragOver
      ? 'border-blue-400 shadow-lg shadow-blue-200 scale-105'
      : 'border-blue-100/80 shadow-sm shadow-blue-50 hover:border-blue-200 hover:shadow-md'
    }
  `;

  const inner = (
    <div
      className={cardClass}
      draggable
      onDragStart={(e) => {
        try {
          onDragStart(e, index);
        } catch (err) {
          console.error('Error in dragStart:', err);
        }
      }}
      onDragOver={(e) => {
        try {
          onDragOver(e, index);
        } catch (err) {
          console.error('Error in dragOver:', err);
        }
      }}
      onDragLeave={(e) => {
        try {
          onDragLeave(e);
        } catch (err) {
          console.error('Error in dragLeave:', err);
        }
      }}
      onDrop={(e) => {
        try {
          onDrop(e, index);
        } catch (err) {
          console.error('Error in drop:', err);
        }
      }}
      onDragEnd={(_e) => {
        try {
          onDragEnd();
        } catch (err) {
          console.error('Error in dragEnd:', err);
        }
      }}
    >
      {/* Image */}
      <img
        src={image.preview}
        alt={image.name}
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      flex flex-col justify-between p-2.5">
        {/* Top: Remove + Page number */}
        <div className="flex items-start justify-between">
          <span className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-sm
                           flex items-center justify-center text-white text-[10px] font-bold">
            {index + 1}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
            className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-red-500
                       flex items-center justify-center transition-colors"
          >
            <Trash2 size={13} className="text-white" />
          </button>
        </div>

        {/* Bottom: File info + Move icon */}
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <div className="w-7 h-7 rounded-lg bg-blue-500/60 backdrop-blur-sm
                            flex items-center justify-center cursor-grab">
              <GripVertical size={13} className="text-white" />
            </div>
          </div>
          <p className="text-white/80 text-[10px] truncate text-center">{image.name}</p>
          <p className="text-white/40 text-[9px] text-center">{formatFileSize(image.size)}</p>
        </div>
      </div>

      {/* Page number badge (always visible) */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-blue-500/80 backdrop-blur-sm
                      flex items-center justify-center shadow-sm group-hover:opacity-0 transition-opacity">
        <span className="text-white text-[10px] font-bold">{index + 1}</span>
      </div>
    </div>
  );

  if (!animate) {
    return (
      <div key={image.id}>
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      key={image.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {inner}
    </motion.div>
  );
}
