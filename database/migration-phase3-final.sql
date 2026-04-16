-- Phase 3: Avis, Codes Promo, Notifications, Wishlist
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. TABLE AVIS (Reviews)
CREATE TABLE IF NOT EXISTS avis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  nom_acheteur VARCHAR(100) NOT NULL,
  email_acheteur VARCHAR(100) NOT NULL,
  note SMALLINT NOT NULL CHECK (note >= 1 AND note <= 5),
  titre VARCHAR(200) NOT NULL,
  commentaire TEXT NOT NULL,
  achete_chez_nous BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  statut VARCHAR(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_avis_produit_statut ON avis(produit_id, statut);
CREATE INDEX IF NOT EXISTS idx_avis_created_at ON avis(created_at DESC);

-- 2. TABLE CODES PROMO
CREATE TABLE IF NOT EXISTS codes_promo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  type_reduction VARCHAR(50) NOT NULL CHECK (type_reduction IN ('pourcentage', 'montant_fixe')),
  valeur_reduction DECIMAL(10,2) NOT NULL,
  montant_min DECIMAL(10,2) DEFAULT 0,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  utilisations_max INTEGER,
  utilisations_actuelles INTEGER DEFAULT 0,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_codes_promo_code ON codes_promo(code);
CREATE INDEX IF NOT EXISTS idx_codes_promo_actif_dates ON codes_promo(actif, date_debut, date_fin);

-- 3. TABLE UTILISATIONS PROMO
CREATE TABLE IF NOT EXISTS utilisations_promo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  code_promo_id UUID NOT NULL REFERENCES codes_promo(id) ON DELETE CASCADE,
  reduction_appliquee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_utilisations_promo_commande ON utilisations_promo(commande_id);
CREATE INDEX IF NOT EXISTS idx_utilisations_promo_code ON utilisations_promo(code_promo_id);

-- 4. TABLE NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acheteur_id UUID,
  email VARCHAR(100),
  telephone VARCHAR(20),
  type VARCHAR(100) NOT NULL,
  statut_email VARCHAR(50) DEFAULT 'pending',
  statut_sms VARCHAR(50) DEFAULT 'pending',
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_acheteur ON notifications(acheteur_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 5. TABLE WISHLIST (Favoris)
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acheteur_id UUID NOT NULL,
  produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(acheteur_id, produit_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_acheteur ON wishlist(acheteur_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_produit ON wishlist(produit_id);

-- 6. TABLE PREFERENCES NOTIFICATIONS
CREATE TABLE IF NOT EXISTS preferences_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acheteur_id UUID NOT NULL UNIQUE,
  email_commande BOOLEAN DEFAULT true,
  email_promo BOOLEAN DEFAULT true,
  email_avis BOOLEAN DEFAULT true,
  sms_commande BOOLEAN DEFAULT false,
  sms_promo BOOLEAN DEFAULT false,
  sms_avis BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_preferences_acheteur ON preferences_notifications(acheteur_id);

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================

-- Activer RLS
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes_promo ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences_notifications ENABLE ROW LEVEL SECURITY;

-- Policies AVIS - Tous peuvent voir les avis approuvés
CREATE POLICY IF NOT EXISTS "Avis approuves sont publics" ON avis
  FOR SELECT
  USING (statut = 'approuve');

-- Policies CODES PROMO - Tous peuvent voir les codes actifs
CREATE POLICY IF NOT EXISTS "Codes promo actifs sont publics" ON codes_promo
  FOR SELECT
  USING (actif = true AND CURRENT_DATE BETWEEN date_debut AND date_fin);

-- Policies WISHLIST - Les utilisateurs gèrent leur wishlist
CREATE POLICY IF NOT EXISTS "Utilisateurs voient leur wishlist" ON wishlist
  FOR SELECT
  USING (acheteur_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Utilisateurs gèrent leur wishlist" ON wishlist
  FOR INSERT
  WITH CHECK (acheteur_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Utilisateurs suppriment leur wishlist" ON wishlist
  FOR DELETE
  USING (acheteur_id = auth.uid());

-- Policies PREFERENCES - Les utilisateurs gèrent leurs préférences
CREATE POLICY IF NOT EXISTS "Utilisateurs voient leurs préférences" ON preferences_notifications
  FOR SELECT
  USING (acheteur_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Utilisateurs mettent à jour leurs préférences" ON preferences_notifications
  FOR UPDATE
  USING (acheteur_id = auth.uid());

-- =====================
-- DONNEES DE TEST
-- =====================

-- Insérer des codes promo de test
INSERT INTO codes_promo (code, description, type_reduction, valeur_reduction, montant_min, date_debut, date_fin, utilisations_max) VALUES
('BIENVENUE10', 'Bienvenue - 10% de réduction', 'pourcentage', 10, 20000, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', 100),
('NOEL20', 'Réduction Noël - 20%', 'pourcentage', 20, 50000, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 50),
('LIVRAISON', 'Livraison gratuite (5000 FCFA)', 'montant_fixe', 5000, 100000, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '90 days', 200)
ON CONFLICT (code) DO NOTHING;

-- Confirmation
SELECT 
  'Tables Phase 3 créées avec succès' as status,
  (SELECT COUNT(*) FROM codes_promo) as codes_promo_count;
