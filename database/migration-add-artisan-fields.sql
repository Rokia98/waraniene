-- Migration: Add artisan delivery tracking fields
-- Adds fields needed for artisan order management

-- Add new columns to commandes table if they don't exist
ALTER TABLE commandes
ADD COLUMN IF NOT EXISTS statut_livraison VARCHAR(20) DEFAULT 'preparation' CHECK (statut_livraison IN ('preparation', 'expediee', 'en_livraison', 'livree', 'annule')),
ADD COLUMN IF NOT EXISTS statut_paiement VARCHAR(20) DEFAULT 'pending' CHECK (statut_paiement IN ('pending', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS nom_acheteur VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_acheteur VARCHAR(255),
ADD COLUMN IF NOT EXISTS telephone_acheteur VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_expedition TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_livraison TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS numero_commande VARCHAR(50);

-- Update existing records to have the new columns populated
UPDATE commandes 
SET 
  nom_acheteur = COALESCE(nom_acheteur, 'Client'),
  email_acheteur = COALESCE(email_acheteur, ''),
  telephone_acheteur = COALESCE(telephone_acheteur, ''),
  numero_commande = COALESCE(numero_commande, 'CMD-' || substring(id::text, 1, 8))
WHERE nom_acheteur IS NULL OR numero_commande IS NULL;

-- Update statut_paiement based on existing order status
UPDATE commandes
SET statut_paiement = 'completed'
WHERE statut IN ('confirmee', 'preparee', 'expediee', 'livree');

-- Update statut_livraison based on existing statut column
UPDATE commandes
SET statut_livraison = 
  CASE 
    WHEN statut = 'en_attente' THEN 'preparation'
    WHEN statut = 'confirmee' THEN 'preparation'
    WHEN statut = 'preparee' THEN 'preparation'
    WHEN statut = 'expediee' THEN 'expediee'
    WHEN statut = 'livree' THEN 'livree'
    WHEN statut = 'annulee' THEN 'annule'
    ELSE 'preparation'
  END
WHERE statut_livraison = 'preparation';

-- Ensure articles_commandes table exists with proper relationships
CREATE TABLE IF NOT EXISTS articles_commandes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL CHECK (quantite > 0),
  prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(commande_id, produit_id)
);

-- Migrate data from detail_commandes to articles_commandes if needed
INSERT INTO articles_commandes (commande_id, produit_id, quantite, prix_unitaire, created_at)
SELECT commande_id, produit_id, quantite, prix_unitaire, created_at
FROM detail_commandes
ON CONFLICT (commande_id, produit_id) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_commandes_commande_id ON articles_commandes(commande_id);
CREATE INDEX IF NOT EXISTS idx_articles_commandes_produit_id ON articles_commandes(produit_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut_livraison ON commandes(statut_livraison);
CREATE INDEX IF NOT EXISTS idx_commandes_numero ON commandes(numero_commande);

-- Log completion
SELECT 'Migration completed successfully' as status;
