import { motion } from 'framer-motion';
import { Loader2, FileText } from 'lucide-react';

interface ProcessingProps {
  progress: number;
  totalImages: number;
}

export default function Processing({ progress, totalImages }: ProcessingProps) {
  const currentImage = Math.min(
    Math.ceil((progress / 100) * totalImages),
    totalImages
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl p-10 sm:p-14 flex flex-col items-center gap-8 
                   max-w-sm w-full shadow-xl shadow-blue-100/50 border border-blue-100"
      >
        {/* Animated icon */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 
                       border border-blue-200 flex items-center justify-center"
          >
            <Loader2 size={32} className="text-blue-500" />
          </motion.div>
          {/* Glow */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border-2 border-blue-300"
          />
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="font-display text-xl font-semibold text-blue-900">
            Compiling your PDF
          </h3>
          <p className="text-slate-400 text-sm">
            Processing image {currentImage} of {totalImages}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-blue-600 font-semibold">{Math.round(progress)}%</span>
            <span className="text-slate-400 flex items-center gap-1">
              <FileText size={10} />
              PDF
            </span>
          </div>
          <div className="w-full h-2.5 bg-blue-50 rounded-full overflow-hidden border border-blue-100">
            <motion.div
              className="h-full rounded-full relative"
              style={{
                background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 100%)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Glow tip */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-400 blur-sm"
                style={{ opacity: progress > 0 ? 1 : 0 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom progress line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 h-1 bg-blue-50"
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}
