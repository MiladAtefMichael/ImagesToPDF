import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-50 flex items-center justify-between px-6 md:px-10 h-18 py-4"
    >
      {/* MILO Converter Logo */}
      <div className="flex items-center gap-2">
        {/* MILO colored letters */}
        <span className="font-display text-2xl font-black tracking-tight leading-none">
          <span style={{ color: '#4285F4' }}>M</span>
          <span style={{ color: '#34A853' }}>I</span>
          <span style={{ color: '#EA4335' }}>L</span>
          <span style={{ color: '#FBBC05' }}>O</span>
        </span>
        {/* Divider dot */}
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-0.5" />
        {/* Converter text */}
        <span className="font-display text-base font-semibold tracking-tight text-slate-500">
          Converter
        </span>
      </div>

      {/* Right side is empty - removed source code button */}
    </motion.header>
  );
}
