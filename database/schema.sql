-- Création des tables pour Tissés de Waraniéné

-- Table des artisans
CREATE TABLE IF NOT EXISTS artisans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  photo TEXT,
  bio TEXT NOT NULL,
  localisation VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL UNIQUE,
  langue VARCHAR(10) DEFAULT 'fr',
  statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
  date_inscription DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE IF NOT EXISTS produits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_produit VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  categorie VARCHAR(20) CHECK (categorie IN ('pagne', 'vetement', 'accessoire')),
  prix DECIMAL(10,2) NOT NULL CHECK (prix > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'rupture')),
  artisan_id UUID REFERENCES artisans(id) ON DELETE CASCADE,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des acheteurs
CREATE TABLE IF NOT EXISTS acheteurs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telephone VARCHAR(20),
  mot_de_passe VARCHAR(255) NOT NULL,
  adresse TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS commandes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  acheteur_id UUID REFERENCES acheteurs(id) ON DELETE CASCADE,
  date_commande TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'preparee', 'expediee', 'livree', 'annulee')),
  montant_total DECIMAL(10,2) NOT NULL CHECK (montant_total > 0),
  mode_paiement VARCHAR(20) CHECK (mode_paiement IN ('orange_money', 'mtn_money', 'carte_bancaire')),
  adresse_livraison TEXT,
  notes_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des détails de commande
CREATE TABLE IF NOT EXISTS detail_commandes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL CHECK (quantite > 0),
  prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table du panier (articles individuels)
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

-- Table des codes QR
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des administrateurs
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'moderateur')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_produits_artisan_id ON produits(artisan_id);
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie);
CREATE INDEX IF NOT EXISTS idx_commandes_acheteur_id ON commandes(acheteur_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_detail_commandes_commande_id ON detail_commandes(commande_id);
CREATE INDEX IF NOT EXISTS idx_detail_commandes_produit_id ON detail_commandes(produit_id);
CREATE INDEX IF NOT EXISTS idx_panier_acheteur_id ON panier(acheteur_id);
CREATE INDEX IF NOT EXISTS idx_panier_produit_id ON panier(produit_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_produit_id ON qr_codes(produit_id);
CREATE INDEX IF NOT EXISTS idx_produits_statut ON produits(statut);
CREATE INDEX IF NOT EXISTS idx_artisans_statut ON artisans(statut);
CREATE INDEX IF NOT EXISTS idx_acheteurs_email ON acheteurs(email);

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_artisans_updated_at BEFORE UPDATE ON artisans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acheteurs_updated_at BEFORE UPDATE ON acheteurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON commandes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_panier_updated_at BEFORE UPDATE ON panier FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE acheteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE panier ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies pour lecture publique des artisans et produits
CREATE POLICY "Artisans are viewable by everyone" ON artisans FOR SELECT USING (true);
CREATE POLICY "Produits are viewable by everyone" ON produits FOR SELECT USING (true);
CREATE POLICY "QR codes are viewable by everyone" ON qr_codes FOR SELECT USING (true);

-- Policies pour administration via service role (nos APIs utilisent service_role)
-- Les APIs gèrent l'autorisation avec JWT custom

-- Permettre toutes les opérations pour le service role
CREATE POLICY "Service role full access acheteurs" ON acheteurs FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role full access commandes" ON commandes FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role full access detail_commandes" ON detail_commandes FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role full access panier" ON panier FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role full access admins" ON admins FOR ALL USING (current_setting('role') = 'service_role');

-- Données de test
INSERT INTO artisans (nom, bio, localisation, telephone, langue, statut) VALUES
('Mamadou Koné', 'Maître tisserand avec 20 ans d''expérience dans l''art traditionnel sénoufo.', 'Waraniéné', '+225 07 12 34 56 78', 'fr', 'actif'),
('Fatima Ouattara', 'Spécialiste des motifs traditionnels et des teintures naturelles.', 'Waraniéné', '+225 05 87 65 43 21', 'fr', 'actif'),
('Ibrahim Silué', 'Artisan innovant qui mélange tradition et modernité.', 'Waraniéné', '+225 01 23 45 67 89', 'fr', 'actif');

INSERT INTO produits (nom_produit, description, categorie, prix, stock, statut, artisan_id, photos) VALUES
('Pagne Traditionnel Sénoufo', 'Magnifique pagne tissé à la main avec des motifs traditionnels sénoufo. Parfait pour les occasions spéciales.', 'pagne', 25000, 15, 'actif', (SELECT id FROM artisans WHERE nom = 'Mamadou Koné'), '{"placeholder-pagne-1.jpg"}'),
('Boubou Moderne', 'Boubou élégant alliant style traditionnel et coupe moderne.', 'vetement', 45000, 8, 'actif', (SELECT id FROM artisans WHERE nom = 'Fatima Ouattara'), '{"placeholder-boubou-1.jpg"}'),
('Sac à Main Artisanal', 'Sac à main unique tissé avec des fibres naturelles et motifs sénoufo.', 'accessoire', 18000, 12, 'actif', (SELECT id FROM artisans WHERE nom = 'Ibrahim Silué'), '{"placeholder-sac-1.jpg"}'),
('Écharpe Traditionnelle', 'Écharpe douce et colorée avec des motifs géométriques traditionnels.', 'accessoire', 12000, 20, 'actif', (SELECT id FROM artisans WHERE nom = 'Fatima Ouattara'), '{"placeholder-echarpe-1.jpg"}');