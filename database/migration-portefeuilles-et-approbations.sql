-- =============================================
-- MIGRATION: Système de Portefeuilles et Approbation Produits
-- Date: 2026-03-26
-- Description: 
--   1. Portefeuilles pour artisans et admin (10% commission)
--   2. Système de transactions financières
--   3. Approbation des produits par admin
--   4. Distribution automatique des revenus
-- =============================================

USE waraniene_db;

-- =============================================
-- TABLE: portefeuilles
-- Gère les comptes financiers des artisans et admin
-- =============================================
CREATE TABLE IF NOT EXISTS portefeuilles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  artisan_id CHAR(36) UNIQUE,  -- NULL pour le portefeuille admin
  type_portefeuille ENUM('artisan', 'admin') NOT NULL,
  solde DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (solde >= 0),
  solde_en_attente DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (solde_en_attente >= 0), -- Argent des commandes non livrées
  total_revenus DECIMAL(10,2) NOT NULL DEFAULT 0.00,  -- Total historique des revenus
  total_retraits DECIMAL(10,2) NOT NULL DEFAULT 0.00,  -- Total historique des retraits
  statut ENUM('actif', 'suspendu', 'bloque') DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  INDEX idx_portefeuilles_artisan (artisan_id),
  INDEX idx_portefeuilles_type (type_portefeuille)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: transactions_financieres
