/**
 * Service Produits pour MySQL
 * Exemple d'adaptation depuis Supabase
 */

import { query, execute, generateUUID } from '@/lib/mysql';

export interface Produit {
  id: string;
  nom_produit: string;
  description: string;
  categorie: 'pagne' | 'vetement' | 'accessoire';
  prix: number;
  stock: number;
  statut: 'actif' | 'inactif' | 'rupture';
  artisan_id: string;
  photos: string[];
  created_at: Date;
  updated_at: Date;
  // Données jointes
  artisan?: {
    id: string;
    nom: string;
    photo?: string;
    localisation: string;
  };
}

/**
 * Récupérer tous les produits actifs
 */
export async function getActiveProducts(): Promise<Produit[]> {
  const results = await query<any>(
    `SELECT 
      p.*,
      a.id as artisan_id,
      a.nom as artisan_nom,
      a.photo as artisan_photo,
      a.localisation as artisan_localisation
     FROM produits p
     LEFT JOIN artisans a ON p.artisan_id = a.id
     WHERE p.statut = 'actif' AND p.stock > 0
     ORDER BY p.created_at DESC`
  );

  return results.map(mapProductFromDB);
}

/**
 * Récupérer les produits par catégorie
 */
export async function getProductsByCategory(
  categorie: 'pagne' | 'vetement' | 'accessoire'
): Promise<Produit[]> {
  const results = await query<any>(
    `SELECT 
      p.*,
      a.id as artisan_id,
      a.nom as artisan_nom,
      a.photo as artisan_photo,
      a.localisation as artisan_localisation
     FROM produits p
     LEFT JOIN artisans a ON p.artisan_id = a.id
     WHERE p.categorie = ? AND p.statut = 'actif'
     ORDER BY p.created_at DESC`,
    [categorie]
  );

  return results.map(mapProductFromDB);
}

/**
 * Récupérer un produit par ID
 */
export async function getProductById(id: string): Promise<Produit | null> {
  const results = await query<any>(
    `SELECT 
      p.*,
      a.id as artisan_id,
      a.nom as artisan_nom,
      a.photo as artisan_photo,
      a.localisation as artisan_localisation
     FROM produits p
     LEFT JOIN artisans a ON p.artisan_id = a.id
     WHERE p.id = ?`,
    [id]
  );

  if (results.length === 0) return null;

  return mapProductFromDB(results[0]);
}

/**
 * Récupérer les produits d'un artisan
 */
export async function getProductsByArtisan(
  artisanId: string
): Promise<Produit[]> {
  const results = await query<any>(
    `SELECT 
      p.*,
      a.id as artisan_id,
      a.nom as artisan_nom,
      a.photo as artisan_photo,
      a.localisation as artisan_localisation
     FROM produits p
     LEFT JOIN artisans a ON p.artisan_id = a.id
     WHERE p.artisan_id = ?
     ORDER BY p.created_at DESC`,
    [artisanId]
  );

  return results.map(mapProductFromDB);
}

/**
 * Créer un nouveau produit
 */
export async function createProduct(data: {
  nom_produit: string;
  description: string;
  categorie: 'pagne' | 'vetement' | 'accessoire';
  prix: number;
  stock: number;
  artisan_id: string;
  photos?: string[];
}): Promise<Produit> {
  const id = generateUUID();
  const photosJson = data.photos ? JSON.stringify(data.photos) : null;

  await execute(
    `INSERT INTO produits 
     (id, nom_produit, description, categorie, prix, stock, artisan_id, photos, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'actif')`,
    [
      id,
      data.nom_produit,
      data.description,
      data.categorie,
      data.prix,
      data.stock,
      data.artisan_id,
      photosJson,
    ]
  );

  const product = await getProductById(id);
  if (!product) {
    throw new Error('Erreur lors de la création du produit');
  }

  return product;
}

/**
 * Mettre à jour un produit
 */
export async function updateProduct(
  id: string,
  data: Partial<{
    nom_produit: string;
    description: string;
    categorie: 'pagne' | 'vetement' | 'accessoire';
    prix: number;
    stock: number;
    statut: 'actif' | 'inactif' | 'rupture';
    photos: string[];
  }>
): Promise<Produit | null> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'photos') {
        fields.push('photos = ?');
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
  });

  if (fields.length === 0) {
    return getProductById(id);
  }

  values.push(id);

  await execute(
    `UPDATE produits SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getProductById(id);
}

/**
 * Supprimer un produit
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const result = await execute('DELETE FROM produits WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Mettre à jour le stock d'un produit
 */
export async function updateProductStock(
  id: string,
  quantityChange: number
): Promise<boolean> {
  await execute(
    'UPDATE produits SET stock = stock + ? WHERE id = ?',
    [quantityChange, id]
  );

  // Mettre à jour le statut si rupture
  await execute(
    `UPDATE produits 
     SET statut = CASE 
       WHEN stock <= 0 THEN 'rupture'
       WHEN statut = 'rupture' AND stock > 0 THEN 'actif'
       ELSE statut
     END
     WHERE id = ?`,
    [id]
  );

  return true;
}

/**
 * Rechercher des produits
 */
export async function searchProducts(
  searchTerm: string
): Promise<Produit[]> {
  const results = await query<any>(
    `SELECT 
      p.*,
      a.id as artisan_id,
      a.nom as artisan_nom,
      a.photo as artisan_photo,
      a.localisation as artisan_localisation
     FROM produits p
     LEFT JOIN artisans a ON p.artisan_id = a.id
     WHERE 
       p.statut = 'actif' AND
       (p.nom_produit LIKE ? OR p.description LIKE ? OR a.nom LIKE ?)
     ORDER BY p.created_at DESC`,
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
  );

  return results.map(mapProductFromDB);
}

/**
 * Mapper les données de la DB vers l'objet Produit
 */
function mapProductFromDB(row: any): Produit {
  return {
    id: row.id,
    nom_produit: row.nom_produit,
    description: row.description,
    categorie: row.categorie,
    prix: parseFloat(row.prix),
    stock: row.stock,
    statut: row.statut,
    artisan_id: row.artisan_id,
    photos: row.photos ? JSON.parse(row.photos) : [],
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    artisan: row.artisan_nom
      ? {
          id: row.artisan_id,
          nom: row.artisan_nom,
          photo: row.artisan_photo,
          localisation: row.artisan_localisation,
        }
      : undefined,
  };
}
