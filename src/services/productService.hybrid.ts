/**
 * Service Produits - Version Hybride (MySQL + Supabase)
 * Utilise la couche d'abstraction db.ts
 */

import { db, dbType, generateUUID, mysqlQuery } from '@/lib/db';

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
  if (dbType === 'mysql') {
    // MySQL: Utiliser JOIN
    const results = await mysqlQuery<any>(
      `SELECT 
        p.*,
        a.id as artisan_id_joined,
        a.nom as artisan_nom,
        a.photo as artisan_photo,
        a.localisation as artisan_localisation
       FROM produits p
       LEFT JOIN artisans a ON p.artisan_id = a.id
       WHERE p.statut = 'actif' AND p.stock > 0
       ORDER BY p.created_at DESC`
    );
    return results.map(mapProductFromMySQL);
  } else {
    // Supabase: Utiliser select avec relation
    const products = await db.select<any>('produits', {
      columns: ['*, artisans(id, nom, photo, localisation)'],
      where: { statut: 'actif' },
      orderBy: { column: 'created_at', direction: 'desc' }
    });
    return products.map(mapProductFromSupabase);
  }
}

/**
 * Récupérer les produits par catégorie
 */
export async function getProductsByCategory(
  categorie: 'pagne' | 'vetement' | 'accessoire'
): Promise<Produit[]> {
  if (dbType === 'mysql') {
    const results = await mysqlQuery<any>(
      `SELECT 
        p.*,
        a.id as artisan_id_joined,
        a.nom as artisan_nom,
        a.photo as artisan_photo,
        a.localisation as artisan_localisation
       FROM produits p
       LEFT JOIN artisans a ON p.artisan_id = a.id
       WHERE p.categorie = ? AND p.statut = 'actif'
       ORDER BY p.created_at DESC`,
      [categorie]
    );
    return results.map(mapProductFromMySQL);
  } else {
    const products = await db.select<any>('produits', {
      columns: ['*, artisans(id, nom, photo, localisation)'],
      where: { categorie, statut: 'actif' },
      orderBy: { column: 'created_at', direction: 'desc' }
    });
    return products.map(mapProductFromSupabase);
  }
}

/**
 * Récupérer un produit par ID
 */
export async function getProductById(id: string): Promise<Produit | null> {
  if (dbType === 'mysql') {
    const results = await mysqlQuery<any>(
      `SELECT 
        p.*,
        a.id as artisan_id_joined,
        a.nom as artisan_nom,
        a.photo as artisan_photo,
        a.localisation as artisan_localisation
       FROM produits p
       LEFT JOIN artisans a ON p.artisan_id = a.id
       WHERE p.id = ?`,
      [id]
    );
    return results.length > 0 ? mapProductFromMySQL(results[0]) : null;
  } else {
    const products = await db.select<any>('produits', {
      columns: ['*, artisans(id, nom, photo, localisation)'],
      where: { id },
      limit: 1
    });
    return products.length > 0 ? mapProductFromSupabase(products[0]) : null;
  }
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
  
  const productData: any = {
    id,
    nom_produit: data.nom_produit,
    description: data.description,
    categorie: data.categorie,
    prix: data.prix,
    stock: data.stock,
    artisan_id: data.artisan_id,
    statut: 'actif',
  };

  // Gérer les photos selon le type de DB
  if (dbType === 'mysql') {
    productData.photos = data.photos ? JSON.stringify(data.photos) : null;
  } else {
    productData.photos = data.photos || [];
  }

  await db.insert('produits', productData);

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
  const updateData: any = { ...data };

  // Convertir photos pour MySQL
  if (dbType === 'mysql' && data.photos) {
    updateData.photos = JSON.stringify(data.photos);
  }

  await db.update('produits', id, updateData);
  return getProductById(id);
}

/**
 * Supprimer un produit
 */
export async function deleteProduct(id: string): Promise<boolean> {
  return db.delete('produits', id);
}

/**
 * Rechercher des produits
 */
export async function searchProducts(searchTerm: string): Promise<Produit[]> {
  if (dbType === 'mysql') {
    const results = await mysqlQuery<any>(
      `SELECT 
        p.*,
        a.id as artisan_id_joined,
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
    return results.map(mapProductFromMySQL);
  } else {
    // Supabase: recherche textuelle (nécessite une fonction personnalisée ou filtres multiples)
    // Pour simplifier, recherche sur nom_produit uniquement
    const products = await db.select<any>('produits', {
      columns: ['*, artisans(id, nom, photo, localisation)']
    });
    
    return products
      .filter((p: any) => 
        p.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(mapProductFromSupabase);
  }
}

/**
 * Mapper MySQL → Produit
 */
function mapProductFromMySQL(row: any): Produit {
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
          id: row.artisan_id_joined || row.artisan_id,
          nom: row.artisan_nom,
          photo: row.artisan_photo,
          localisation: row.artisan_localisation,
        }
      : undefined,
  };
}

/**
 * Mapper Supabase → Produit
 */
function mapProductFromSupabase(row: any): Produit {
  return {
    id: row.id,
    nom_produit: row.nom_produit,
    description: row.description,
    categorie: row.categorie,
    prix: parseFloat(row.prix),
    stock: row.stock,
    statut: row.statut,
    artisan_id: row.artisan_id,
    photos: Array.isArray(row.photos) ? row.photos : [],
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    artisan: row.artisans
      ? {
          id: row.artisans.id,
          nom: row.artisans.nom,
          photo: row.artisans.photo,
          localisation: row.artisans.localisation,
        }
      : undefined,
  };
}
