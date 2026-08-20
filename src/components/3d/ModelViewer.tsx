'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export interface ModelViewerRef {
  activateAR: () => void;
}

interface ModelViewerProps {
  src: string;
  iosSrc?: string;
  alt: string;
  autoRotate?: boolean;
  poster?: string;
}

const ModelViewer = forwardRef<ModelViewerRef, ModelViewerProps>(
  ({ src, iosSrc, alt, autoRotate = true, poster }, ref) => {
    const [loaded, setLoaded] = useState(false);
    const [loadingModel, setLoadingModel] = useState(true);
    const viewerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      activateAR: () => {
        if (viewerRef.current) {
          viewerRef.current.activateAR();
        }
      },
    }));

    useEffect(() => {
    // Dynamically import @google/model-viewer on the client side only
    import('@google/model-viewer')
      .then(() => setLoaded(true))
      .catch((err) => console.error('Failed to load @google/model-viewer:', err));
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Reset loading state if the src changes
    setLoadingModel(true);

    const handleLoad = () => {
      setLoadingModel(false);
    };

    const handleProgress = (event: any) => {
      // event.detail.totalProgress ranges from 0 to 1
      if (event.detail.totalProgress === 1) {
        setLoadingModel(false);
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('progress', handleProgress);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('progress', handleProgress);
    };
  }, [loaded, src]); // Re-run if model-viewer script loads or model source changes

  if (!loaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-zinc-800 text-zinc-400 min-h-[300px] md:min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Loading 3D Dining Engine...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-zinc-800/80 overflow-hidden group">
      <model-viewer
        ref={viewerRef}
        src={src}
        ios-src={iosSrc || ''}
        alt={alt}
        poster={poster || ''}
        loading="eager"
        reveal="auto"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate={autoRotate ? true : undefined}
        shadow-intensity="1.5"
        shadow-softness="1"
        exposure="1.2"
        environment-image="neutral"
        ar-placement="floor"
        interaction-prompt="auto"
        className="w-full h-full"
        style={{ width: '100%', height: '100%', outline: 'none' }}
      >
        {/* Custom AR Button */}
        <button
          slot="ar-button"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold py-3 px-6 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2.5 transition-all text-sm z-10 border border-amber-400"
        >
          <Camera size={18} className="animate-pulse" />
          <span>View in Your Space</span>
        </button>

        {/* Custom Loading State (Controlled directly by React State) */}
        {loadingModel && (
          <div
            slot="progress-bar"
            className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center z-20"
          >
            <div className="flex flex-col items-center">
              <Sparkles className="text-amber-500 animate-bounce mb-2" size={32} />
              <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider animate-pulse">
                Plating 3D Dish...
              </span>
            </div>
          </div>
        )}
      </model-viewer>
    </div>
  );
});

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer;
