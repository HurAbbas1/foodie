'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, Flame, Info, Milk, ShieldAlert, Sparkles, Wheat, Camera } from 'lucide-react';
import ModelViewer, { ModelViewerRef } from '../3d/ModelViewer';

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

interface DishMobileViewProps {
  dish: Dish;
}

export default function DishMobileView({ dish }: DishMobileViewProps) {
  const modelViewerRef = useRef<ModelViewerRef>(null);
  const getAllergenIcon = (allergenName: string) => {
    const name = allergenName.toLowerCase();
    if (name.includes('dairy') || name.includes('milk')) {
      return <Milk size={14} className="text-blue-400" />;
    }
    if (name.includes('gluten') || name.includes('wheat')) {
      return <Wheat size={14} className="text-amber-400" />;
    }
    if (name.includes('nut')) {
      return <ShieldAlert size={14} className="text-red-400" />;
    }
    return <Info size={14} className="text-zinc-400" />;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-10">
      {/* Top Mobile Bar */}
      <div className="glass fixed top-0 left-0 right-0 z-40 border-b border-zinc-900 px-4 py-3.5 flex items-center gap-3">
        <Link 
          href="/" 
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white p-2 rounded-xl"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-extrabold text-sm text-zinc-200 line-clamp-1">{dish.name}</h1>
          <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
            {dish.category}
          </span>
        </div>
      </div>

      {/* 3D Model Display Container (Height fixed at 50vh for perfect mobile spacing) */}
      <div className="w-full h-[50vh] pt-16 px-4 pb-2">
        {dish.modelUrl ? (
          <ModelViewer
            ref={modelViewerRef}
            src={dish.modelUrl}
            iosSrc={dish.usdzUrl || undefined}
            alt={dish.name}
            autoRotate={true}
          />
        ) : (
          <div className="w-full h-full bg-zinc-900/40 rounded-2xl border border-zinc-850 flex flex-col items-center justify-center text-zinc-500">
            <Info size={36} className="mb-2 text-zinc-600" />
            <p className="text-xs font-semibold">3D Model is not available.</p>
          </div>
        )}
      </div>

      {/* Details Slide-up Sheet Panel */}
      <div className="px-4 py-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full">
              {dish.category}
            </span>
            {dish.calories && (
              <span className="bg-zinc-900 border border-zinc-850 text-zinc-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Flame size={12} className="text-orange-500 fill-orange-500" />
                <span>{dish.calories} kcal</span>
              </span>
            )}
          </div>

          {/* Title & Price */}
          <div className="flex justify-between items-start gap-4 mb-4">
            <h2 className="text-2xl font-black text-zinc-100">{dish.name}</h2>
            <span className="text-xl font-extrabold text-amber-500 shrink-0">
              ${dish.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-400 font-normal leading-relaxed mb-6 pb-6 border-b border-zinc-900">
            {dish.description}
          </p>

          {/* AR Action Button */}
          {dish.modelUrl && (
            <button
              type="button"
              onClick={() => modelViewerRef.current?.activateAR()}
              className="w-full mb-6 flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-extrabold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all text-sm border border-amber-400 cursor-pointer select-none"
            >
              <Camera size={16} className="animate-pulse" />
              <span>See in your environment</span>
            </button>
          )}

          {/* Allergens Warning */}
          {dish.allergens.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500" />
                <span>Allergens Warning</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map((allergen) => (
                  <div
                    key={allergen.id}
                    className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-xl text-zinc-400 text-xs font-semibold"
                  >
                    {getAllergenIcon(allergen.name)}
                    <span>{allergen.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients Table */}
          <div>
            <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
              <Info size={12} className="text-amber-500" />
              <span>Ingredients Breakdown</span>
            </h3>
            
            {dish.ingredients.length > 0 ? (
              <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-900/40 border-b border-zinc-900">
                      <th className="py-2.5 px-4 font-bold text-zinc-400">Ingredient</th>
                      <th className="py-2.5 px-4 font-bold text-zinc-400 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {dish.ingredients.map((ing) => (
                      <tr key={ing.id}>
                        <td className="py-2.5 px-4 text-zinc-300 font-medium">{ing.name}</td>
                        <td className="py-2.5 px-4 text-zinc-500 text-right font-semibold">
                          {ing.quantity} {ing.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">Ingredient details not listed.</p>
            )}
          </div>
        </div>

        {/* Back Home CTA Link */}
        <div className="mt-8 border-t border-zinc-900 pt-6">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm"
          >
            <span>Back to Menu Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
