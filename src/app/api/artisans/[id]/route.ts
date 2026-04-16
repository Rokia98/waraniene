import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Récupérer l'artisan
    const artisans = await db.select('artisans', { where: { id }, limit: 1 });
    const artisan = artisans && artisans.length > 0 ? artisans[0] : null;

    if (!artisan) {
      return NextResponse.json(
        { error: 'Artisan introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les produits de l'artisan
    const produits = await db.select('produits', {
      where: { artisan_id: id },
      orderBy: 'created_at',
      orderDirection: 'desc'
    });

    const totalProduits = produits?.length || 0;

    // Récupérer les détails de commandes pour les statistiques
    let ventesTotal = 0;
    let commandesLivrees = 0;

    if (produits && produits.length > 0) {
      const produitIds = produits.map(p => p.id);
      
      // Pour chaque produit, récupérer les détails de commandes
      for (const produitId of produitIds) {
        const details = await db.select('detail_commandes', {
          where: { produit_id: produitId }
        });

        if (details && details.length > 0) {
          for (const detail of details) {
            // Récupérer le statut de la commande
            const commandes = await db.select('commandes', {
              where: { id: detail.commande_id },
              limit: 1
            });
            
            if (commandes && commandes.length > 0 && commandes[0].statut === 'livree') {
              ventesTotal += detail.quantite * detail.prix_unitaire;
              commandesLivrees++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      artisan: {
        ...artisan,
        stats: {
          totalProduits,
          ventesTotal,
          commandesLivrees,
          note: 4.8 // À calculer à partir des vraies évaluations
        }
      },
      produits: (produits || []).map(produit => ({
        ...produit,
        stock_disponible: produit.stock
      }))
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
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
      nom, 
      bio, 
      localisation, 
      telephone, 
      langue,
      photo 
    } = body;

    // Vérifier que l'artisan existe
    const existingArtisans = await db.select('artisans', {
      where: { id },
      limit: 1
    });
    const existingArtisan = existingArtisans && existingArtisans.length > 0 ? existingArtisans[0] : null;

    if (!existingArtisan) {
      return NextResponse.json(
        { error: 'Artisan introuvable' },
        { status: 404 }
      );
    }

    // Vérifier l'unicité du téléphone (sauf pour l'artisan actuel)
    if (telephone && telephone !== existingArtisan.telephone) {
      const phoneExistsResult = await db.select('artisans', {
        where: { telephone },
        limit: 1
      });
      const phoneExists = phoneExistsResult && phoneExistsResult.length > 0 
        && phoneExistsResult[0].id !== id;

      if (phoneExists) {
        return NextResponse.json(
          { error: 'Ce numéro de téléphone est déjà utilisé' },
          { status: 409 }
        );
      }
    }

    // Mettre à jour l'artisan
    const updated = await db.update('artisans', id, {
      nom,
      bio,
      localisation,
      telephone,
      langue,
      photo,
      updated_at: new Date().toISOString()
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'artisan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ artisan: updated });

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
    const { id } = params;

    // Vérifier que l'artisan existe
    const existingArtisans = await db.select('artisans', {
      where: { id },
      limit: 1
    });

    if (!existingArtisans || existingArtisans.length === 0) {
      return NextResponse.json(
        { error: 'Artisan introuvable' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des produits liés
    const produits = await db.select('produits', { where: { artisan_id: id } });
    const produitsCount = produits?.length || 0;

    if (produitsCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un artisan qui a des produits' },
        { status: 409 }
      );
    }

    // Supprimer l'artisan
    const deleted = await db.delete('artisans', id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'artisan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Artisan supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}