'use client';
import { useState, useCallback } from 'react';
import { uploadApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface UseImageUploadOptions {
  folder?: 'produits' | 'artisans' | 'general';
  maxFiles?: number;
  onSuccess?: (urls: string[]) => void;
  onError?: (error: string) => void;
}

interface UseImageUploadReturn {
  uploadedUrls: string[];
  isUploading: boolean;
  uploadSingle: (file: File) => Promise<string | null>;
  uploadMultiple: (files: File[]) => Promise<string[]>;
  removeImage: (url: string) => Promise<boolean>;
  setUploadedUrls: (urls: string[]) => void;
  clearImages: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { folder = 'general', maxFiles = 5, onSuccess, onError } = options;
  
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Upload d'une seule image
  const uploadSingle = useCallback(async (file: File): Promise<string | null> => {
    if (uploadedUrls.length >= maxFiles) {
      const error = `Maximum ${maxFiles} image(s) autorisée(s)`;
      toast.error(error);
      onError?.(error);
      return null;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await uploadApi.uploadImage(file, folder);
      
      if (response.success && response.data?.url) {
        const newUrl = response.data.url;
        setUploadedUrls(prev => [...prev, newUrl]);
        onSuccess?.([newUrl]);
        toast.success('Image uploadée avec succès');
        return newUrl;
      } else {
        const error = response.error || 'Erreur lors de l\'upload';
        toast.error(error);
        onError?.(error);
        return null;
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      const errorMsg = 'Erreur lors de l\'upload';
      toast.error(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [uploadedUrls.length, maxFiles, folder, onSuccess, onError]);

  // Upload de plusieurs images
  const uploadMultiple = useCallback(async (files: File[]): Promise<string[]> => {
    const availableSlots = maxFiles - uploadedUrls.length;
    const filesToUpload = files.slice(0, availableSlots);
    
    if (files.length > availableSlots) {
      toast.error(`Seulement ${availableSlots} image(s) peuvent être uploadée(s)`);
    }

    if (filesToUpload.length === 0) {
      return [];
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        const response = await uploadApi.uploadImage(file, folder);
        return response;
      });

      const results = await Promise.allSettled(uploadPromises);
      
      const successUrls: string[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data?.url) {
          successUrls.push(result.value.data.url);
        } else {
          const fileName = filesToUpload[index].name;
          const error = result.status === 'fulfilled' 
            ? result.value.error 
            : 'Erreur inconnue';
          errors.push(`${fileName}: ${error}`);
        }
      });

      if (successUrls.length > 0) {
        setUploadedUrls(prev => [...prev, ...successUrls]);
        onSuccess?.(successUrls);
        toast.success(`${successUrls.length} image(s) uploadée(s)`);
      }

      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        onError?.(errors.join(', '));
      }

      return successUrls;
    } catch (error) {
      console.error('Erreur upload multiple:', error);
      const errorMsg = 'Erreur lors de l\'upload multiple';
      toast.error(errorMsg);
      onError?.(errorMsg);
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [uploadedUrls.length, maxFiles, folder, onSuccess, onError]);

  // Supprimer une image
  const removeImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      const response = await uploadApi.deleteImage(url);
      
      if (response.success) {
        setUploadedUrls(prev => prev.filter(u => u !== url));
        toast.success('Image supprimée');
        return true;
      } else {
        toast.error(response.error || 'Erreur lors de la suppression');
        return false;
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  // Vider toutes les images
  const clearImages = useCallback(() => {
    setUploadedUrls([]);
  }, []);

  return {
    uploadedUrls,
    isUploading,
    uploadSingle,
    uploadMultiple,
    removeImage,
    setUploadedUrls,
    clearImages
  };
}