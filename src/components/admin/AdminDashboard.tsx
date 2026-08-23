'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, ArrowLeft, Upload, Loader2, 
  Check, X, Sparkles, AlertCircle, Eye, Search, 
  LayoutDashboard, Flame, Carrot, AlertTriangle 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import Image from 'next/image';

const ModelViewer = dynamic(() => import('../3d/ModelViewer'), {
  ssr: false,
});


interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Allergen {
  id?: string;
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

const CATEGORIES = ['Appetizers', 'Mains', 'Desserts', 'Beverages'];
const ALLERGEN_OPTIONS = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Soy', 'Shellfish', 'Spicy'];

export default function AdminDashboard() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard Views
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mains');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [usdzUrl, setUsdzUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  // Loading states for file uploads
  const [uploadingModel, setUploadingModel] = useState(false);
  const [uploadingUsdz, setUploadingUsdz] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load dishes
  useEffect(() => {
    fetchDishes();
  }, []);

  async function fetchDishes() {
    try {
      setLoading(true);
      const res = await fetch('/api/dishes');
      if (!res.ok) throw new Error('Could not fetch dishes');
      const data = await res.json();
      setDishes(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while loading data');
    } finally {
      setLoading(false);
    }
  }

  // Handle Form Open
  const handleOpenForm = (dish?: Dish) => {
    if (dish) {
      // Edit mode
      setEditingDish(dish);
      setName(dish.name);
      setCategory(dish.category);
      setPrice(dish.price.toString());
      setDescription(dish.description);
      setCalories(dish.calories?.toString() || '');
      setModelUrl(dish.modelUrl || '');
      setUsdzUrl(dish.usdzUrl || '');
      setPreviewUrl(dish.previewUrl || '');
      setIngredients(dish.ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit })));
      setSelectedAllergens(dish.allergens.map(a => a.name));
    } else {
      // Create mode
      setEditingDish(null);
      setName('');
      setCategory('Mains');
      setPrice('');
      setDescription('');
      setCalories('');
      setModelUrl('');
      setUsdzUrl('');
      setPreviewUrl('');
      setIngredients([]);
      setSelectedAllergens([]);
    }
    setView('form');
  };

  // Delete Dish
  const handleDeleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish? All related relations will be deleted.')) return;
    
    try {
      const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');
      
      confetti({ particleCount: 50, colors: ['#ef4444', '#f59e0b'] });
      fetchDishes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete dish');
    }
  };

  // Upload Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'usdz' | 'image') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const formData = new FormData();
    formData.append('file', file);

    try {
      if (type === 'model') setUploadingModel(true);
      if (type === 'usdz') setUploadingUsdz(true);
      if (type === 'image') setUploadingImage(true);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload request failed');
      const data = await res.json();

      if (type === 'model') setModelUrl(data.url);
      if (type === 'usdz') setUsdzUrl(data.url);
      if (type === 'image') setPreviewUrl(data.url);
      
      confetti({ particleCount: 30, colors: ['#10b981', '#f59e0b'] });
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    } finally {
      if (type === 'model') setUploadingModel(false);
      if (type === 'usdz') setUploadingUsdz(false);
      if (type === 'image') setUploadingImage(false);
    }
  };

  // Dynamic Ingredients Handlers
  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: 'g' }]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredientField = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = ingredients.map((ing, i) => {
      if (i === index) {
        return { ...ing, [field]: value };
      }
      return ing;
    });
    setIngredients(updated);
  };

  // Allergen Toggle
  const toggleAllergen = (allergen: string) => {
    if (selectedAllergens.includes(allergen)) {
      setSelectedAllergens(selectedAllergens.filter(a => a !== allergen));
    } else {
      setSelectedAllergens([...selectedAllergens, allergen]);
    }
  };

  // Form Submit (Save / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingDish ? `/api/dishes/${editingDish.id}` : '/api/dishes';
      const method = editingDish ? 'PUT' : 'POST';

      const body = {
        name,
        category,
        price: parseFloat(price),
        description,
        calories: calories ? parseInt(calories, 10) : null,
        modelUrl,
        usdzUrl,
        previewUrl,
        ingredients,
        allergens: selectedAllergens,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Submission failed');

      // Success effects
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setView('list');
      fetchDishes();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering list by search bar
  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8 pt-24 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold mb-1">
            <LayoutDashboard size={20} />
            <span className="text-xs uppercase tracking-widest">System Console</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Menu Assets Manager
          </h1>
        </div>

        {view === 'list' ? (
          <button
            onClick={() => handleOpenForm()}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all text-sm w-full sm:w-auto justify-center cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Dish</span>
          </button>
        ) : (
          <button
            onClick={() => setView('list')}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white py-3 px-5 rounded-2xl flex items-center gap-2 transition-all text-sm w-full sm:w-auto justify-center cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Assets List</span>
          </button>
        )}
      </div>

      {/* ERROR PANEL */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 mb-8">
          <AlertCircle size={20} />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div>
          {/* Search bar */}
          <div className="relative w-full max-w-md mb-8">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search assets by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Loader2 className="animate-spin text-amber-500 mb-4" size={36} />
              <span className="text-sm font-semibold">Syncing database entries...</span>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-3xl">
              <p className="font-bold text-sm">No dishes found</p>
              <p className="text-xs text-zinc-600 mt-1">Get started by creating your first digital dish.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <div key={dish.id} className="glass border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 mb-4">
                      {dish.previewUrl ? (
                        <Image
                          src={dish.previewUrl}
                          alt={dish.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs uppercase font-extrabold tracking-widest">
                          No Thumbnail
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-bold text-lg text-zinc-100 line-clamp-1">{dish.name}</h3>
                      <span className="text-amber-500 font-extrabold">Rs. {dish.price.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <span className="bg-zinc-800 text-zinc-400 border border-zinc-750 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-widest">
                        {dish.category}
                      </span>
                      {dish.modelUrl && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          3D Ready
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">{dish.description}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-zinc-900 mt-2">
                    <button
                      onClick={() => handleOpenForm(dish)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs font-semibold"
                    >
                      <Edit2 size={13} />
                      <span>Edit Asset</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="bg-red-950/20 border border-red-900/30 hover:border-red-500/50 text-red-400 hover:bg-red-500 hover:text-zinc-950 p-2.5 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM VIEW (ADD / EDIT) */}
      {view === 'form' && (
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          {/* Left Form Inputs column */}
          <div className="w-full lg:w-7/12 space-y-6">
            <h2 className="text-xl font-bold border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={18} />
              <span>{editingDish ? 'Edit Dish Profile' : 'Create Culinary Dish'}</span>
            </h2>

            {/* Basic Info Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-extrabold text-zinc-400 tracking-wider mb-2">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lobster Thermidor"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/80 rounded-xl py-3 px-4 text-sm text-zinc-100 outline-none transition-all placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-zinc-400 tracking-wider mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/80 rounded-xl py-3 px-4 text-sm text-zinc-100 outline-none transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-extrabold text-zinc-400 tracking-wider mb-2">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24.99"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/80 rounded-xl py-3 px-4 text-sm text-zinc-100 outline-none transition-all placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-zinc-400 tracking-wider mb-2">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="450"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/80 rounded-xl py-3 px-4 text-sm text-zinc-100 outline-none transition-all placeholder-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-extrabold text-zinc-400 tracking-wider mb-2">
                Dish Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief gourmet profile, taste parameters, textures, etc."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/80 rounded-xl py-3 px-4 text-sm text-zinc-100 outline-none transition-all placeholder-zinc-600"
              />
            </div>

            {/* Asset Upload Section */}
            <div className="border border-zinc-800 p-5 rounded-2xl bg-zinc-900/10 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-amber-500 flex items-center gap-1.5">
                <Upload size={14} />
                <span>3D Assets & Media uploads</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* GLB File Upload */}
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-zinc-500 mb-2.5">
                    3D Model (.glb) *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".glb"
                      onChange={(e) => handleFileUpload(e, 'model')}
                      className="hidden"
                      id="glb-upload"
                    />
                    <label
                      htmlFor="glb-upload"
                      className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-800 hover:border-amber-500/40 rounded-xl cursor-pointer text-zinc-400 bg-zinc-950/40 text-center gap-1.5 transition-all h-28"
                    >
                      {uploadingModel ? (
                        <Loader2 className="animate-spin text-amber-500" size={20} />
                      ) : modelUrl ? (
                        <Check className="text-emerald-500" size={20} />
                      ) : (
                        <Upload size={20} />
                      )}
                      <span className="text-[10px] font-semibold line-clamp-1">
                        {uploadingModel ? 'Uploading...' : modelUrl ? 'Change GLB' : 'Select GLB'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* USDZ File Upload */}
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-zinc-500 mb-2.5">
                    iOS Quick Look (.usdz)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".usdz"
                      onChange={(e) => handleFileUpload(e, 'usdz')}
                      className="hidden"
                      id="usdz-upload"
                    />
                    <label
                      htmlFor="usdz-upload"
                      className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-800 hover:border-amber-500/40 rounded-xl cursor-pointer text-zinc-400 bg-zinc-950/40 text-center gap-1.5 transition-all h-28"
                    >
                      {uploadingUsdz ? (
                        <Loader2 className="animate-spin text-amber-500" size={20} />
                      ) : usdzUrl ? (
                        <Check className="text-emerald-500" size={20} />
                      ) : (
                        <Upload size={20} />
                      )}
                      <span className="text-[10px] font-semibold line-clamp-1">
                        {uploadingUsdz ? 'Uploading...' : usdzUrl ? 'Change USDZ' : 'Select USDZ'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Preview Image File Upload */}
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-zinc-500 mb-2.5">
                    Thumbnail Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-800 hover:border-amber-500/40 rounded-xl cursor-pointer text-zinc-400 bg-zinc-950/40 text-center gap-1.5 transition-all h-28"
                    >
                      {uploadingImage ? (
                        <Loader2 className="animate-spin text-amber-500" size={20} />
                      ) : previewUrl ? (
                        <Check className="text-emerald-500" size={20} />
                      ) : (
                        <Upload size={20} />
                      )}
                      <span className="text-[10px] font-semibold line-clamp-1">
                        {uploadingImage ? 'Uploading...' : previewUrl ? 'Change Image' : 'Select Image'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Ingredients Builder */}
            <div className="border border-zinc-800 p-5 rounded-2xl bg-zinc-900/10 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-amber-500 flex items-center gap-1.5">
                  <Carrot size={14} />
                  <span>Ingredients Ratio Builder</span>
                </h3>
                <button
                  type="button"
                  onClick={addIngredientRow}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] uppercase font-extrabold tracking-wider py-1.5 px-3 rounded-lg border border-zinc-750 cursor-pointer"
                >
                  Add Ingredient Row
                </button>
              </div>

              {ingredients.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No ingredients specified. Tap add to create rows.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Ingredient (e.g. Milk)"
                        value={ing.name}
                        required
                        onChange={(e) => updateIngredientField(index, 'name', e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs text-zinc-100 outline-none"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Qty"
                        value={ing.quantity || ''}
                        required
                        onChange={(e) => updateIngredientField(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-zinc-950 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs text-zinc-100 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Unit (g)"
                        value={ing.unit}
                        required
                        onChange={(e) => updateIngredientField(index, 'unit', e.target.value)}
                        className="w-20 bg-zinc-950 border border-zinc-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs text-zinc-100 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredientRow(index)}
                        className="bg-zinc-950 text-red-500 border border-zinc-850 hover:border-red-500/40 p-2 rounded-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Allergens Selection Checklist */}
            <div className="border border-zinc-800 p-5 rounded-2xl bg-zinc-900/10 space-y-3">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-amber-500 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>Allergens Multiselect</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((allergen) => {
                  const active = selectedAllergens.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleAllergen(allergen)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-red-500/10 border-red-500/40 text-red-400 font-bold'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submission Row */}
            <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold py-3 px-6 rounded-xl transition-all text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-zinc-950 font-bold py-3 px-6 rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {submitting && <Loader2 className="animate-spin" size={14} />}
                <span>{editingDish ? 'Update Dish' : 'Publish Dish'}</span>
              </button>
            </div>
          </div>

          {/* Right column: LIVE 3D MODEL PREVIEW */}
          <div className="w-full lg:w-5/12 space-y-6">
            <h2 className="text-xl font-bold border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Eye className="text-amber-500" size={18} />
              <span>Live 3D asset preview</span>
            </h2>

            {modelUrl ? (
              <div className="h-[400px] w-full relative">
                <ModelViewer src={modelUrl} iosSrc={usdzUrl || undefined} alt="Live model test" />
                <div className="absolute top-4 left-4 bg-zinc-950/80 border border-zinc-850/80 text-[10px] text-emerald-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Interactive Preview Active</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-[400px] bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 text-center p-6">
                <AlertCircle size={40} className="text-zinc-700 mb-2" />
                <p className="font-bold text-xs uppercase tracking-wider mb-1 text-zinc-500">Preview Idle</p>
                <p className="text-[11px] text-zinc-600 leading-relaxed max-w-[240px]">
                  Upload a 3D model (.glb) file in the form to test lighting, positioning, and orbit controls here.
                </p>
              </div>
            )}

            {/* Config warning panel */}
            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-zinc-300 mb-1">Mobile Wi-Fi Ready Note</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                When you deploy to mobile via QR code, make sure your mobile device is on the same local Wi-Fi network and accessing via your workstation IP address.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
