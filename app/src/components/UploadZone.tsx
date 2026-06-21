import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, ImagePlus, FileImage, Shield } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (files: FileList | null) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

export default function UploadZone({ onUpload, isDragging, setIsDragging }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget && !dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, [setIsDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onUpload(e.dataTransfer.files);
  }, [onUpload, setIsDragging]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpload(e.target.files);
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-8"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-blue-900 mb-3">
            Convert Images to <span className="text-gradient-blue">PDF</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">
            Drag and drop your images, reorder them, and create a beautiful PDF in seconds.
          </p>
        </motion.div>

        {/* Drop Zone */}
        <motion.div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          animate={{
            scale: isDragging ? 1.02 : 1,
          }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative w-full max-w-xl cursor-pointer"
        >
          <div
            className={`
              relative rounded-3xl border-2 border-dashed transition-all duration-300
              flex flex-col items-center justify-center gap-5 p-10 sm:p-14
              ${isDragging
                ? 'border-blue-400 bg-blue-50/80 shadow-[0_0_40px_rgba(59,130,246,0.15)]'
                : 'border-blue-200 bg-white/70 hover:bg-white/90 hover:border-blue-300 shadow-lg shadow-blue-100/50'
              }
            `}
          >
            {/* Animated icon */}
            <motion.div
              animate={{ y: isDragging ? -8 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
                ${isDragging
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-blue-50 border border-blue-100'
                }
              `}>
                {isDragging ? (
                  <ImagePlus size={32} className="text-white" />
                ) : (
                  <UploadCloud size={32} className="text-blue-500" />
                )}
              </div>
              {/* Ripple */}
              {!isDragging && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-2xl border-2 border-blue-300"
                />
              )}
            </motion.div>

            {/* Text */}
            <div className="text-center space-y-2">
              <h3 className={`font-display text-xl font-semibold transition-colors ${isDragging ? 'text-blue-600' : 'text-blue-900'}`}>
                {isDragging ? 'Release to Upload' : 'Drop your images here'}
              </h3>
              <p className="text-slate-400 text-sm">
                or <span className="text-blue-500 font-medium underline underline-offset-2 decoration-blue-200">click to browse</span> your files
              </p>
            </div>

            {/* Format badges */}
            <div className="flex items-center gap-2">
              {['JPG', 'PNG', 'WEBP', 'GIF'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-3 py-1 rounded-lg bg-blue-50 text-blue-500 text-xs font-medium border border-blue-100"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-6 mt-8"
        >
          {[
            { icon: FileImage, label: 'Multiple Images' },
            { icon: UploadCloud, label: 'Drag & Drop' },
            { icon: Shield, label: '100% Secure' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-slate-400">
              <Icon size={14} className="text-blue-400" />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
