import Image from 'next/image';
import { useState } from 'react';
import { Eye } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export function SafeImage({ 
  src, 
  alt, 
  fill, 
  width, 
  height, 
  className,
  fallbackTitle,
  fallbackSubtitle = "Image à venir"
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  
  // Vérifier si l'image est valide
  const isValidImage = src && (
    src.startsWith('/') || 
    src.startsWith('http://') || 
    src.startsWith('https://') || 
    src.startsWith('data:')
  );

  if (!isValidImage || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 ${className}`}>
        <div className="text-center p-4">
          <div className="w-16 h-16 mx-auto mb-2 bg-primary-200 rounded-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-primary-600" />
          </div>
          {fallbackTitle && (
            <p className="text-sm text-primary-700 font-medium">
              {fallbackTitle}
            </p>
          )}
          <p className="text-xs text-primary-600 mt-1">
            {fallbackSubtitle}
          </p>
        </div>
      </div>
    );
  }

  const imageProps: any = {
    src,
    alt,
    className,
    onError: () => setHasError(true),
  };

  if (fill) {
    imageProps.fill = true;
  } else if (width && height) {
    imageProps.width = width;
    imageProps.height = height;
  }

  return <Image {...imageProps} />;
}