-- Historique de tous les mouvements d'argent
-- =============================================
CREATE TABLE IF NOT EXISTS transactions_financieres (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  portefeuille_id CHAR(36) NOT NULL,
  type_transaction ENUM('credit_vente', 'credit_remboursement', 'debit_retrait', 'credit_commission') NOT NULL,
  montant DECIMAL(10,2) NOT NULL CHECK (montant != 0),
  solde_avant DECIMAL(10,2) NOT NULL,
  solde_apres DECIMAL(10,2) NOT NULL,
  commande_id CHAR(36),  -- Référence à la commande si applicable
  produit_id CHAR(36),   -- Référence au produit vendu
  description TEXT,
  metadata JSON,  -- Informations supplémentaires (pourcentage commission, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portefeuille_id) REFERENCES portefeuilles(id) ON DELETE CASCADE,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE SET NULL,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL,
  INDEX idx_transactions_portefeuille (portefeuille_id),
  INDEX idx_transactions_type (type_transaction),
  INDEX idx_transactions_commande (commande_id),
  INDEX idx_transactions_date (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: retraits (Demandes de retrait artisans)
-- =============================================
CREATE TABLE IF NOT EXISTS retraits (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  portefeuille_id CHAR(36) NOT NULL,
  artisan_id CHAR(36) NOT NULL,
  montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  statut ENUM('en_attente', 'approuve', 'traite', 'rejete') DEFAULT 'en_attente',
  methode_retrait ENUM('orange_money', 'mtn_money', 'virement', 'especes') NOT NULL,
  numero_telephone VARCHAR(20),  -- Pour mobile money
  coordonnees_bancaires TEXT,    -- Pour virements
  notes_artisan TEXT,
  notes_admin TEXT,
  date_approbation TIMESTAMP NULL,
  date_traitement TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (portefeuille_id) REFERENCES portefeuilles(id) ON DELETE CASCADE,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  INDEX idx_retraits_portefeuille (portefeuille_id),
  INDEX idx_retraits_artisan (artisan_id),
  INDEX idx_retraits_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- MODIFICATION: Ajout du statut d'approbation aux produits
-- =============================================

-- Vérifier et ajouter la colonne statut_approbation
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_schema = 'waraniene_db' 
  AND table_name = 'produits' 
  AND column_name = 'statut_approbation';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE produits ADD COLUMN statut_approbation ENUM(''en_attente'', ''approuve'', ''rejete'') DEFAULT ''en_attente'' AFTER statut',
  'SELECT ''Column statut_approbation already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérifier et ajouter la colonne date_approbation
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_schema = 'waraniene_db' 
  AND table_name = 'produits' 
  AND column_name = 'date_approbation';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE produits ADD COLUMN date_approbation TIMESTAMP NULL',
  'SELECT ''Column date_approbation already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérifier et ajouter la colonne approuve_par
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_schema = 'waraniene_db' 
  AND table_name = 'produits' 
  AND column_name = 'approuve_par';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE produits ADD COLUMN approuve_par CHAR(36)',
  'SELECT ''Column approuve_par already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérifier et ajouter la colonne notes_approbation
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_schema = 'waraniene_db' 
  AND table_name = 'produits' 
  AND column_name = 'notes_approbation';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE produits ADD COLUMN notes_approbation TEXT',
  'SELECT ''Column notes_approbation already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter l'index si nécessaire (géré manuellement car IF NOT EXISTS non supporté pour INDEX)
-- Si l'index existe déjà, cette ligne générera une erreur ignorable

-- =============================================
-- TABLE: paiements (Si elle n'existe pas encore)
-- =============================================
CREATE TABLE IF NOT EXISTS paiements (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  commande_id CHAR(36) NOT NULL,
  montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  methode_paiement VARCHAR(50),
  statut ENUM('en_attente', 'paye', 'echec', 'rembourse', 'annule') DEFAULT 'en_attente',
  numero_transaction VARCHAR(255) UNIQUE,
  numero_reference VARCHAR(255),
  details_paiement JSON,
  date_paiement TIMESTAMP NULL,
  revenus_distribues BOOLEAN DEFAULT FALSE,  -- Indique si les revenus ont été distribués aux portefeuilles
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  INDEX idx_paiements_commande (commande_id),
  INDEX idx_paiements_statut (statut),
  INDEX idx_paiements_transaction (numero_transaction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TRIGGERS: Distribution automatique des revenus
-- =============================================

DELIMITER $$

-- Trigger: Créer automatiquement un portefeuille quand un artisan est créé
CREATE TRIGGER IF NOT EXISTS create_portefeuille_for_artisan
AFTER INSERT ON artisans
FOR EACH ROW
BEGIN
  INSERT INTO portefeuilles (artisan_id, type_portefeuille, solde, solde_en_attente, total_revenus, total_retraits, statut)
  VALUES (NEW.id, 'artisan', 0.00, 0.00, 0.00, 0.00, 'actif');
END$$

DELIMITER ;

-- =============================================
-- INITIALISATION: Créer le portefeuille admin
-- =============================================
INSERT INTO portefeuilles (id, artisan_id, type_portefeuille, solde, solde_en_attente, total_revenus, total_retraits, statut)
VALUES 
  ('admin-wallet-001', NULL, 'admin', 0.00, 0.00, 0.00, 0.00, 'actif')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- =============================================
-- CRÉER DES PORTEFEUILLES POUR LES ARTISANS EXISTANTS
-- =============================================
INSERT INTO portefeuilles (artisan_id, type_portefeuille, solde, solde_en_attente, total_revenus, total_retraits, statut)
SELECT 
  a.id, 
  'artisan', 
  0.00, 
  0.00, 
  0.00, 
  0.00, 
  'actif'
FROM artisans a
WHERE NOT EXISTS (
  SELECT 1 FROM portefeuilles p WHERE p.artisan_id = a.id
);

-- =============================================
-- APPROUVER TOUS LES PRODUITS EXISTANTS (migration one-time)
-- =============================================
UPDATE produits 
SET statut_approbation = 'approuve', 
    date_approbation = CURRENT_TIMESTAMP
WHERE statut_approbation = 'en_attente';

-- =============================================
-- COMMENTAIRES
-- =============================================
ALTER TABLE portefeuilles 
  COMMENT = 'Portefeuilles financiers des artisans et admin (10% commission)';

ALTER TABLE transactions_financieres 
  COMMENT = 'Historique complet de toutes les transactions financières';

ALTER TABLE retraits 
  COMMENT = 'Demandes de retrait des artisans';

-- =============================================
-- PROCÉDURE STOCKÉE: Distribuer les revenus d'un paiement
-- =============================================
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS distribuer_revenus_paiement(
  IN p_paiement_id CHAR(36)
)
BEGIN
  DECLARE v_commande_id CHAR(36);
  DECLARE v_montant_paiement DECIMAL(10,2);
  DECLARE v_deja_distribue BOOLEAN;
  DECLARE v_admin_wallet_id CHAR(36);
  
  -- Récupérer les infos du paiement
  SELECT commande_id, montant, revenus_distribues 
  INTO v_commande_id, v_montant_paiement, v_deja_distribue
  FROM paiements 
  WHERE id = p_paiement_id AND statut = 'paye';
  
  -- Vérifier que le paiement existe et n'a pas déjà été distribué
  IF v_commande_id IS NOT NULL AND v_deja_distribue = FALSE THEN
    
    -- Récupérer l'ID du portefeuille admin
    SELECT id INTO v_admin_wallet_id 
    FROM portefeuilles 
    WHERE type_portefeuille = 'admin' 
    LIMIT 1;
    
    -- Pour chaque produit dans la commande
    BEGIN
      DECLARE done INT DEFAULT FALSE;
      DECLARE v_detail_id, v_produit_id, v_artisan_id, v_portefeuille_id CHAR(36);
      DECLARE v_quantite INT;
      DECLARE v_prix_unitaire, v_montant_ligne, v_part_artisan, v_part_admin DECIMAL(10,2);
      
      DECLARE cur CURSOR FOR 
        SELECT dc.id, dc.produit_id, dc.quantite, dc.prix_unitaire, p.artisan_id
        FROM detail_commandes dc
        INNER JOIN produits p ON dc.produit_id = p.id
        WHERE dc.commande_id = v_commande_id;
      
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
      
      OPEN cur;
      
      read_loop: LOOP
        FETCH cur INTO v_detail_id, v_produit_id, v_quantite, v_prix_unitaire, v_artisan_id;
        
        IF done THEN
          LEAVE read_loop;
        END IF;
        
        -- Calculer les montants
        SET v_montant_ligne = v_quantite * v_prix_unitaire;
        SET v_part_artisan = ROUND(v_montant_ligne * 0.90, 2);  -- 90% pour l'artisan
        SET v_part_admin = ROUND(v_montant_ligne * 0.10, 2);    -- 10% pour l'admin
        
        -- Récupérer l'ID du portefeuille de l'artisan
        SELECT id INTO v_portefeuille_id 
        FROM portefeuilles 
        WHERE artisan_id = v_artisan_id;
        
        -- Créditer le portefeuille de l'artisan (en attente jusqu'à livraison)
        UPDATE portefeuilles 
        SET solde_en_attente = solde_en_attente + v_part_artisan,
            total_revenus = total_revenus + v_part_artisan
        WHERE id = v_portefeuille_id;
        
        -- Enregistrer la transaction artisan
        INSERT INTO transactions_financieres (
          portefeuille_id, type_transaction, montant, solde_avant, solde_apres,
          commande_id, produit_id, description, metadata
        ) 
        SELECT 
          v_portefeuille_id,
          'credit_vente',
          v_part_artisan,
          solde,
          solde,
          v_commande_id,
          v_produit_id,
          CONCAT('Vente produit - Commande #', SUBSTRING(v_commande_id, 1, 8)),
          JSON_OBJECT(
            'pourcentage_artisan', 90,
            'montant_total_ligne', v_montant_ligne,
            'quantite', v_quantite,
            'statut', 'en_attente_confirmation'
          )
        FROM portefeuilles 
        WHERE id = v_portefeuille_id;
        
        -- Créditer le portefeuille admin (commission)
        UPDATE portefeuilles 
        SET solde_en_attente = solde_en_attente + v_part_admin,
            total_revenus = total_revenus + v_part_admin
        WHERE id = v_admin_wallet_id;
        
        -- Enregistrer la transaction admin
        INSERT INTO transactions_financieres (
          portefeuille_id, type_transaction, montant, solde_avant, solde_apres,
          commande_id, produit_id, description, metadata
        ) 
        SELECT 
          v_admin_wallet_id,
          'credit_commission',
          v_part_admin,
          solde,
          solde,
          v_commande_id,
          v_produit_id,
          CONCAT('Commission 10% - Commande #', SUBSTRING(v_commande_id, 1, 8)),
          JSON_OBJECT(
            'pourcentage_commission', 10,
            'montant_total_ligne', v_montant_ligne,
            'artisan_id', v_artisan_id
          )
        FROM portefeuilles 
        WHERE id = v_admin_wallet_id;
        
      END LOOP;
      
      CLOSE cur;
    END;
    
    -- Marquer le paiement comme distribué
    UPDATE paiements 
    SET revenus_distribues = TRUE 
    WHERE id = p_paiement_id;
    
  END IF;
END$$

DELIMITER ;

-- =============================================
-- PROCÉDURE: Confirmer les revenus lors de la livraison
-- =============================================
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS confirmer_revenus_commande(
  IN p_commande_id CHAR(36)
)
BEGIN
  -- Transférer les soldes en_attente vers solde disponible
  -- Pour tous les portefeuilles liés à cette commande
  
  UPDATE portefeuilles p
  INNER JOIN transactions_financieres tf ON p.id = tf.portefeuille_id
  SET p.solde = p.solde + (
    SELECT IFNULL(SUM(montant), 0)
    FROM transactions_financieres
    WHERE portefeuille_id = p.id 
      AND commande_id = p_commande_id
      AND type_transaction IN ('credit_vente', 'credit_commission')
  ),
  p.solde_en_attente = p.solde_en_attente - (
    SELECT IFNULL(SUM(montant), 0)
    FROM transactions_financieres
    WHERE portefeuille_id = p.id 
      AND commande_id = p_commande_id
      AND type_transaction IN ('credit_vente', 'credit_commission')
  )
  WHERE tf.commande_id = p_commande_id
    AND JSON_EXTRACT(tf.metadata, '$.statut') = 'en_attente_confirmation';
  
  -- Mettre à jour le statut dans les transactions
  UPDATE transactions_financieres
  SET metadata = JSON_SET(metadata, '$.statut', 'confirme')
  WHERE commande_id = p_commande_id
    AND JSON_EXTRACT(metadata, '$.statut') = 'en_attente_confirmation';
    
END$$

DELIMITER ;
