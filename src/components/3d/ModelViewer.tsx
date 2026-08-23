'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Camera } from 'lucide-react';
import React from 'react';
import '@google/model-viewer';

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
    const [loadingModel, setLoadingModel] = useState(true);
    const [processedSrc, setProcessedSrc] = useState(src.endsWith('.gz') ? '' : src);
    const viewerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      activateAR: () => {
        if (viewerRef.current) {
          viewerRef.current.activateAR();
        }
      },
    }));

    // Process source files (handle .gz client-side decompression)
    useEffect(() => {
      let active = true;
      let objectUrl: string | null = null;

      async function processSource() {
        if (!src) return;

        if (src.endsWith('.gz')) {
          setProcessedSrc('');
          setLoadingModel(true);
          try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Native browser DecompressionStream support (Chrome 80+, Safari 16.4+, Firefox 113+)
            if (typeof globalThis.DecompressionStream !== 'undefined') {
              const ds = new DecompressionStream('gzip');
              const decompressedStream = response.body!.pipeThrough(ds);
              const blob = await new Response(decompressedStream, {
                headers: { 'Content-Type': 'model/gltf-binary' }
              }).blob();
              
              if (active) {
                const rawUrl = URL.createObjectURL(blob);
                objectUrl = rawUrl;
                setProcessedSrc(rawUrl + '#.glb');
              }
            } else {
              // Fallback to uncompressed file if DecompressionStream is missing
              const uncompressedUrl = src.substring(0, src.length - 3);
              setProcessedSrc(uncompressedUrl);
            }
          } catch (error) {
            console.error("Failed to decompress model file:", error);
            // Fallback to uncompressed file on fetch/decode error
            const uncompressedUrl = src.substring(0, src.length - 3);
            setProcessedSrc(uncompressedUrl);
          }
        } else {
          setProcessedSrc(src);
        }
      }

      processSource();

      return () => {
        active = false;
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, [src]);

    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      // Reset loading state if the source changes
      setLoadingModel(true);

      const handleLoad = () => {
        setLoadingModel(false);
      };

      const handleProgress = (event: any) => {
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
    }, [processedSrc]);

  return (
    <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-zinc-800/80 overflow-hidden group">
      <model-viewer
        ref={viewerRef}
        src={processedSrc}
        ios-src={iosSrc || ''}
        alt={alt}
        poster={poster || ''}
        loading="eager"
        reveal="auto"
        ar
        ar-modes="scene-viewer quick-look webxr"
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

      </model-viewer>

      {/* Custom Loading State (Standard React overlay with spinning circle) */}
      {loadingModel && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500 mb-4"></div>
          <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider animate-pulse">
            Plating 3D Dish...
          </span>
        </div>
      )}
    </div>
  );
});

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer;
