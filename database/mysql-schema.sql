-- =============================================
-- SCHEMA MYSQL POUR TISSÉS DE WARANIÉNÉ
-- Migration depuis PostgreSQL/Supabase vers MySQL/Laragon
-- =============================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS waraniene_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE waraniene_db;

-- =============================================
-- TABLE: artisans
-- =============================================
CREATE TABLE IF NOT EXISTS artisans (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nom VARCHAR(255) NOT NULL,
  photo TEXT,
  bio TEXT NOT NULL,
  localisation VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL UNIQUE,
  langue VARCHAR(10) DEFAULT 'fr',
  statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
  date_inscription DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_artisans_statut (statut),
  INDEX idx_artisans_telephone (telephone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: produits
-- =============================================
CREATE TABLE IF NOT EXISTS produits (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nom_produit VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  categorie ENUM('pagne', 'vetement', 'accessoire'),
  prix DECIMAL(10,2) NOT NULL CHECK (prix > 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  statut ENUM('actif', 'inactif', 'rupture') DEFAULT 'actif',
  artisan_id CHAR(36),
  photos JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  INDEX idx_produits_artisan_id (artisan_id),
  INDEX idx_produits_categorie (categorie),
  INDEX idx_produits_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: acheteurs
-- =============================================
CREATE TABLE IF NOT EXISTS acheteurs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telephone VARCHAR(20),
  mot_de_passe VARCHAR(255) NOT NULL,
  adresse TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_acheteurs_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: commandes
-- =============================================
CREATE TABLE IF NOT EXISTS commandes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  acheteur_id CHAR(36),
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut ENUM('en_attente', 'confirmee', 'preparee', 'expediee', 'livree', 'annulee') DEFAULT 'en_attente',
  montant_total DECIMAL(10,2) NOT NULL CHECK (montant_total > 0),
  mode_paiement ENUM('orange_money', 'mtn_money', 'carte_bancaire', 'kkiapay'),
  adresse_livraison TEXT,
  notes_admin TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (acheteur_id) REFERENCES acheteurs(id) ON DELETE CASCADE,
  INDEX idx_commandes_acheteur_id (acheteur_id),
  INDEX idx_commandes_statut (statut),
  INDEX idx_commandes_date (date_commande)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: detail_commandes
-- =============================================
CREATE TABLE IF NOT EXISTS detail_commandes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  commande_id CHAR(36),
  produit_id CHAR(36),
  quantite INT NOT NULL CHECK (quantite > 0),
  prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  INDEX idx_detail_commandes_commande_id (commande_id),
  INDEX idx_detail_commandes_produit_id (produit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: panier
-- =============================================
CREATE TABLE IF NOT EXISTS panier (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  acheteur_id CHAR(36),
  produit_id CHAR(36),
  quantite INT NOT NULL CHECK (quantite > 0),
  date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (acheteur_id) REFERENCES acheteurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  UNIQUE KEY unique_acheteur_produit (acheteur_id, produit_id),
  INDEX idx_panier_acheteur_id (acheteur_id),
  INDEX idx_panier_produit_id (produit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: qr_codes
-- =============================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  produit_id CHAR(36),
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  INDEX idx_qr_codes_produit_id (produit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: admins
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('admin', 'moderateur') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLES PHASE 3: Avis, Codes Promo, Notifications, Wishlist
-- =============================================

-- TABLE: avis (Reviews)
CREATE TABLE IF NOT EXISTS avis (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  produit_id CHAR(36) NOT NULL,
  nom_acheteur VARCHAR(100) NOT NULL,
  email_acheteur VARCHAR(100) NOT NULL,
  note TINYINT NOT NULL CHECK (note >= 1 AND note <= 5),
  titre VARCHAR(200) NOT NULL,
  commentaire TEXT NOT NULL,
  achete_chez_nous BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  statut ENUM('en_attente', 'approuve', 'rejete') DEFAULT 'en_attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  INDEX idx_avis_produit_statut (produit_id, statut),
  INDEX idx_avis_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: codes_promo
CREATE TABLE IF NOT EXISTS codes_promo (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  type_reduction ENUM('pourcentage', 'montant_fixe') NOT NULL,
  valeur_reduction DECIMAL(10,2) NOT NULL,
  montant_min DECIMAL(10,2) DEFAULT 0,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  utilisations_max INT,
  utilisations_actuelles INT DEFAULT 0,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_codes_promo_code (code),
  INDEX idx_codes_promo_actif_dates (actif, date_debut, date_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: utilisations_promo
CREATE TABLE IF NOT EXISTS utilisations_promo (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  commande_id CHAR(36) NOT NULL,
  code_promo_id CHAR(36) NOT NULL,
  reduction_appliquee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (code_promo_id) REFERENCES codes_promo(id) ON DELETE CASCADE,
  INDEX idx_utilisations_promo_commande (commande_id),
  INDEX idx_utilisations_promo_code (code_promo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  acheteur_id CHAR(36),
  email VARCHAR(100),
  telephone VARCHAR(20),
  type VARCHAR(100) NOT NULL,
  statut_email VARCHAR(50) DEFAULT 'pending',
  statut_sms VARCHAR(50) DEFAULT 'pending',
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_acheteur (acheteur_id),
  INDEX idx_notifications_type (type),
  INDEX idx_notifications_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: wishlist (Favoris)
CREATE TABLE IF NOT EXISTS wishlist (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  acheteur_id CHAR(36) NOT NULL,
  produit_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  UNIQUE KEY unique_acheteur_produit_wishlist (acheteur_id, produit_id),
  INDEX idx_wishlist_acheteur (acheteur_id),
  INDEX idx_wishlist_produit (produit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: preferences_notifications
CREATE TABLE IF NOT EXISTS preferences_notifications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  acheteur_id CHAR(36) NOT NULL UNIQUE,
  email_commande BOOLEAN DEFAULT TRUE,
  email_promo BOOLEAN DEFAULT TRUE,
  email_avis BOOLEAN DEFAULT TRUE,
  sms_commande BOOLEAN DEFAULT FALSE,
  sms_promo BOOLEAN DEFAULT FALSE,
  sms_avis BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_preferences_acheteur (acheteur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DONNÉES DE TEST
-- =============================================

-- Artisans de test
INSERT INTO artisans (id, nom, bio, localisation, telephone, langue, statut) VALUES
(UUID(), 'Mamadou Koné', 'Maître tisserand avec 20 ans d''expérience dans l''art traditionnel sénoufo.', 'Waraniéné', '+225 07 12 34 56 78', 'fr', 'actif'),
(UUID(), 'Fatima Ouattara', 'Spécialiste des motifs traditionnels et des teintures naturelles.', 'Waraniéné', '+225 05 87 65 43 21', 'fr', 'actif'),
(UUID(), 'Ibrahim Silué', 'Artisan innovant qui mélange tradition et modernité.', 'Waraniéné', '+225 01 23 45 67 89', 'fr', 'actif');

-- Produits de test (après avoir récupéré les IDs des artisans)
INSERT INTO produits (id, nom_produit, description, categorie, prix, stock, statut, artisan_id, photos) 
SELECT 
  UUID(),
  'Pagne Traditionnel Sénoufo',
  'Magnifique pagne tissé à la main avec des motifs traditionnels sénoufo. Parfait pour les occasions spéciales.',
  'pagne',
  25000,
  15,
  'actif',
  a.id,
  JSON_ARRAY('placeholder-pagne-1.jpg')
FROM artisans a WHERE a.nom = 'Mamadou Koné' LIMIT 1;

INSERT INTO produits (id, nom_produit, description, categorie, prix, stock, statut, artisan_id, photos)
SELECT 
  UUID(),
  'Boubou Moderne',
  'Boubou élégant alliant style traditionnel et coupe moderne.',
  'vetement',
  45000,
  8,
  'actif',
  a.id,
  JSON_ARRAY('placeholder-boubou-1.jpg')
FROM artisans a WHERE a.nom = 'Fatima Ouattara' LIMIT 1;

INSERT INTO produits (id, nom_produit, description, categorie, prix, stock, statut, artisan_id, photos)
SELECT 
  UUID(),
  'Sac à Main Artisanal',
  'Sac à main unique tissé avec des fibres naturelles et motifs sénoufo.',
  'accessoire',
  18000,
  12,
  'actif',
  a.id,
  JSON_ARRAY('placeholder-sac-1.jpg')
FROM artisans a WHERE a.nom = 'Ibrahim Silué' LIMIT 1;

INSERT INTO produits (id, nom_produit, description, categorie, prix, stock, statut, artisan_id, photos)
SELECT 
  UUID(),
  'Écharpe Traditionnelle',
  'Écharpe douce et colorée avec des motifs géométriques traditionnels.',
  'accessoire',
  12000,
  20,
  'actif',
  a.id,
  JSON_ARRAY('placeholder-echarpe-1.jpg')
FROM artisans a WHERE a.nom = 'Fatima Ouattara' LIMIT 1;

-- Codes promo de test
INSERT INTO codes_promo (id, code, description, type_reduction, valeur_reduction, montant_min, date_debut, date_fin, utilisations_max) VALUES
(UUID(), 'BIENVENUE10', 'Bienvenue - 10% de réduction', 'pourcentage', 10, 20000, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 100),
(UUID(), 'NOEL20', 'Réduction Noël - 20%', 'pourcentage', 20, 50000, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY), 50),
(UUID(), 'LIVRAISON', 'Livraison gratuite (5000 FCFA)', 'montant_fixe', 5000, 100000, DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 200);

-- =============================================
-- VÉRIFICATION
-- =============================================
SELECT 'Base de données MySQL créée avec succès' AS status;
SELECT COUNT(*) AS artisans_count FROM artisans;
SELECT COUNT(*) AS produits_count FROM produits;
SELECT COUNT(*) AS codes_promo_count FROM codes_promo;
