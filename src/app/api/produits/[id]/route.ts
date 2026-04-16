import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Récupérer le produit
    const produits = await db.select('produits', { where: { id }, limit: 1 });
    const produit = produits && produits.length > 0 ? produits[0] : null;

    if (!produit) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les informations de l'artisan
    const artisans = await db.select('artisans', {
      where: { id: produit.artisan_id },
      limit: 1
    });
    const artisan = artisans && artisans.length > 0 ? artisans[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        ...produit,
        photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || []),
        artisan: artisan ? {
          id: artisan.id,
          nom: artisan.nom,
          bio: artisan.bio,
          localisation: artisan.localisation,
          telephone: artisan.telephone,
          photo: artisan.photo,
          statut: artisan.statut
        } : null
      }
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { 
      nom_produit, 
      description, 
      categorie, 
      prix, 
      stock, 
      photos 
    } = body;

    // Mettre à jour le produit
    const updated = await db.update('produits', id, {
      nom_produit,
      description,
      categorie,
      prix: parseFloat(prix),
      stock: parseInt(stock),
      photos: typeof photos === 'string' ? photos : JSON.stringify(photos),
      updated_at: new Date().toISOString()
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du produit' },
        { status: 500 }
      );
    }

    // Récupérer l'artisan pour la réponse
    const artisans = await db.select('artisans', {
      where: { id: updated.artisan_id },
      limit: 1
    });
    const artisan = artisans && artisans.length > 0 ? artisans[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        photos: typeof updated.photos === 'string' ? JSON.parse(updated.photos) : (updated.photos || []),
        artisan: artisan ? {
          id: artisan.id,
          nom: artisan.nom,
          localisation: artisan.localisation,
          photo: artisan.photo
        } : null
      }
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Marquer comme inactif au lieu de supprimer
    const updated = await db.update('produits', id, { statut: 'inactif' });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du produit' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Produit supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}