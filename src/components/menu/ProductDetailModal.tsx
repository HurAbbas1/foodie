'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Flame, Info, RotateCw, Sparkles, Camera } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ModelViewerRef } from '../3d/ModelViewer';
import { QRCodeSVG } from 'qrcode.react';

const ModelViewer = dynamic(() => import('../3d/ModelViewer'), {
  ssr: false,
});


interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Allergen {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  calories?: number | null;
  modelUrl?: string | null;
  usdzUrl?: string | null;
  previewUrl?: string | null;
  ingredients: Ingredient[];
  allergens: Allergen[];
}

interface ProductDetailModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ dish, isOpen, onClose }: ProductDetailModalProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [arUrl, setArUrl] = useState('');
  const [animationDone, setAnimationDone] = useState(false);
  const modelViewerRef = useRef<ModelViewerRef>(null);

  // Reset animationDone when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAnimationDone(false);
    }
  }, [isOpen]);


  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Construct mobile AR url on client side
  useEffect(() => {
    if (dish && typeof window !== 'undefined') {
      // Dynamic link based on current local origin to load the single-dish viewer page
      setArUrl(`${window.location.origin}/dish/${dish.id}`);
    }
  }, [dish]);

  if (!dish) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onAnimationComplete={() => setAnimationDone(true)}
            className="relative w-full max-w-6xl glass rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/80 z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] text-zinc-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2 rounded-full border border-zinc-800 transition-colors z-30"
            >
              <X size={20} />
            </button>

            {/* Left Side: 3D Model Viewer & Controls */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800/60 bg-zinc-950/20">
              <div className="flex-1 flex flex-col justify-center min-h-[300px] md:min-h-0 relative">
                {dish.modelUrl && animationDone ? (
                  <ModelViewer
                    ref={modelViewerRef}
                    src={dish.modelUrl}
                    iosSrc={dish.usdzUrl || undefined}
                    alt={dish.name}
                    autoRotate={autoRotate}
                    poster={dish.previewUrl || undefined}
                  />
                ) : dish.modelUrl ? (
                  <div className="w-full h-[300px] md:h-full relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950/60 flex items-center justify-center">
                    {dish.previewUrl && (
                      <img 
                        src={dish.previewUrl} 
                        alt={dish.name} 
                        className="w-full h-full object-cover absolute inset-0 opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                      <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider animate-pulse">
                        Plating 3D Dish...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[300px] md:h-full bg-zinc-900/40 rounded-2xl border border-zinc-850 flex flex-col items-center justify-center text-zinc-500">
                    <Info size={40} className="mb-2 text-zinc-600" />
                    <p className="text-sm font-medium">3D Model is not available for this dish.</p>
                  </div>
                )}
              </div>

              {/* 3D Model Control Toolbar */}
              {dish.modelUrl && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-2xl">
                  {/* Auto-rotate Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className="flex items-center gap-3 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer select-none"
                  >
                    <span>Auto Rotate</span>
                    <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-305 ${autoRotate ? 'bg-amber-500' : 'bg-zinc-800'}`}>
                      <div className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-305 ${autoRotate ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </button>

                  {/* Desktop QR Scan Area & Mobile Direct Button */}
                  {arUrl && (
                    <>
                      <div className="hidden lg:flex items-center gap-4 border-l border-zinc-800/80 pl-4">
                        <div className="bg-white p-1.5 rounded-xl shadow-inner border border-zinc-200">
                          <QRCodeSVG value={arUrl} size={64} level="M" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-widest text-amber-500">
                            <Smartphone size={10} />
                            <span>View in AR</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight max-w-[150px]">
                            Scan with your phone camera to place on your table.
                          </p>
                        </div>
                      </div>

                      <div className="lg:hidden flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => modelViewerRef.current?.activateAR()}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all text-xs border border-amber-400 cursor-pointer select-none"
                        >
                          <Camera size={14} className="animate-pulse" />
                          <span>See in your environment</span>
                        </button>

                        <Link
                          href={`/ar-marker/${dish.id}`}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-200 hover:text-white font-bold py-2.5 px-4 rounded-xl border border-zinc-800 transition-all text-xs cursor-pointer select-none text-center"
                        >
                          <span>MenuVerse Marker AR</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Dish Details & Advanced Ingredients Dashboard */}
            <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between max-h-[50vh] md:max-h-none">
              <div>
                {/* Header Information */}
                <div className="flex flex-wrap items-center gap-2.5 mb-4">
                  <span className="bg-amber-500/10 border border-amber-500/35 text-amber-500 text-[10px] uppercase tracking-widest font-black px-3.5 py-1.5 rounded-xl shadow-inner">
                    {dish.category}
                  </span>
                  {dish.calories && (
                    <span className="bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-[10px] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                      <Flame size={12} className="text-orange-500 fill-orange-500" />
                      <span>{dish.calories} Calories</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-zinc-900">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                    {dish.name}
                  </h2>
                  <div className="bg-amber-500/5 border border-amber-500/30 px-4 py-2 rounded-2xl shadow-inner">
                    <span className="text-2xl font-black text-amber-500 tracking-tight">${dish.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-400 font-normal leading-relaxed mb-8">
                  {dish.description}
                </p>

                {/* Allergens warning */}
                {dish.allergens.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 mb-3.5 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Allergen Profile</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dish.allergens.map((allergen) => (
                        <span
                          key={allergen.id}
                          className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                          <span>{allergen.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients Dashboard Capsules */}
                <div>
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
                    <Info size={14} className="text-amber-500" />
                    <span>Ingredients & Portion Profile</span>
                  </h3>
                  
                  {dish.ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {dish.ingredients.map((ing) => (
                        <div 
                          key={ing.id} 
                          className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-amber-500/35 transition-all group"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-zinc-200 capitalize group-hover:text-amber-400 transition-colors">
                              {ing.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                              Portion weight
                            </span>
                          </div>
                          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-1 rounded-xl text-xs font-black text-amber-500 shadow-inner">
                            {ing.quantity} {ing.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">Ingredient ratios not specified.</p>
                  )}
                </div>
              </div>

              {/* Close / Action Row */}
              <div className="mt-10 pt-5 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white py-2.5 px-6 rounded-xl hover:bg-zinc-800 transition-all font-bold text-xs select-none cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
