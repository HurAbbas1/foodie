'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Sparkles, Smartphone, Eye } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-zinc-950 to-zinc-950">
      {/* Decorative blurred background circles */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-rose-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Full Brand Logo Banner (Clean transparent png logo overlay) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-10 select-none"
        >
          <div className="relative w-28 h-28 overflow-hidden flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
            <img 
              src="/logo-transparent.png" 
              alt="MenuVerse Logo Icon" 
              className="absolute left-0 top-0 h-full w-auto max-w-none object-cover"
              style={{
                // Soft, natural gold-tinted drop shadow with standard natural colors
                filter: 'brightness(1.05) drop-shadow(0 8px 16px rgba(197, 155, 39, 0.15))'
              }}
              onError={(e) => {
                e.currentTarget.src = "/logo-badge-transparent.png";
                e.currentTarget.style.position = "static";
                e.currentTarget.style.width = "100%";
              }}
            />
          </div>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Experience Your Food
          </span>
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.25)]">
            In Augmented Reality
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
        >
          Don't just read a description. Bring our curated gourmet menu straight to your table in full interactive 3D and WebAR. Scan, view, and decide with confidence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#menu"
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 font-bold px-8 py-4 rounded-2xl shadow-[0_4px_30px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Explore The Menu</span>
            <ArrowDown size={18} />
          </a>
          <a
            href="#ar-guide"
            className="w-full sm:w-auto bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <span>How WebAR Works</span>
          </a>
        </motion.div>

        {/* Mini Guide Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          id="ar-guide"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-zinc-900/80 text-left max-w-4xl mx-auto"
        >
          <div className="flex gap-4">
            <div className="bg-zinc-900/80 p-3 rounded-xl h-fit border border-zinc-800 text-amber-500">
              <Eye size={20} />
            </div>
            <div>
              <h4 className="text-zinc-200 font-bold text-sm mb-1">1. Choose a Dish</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">Browse the dishes and hit "View in 3D" to inspect allergens and details.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-zinc-900/80 p-3 rounded-xl h-fit border border-zinc-800 text-amber-500">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="text-zinc-200 font-bold text-sm mb-1">2. Scan or Tap AR</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">Scan the QR code on your laptop or tap the AR button directly from your mobile.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-zinc-900/80 p-3 rounded-xl h-fit border border-zinc-800 text-amber-500">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-zinc-200 font-bold text-sm mb-1">3. Placed on Table</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">Watch the gourmet creation render in scale directly on your physical dining table!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
