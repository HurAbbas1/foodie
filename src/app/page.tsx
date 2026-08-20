import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/menu/HeroSection';
import MenuGrid from '@/components/menu/MenuGrid';
import { ChefHat, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Hero Header */}
      <HeroSection />

      {/* Main Content: Food Menu Directory */}
      <main className="flex-grow">
        <MenuGrid />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-between gap-6 sm:flex-row text-zinc-500 text-xs sm:text-sm">
          {/* Logo & Trademark */}
          <div className="flex items-center gap-2">
            <ChefHat size={16} className="text-amber-500" />
            <span className="font-bold text-zinc-400">AuraBite AR Menu System</span>
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
