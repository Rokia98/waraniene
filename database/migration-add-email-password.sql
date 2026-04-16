-- Migration: Ajouter les colonnes manquantes à la table artisans
-- Date: 2026-03-26

USE waraniene_db;

-- Ajouter la colonne email si elle n'existe pas
ALTER TABLE artisans 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE AFTER nom;

-- Ajouter la colonne password si elle n'existe pas
ALTER TABLE artisans 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) AFTER email;

-- Créer un index sur email
CREATE INDEX IF NOT EXISTS idx_artisans_email ON artisans(email);

-- Vérification
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'waraniene_db' 
  AND TABLE_NAME = 'artisans'
ORDER BY ORDINAL_POSITION;

-- Afficher le résultat
SELECT 'Migration terminée - Colonnes email et password ajoutées à artisans' AS status;
