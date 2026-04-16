-- Création des tables pour la plateforme Tissés de Waraniéné

-- Table des utilisateurs (étendue de auth.users)
CREATE TABLE users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nom text NOT NULL,
  prenom text NOT NULL,
  telephone text,
  adresse text,
  ville text,
  pays text DEFAULT 'Côte d''Ivoire',
  code_postal text,
  preferences_notification jsonb DEFAULT '{}',
  type_compte text CHECK (type_compte IN ('client', 'artisan')) DEFAULT 'client',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table des artisans
CREATE TABLE artisans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  nom_atelier text,
  description text,
  photo_profil text,
  photos_atelier text[],
  techniques_specialites text[],
  localisation text,
  contact_whatsapp text,
  contact_email text,
  est_verifie boolean DEFAULT false,
  note_moyenne decimal(3,2) DEFAULT 0,
  nombre_avis integer DEFAULT 0,
  date_verification timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Index pour optimiser les requêtes
  UNIQUE(user_id)
);

-- Table des catégories de produits
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL,
  description text,
  image_url text,
  parent_id uuid REFERENCES categories(id),
  est_active boolean DEFAULT true,
  ordre integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Table des produits
CREATE TABLE produits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id uuid REFERENCES artisans(id) ON DELETE CASCADE NOT NULL,
  nom text NOT NULL,
  description text NOT NULL,
  categorie_id uuid REFERENCES categories(id),
  prix decimal(10,2) NOT NULL,
  prix_promo decimal(10,2),
  images text[] NOT NULL,
  tailles_disponibles text[],
  couleurs_disponibles text[],
  stock_quantite integer DEFAULT 0,
  materiaux text[],
  techniques_fabrication text[],
  temps_fabrication text,
  personnalisable boolean DEFAULT false,
  est_actif boolean DEFAULT true,
  poids_grammes integer,
  dimensions_cm text,
  note_moyenne decimal(3,2) DEFAULT 0,
  nombre_avis integer DEFAULT 0,
  nombre_vues integer DEFAULT 0,
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table du panier
CREATE TABLE panier (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  produit_id uuid REFERENCES produits(id) ON DELETE CASCADE NOT NULL,
  quantite integer NOT NULL CHECK (quantite > 0),
  taille text,
  couleur text,
  notes_personnalisation text,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Contrainte pour éviter les doublons
  UNIQUE(user_id, produit_id, taille, couleur)
);

-- Table des commandes
CREATE TABLE commandes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  numero_commande text UNIQUE NOT NULL,
  statut text CHECK (statut IN ('en_attente', 'confirmee', 'en_preparation', 'prete', 'expediee', 'livree', 'annulee')) DEFAULT 'en_attente',
  total_produits decimal(10,2) NOT NULL,
  frais_livraison decimal(10,2) DEFAULT 0,
  total_commande decimal(10,2) NOT NULL,
  methode_paiement text CHECK (methode_paiement IN ('orange_money', 'mtn_money', 'moov_money', 'carte_bancaire', 'virement', 'especes')),
  reference_paiement text,
  statut_paiement text CHECK (statut_paiement IN ('en_attente', 'paye', 'echec', 'rembourse')) DEFAULT 'en_attente',
  
  -- Adresse de livraison
  adresse_livraison jsonb NOT NULL,
  
  -- Dates importantes
  date_livraison_prevue timestamp with time zone,
  date_livraison_reelle timestamp with time zone,
  
  notes_commande text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table des articles de commande
CREATE TABLE articles_commande (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id uuid REFERENCES commandes(id) ON DELETE CASCADE NOT NULL,
  produit_id uuid REFERENCES produits(id) NOT NULL,
  artisan_id uuid REFERENCES artisans(id) NOT NULL,
  quantite integer NOT NULL CHECK (quantite > 0),
  prix_unitaire decimal(10,2) NOT NULL,
  prix_total decimal(10,2) NOT NULL,
  taille text,
  couleur text,
  notes_personnalisation text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table des avis produits
CREATE TABLE avis_produits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  produit_id uuid REFERENCES produits(id) ON DELETE CASCADE NOT NULL,
  commande_id uuid REFERENCES commandes(id),
  note integer CHECK (note >= 1 AND note <= 5) NOT NULL,
  commentaire text,
  photos text[],
  est_verifie boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Un utilisateur ne peut donner qu'un avis par produit
  UNIQUE(user_id, produit_id)
);

