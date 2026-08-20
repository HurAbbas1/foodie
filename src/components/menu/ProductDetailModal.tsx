'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Flame, Info, RotateCw, Sparkles, Camera } from 'lucide-react';
import ModelViewer, { ModelViewerRef } from '../3d/ModelViewer';
import { QRCodeSVG } from 'qrcode.react';

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
  const modelViewerRef = useRef<ModelViewerRef>(null);

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
                {dish.modelUrl ? (
                  <ModelViewer
                    ref={modelViewerRef}
                    src={dish.modelUrl}
                    iosSrc={dish.usdzUrl || undefined}
                    alt={dish.name}
                    autoRotate={autoRotate}
                  />
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

                      <button
                        type="button"
                        onClick={() => modelViewerRef.current?.activateAR()}
                        className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all text-xs border border-amber-400 cursor-pointer select-none"
                      >
                        <Camera size={14} className="animate-pulse" />
                        <span>See in your environment</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Dish Details & Ingredients Table */}
            <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
              <div>
                {/* Header Information */}
                <div className="flex flex-wrap items-center gap-3 mb-2.5">
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full">
                    {dish.category}
                  </span>
                  {dish.calories && (
                    <span className="bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Flame size={12} className="text-orange-500 fill-orange-500" />
                      <span>{dish.calories} Calories</span>
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-start gap-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                    {dish.name}
                  </h2>
                  <span className="text-2xl font-black text-amber-500">${dish.price.toFixed(2)}</span>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed mb-6 border-b border-zinc-900 pb-5">
                  {dish.description}
                </p>

                {/* Allergens Checklist */}
                {dish.allergens.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Allergens Warning</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dish.allergens.map((allergen) => (
                        <span
                          key={allergen.id}
                          className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-xl"
                        >
                          {allergen.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients Breakdown Table */}
                <div>
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Info size={14} className="text-amber-500" />
                    <span>Ingredients & Nutrition</span>
                  </h3>
                  
                  {dish.ingredients.length > 0 ? (
                    <div className="border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-900/60 border-b border-zinc-800/80">
                            <th className="py-3 px-4 font-bold text-zinc-300">Ingredient</th>
                            <th className="py-3 px-4 font-bold text-zinc-300 text-right">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40">
                          {dish.ingredients.map((ing) => (
                            <tr key={ing.id} className="hover:bg-zinc-900/20 transition-colors">
                              <td className="py-3 px-4 font-medium text-zinc-200">{ing.name}</td>
                              <td className="py-3 px-4 text-zinc-400 text-right font-semibold">
                                {ing.quantity} {ing.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">Ingredient ratios not specified.</p>
                  )}
                </div>
              </div>

              {/* Close / Action Row */}
              <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white py-2.5 px-6 rounded-xl hover:bg-zinc-800 transition-all font-semibold text-xs"
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
