-- Configuration des buckets de stockage pour Tissés de Waraniéné

-- Création des buckets pour les différents types de fichiers
INSERT INTO storage.buckets (id, name, public) VALUES
('produits', 'produits', true),
('artisans', 'artisans', true),
('avatars', 'avatars', true),
('documents', 'documents', false);

-- Politiques de stockage pour les images de produits
CREATE POLICY "Tout le monde peut voir les images de produits" ON storage.objects
FOR SELECT USING (bucket_id = 'produits');

CREATE POLICY "Artisans peuvent uploader des images de produits" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'produits' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Artisans peuvent modifier leurs images de produits" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'produits' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);

CREATE POLICY "Artisans peuvent supprimer leurs images de produits" ON storage.objects
FOR DELETE USING (
  bucket_id = 'produits' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);

-- Politiques de stockage pour les photos d'artisans
CREATE POLICY "Tout le monde peut voir les photos d'artisans" ON storage.objects
FOR SELECT USING (bucket_id = 'artisans');

CREATE POLICY "Artisans peuvent uploader leurs photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'artisans' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Artisans peuvent modifier leurs photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'artisans' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);

CREATE POLICY "Artisans peuvent supprimer leurs photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'artisans' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);

-- Politiques de stockage pour les avatars d'utilisateurs
CREATE POLICY "Utilisateurs peuvent voir tous les avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Utilisateurs peuvent uploader leur avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Utilisateurs peuvent modifier leur avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);

CREATE POLICY "Utilisateurs peuvent supprimer leur avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);

-- Politiques de stockage pour les documents (factures, contrats, etc.)
CREATE POLICY "Utilisateurs peuvent voir leurs documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);

CREATE POLICY "Utilisateurs peuvent uploader leurs documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Utilisateurs peuvent modifier leurs documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);

CREATE POLICY "Utilisateurs peuvent supprimer leurs documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated' AND
  owner_id = auth.uid()
);