-- Table des favoris
CREATE TABLE favoris (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  produit_id uuid REFERENCES produits(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, produit_id)
);

-- Table des notifications
CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  titre text NOT NULL,
  message text NOT NULL,
  donnees jsonb,
  est_lue boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Insertion des catégories de base
INSERT INTO categories (nom, description) VALUES
('Bogolan', 'Tissus traditionnels teints à la boue'),
('Kente', 'Tissus colorés aux motifs géométriques'),
('Indigo', 'Tissus teints à l''indigo naturel'),
('Raphia', 'Tissus en fibres de raphia'),
('Coton Bio', 'Tissus en coton biologique local'),
('Accessoires', 'Sacs, chaussures et accessoires traditionnels');

-- Triggers pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_artisans_updated_at BEFORE UPDATE ON artisans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON commandes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function pour générer les numéros de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_commande := 'TW' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('order_sequence')::text, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les numéros de commande
CREATE SEQUENCE order_sequence START 1;

CREATE TRIGGER set_order_number BEFORE INSERT ON commandes FOR EACH ROW EXECUTE PROCEDURE generate_order_number();

-- Index pour améliorer les performances
CREATE INDEX idx_produits_artisan ON produits(artisan_id);
CREATE INDEX idx_produits_categorie ON produits(categorie_id);
CREATE INDEX idx_produits_actif ON produits(est_actif);
CREATE INDEX idx_commandes_user ON commandes(user_id);
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_panier_user ON panier(user_id);
CREATE INDEX idx_avis_produit ON avis_produits(produit_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, est_lue);

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE panier ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users
CREATE POLICY "Utilisateurs peuvent voir leur profil" ON users FOR ALL TO authenticated USING (auth.uid() = id);

-- Politiques RLS pour artisans
CREATE POLICY "Tout le monde peut voir les artisans" ON artisans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Artisans peuvent modifier leur profil" ON artisans FOR ALL TO authenticated USING (user_id = auth.uid());

-- Politiques RLS pour produits
CREATE POLICY "Tout le monde peut voir les produits actifs" ON produits FOR SELECT TO authenticated USING (est_actif = true);
CREATE POLICY "Artisans peuvent gérer leurs produits" ON produits FOR ALL TO authenticated USING (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()));

-- Politiques RLS pour panier
CREATE POLICY "Utilisateurs peuvent gérer leur panier" ON panier FOR ALL TO authenticated USING (user_id = auth.uid());

-- Politiques RLS pour commandes
CREATE POLICY "Utilisateurs peuvent voir leurs commandes" ON commandes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Utilisateurs peuvent créer des commandes" ON commandes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Artisans peuvent voir les commandes de leurs produits" ON commandes FOR SELECT TO authenticated USING (
    id IN (
        SELECT DISTINCT ac.commande_id 
        FROM articles_commande ac 
        JOIN artisans a ON ac.artisan_id = a.id 
        WHERE a.user_id = auth.uid()
    )
);

-- Politiques RLS pour articles_commande
CREATE POLICY "Utilisateurs peuvent voir leurs articles" ON articles_commande FOR SELECT TO authenticated USING (
    commande_id IN (SELECT id FROM commandes WHERE user_id = auth.uid())
);
CREATE POLICY "Artisans peuvent voir leurs articles vendus" ON articles_commande FOR SELECT TO authenticated USING (
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
);

-- Politiques RLS pour avis
CREATE POLICY "Tout le monde peut voir les avis" ON avis_produits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Utilisateurs peuvent gérer leurs avis" ON avis_produits FOR ALL TO authenticated USING (user_id = auth.uid());

-- Politiques RLS pour favoris
CREATE POLICY "Utilisateurs peuvent gérer leurs favoris" ON favoris FOR ALL TO authenticated USING (user_id = auth.uid());

-- Politiques RLS pour notifications
CREATE POLICY "Utilisateurs peuvent voir leurs notifications" ON notifications FOR ALL TO authenticated USING (user_id = auth.uid());