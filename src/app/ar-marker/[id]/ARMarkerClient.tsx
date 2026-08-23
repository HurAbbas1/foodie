'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Download, ScanLine } from 'lucide-react';

interface ARMarkerClientProps {
  dishId: string;
  dishName: string;
  modelUrl: string;
}

export default function ARMarkerClient({ dishId, dishName, modelUrl }: ARMarkerClientProps) {
  const [started, setStarted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col w-screen h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <Link
          href={`/dish/${dishId}`}
          className="flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 rounded-full shadow-lg select-none transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Back to Dish</span>
        </Link>
      </div>

      {/* Marker Guide Overlay (shown before starting) */}
      {!started && (
        <div className="flex flex-col items-center justify-center w-full h-full px-6 text-center gap-6">
          {/* Title */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full mb-2">
              <ScanLine size={14} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">MenuVerse Marker AR</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Point at the <span className="text-amber-500">MenuVerse Logo</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              Print or display the marker below on a flat surface, then tap <strong className="text-zinc-200">Start Camera</strong> to see <span className="text-amber-400 font-semibold">{dishName}</span> appear in 3D above it.
            </p>
          </div>

          {/* Marker Image */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-amber-500/10 blur-xl" />
            <div className="relative border-2 border-amber-500/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)] p-3 bg-zinc-900">
              {/* Corner scan brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-md" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-md" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-md" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-marker.png"
                alt="MenuVerse AR Marker"
                className="w-56 h-56 object-contain"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="flex flex-col gap-2 text-left max-w-xs w-full">
            {[
              'Download & print the QR marker below',
              'Place it on a flat surface (table, floor, etc.)',
              'Tap Start Camera and point your phone at it',
              'Watch the 3D model appear on top!',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-400">{step}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            {/* Download QR Button */}
            <a
              href="/logo-marker.png"
              download="menuverse-qr-marker.png"
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-200 hover:text-white font-bold py-3.5 px-6 rounded-2xl border border-zinc-700 hover:border-zinc-600 transition-all text-sm"
            >
              <Download size={16} />
              Download QR
            </a>

            {/* Start Camera Button */}
            <button
              onClick={() => setStarted(true)}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-black py-3.5 px-6 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all text-sm uppercase tracking-wider"
            >
              <Camera size={16} />
              Start Camera
            </button>
          </div>
        </div>
      )}

      {/* AR Scene iframe (mounted after user taps Start) */}
      {started && (
        <iframe
          src={`/ar-marker.html?modelUrl=${encodeURIComponent(modelUrl)}`}
          className="w-full h-full border-0 outline-none flex-grow"
          allow="camera; gyroscope; accelerometer; xr-spatial-tracking"
        />
      )}
    </div>
  );
}
