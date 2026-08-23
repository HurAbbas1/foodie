'use client';

import { motion } from 'framer-motion';
import { Eye, Flame, Info, Milk, ShieldAlert, Wheat } from 'lucide-react';
import Image from 'next/image';

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

interface FoodCardProps {
  dish: Dish;
  onViewDetails: (dish: Dish) => void;
}

export default function FoodCard({ dish, onViewDetails }: FoodCardProps) {
  // Helper to map allergen strings to icons
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-3xl overflow-hidden shadow-xl border border-zinc-800/80 flex flex-col justify-between group"
    >
      <div>
        {/* Thumbnail Preview Image */}
        <div className="relative aspect-[4/3] w-full bg-zinc-950 overflow-hidden">
          {dish.previewUrl ? (
            <Image
              src={dish.previewUrl}
              alt={dish.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 bg-gradient-to-br from-zinc-900 to-zinc-950">
              <span className="text-3xl font-black tracking-wider text-zinc-800 uppercase">MenuVerse</span>
              <span className="text-xs uppercase font-semibold tracking-wider text-zinc-600 mt-2">No Preview Available</span>
            </div>
          )}
          
          {/* Category Tag */}
          <span className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-amber-500 text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-full z-10 shadow-lg">
            {dish.category}
          </span>

          {/* Calories Tag */}
          {dish.calories && (
            <span className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-zinc-300 text-[10px] font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 shadow-lg">
              <Flame size={12} className="text-orange-500 fill-orange-500" />
              <span>{dish.calories} kcal</span>
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-2.5">
            <h3 className="text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-amber-500 transition-colors duration-200 line-clamp-1">
              {dish.name}
            </h3>
            <span className="text-lg font-extrabold text-amber-500 shrink-0">
              Rs. {dish.price.toFixed(2)}
            </span>
          </div>

          <p className="text-sm text-zinc-400 font-normal line-clamp-2 leading-relaxed mb-4">
            {dish.description}
          </p>

          {/* Allergen Indicators */}
          {dish.allergens.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {dish.allergens.map((allergen) => (
                <div
                  key={allergen.id}
                  className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-400 text-xs font-medium"
                >
                  {getAllergenIcon(allergen.name)}
                  <span>{allergen.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Button Action */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onViewDetails(dish)}
          className="w-full bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 text-sm font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        >
          <Eye size={16} />
          <span>View in 3D / AR</span>
        </button>
      </div>
    </motion.div>
  );
}
