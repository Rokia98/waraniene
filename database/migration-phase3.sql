-- ============================================
-- PHASE 3 - MIGRATIONS SCHEMA
-- ============================================

-- 1. TABLE AVIS (Reviews/Ratings)
CREATE TABLE IF NOT EXISTS avis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produit_id UUID REFERENCES produits(id) ON DELETE CASCADE NOT NULL,
  nom_acheteur VARCHAR(255) NOT NULL,
  email_acheteur VARCHAR(255) NOT NULL,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  titre VARCHAR(255) NOT NULL,
  commentaire TEXT NOT NULL,
  achete_chez_nous BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_avis_produit_id ON avis(produit_id);
CREATE INDEX idx_avis_statut ON avis(statut);

-- 2. TABLE CODES PROMO
CREATE TABLE IF NOT EXISTS codes_promo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  reduction DECIMAL(10,2) NOT NULL,
  type_reduction VARCHAR(20) CHECK (type_reduction IN ('pourcentage', 'montant_fixe')),
  montant_min DECIMAL(10,2) DEFAULT 0,
  utilisations INTEGER DEFAULT 0,
  utilisations_max INTEGER,
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  actif BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_codes_promo_code ON codes_promo(code);
CREATE INDEX idx_codes_promo_actif ON codes_promo(actif);

-- 3. TABLE NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(20),
  statut VARCHAR(20) DEFAULT 'envoyee' CHECK (statut IN ('envoyee', 'echouee', 'en_attente')),
  contenu TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_commande_id ON notifications(commande_id);
CREATE INDEX idx_notifications_type ON notifications(type);

-- 4. TABLE UTILISATION CODES PROMO
CREATE TABLE IF NOT EXISTS utilisations_promo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_promo_id UUID REFERENCES codes_promo(id) ON DELETE CASCADE NOT NULL,
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE NOT NULL,
  reduction_appliquee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_utilisations_promo_code ON utilisations_promo(code_promo_id);
CREATE INDEX idx_utilisations_promo_commande ON utilisations_promo(commande_id);

-- 5. TABLE WISHLIST (Favoris)
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_acheteur VARCHAR(255) NOT NULL,
  produit_id UUID REFERENCES produits(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email_acheteur, produit_id)
);

CREATE INDEX idx_wishlist_email ON wishlist(email_acheteur);
CREATE INDEX idx_wishlist_produit ON wishlist(produit_id);

-- RLS POLICIES
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes_promo ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilisations_promo ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Policies publiques pour lecture
CREATE POLICY "Avis visible par tous (approuves)" ON avis FOR SELECT USING (statut = 'approuve');
CREATE POLICY "Codes promo visibles (actifs)" ON codes_promo FOR SELECT USING (actif = true);

-- Données d'exemple
INSERT INTO codes_promo (code, reduction, type_reduction, montant_min, date_debut, date_fin, actif, description) 
VALUES 
  ('BIENVENUE10', 10, 'pourcentage', 50000, NOW(), NOW() + INTERVAL '30 days', true, 'Code bienvenue: 10% de réduction'),
  ('NOEL20', 20, 'pourcentage', 100000, NOW(), NOW() + INTERVAL '31 days', true, 'Promo Noël: 20% jusqu\'au 31 décembre'),
  ('LIVRAISON', 5000, 'montant_fixe', 50000, NOW(), NOW() + INTERVAL '60 days', true, '5000 CFA sur la livraison');
