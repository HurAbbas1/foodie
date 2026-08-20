'use client';

import Link from 'next/link';
import { ChefHat, LayoutDashboard, UtensilsCrossed } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-800/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-tr from-amber-500 to-rose-600 p-2 rounded-xl text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform group-hover:scale-105">
              <ChefHat size={22} className="stroke-[2.5]" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Aura<span className="text-amber-500 font-extrabold">Bite</span>
            </span>
            <span className="hidden xs:inline-block text-[10px] uppercase font-bold tracking-widest bg-zinc-800 border border-zinc-700/80 text-zinc-400 px-2 py-0.5 rounded-full">
              AR Menu
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              href="/#menu" 
              className="text-sm font-semibold text-zinc-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
            >
              <UtensilsCrossed size={16} />
              <span>Browse Menu</span>
            </Link>
            
            <Link 
              href="/admin" 
              className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 text-xs sm:text-sm font-semibold py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-2 transition-all shadow-inner"
            >
              <LayoutDashboard size={15} />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
