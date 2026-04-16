-- Migration: Populate artisan order management data
-- This migration fills in the missing data for artisan order management

-- 1. Populate nom_acheteur, email_acheteur, telephone_acheteur from acheteurs table
UPDATE commandes c
SET 
  nom_acheteur = COALESCE(c.nom_acheteur, a.nom || ' ' || a.prenom),
  email_acheteur = COALESCE(c.email_acheteur, a.email),
  telephone_acheteur = COALESCE(c.telephone_acheteur, a.telephone)
FROM acheteurs a
WHERE c.acheteur_id = a.id 
AND (c.nom_acheteur IS NULL OR c.email_acheteur IS NULL OR c.telephone_acheteur IS NULL);

-- 2. Generate numero_commande if empty
UPDATE commandes
SET numero_commande = 'CMD-' || substring(id::text, 1, 8) || '-' || to_char(date_commande, 'MMDD')
WHERE numero_commande IS NULL OR numero_commande = '';

-- 3. Populate articles_commandes from detail_commandes if not already done
INSERT INTO articles_commandes (commande_id, produit_id, quantite, prix_unitaire, created_at)
SELECT dc.commande_id, dc.produit_id, dc.quantite, dc.prix_unitaire, dc.created_at
FROM detail_commandes dc
WHERE NOT EXISTS (
  SELECT 1 FROM articles_commandes ac 
  WHERE ac.commande_id = dc.commande_id AND ac.produit_id = dc.produit_id
)
ON CONFLICT (commande_id, produit_id) DO NOTHING;

-- 4. Populate statut_paiement based on statut column
UPDATE commandes
SET statut_paiement = 
  CASE 
    WHEN statut IN ('confirmee', 'preparee', 'expediee', 'livree') THEN 'completed'
    WHEN statut = 'annulee' THEN 'failed'
    ELSE 'pending'
  END
WHERE statut_paiement IS NULL OR statut_paiement = '';

-- 5. Populate statut_livraison based on statut column (mapping old to new)
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
WHERE statut_livraison IS NULL OR statut_livraison = '';

-- 6. Set date_expedition if statut_livraison is expediee or en_livraison
UPDATE commandes
SET date_expedition = COALESCE(date_expedition, updated_at)
WHERE (statut_livraison IN ('expediee', 'en_livraison'))
AND date_expedition IS NULL;

-- 7. Set date_livraison if statut_livraison is livree
UPDATE commandes
SET date_livraison = COALESCE(date_livraison, updated_at)
WHERE statut_livraison = 'livree'
AND date_livraison IS NULL;

-- Verify the data was populated
SELECT 
  COUNT(*) as total_commandes,
  COUNT(CASE WHEN nom_acheteur IS NOT NULL THEN 1 END) as with_nom,
  COUNT(CASE WHEN email_acheteur IS NOT NULL THEN 1 END) as with_email,
  COUNT(CASE WHEN numero_commande IS NOT NULL THEN 1 END) as with_numero,
  COUNT(CASE WHEN statut_livraison IS NOT NULL THEN 1 END) as with_statut_livraison
FROM commandes;

-- Check articles_commandes
SELECT 
  COUNT(*) as total_articles,
  COUNT(DISTINCT commande_id) as commandes_with_articles
FROM articles_commandes;

-- Show sample data
SELECT 
  c.id,
  c.numero_commande,
  c.nom_acheteur,
  c.email_acheteur,
  c.statut_paiement,
  c.statut_livraison,
  COUNT(ac.id) as nb_articles
FROM commandes c
LEFT JOIN articles_commandes ac ON c.id = ac.commande_id
WHERE c.numero_commande IS NOT NULL
GROUP BY c.id, c.numero_commande, c.nom_acheteur, c.email_acheteur, c.statut_paiement, c.statut_livraison
LIMIT 10;
