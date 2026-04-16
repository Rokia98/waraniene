import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * POST /api/paiement/distribuer-revenus
 * Distribuer automatiquement les revenus d'un paiement (90% artisan, 10% admin)
 * Appelé après confirmation du paiement via webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paiement_id } = body;

    if (!paiement_id) {
      return NextResponse.json(
        { error: 'ID paiement requis' },
        { status: 400 }
      );
    }

    // Récupérer le paiement
    const paiement = await db.selectOne('paiements', { id: paiement_id });

    if (!paiement) {
      return NextResponse.json(
        { error: 'Paiement non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le paiement est payé et pas encore distribué
    if (paiement.statut !== 'paye') {
      return NextResponse.json(
        { error: 'Le paiement n\'est pas confirmé' },
        { status: 400 }
      );
    }

    if (paiement.revenus_distribues) {
      return NextResponse.json(
        { error: 'Les revenus ont déjà été distribués pour ce paiement' },
        { status: 400 }
      );
    }

    // Appeler la procédure stockée MySQL
    await db.query('CALL distribuer_revenus_paiement(?)', [paiement_id]);

    return NextResponse.json({
      success: true,
      message: 'Revenus distribués avec succès',
      paiement_id: paiement_id,
    });

  } catch (error) {
    console.error('Erreur distribution revenus:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/paiement/confirmer-revenus
 * Confirmer les revenus en attente lors de la livraison (transférer de solde_en_attente vers solde)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { commande_id } = body;

    if (!commande_id) {
      return NextResponse.json(
        { error: 'ID commande requis' },
        { status: 400 }
      );
    }

    // Vérifier que la commande est livrée
    const commande = await db.selectOne('commandes', { id: commande_id });

    if (!commande) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    if (commande.statut !== 'livree') {
      return NextResponse.json(
        { 
          error: 'La commande doit être livrée pour confirmer les revenus',
          statut_actuel: commande.statut
        },
        { status: 400 }
      );
    }

    // Appeler la procédure stockée MySQL
    await db.query('CALL confirmer_revenus_commande(?)', [commande_id]);

    return NextResponse.json({
      success: true,
      message: 'Revenus confirmés et transférés vers les soldes disponibles',
      commande_id: commande_id,
    });

  } catch (error) {
    console.error('Erreur confirmation revenus:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: (error as Error).message },
      { status: 500 }
    );
  }
}
