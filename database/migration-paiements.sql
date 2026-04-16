-- Migration: Création de la table paiements
-- Date: 2025-11-25
-- Description: Table pour stocker les transactions de paiement PayDunya

CREATE TABLE IF NOT EXISTS paiements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE NOT NULL,
  montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  methode_paiement VARCHAR(50),
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'paye', 'echec', 'rembourse', 'annule')),
  numero_transaction VARCHAR(255) UNIQUE,
  numero_reference VARCHAR(255),
  details_paiement JSONB,
  date_paiement TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_paiements_commande_id ON paiements(commande_id);
CREATE INDEX IF NOT EXISTS idx_paiements_statut ON paiements(statut);
CREATE INDEX IF NOT EXISTS idx_paiements_numero_transaction ON paiements(numero_transaction);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_paiements_updated_at 
  BEFORE UPDATE ON paiements 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

-- Policy pour le service role
CREATE POLICY "Service role full access paiements" 
  ON paiements 
  FOR ALL 
  USING (current_setting('role') = 'service_role');

-- Commentaires
COMMENT ON TABLE paiements IS 'Table des transactions de paiement via PayDunya';
COMMENT ON COLUMN paiements.numero_transaction IS 'Token de transaction fourni par PayDunya';
COMMENT ON COLUMN paiements.numero_reference IS 'Référence unique du paiement';
COMMENT ON COLUMN paiements.details_paiement IS 'Données JSON du webhook PayDunya';
