-- Migration pour authentification artisans uniquement
-- Date: 2025-11-24
-- Description: Ajoute email/password aux artisans et permet checkout anonyme

-- ============================================
-- ÉTAPE 1: Ajouter colonnes auth à artisans
-- ============================================

-- Ajouter email (unique)
ALTER TABLE public.artisans 
ADD COLUMN IF NOT EXISTS email character varying UNIQUE;

-- Ajouter mot_de_passe
ALTER TABLE public.artisans 
ADD COLUMN IF NOT EXISTS mot_de_passe character varying;

-- Créer index pour performance
CREATE INDEX IF NOT EXISTS idx_artisans_email ON public.artisans(email);

-- ============================================
-- ÉTAPE 2: Modifier table commandes pour checkout anonyme
-- ============================================

-- Rendre acheteur_id nullable (déjà fait dans votre schéma)
-- ALTER TABLE public.commandes ALTER COLUMN acheteur_id DROP NOT NULL;

-- Ajouter colonnes pour acheteur anonyme
ALTER TABLE public.commandes 
ADD COLUMN IF NOT EXISTS nom_acheteur character varying,
ADD COLUMN IF NOT EXISTS email_acheteur character varying,
ADD COLUMN IF NOT EXISTS telephone_acheteur character varying;

-- Index pour recherche par email acheteur
CREATE INDEX IF NOT EXISTS idx_commandes_email_acheteur ON public.commandes(email_acheteur);

-- ============================================
-- ÉTAPE 3: Triggers updated_at
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour artisans
DROP TRIGGER IF EXISTS update_artisans_updated_at ON public.artisans;
CREATE TRIGGER update_artisans_updated_at
    BEFORE UPDATE ON public.artisans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour commandes
DROP TRIGGER IF EXISTS update_commandes_updated_at ON public.commandes;
CREATE TRIGGER update_commandes_updated_at
    BEFORE UPDATE ON public.commandes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÉTAPE 4: Données de test (optionnel)
-- ============================================

-- Vous pouvez créer un artisan de test ici si nécessaire
-- Mot de passe hashé avec bcrypt (12 rounds) pour "password123"
-- $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lZNfC5YbHPuG

/*
INSERT INTO public.artisans (
  nom, 
  email, 
  mot_de_passe, 
  bio, 
  localisation, 
  telephone, 
  langue, 
  statut
) VALUES (
  'Artisan Test',
  'artisan@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lZNfC5YbHPuG',
  'Artisan tisserand spécialisé dans les textiles traditionnels sénoufo de Waraniéné.',
  'Waraniéné, Côte d''Ivoire',
  '+225 07 12 34 56 78',
  'fr',
  'actif'
) ON CONFLICT (email) DO NOTHING;
*/

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'artisans' 
  AND table_schema = 'public'
  AND column_name IN ('email', 'mot_de_passe')
ORDER BY ordinal_position;

-- Vérifier les nouvelles colonnes de commandes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'commandes' 
  AND table_schema = 'public'
  AND column_name IN ('nom_acheteur', 'email_acheteur', 'telephone_acheteur')
ORDER BY ordinal_position;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
/*
1. Table 'acheteurs' reste en base mais n'est plus utilisée pour l'authentification
2. Seuls les ARTISANS peuvent se connecter maintenant
3. Les ACHETEURS achètent sans créer de compte (checkout anonyme)
4. Les commandes peuvent avoir soit:
   - acheteur_id (si ancien système ou future implémentation)
   - nom_acheteur + email_acheteur + telephone_acheteur (checkout anonyme)
5. Pour créer un artisan, utilisez l'API /api/auth/register
*/
