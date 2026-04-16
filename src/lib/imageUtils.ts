import { supabaseAdmin } from './supabase';

// Configuration des images
const STORAGE_BUCKET = 'images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_FOLDERS = ['produits', 'artisans', 'general'];

// Types
interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

interface UploadOptions {
  folder?: string;
  maxWidth?: number;
  quality?: number;
}

// Générer un nom de fichier unique
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}-${random}.${extension}`;
}

// Valider le fichier
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${ALLOWED_TYPES.join(', ')}`
    };
  }

  return { valid: true };
}

// Redimensionner l'image (côté client)
function resizeImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions
      const aspectRatio = img.height / img.width;
      const newWidth = Math.min(img.width, maxWidth);
      const newHeight = newWidth * aspectRatio;

      // Redimensionner le canvas
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Dessiner l'image redimensionnée
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      // Convertir en blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

// Upload d'une image
export async function uploadImage(
  file: File, 
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Validation
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const folder = options.folder || 'general';
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return { success: false, error: `Dossier non autorisé: ${folder}` };
    }

    // Redimensionner si nécessaire (côté client seulement)
    let processedFile = file;
    if (typeof window !== 'undefined' && (options.maxWidth || options.quality)) {
      processedFile = await resizeImage(
        file, 
        options.maxWidth || 1200, 
        options.quality || 0.8
      );
    }

    // Générer le chemin du fichier
    const fileName = generateFileName(file.name);
    const filePath = `${folder}/${fileName}`;

    // Convertir en ArrayBuffer
    const fileBuffer = await processedFile.arrayBuffer();

    // Upload vers Supabase
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: processedFile.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur upload Supabase:', error);
      return { success: false, error: 'Erreur lors de l\'upload' };
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Erreur upload:', error);
    return { success: false, error: 'Erreur interne lors de l\'upload' };
  }
}

// Upload multiple d'images
export async function uploadMultipleImages(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results = await Promise.allSettled(
    files.map(file => uploadImage(file, options))
  );

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return { success: false, error: 'Erreur lors de l\'upload' };
    }
  });
}

// Supprimer une image
export async function deleteImage(filePath: string): Promise<UploadResult> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Erreur suppression:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }

    return { success: true };

  } catch (error) {
    console.error('Erreur suppression:', error);
    return { success: false, error: 'Erreur interne lors de la suppression' };
  }
}

// Obtenir l'URL publique d'une image
export function getPublicImageUrl(filePath: string): string {
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Extraire le path depuis une URL
export function extractPathFromUrl(url: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
  if (!baseUrl || !url.startsWith(baseUrl)) {
    return null;
  }

  const path = url.replace(`${baseUrl}/${STORAGE_BUCKET}/`, '');
  return path;
}

// Optimiser les URLs d'images (ajouter des transformations)
export function getOptimizedImageUrl(
  filePath: string, 
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  let url = getPublicImageUrl(filePath);
  
  // Ajouter des paramètres de transformation si supportés
  const params = new URLSearchParams();
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.quality) params.append('quality', options.quality.toString());
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

// Composant utilitaire pour prévisualiser une image avant upload
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}