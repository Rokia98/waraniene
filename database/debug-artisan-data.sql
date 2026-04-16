-- Debug: See what data we have
-- Check 1: Do we have commandes?
SELECT 'COMMANDES' as check_name, COUNT(*) as count FROM commandes;

-- Check 2: Do we have produits with artisan_id?
SELECT 'PRODUITS with artisan_id' as check_name, COUNT(*) as count 
FROM produits WHERE artisan_id IS NOT NULL;

-- Check 3: Do we have articles_commandes?
SELECT 'ARTICLES_COMMANDES' as check_name, COUNT(*) as count FROM articles_commandes;

-- Check 4: Do articles link to products that have artisan_id?
SELECT 
  'ARTICLES with artisan products' as check_name,
  COUNT(DISTINCT ac.id) as count
FROM articles_commandes ac
JOIN produits p ON ac.produit_id = p.id
WHERE p.artisan_id IS NOT NULL;

-- Check 5: See a sample commande with its articles and products
SELECT 
  c.id as commande_id,
  c.numero_commande,
  c.nom_acheteur,
  ac.id as article_id,
  p.nom_produit,
  p.artisan_id,
  a.artisan_id as artisan_ref
FROM commandes c
LEFT JOIN articles_commandes ac ON c.id = ac.commande_id
LEFT JOIN produits p ON ac.produit_id = p.id
LIMIT 20;

-- Check 6: List all artisans
SELECT id, nom FROM artisans;

-- Check 7: Match commandes to artisans via products
SELECT DISTINCT
  c.id,
  c.numero_commande,
  c.nom_acheteur,
  p.artisan_id
FROM commandes c
JOIN articles_commandes ac ON c.id = ac.commande_id
JOIN produits p ON ac.produit_id = p.id
WHERE p.artisan_id IS NOT NULL
ORDER BY c.date_commande DESC
LIMIT 10;
