-- Migration script pour mettre à jour le schéma existant
-- À exécuter si vous avez déjà des données

-- 1. Ajouter les colonnes manquantes aux acheteurs
ALTER TABLE acheteurs 
  ADD COLUMN IF NOT EXISTS prenom VARCHAR(255),
  ADD COLUMN IF NOT EXISTS adresse TEXT,
  ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Rendre prenom NOT NULL après avoir ajouté des valeurs par défaut
UPDATE acheteurs SET prenom = 'Non renseigné' WHERE prenom IS NULL;
ALTER TABLE acheteurs ALTER COLUMN prenom SET NOT NULL;

-- Rendre telephone nullable
ALTER TABLE acheteurs ALTER COLUMN telephone DROP NOT NULL;

-- Supprimer la colonne pays si elle existe (remplacée par adresse)
ALTER TABLE acheteurs DROP COLUMN IF EXISTS pays;
ALTER TABLE acheteurs DROP COLUMN IF EXISTS date_inscription;

-- 2. Ajouter le statut aux artisans
ALTER TABLE artisans 
  ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'actif' 
  CHECK (statut IN ('actif', 'inactif', 'suspendu'));

-- 3. Ajouter le statut aux produits
ALTER TABLE produits 
  ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'actif' 
  CHECK (statut IN ('actif', 'inactif', 'rupture'));

-- 4. Ajouter les colonnes aux commandes
ALTER TABLE commandes 
  ADD COLUMN IF NOT EXISTS adresse_livraison TEXT,
  ADD COLUMN IF NOT EXISTS notes_admin TEXT;

-- Modifier le check constraint pour le statut des commandes
ALTER TABLE commandes DROP CONSTRAINT IF EXISTS commandes_statut_check;
ALTER TABLE commandes ADD CONSTRAINT commandes_statut_check 
  CHECK (statut IN ('en_attente', 'confirmee', 'preparee', 'expediee', 'livree', 'annulee'));

-- 5. Renommer la table details_commande si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'details_commande') THEN
    ALTER TABLE details_commande RENAME TO detail_commandes;
  END IF;
END $$;

-- 6. Créer la nouvelle table panier et migrer les données de paniers si elle existe
CREATE TABLE IF NOT EXISTS panier (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  acheteur_id UUID REFERENCES acheteurs(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL CHECK (quantite > 0),
  date_ajout TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(acheteur_id, produit_id)
);

-- Migration des données de l'ancienne table paniers (JSONB) vers la nouvelle (normalisée)
DO $$
DECLARE
  r RECORD;
  item JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'paniers') THEN
    FOR r IN SELECT * FROM paniers LOOP
      FOR item IN SELECT * FROM jsonb_array_elements(r.items) LOOP
        INSERT INTO panier (acheteur_id, produit_id, quantite, date_ajout)
        VALUES (
          r.acheteur_id,
          (item->>'produit_id')::UUID,
          (item->>'quantite')::INTEGER,
          r.updated_at
        ) ON CONFLICT (acheteur_id, produit_id) DO NOTHING;
      END LOOP;
    END LOOP;
  END IF;
END $$;

-- Supprimer l'ancienne table paniers après migration
DROP TABLE IF EXISTS paniers;

-- 7. Ajouter les index manquants
CREATE INDEX IF NOT EXISTS idx_produits_statut ON produits(statut);
CREATE INDEX IF NOT EXISTS idx_artisans_statut ON artisans(statut);
CREATE INDEX IF NOT EXISTS idx_acheteurs_email ON acheteurs(email);
CREATE INDEX IF NOT EXISTS idx_panier_acheteur_id ON panier(acheteur_id);
CREATE INDEX IF NOT EXISTS idx_panier_produit_id ON panier(produit_id);

-- 8. Ajouter les triggers manquants
DROP TRIGGER IF EXISTS update_panier_updated_at ON panier;
CREATE TRIGGER update_panier_updated_at 
  BEFORE UPDATE ON panier 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Mettre à jour les policies RLS
DROP POLICY IF EXISTS "Acheteurs can view own profile" ON acheteurs;
DROP POLICY IF EXISTS "Acheteurs can update own profile" ON acheteurs;
DROP POLICY IF EXISTS "Acheteurs can view own commandes" ON commandes;
DROP POLICY IF EXISTS "Acheteurs can insert own commandes" ON commandes;
DROP POLICY IF EXISTS "Acheteurs can manage own panier" ON paniers;

-- Nouvelles policies pour le service role
CREATE POLICY IF NOT EXISTS "Service role full access acheteurs" ON acheteurs FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role full access commandes" ON commandes FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role full access detail_commandes" ON detail_commandes FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role full access panier" ON panier FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY IF NOT EXISTS "Service role full access admins" ON admins FOR ALL USING (current_setting('role') = 'service_role');

-- Activer RLS sur la nouvelle table panier
ALTER TABLE panier ENABLE ROW LEVEL SECURITY;

COMMIT;