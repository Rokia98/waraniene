import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commande_id = params.id;

    // Récupérer la commande
    const commandes = await db.select('commandes', {
      where: { id: commande_id },
      limit: 1
    });

    if (!commandes || commandes.length === 0) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    const commande = commandes[0];

    // Récupérer l'acheteur
    let acheteurData = null;
    if (commande.acheteur_id) {
      const acheteurs = await db.select('acheteurs', {
        where: { id: commande.acheteur_id },
        limit: 1
      });
      const acheteur = acheteurs && acheteurs.length > 0 ? acheteurs[0] : null;
      if (acheteur) {
        acheteurData = {
          id: acheteur.id,
          nom: acheteur.nom,
          prenom: acheteur.prenom,
          email: acheteur.email,
          telephone: acheteur.telephone
        };
      }
    }

    // Récupérer les détails de commande
    const details = await db.select('detail_commandes', {
      where: { commande_id: commande.id }
    });

    // Enrichir chaque détail avec le produit et l'artisan
    const detailsEnrichis = await Promise.all(
      (details || []).map(async (detail: any) => {
        const produits = await db.select('produits', {
          where: { id: detail.produit_id },
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
            id: detail.id,
            quantite: detail.quantite,
            prix_unitaire: detail.prix_unitaire,
            produit: {
              id: produit.id,
              nom_produit: produit.nom_produit,
              photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || []),
              prix: produit.prix,
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

    const commandeEnrichie = {
      ...commande,
      acheteur: acheteurData,
      detail_commandes: detailsEnrichis.filter(d => d !== null)
    };

    return NextResponse.json({
      success: true,
      commande: commandeEnrichie
    });

  } catch (error) {
    console.error('Erreur API commande:', error);
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
    const body = await request.json();
    const { statut, adresse_livraison, notes_admin } = body;

    // Validation du statut
    const statutsValides = ['en_attente', 'confirmee', 'preparee', 'expediee', 'livree', 'annulee'];
    if (statut && !statutsValides.includes(statut)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe
    const commandesExistantes = await db.select('commandes', {
      where: { id: params.id },
      limit: 1
    });

    if (!commandesExistantes || commandesExistantes.length === 0) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (statut) updateData.statut = statut;
    if (adresse_livraison) updateData.adresse_livraison = adresse_livraison;
    if (notes_admin !== undefined) updateData.notes_admin = notes_admin;

    // Mettre à jour la commande
    await db.update('commandes', updateData, {
      where: { id: params.id }
    });

    // Récupérer la commande enrichie mise à jour
    const commandes = await db.select('commandes', {
      where: { id: params.id },
      limit: 1
    });
    const commande = commandes[0];

    // Récupérer l'acheteur
    let acheteurData = null;
    if (commande.acheteur_id) {
      const acheteurs = await db.select('acheteurs', {
        where: { id: commande.acheteur_id },
        limit: 1
      });
      const acheteur = acheteurs && acheteurs.length > 0 ? acheteurs[0] : null;
      if (acheteur) {
        acheteurData = {
          id: acheteur.id,
          nom: acheteur.nom,
          prenom: acheteur.prenom,
          email: acheteur.email,
          telephone: acheteur.telephone
        };
      }
    }

    // Récupérer les détails de commande
    const details = await db.select('detail_commandes', {
      where: { commande_id: commande.id }
    });

    // Enrichir chaque détail avec le produit
    const detailsEnrichis = await Promise.all(
      (details || []).map(async (detail: any) => {
        const produits = await db.select('produits', {
          where: { id: detail.produit_id },
          limit: 1
        });
        const produit = produits && produits.length > 0 ? produits[0] : null;

        if (produit) {
          return {
            id: detail.id,
            quantite: detail.quantite,
            prix_unitaire: detail.prix_unitaire,
            produit: {
              id: produit.id,
              nom_produit: produit.nom_produit,
              photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || []),
              prix: produit.prix
            }
          };
        }
        return null;
      })
    );

    const commandeEnrichie = {
      ...commande,
      acheteur: acheteurData,
      detail_commandes: detailsEnrichis.filter(d => d !== null)
    };

    return NextResponse.json({
      success: true,
      commande: commandeEnrichie,
      message: 'Commande mise à jour avec succès'
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
    // Vérifier que la commande existe et son statut
    const commandes = await db.select('commandes', {
      where: { id: params.id },
      limit: 1
    });

    if (!commandes || commandes.length === 0) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    const commande = commandes[0];

    // Seules les commandes en_attente peuvent être supprimées
    if (commande.statut !== 'en_attente') {
      return NextResponse.json(
        { error: 'Seules les commandes en attente peuvent être supprimées' },
        { status: 400 }
      );
    }

    // Récupérer les détails de commande
    const details = await db.select('detail_commandes', {
      where: { commande_id: params.id }
    });

    // Remettre les stocks en place
    for (const detail of details || []) {
      const produits = await db.select('produits', {
        where: { id: detail.produit_id },
        limit: 1
      });

      if (produits && produits.length > 0) {
        const produit = produits[0];
        await db.update('produits', 
          { stock: produit.stock + detail.quantite },
          { where: { id: detail.produit_id } }
        );
      }
    }

    // Supprimer les détails de commande d'abord
    await db.delete('detail_commandes', {
      where: { commande_id: params.id }
    });

    // Supprimer la commande
    await db.delete('commandes', {
      where: { id: params.id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Commande supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}