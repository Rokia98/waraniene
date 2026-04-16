'use client';
import { useState, useRef, useCallback } from 'react';
import { uploadImage, uploadMultipleImages, createImagePreview } from '@/lib/imageUtils';
import toast from 'react-hot-toast';
import { XMarkIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageUploadProps {
  folder?: 'produits' | 'artisans' | 'general';
  multiple?: boolean;
  maxFiles?: number;
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  existingImages?: string[];
  className?: string;
}

interface PreviewImage {
  file: File;
  preview: string;
  uploading: boolean;
}

export default function ImageUpload({
  folder = 'general',
  multiple = false,
  maxFiles = 5,
  onUploadSuccess,
  onUploadError,
  existingImages = [],
  className = ''
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Vérifier le nombre maximum de fichiers
    const totalFiles = previews.length + uploadedUrls.length + fileArray.length;
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} image(s) autorisée(s)`);
      return;
    }

    // Créer les prévisualisations
    const newPreviews: PreviewImage[] = [];
    for (const file of fileArray) {
      try {
        const preview = await createImagePreview(file);
        newPreviews.push({
          file,
          preview,
          uploading: false
        });
      } catch (error) {
        console.error('Erreur création preview:', error);
        toast.error(`Erreur avec le fichier ${file.name}`);
      }
    }

    setPreviews(prev => [...prev, ...newPreviews]);
  }, [previews.length, uploadedUrls.length, maxFiles]);

  // Upload des images
  const handleUpload = useCallback(async () => {
    if (previews.length === 0) return;

    setIsUploading(true);
    setPreviews(prev => prev.map(p => ({ ...p, uploading: true })));

    try {
      const files = previews.map(p => p.file);
      
      if (multiple) {
        // Upload multiple
        const results = await uploadMultipleImages(files, { folder });
        
        const successUrls: string[] = [];
        const errors: string[] = [];
        
        results.forEach((result, index) => {
          if (result.success && result.url) {
            successUrls.push(result.url);
          } else {
            errors.push(`${files[index].name}: ${result.error}`);
          }
        });

        if (successUrls.length > 0) {
          setUploadedUrls(prev => [...prev, ...successUrls]);
          onUploadSuccess?.(successUrls);
          toast.success(`${successUrls.length} image(s) uploadée(s)`);
        }

        if (errors.length > 0) {
          errors.forEach(error => toast.error(error));
          onUploadError?.(errors.join(', '));
        }
      } else {
        // Upload simple
        const result = await uploadImage(files[0], { folder });
        
        if (result.success && result.url) {
          setUploadedUrls([result.url]);
          onUploadSuccess?.([result.url]);
          toast.success('Image uploadée avec succès');
        } else {
          toast.error(result.error || 'Erreur lors de l\'upload');
          onUploadError?.(result.error || 'Erreur upload');
        }
      }

      setPreviews([]);
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload');
      onUploadError?.('Erreur interne');
    } finally {
      setIsUploading(false);
    }
  }, [previews, folder, multiple, onUploadSuccess, onUploadError]);

  // Supprimer une preview
  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Supprimer une image uploadée
  const removeUploadedImage = (index: number) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    onUploadSuccess?.(uploadedUrls.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop et sélection */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-orange-600 hover:text-orange-500 font-medium"
          >
            Sélectionner {multiple ? 'des images' : 'une image'}
          </button>
          <p className="text-sm text-gray-500 mt-1">
            ou glisser-déposer ici
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, WebP jusqu&apos;à 5MB
            {multiple && ` (max ${maxFiles} images)`}
          </p>
        </div>
      </div>

      {/* Prévisualisations des nouvelles images */}
      {previews.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Images à uploader ({previews.length})
            </h4>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isUploading ? 'Upload...' : 'Uploader'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <Image
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                
                {preview.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}

                <button
                  onClick={() => removePreview(index)}
                  disabled={preview.uploading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images déjà uploadées */}
      {uploadedUrls.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Images uploadées ({uploadedUrls.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                
                <button
                  onClick={() => removeUploadedImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {/* Bouton pour ajouter plus d'images si multiple et pas à la limite */}
            {multiple && uploadedUrls.length < maxFiles && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-orange-400 transition-colors"
              >
                <div className="text-center">
                  <PlusIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-1">Ajouter</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}