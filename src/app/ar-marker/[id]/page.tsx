import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import menuData from '@/data/menu.json';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ARMarkerPage({ params }: PageProps) {
  const { id } = await params;
  const dish = menuData.find((d) => d.id === id);

  if (!dish || !dish.modelUrl) {
    notFound();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen overflow-hidden">
      {/* Top Bar with Return Action */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <Link
          href={`/dish/${dish.id}`}
          className="flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 rounded-full shadow-lg select-none transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Back to Dish</span>
        </Link>
      </div>

      {/* Fullscreen IFrame pointing to static A-Frame page */}
      <iframe
        src={`/ar-marker.html?modelUrl=${encodeURIComponent(dish.modelUrl)}`}
        className="w-full h-full border-0 outline-none flex-grow"
        allow="camera; gyroscope; accelerometer; xr-spatial-tracking"
      />
    </div>
  );
}
export const dynamic = 'force-dynamic';
