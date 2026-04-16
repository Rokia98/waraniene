-- Script pour configurer Supabase Storage
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer le bucket pour les images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB en octets
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Policy pour permettre à tous de voir les images
CREATE POLICY "Public read access for images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Policy pour permettre l'upload d'images (pour les utilisateurs authentifiés via nos APIs)
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    (storage.foldername(name))[1] IN ('produits', 'artisans', 'general')
  );

-- Policy pour permettre la suppression d'images (pour les utilisateurs authentifiés via nos APIs)
CREATE POLICY "Authenticated users can delete own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');

-- Policy pour la mise à jour d'images
CREATE POLICY "Authenticated users can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images');