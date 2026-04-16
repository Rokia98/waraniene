'use client';
import { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
}

export default function ImageGallery({ images, alt = "Image", className = "" }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center rounded-lg ${className}`}>
        <div className="text-gray-400 text-center p-8">
          <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Aucune image disponible</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex(current => 
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(current => 
      current === images.length - 1 ? 0 : current + 1
    );
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={className}>
      {/* Image principale */}
      <div className="relative group cursor-pointer" onClick={() => openModal(currentIndex)}>
        <OptimizedImage
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          width={600}
          height={400}
          className="w-full h-64 md:h-96 object-cover rounded-lg"
        />
        
        {/* Contrôles de navigation (si plusieurs images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            {/* Indicateur du nombre d'images */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Miniatures (si plusieurs images) */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                index === currentIndex 
                  ? 'border-orange-500' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <OptimizedImage
                src={image}
                alt={`${alt} miniature ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal plein écran */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-full max-h-full p-4">
            {/* Bouton de fermeture */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Image en grand */}
            <OptimizedImage
              src={images[currentIndex]}
              alt={`${alt} ${currentIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />

            {/* Navigation dans le modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-70"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>
                
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-70"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>

                {/* Indicateur en bas */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Fermeture en cliquant sur le fond */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={closeModal}
          />
        </div>
      )}
    </div>
  );
}