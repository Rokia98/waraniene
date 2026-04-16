-- Configuration du Storage Supabase pour Tissés de Waraniéné
-- Gestion des uploads d'images (produits, profils artisans, avatars)

-- =================== CRÉATION DES BUCKETS ===================

-- Bucket pour les images de produits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'produits',
    'produits', 
    true, 
    5242880, -- 5MB max
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les photos de profil des artisans
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'artisans',
    'artisans', 
    true, 
    2097152, -- 2MB max
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les avatars des utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars', 
    true, 
    1048576, -- 1MB max
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les documents (certifications, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    false, -- Privé
    10485760, -- 10MB max
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- =================== POLITIQUES DE SÉCURITÉ STORAGE ===================

-- Politique pour les images de produits
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT
USING (bucket_id = 'produits');

CREATE POLICY "Artisans can upload product images" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'produits' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Artisans can update own product images" ON storage.objects FOR UPDATE
USING (
    bucket_id = 'produits' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Artisans can delete own product images" ON storage.objects FOR DELETE
USING (
    bucket_id = 'produits' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour les photos d'artisans
CREATE POLICY "Public can view artisan photos" ON storage.objects FOR SELECT
USING (bucket_id = 'artisans');

CREATE POLICY "Artisans can upload own photos" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'artisans' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Artisans can update own photos" ON storage.objects FOR UPDATE
USING (
    bucket_id = 'artisans' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Artisans can delete own photos" ON storage.objects FOR DELETE
USING (
    bucket_id = 'artisans' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour les avatars
CREATE POLICY "Users can view any avatar" ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour les documents (privés)
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =================== FONCTIONS UTILITAIRES ===================

-- Fonction pour nettoyer les anciens fichiers (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS void AS $$
DECLARE
    file_record RECORD;
BEGIN
    -- Supprimer les images de produits qui ne sont plus référencées
    FOR file_record IN 
        SELECT name FROM storage.objects 
        WHERE bucket_id = 'produits' 
        AND created_at < NOW() - INTERVAL '30 days'
        AND NOT EXISTS (
            SELECT 1 FROM produits 
            WHERE photos @> ARRAY['/storage/v1/object/public/produits/' || file_record.name]
        )
    LOOP
        DELETE FROM storage.objects WHERE bucket_id = 'produits' AND name = file_record.name;
    END LOOP;
    
    -- Log du nettoyage
    INSERT INTO admin_logs (action, details, created_at) 
    VALUES ('storage_cleanup', 'Nettoyage automatique des fichiers orphelins', NOW());
END;
$$ LANGUAGE plpgsql;

-- =================== EXEMPLES D'UTILISATION ===================

/*
-- Structure des chemins de fichiers :

1. Images de produits :
   - Format : /produits/{artisan_id}/{produit_id}/{timestamp}_{nom_original}
   - Exemple : /produits/123e4567-e89b-12d3-a456-426614174000/456e7890-e89b-12d3-a456-426614174001/1638360000_boubou_rouge.jpg

2. Photos d'artisans :
   - Format : /artisans/{artisan_id}/{type}_{timestamp}_{nom}
   - Exemple : /artisans/123e4567-e89b-12d3-a456-426614174000/profil_1638360000_photo.jpg
   - Exemple : /artisans/123e4567-e89b-12d3-a456-426614174000/galerie_1638360000_atelier.jpg

3. Avatars utilisateurs :
   - Format : /avatars/{user_id}/avatar_{timestamp}.{extension}
   - Exemple : /avatars/123e4567-e89b-12d3-a456-426614174000/avatar_1638360000.jpg

4. Documents privés :
   - Format : /documents/{user_id}/{type}_{timestamp}_{nom}
   - Exemple : /documents/123e4567-e89b-12d3-a456-426614174000/certification_1638360000_document.pdf
*/