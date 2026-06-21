import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="relative z-30 flex items-center justify-between px-6 md:px-10 py-4 border-t border-blue-100/50"
    >
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <Shield size={12} />
        <span>100% client-side. No uploads to any server.</span>
      </div>
      <div className="hidden md:flex items-center gap-4 text-slate-400 text-xs">
        <button className="hover:text-blue-600 transition-colors">Privacy</button>
        <button className="hover:text-blue-600 transition-colors">Terms</button>
      </div>
    </motion.footer>
  );
}
