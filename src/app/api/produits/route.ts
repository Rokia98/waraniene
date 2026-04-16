import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de requête
    const categorie = searchParams.get('categorie');
    const artisan_id = searchParams.get('artisan_id');
    const prix_min = searchParams.get('prix_min');
    const prix_max = searchParams.get('prix_max');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limite') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construire les conditions de filtrage
    const where: any = { statut: 'actif' };
    
    if (categorie && categorie !== 'all') {
      where.categorie = categorie;
    }

    if (artisan_id) {
      where.artisan_id = artisan_id;
    }

    // Récupérer les produits
    let produits = await db.select('produits', {
      where,
      orderBy: sortBy === 'date_desc' ? 'created_at' : sortBy === 'prix_asc' || sortBy === 'prix_desc' ? 'prix' : 'created_at',
      orderDirection: (sortBy === 'prix_desc' || sortBy === 'date_desc' ? 'desc' : sortOrder) as 'asc' | 'desc',
      limit,
      offset
    });

    // Filtrer par prix et stock (côté application car db.select ne supporte pas gte/lte/gt)
    produits = (produits || []).filter((p: any) => {
      if (p.stock <= 0) return false;
      if (prix_min && p.prix < parseFloat(prix_min)) return false;
      if (prix_max && p.prix > parseFloat(prix_max)) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        const nomMatch = p.nom_produit?.toLowerCase().includes(searchLower);
        const descMatch = p.description?.toLowerCase().includes(searchLower);
        return nomMatch || descMatch;
      }
      return true;
    });

    // Récupérer les informations des artisans pour chaque produit
    const produitsAvecArtisan = await Promise.all(
      produits.map(async (produit: any) => {
        const artisans = await db.select('artisans', {
          where: { id: produit.artisan_id },
          limit: 1
        });
        const artisan = artisans && artisans.length > 0 ? artisans[0] : null;
        
        return {
          ...produit,
          photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || []),
          artisan: artisan ? {
            id: artisan.id,
            nom: artisan.nom,
            photo: artisan.photo,
            bio: artisan.bio,
            localisation: artisan.localisation,
            telephone: artisan.telephone,
            statut: artisan.statut
          } : null
        };
      })
    );

    // Compter le total pour la pagination
    const allProduits = await db.select('produits', { where: { statut: 'actif' } });
    const totalCount = (allProduits || []).filter((p: any) => p.stock > 0).length;

    return NextResponse.json({
      success: true,
      data: produitsAvecArtisan || [],
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limite: limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit),
        has_next: (offset + limit) < totalCount,
        has_prev: offset > 0
      }
    });

  } catch (error) {
    console.error('Erreur API produits:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.nom_produit || !body.prix || !body.artisan_id) {
      return NextResponse.json(
        { success: false, error: 'Nom du produit, prix et ID artisan requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'artisan existe
    const artisans = await db.select('artisans', {
      where: { id: body.artisan_id },
      limit: 1
    });

    if (!artisans || artisans.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Artisan non trouvé' },
        { status: 404 }
      );
    }

    // Créer le produit
    const newProduit = await db.insert('produits', {
      nom_produit: body.nom_produit,
      description: body.description || '',
      prix: parseFloat(body.prix),
      categorie: body.categorie || 'pagne',
      artisan_id: body.artisan_id,
      photos: JSON.stringify(body.photos || []),
      stock: parseInt(body.stock) || 0,
      statut: 'actif'
    });

    if (!newProduit) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du produit' },
        { status: 500 }
      );
    }

    // Parser les photos pour la réponse
    const produitWithPhotos = {
      ...newProduit,
      photos: typeof newProduit.photos === 'string' ? JSON.parse(newProduit.photos) : (newProduit.photos || [])
    };

    return NextResponse.json({
      success: true,
      data: produitWithPhotos
    });

  } catch (error) {
    console.error('Erreur création produit:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du produit' },
      { status: 500 }
    );
  }
}