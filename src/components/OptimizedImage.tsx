'use client';
import { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import NextImage from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  className = '',
  loading = 'lazy',
  placeholder = '/images/placeholder.jpg',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Créer l'URL optimisée
    const optimizedUrl = getOptimizedImageUrl(src, {
      width,
      height,
      quality
    });

    // Précharger l'image
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(optimizedUrl);
      setImageLoaded(true);
      setImageError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
      onError?.();
    };

    img.src = optimizedUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, width, height, quality, onLoad, onError]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <NextImage
        src={imageSrc}
        alt={alt}
        width={width || 400}
        height={height || 300}
        className={`transition-opacity duration-300 ${
          imageLoaded && !imageError ? 'opacity-100' : 'opacity-70'
        }`}
      />
      
      {/* Indicateur de chargement */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Indicateur d'erreur */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 text-center">
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image non disponible</p>
          </div>
        </div>
      )}
    </div>
  );
}