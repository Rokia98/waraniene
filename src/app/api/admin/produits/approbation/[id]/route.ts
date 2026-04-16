import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * PATCH /api/admin/produits/approbation/[id]
 * Approuver ou rejeter un produit
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    const adminId = request.headers.get('x-admin-id');
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const produitId = params.id;
    const body = await request.json();
    const { action, notes } = body; // action: 'approuver' ou 'rejeter'

    // Récupérer le produit
    const produit = await db.selectOne('produits', { id: produitId });

    if (!produit) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    if (produit.statut_approbation !== 'en_attente') {
      return NextResponse.json(
        { 
          error: 'Ce produit a déjà été traité',
          statut_actuel: produit.statut_approbation
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let updateData: any = {
      date_approbation: now,
      approuve_par: adminId || null,
      notes_approbation: notes || null,
    };

    if (action === 'approuver') {
      updateData.statut_approbation = 'approuve';
      // Rendre le produit actif s'il était en attente
      if (produit.statut === 'inactif') {
        updateData.statut = 'actif';
      }
    } else if (action === 'rejeter') {
      updateData.statut_approbation = 'rejete';
      updateData.statut = 'inactif'; // Désactiver le produit rejeté
    } else {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez: approuver ou rejeter' },
        { status: 400 }
      );
    }

    await db.update('produits', produitId, updateData);

    // TODO: Envoyer notification à l'artisan
    // await notifierArtisan(produit.artisan_id, action, produit.nom_produit, notes);

    return NextResponse.json({
      success: true,
      message: `Produit ${action === 'approuver' ? 'approuvé' : 'rejeté'} avec succès`,
      produit: {
        id: produit.id,
        nom_produit: produit.nom_produit,
        statut_approbation: updateData.statut_approbation,
        statut: updateData.statut,
        date_approbation: updateData.date_approbation,
        notes_approbation: updateData.notes_approbation,
      }
    });

  } catch (error) {
    console.error('Erreur approbation produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
