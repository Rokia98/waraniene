import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const body = await request.json();
    const { quantite } = body;

    // Validation
    if (!quantite || quantite < 1) {
      return NextResponse.json(
        { error: 'La quantité doit être supérieure à 0' },
        { status: 400 }
      );
    }

    // Vérifier que l'article appartient bien à l'utilisateur
    const paniers = await db.select('panier', {
      where: { id: params.id, acheteur_id: user.userId },
      limit: 1
    });
    const panierItem = paniers && paniers.length > 0 ? paniers[0] : null;

    if (!panierItem) {
      return NextResponse.json(
        { error: 'Article du panier introuvable' },
        { status: 404 }
      );
    }

    // Récupérer le produit associé
    const produits = await db.select('produits', {
      where: { id: panierItem.produit_id },
      limit: 1
    });
    const produit = produits && produits.length > 0 ? produits[0] : null;

    if (!produit) {
      return NextResponse.json(
        { error: 'Produit associé introuvable' },
        { status: 404 }
      );
    }

    if (produit.statut !== 'actif') {
      return NextResponse.json(
        { error: 'Ce produit n\'est plus disponible' },
        { status: 400 }
      );
    }

    if (produit.stock < quantite) {
      return NextResponse.json(
        { error: `Stock insuffisant. Stock disponible: ${produit.stock}` },
        { status: 409 }
      );
    }

    // Mettre à jour la quantité
    await db.update('panier', params.id, {
      quantite,
      date_ajout: new Date().toISOString()
    });

    // Récupérer l'article mis à jour avec enrichissement
    const updated = await db.select('panier', {
      where: { id: params.id },
      limit: 1
    });
    const updatedPanier = updated && updated.length > 0 ? updated[0] : null;

    if (!updatedPanier) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    // Enrichir avec produit
    const produitsUpdated = await db.select('produits', {
      where: { id: updatedPanier.produit_id },
      limit: 1
    });
    const produitUpdated = produitsUpdated && produitsUpdated.length > 0 ? produitsUpdated[0] : null;

    let artisan = null;
    if (produitUpdated?.artisan_id) {
      const artisans = await db.select('artisans', {
        where: { id: produitUpdated.artisan_id },
        columns: ['nom'],
        limit: 1
      });
      artisan = artisans && artisans.length > 0 ? artisans[0] : null;
    }

    const enrichedItem = {
      id: updatedPanier.id,
      quantite: updatedPanier.quantite,
      date_ajout: updatedPanier.date_ajout,
      produit: produitUpdated ? {
        id: produitUpdated.id,
        nom_produit: produitUpdated.nom_produit,
        prix: produitUpdated.prix,
        photos: produitUpdated.photos,
        stock: produitUpdated.stock,
        artisan: artisan ? { nom: artisan.nom } : null
      } : null
    };

    return NextResponse.json({
      item: enrichedItem,
      message: 'Quantité mise à jour'
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Vérifier que l'article appartient bien à l'utilisateur
    const paniers = await db.select('panier', {
      where: { id: params.id, acheteur_id: user.userId },
      columns: ['id', 'produit_id'],
      limit: 1
    });
    const panierItem = paniers && paniers.length > 0 ? paniers[0] : null;

    if (!panierItem) {
      return NextResponse.json(
        { error: 'Article du panier introuvable' },
        { status: 404 }
      );
    }

    // Supprimer l'article
    await db.delete('panier', params.id);

    return NextResponse.json({
      message: 'Article retiré du panier'
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Récupérer l'article spécifique
    const paniers = await db.select('panier', {
      where: { id: params.id, acheteur_id: user.userId },
      limit: 1
    });
    const panierItem = paniers && paniers.length > 0 ? paniers[0] : null;

    if (!panierItem) {
      return NextResponse.json(
        { error: 'Article du panier introuvable' },
        { status: 404 }
      );
    }

    // Enrichir avec produit
    const produits = await db.select('produits', {
      where: { id: panierItem.produit_id },
      limit: 1
    });
    const produit = produits && produits.length > 0 ? produits[0] : null;

    if (!produit) {
      return NextResponse.json(
        { error: 'Produit associé introuvable' },
        { status: 404 }
      );
    }

    // Enrichir avec artisan
    let artisan = null;
    if (produit.artisan_id) {
      const artisans = await db.select('artisans', {
        where: { id: produit.artisan_id },
        columns: ['id', 'nom'],
        limit: 1
      });
      artisan = artisans && artisans.length > 0 ? artisans[0] : null;
    }

    const enrichedItem = {
      id: panierItem.id,
      quantite: panierItem.quantite,
      date_ajout: panierItem.date_ajout,
      produit: {
        id: produit.id,
        nom_produit: produit.nom_produit,
        prix: produit.prix,
        photos: produit.photos,
        stock: produit.stock,
        statut: produit.statut,
        artisan: artisan ? {
          id: artisan.id,
          nom: artisan.nom
        } : null
      }
    };

    return NextResponse.json(enrichedItem);

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}