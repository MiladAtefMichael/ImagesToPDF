import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Replace these values with your actual Google AdSense publisher ID and ad slot ID
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; // e.g. ca-pub-1234567890123456
const ADSENSE_SLOT = 'XXXXXXXXXX';               // e.g. 1234567890

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only inject the AdSense script once
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Push the ad after a short delay to allow script to initialise
    const timer = setTimeout(() => {
      if (!initialized.current && adRef.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        } catch (e) {
          console.warn('AdSense push failed:', e);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-30 mx-4 md:mx-8 mb-4"
    >
      <div className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 p-[2px] shadow-lg shadow-blue-500/20">
        <div className="bg-white rounded-[14px] px-4 sm:px-6 py-3 flex flex-col items-center justify-center min-h-[90px]">
          {/* Google AdSense ad unit */}
          <div ref={adRef} className="w-full flex items-center justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minHeight: '60px' }}
              data-ad-client={ADSENSE_CLIENT}
              data-ad-slot={ADSENSE_SLOT}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
