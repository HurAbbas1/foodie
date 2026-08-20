'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, Filter } from 'lucide-react';
import FoodCard from './FoodCard';
import ProductDetailModal from './ProductDetailModal';

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

const CATEGORIES = ['All', 'Appetizers', 'Mains', 'Desserts', 'Beverages'];

export default function MenuGrid() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Search
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal selection
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all dishes from database API
  useEffect(() => {
    async function loadDishes() {
      try {
        setLoading(true);
        const res = await fetch('/api/dishes');
        if (!res.ok) throw new Error('Failed to retrieve dishes');
        const data = await res.ok ? await res.json() : [];
        setDishes(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unable to connect to service');
      } finally {
        setLoading(false);
      }
    }
    loadDishes();
  }, []);

  // Preload 3D models in background once dishes list is fetched
  useEffect(() => {
    if (dishes.length === 0) return;

    dishes.forEach((dish) => {
      if (dish.modelUrl) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = dish.modelUrl;
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
      if (dish.usdzUrl) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = dish.usdzUrl;
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }, [dishes]);

  // Filtered dishes computation
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = activeCategory === 'All' || dish.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleViewDetails = (dish: Dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  return (
    <section id="menu" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
          Browse Our <span className="text-amber-500">Interactive</span> Menu
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Filter by category, search specific ingredients, or tap any dish to view its nutrition and place its 3D model right in front of you.
        </p>
      </div>

      {/* Toolbar: Category filter tabs + Search bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 bg-zinc-900/30 border border-zinc-800/60 p-4 sm:p-5 rounded-3xl backdrop-blur-sm">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeCategory === category
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search menu or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/80 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid Display Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="animate-spin text-amber-500 mb-4" size={36} />
          <span className="text-sm font-semibold">Tasting dishes from database...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 max-w-md mx-auto">
          <p className="font-bold mb-2">Failed to load Menu</p>
          <p className="text-zinc-500 text-xs">{error}</p>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-3xl max-w-lg mx-auto">
          <Filter className="mx-auto text-zinc-600 mb-3" size={32} />
          <p className="font-bold text-sm">No dishes match your filters</p>
          <p className="text-xs text-zinc-600 mt-1">Try modifying your category or search keyword.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredDishes.map((dish) => (
              <FoodCard key={dish.id} dish={dish} onViewDetails={handleViewDetails} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detailed 3D Viewer Modal */}
      <ProductDetailModal
        dish={selectedDish}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDish(null);
        }}
      />
    </section>
  );
}
