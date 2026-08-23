import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/menu/HeroSection';
import MenuGrid from '@/components/menu/MenuGrid';
import { ChefHat, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      {/* Background Rotating Watermark Logo (Transparent circular badge with no white canvas) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden flex items-center justify-center opacity-[0.03] select-none">
        <img 
          src="/logo-badge-transparent.png" 
          alt="MenuVerse Background Logo" 
          className="w-[850px] h-[850px] object-contain animate-[spin_180s_linear_infinite]"
        />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Hero Header */}
      <HeroSection />

      {/* Main Content: Food Menu Directory */}
      <main className="flex-grow relative z-10">
        <MenuGrid />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-between gap-6 sm:flex-row text-zinc-500 text-xs sm:text-sm">
          {/* Logo & Trademark */}
          <div className="flex items-center gap-2">
            <img 
              src="/logo-badge.jpg" 
              alt="MenuVerse Logo" 
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-bold text-zinc-400">MenuVerse AR Menu System</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-1 text-zinc-600">
            <span>Made with</span>
            <Heart size={12} className="text-rose-600 fill-rose-600" />
            <span>using Next.js & Google Model Viewer.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
