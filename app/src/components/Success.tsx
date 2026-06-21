import { motion } from 'framer-motion';
import { Download, CheckCircle2, FileText, RotateCcw } from 'lucide-react';

interface SuccessProps {
  onDownload: () => void;
  onConvertAnother: () => void;
  imageCount: number;
}

export default function Success({ onDownload, onConvertAnother, imageCount }: SuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col items-center justify-center px-6"
    >
      {/* Confetti */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: '50vw', y: '-10vh', rotate: 0, opacity: 1 }}
            animate={{
              x: `${20 + Math.random() * 60}vw`,
              y: '110vh',
              rotate: Math.random() * 720,
              opacity: 0,
            }}
            transition={{
              duration: Math.random() * 2.5 + 2,
              delay: Math.random() * 0.4,
              ease: 'easeIn',
            }}
            className="absolute w-2.5 h-2.5 rounded-sm"
            style={{
              backgroundColor: ['#3B82F6', '#10B981', '#34D399', '#60A5FA', '#2563EB'][
                Math.floor(Math.random() * 5)
              ],
            }}
          />
        ))}
      </div>

      {/* Success card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-white rounded-3xl p-10 sm:p-14 flex flex-col items-center gap-8 
                   max-w-sm w-full shadow-xl shadow-blue-100/50 border border-blue-100"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 
                          border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
        </motion.div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="font-display text-2xl font-semibold text-blue-900"
          >
            PDF Ready!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-slate-400 text-sm"
          >
            {imageCount} {imageCount === 1 ? 'image' : 'images'} compiled successfully
          </motion.p>
        </div>

        {/* PDF Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 
                     border border-red-100 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <FileText size={24} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-700 text-sm font-medium truncate">converted-document.pdf</p>
            <p className="text-slate-400 text-xs">PDF Document</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
        </motion.div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDownload}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download size={18} />
            <span>Download PDF</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConvertAnother}
            className="w-full flex items-center justify-center gap-2 px-6 py-3
                       text-slate-400 hover:text-blue-600 rounded-xl font-medium text-sm
                       hover:bg-blue-50 transition-all duration-300"
          >
            <RotateCcw size={16} />
            <span>Convert Another</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
