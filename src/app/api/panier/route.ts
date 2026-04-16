import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Récupérer les articles du panier
    const panierItems = await db.select('panier', {
      where: { acheteur_id: user.userId },
      orderBy: 'date_ajout',
      orderDirection: 'desc'
    });

    // Enrichir avec les données produits et artisans
    const enrichedItems = await Promise.all(
      (panierItems || []).map(async (item: any) => {
        const produits = await db.select('produits', {
          where: { id: item.produit_id },
          limit: 1
        });
        const produit = produits && produits.length > 0 ? produits[0] : null;

        if (produit) {
          const artisans = await db.select('artisans', {
            where: { id: produit.artisan_id },
            limit: 1
          });
          const artisan = artisans && artisans.length > 0 ? artisans[0] : null;

          return {
            id: item.id,
            quantite: item.quantite,
            date_ajout: item.date_ajout,
            produit: {
              id: produit.id,
              nom_produit: produit.nom_produit,
              prix: produit.prix,
              photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || []),
              stock: produit.stock,
              artisan: artisan ? {
                id: artisan.id,
                nom: artisan.nom
              } : null
            }
          };
        }
        return null;
      })
    );

    // Filtrer les items null
    const validItems = enrichedItems.filter(item => item !== null);

    // Calculer le total
    const total = validItems.reduce((sum, item: any) => {
      if (item.produit) {
        return sum + (item.produit.prix * item.quantite);
      }
      return sum;
    }, 0);

    const totalItems = validItems.reduce((sum, item: any) => sum + item.quantite, 0);

    return NextResponse.json({
      items: validItems,
      total,
      totalItems,
      count: validItems.length
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { produit_id, quantite = 1 } = body;

    // Validation des données
    if (!produit_id) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      );
    }

    if (quantite < 1) {
      return NextResponse.json(
        { error: 'La quantité doit être supérieure à 0' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe et est disponible
    const produits = await db.select('produits', {
      where: { id: produit_id },
      limit: 1
    });
    const produit = produits && produits.length > 0 ? produits[0] : null;

    if (!produit) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
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

    // Vérifier si le produit est déjà dans le panier
    const existingItems = await db.select('panier', {
      where: { acheteur_id: user.userId, produit_id },
      limit: 1
    });
    const existingItem = existingItems && existingItems.length > 0 ? existingItems[0] : null;

    if (existingItem) {
      // Mettre à jour la quantité existante
      const nouvelleQuantite = existingItem.quantite + quantite;

      if (nouvelleQuantite > produit.stock) {
        return NextResponse.json(
          { error: `Stock insuffisant. Vous avez déjà ${existingItem.quantite} article(s) dans votre panier. Stock total: ${produit.stock}` },
          { status: 409 }
        );
      }

      const updatedItem = await db.update('panier', existingItem.id, {
        quantite: nouvelleQuantite,
        date_ajout: new Date().toISOString()
      });

      if (!updatedItem) {
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du panier' },
          { status: 500 }
        );
      }

      // Enrichir avec les données du produit et artisan
      const artisans = await db.select('artisans', {
        where: { id: produit.artisan_id },
        limit: 1
      });
      const artisan = artisans && artisans.length > 0 ? artisans[0] : null;

      return NextResponse.json({
        item: {
          ...updatedItem,
          produit: {
            id: produit.id,
            nom_produit: produit.nom_produit,
            prix: produit.prix,
            photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || []),
            stock: produit.stock,
            artisan: artisan ? { nom: artisan.nom } : null
          }
        },
        message: 'Quantité mise à jour dans le panier'
      });
    } else {
      // Ajouter un nouvel article
      const newItem = await db.insert('panier', {
        acheteur_id: user.userId,
        produit_id,
        quantite,
        date_ajout: new Date().toISOString()
      });

      if (!newItem) {
        return NextResponse.json(
          { error: 'Erreur lors de l\'ajout au panier' },
          { status: 500 }
        );
      }

      // Enrichir avec les données du produit et artisan
      const artisans = await db.select('artisans', {
        where: { id: produit.artisan_id },
        limit: 1
      });
      const artisan = artisans && artisans.length > 0 ? artisans[0] : null;

      return NextResponse.json({
        item: {
          ...newItem,
          produit: {
            id: produit.id,
            nom_produit: produit.nom_produit,
            prix: produit.prix,
            photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || []),
            stock: produit.stock,
            artisan: artisan ? { nom: artisan.nom } : null
          }
        },
        message: 'Produit ajouté au panier'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Vider tout le panier
    const panierItems = await db.select('panier', {
      where: { acheteur_id: user.userId }
    });

    if (panierItems && panierItems.length > 0) {
      for (const item of panierItems) {
        await db.delete('panier', item.id);
      }
    }

    return NextResponse.json({
      message: 'Panier vidé avec succès'
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}