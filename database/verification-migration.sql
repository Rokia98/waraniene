-- ============================================
-- Script de vérification post-migration
-- À exécuter après migration-artisan-auth.sql
-- ============================================

-- ============================================
-- 1. VÉRIFICATION STRUCTURE TABLE ARTISANS
-- ============================================

SELECT 
    'Artisans - Structure' as verification,
    column_name, 
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'artisans'
ORDER BY ordinal_position;

-- ============================================
-- 2. VÉRIFICATION INDEX
-- ============================================

SELECT 
    'Index artisans' as verification,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'artisans'
  AND indexname LIKE 'idx_%';

-- ============================================
-- 3. VÉRIFICATION STRUCTURE TABLE COMMANDES
-- ============================================

SELECT 
    'Commandes - Nouvelles colonnes' as verification,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'commandes'
  AND column_name IN ('nom_acheteur', 'email_acheteur', 'telephone_acheteur', 'acheteur_id')
ORDER BY ordinal_position;

-- ============================================
-- 4. VÉRIFICATION TRIGGERS
-- ============================================

SELECT 
    'Triggers' as verification,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- ============================================
-- 5. STATISTIQUES TABLES
-- ============================================

-- Compter les artisans
SELECT 
    'Statistiques' as verification,
    'artisans' as table_name,
    COUNT(*) as total_rows,
    COUNT(email) as artisans_avec_email,
    COUNT(mot_de_passe) as artisans_avec_password
FROM public.artisans;

-- Compter les commandes
SELECT 
    'Statistiques' as verification,
    'commandes' as table_name,
    COUNT(*) as total_commandes,
    COUNT(acheteur_id) as avec_compte_acheteur,
    COUNT(nom_acheteur) as checkout_anonyme
FROM public.commandes;

-- ============================================
-- 6. VÉRIFICATION CONTRAINTES
-- ============================================

SELECT 
    'Contraintes' as verification,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('artisans', 'commandes')
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY', 'FOREIGN KEY')
ORDER BY tc.table_name, tc.constraint_type;

-- ============================================
-- 7. TEST REQUÊTE ARTISAN (si des données existent)
-- ============================================

-- Afficher les artisans avec email
SELECT 
    'Artisans existants' as verification,
    id,
    nom,
    email,
    telephone,
    localisation,
    statut,
    date_inscription,
    CASE 
        WHEN email IS NOT NULL THEN '✅ Email présent'
        ELSE '❌ Email manquant'
    END as status_email,
    CASE 
        WHEN mot_de_passe IS NOT NULL THEN '✅ Password présent'
        ELSE '❌ Password manquant'
    END as status_password
FROM public.artisans
LIMIT 10;

-- ============================================
-- 8. RÉSUMÉ FINAL
-- ============================================

SELECT 
    '=== RÉSUMÉ DE LA MIGRATION ===' as titre,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'artisans' AND column_name = 'email') as colonne_email_artisans,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'artisans' AND column_name = 'mot_de_passe') as colonne_password_artisans,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'commandes' AND column_name = 'nom_acheteur') as colonne_nom_acheteur,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'commandes' AND column_name = 'email_acheteur') as colonne_email_acheteur,
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE tablename = 'artisans' AND indexname = 'idx_artisans_email') as index_email_artisans,
    (SELECT COUNT(*) FROM information_schema.triggers 
     WHERE event_object_table = 'artisans' 
     AND trigger_name = 'update_artisans_updated_at') as trigger_artisans;

-- ============================================
-- INTERPRÉTATION DES RÉSULTATS
-- ============================================

/*
✅ MIGRATION RÉUSSIE SI :
- colonne_email_artisans = 1
- colonne_password_artisans = 1
- colonne_nom_acheteur = 1
- colonne_email_acheteur = 1
- index_email_artisans = 1
- trigger_artisans = 1

❌ PROBLÈME SI une valeur = 0
Relancez le script de migration

📊 NOTES :
- Si total_rows artisans = 0 : Aucun artisan en base (normal pour nouveau projet)
- Si total_commandes = 0 : Aucune commande (normal pour nouveau projet)
- Les colonnes email/password peuvent être NULL pour artisans existants (migrés)
- Les nouveaux artisans créés via /api/auth/register auront toujours email/password
*/
