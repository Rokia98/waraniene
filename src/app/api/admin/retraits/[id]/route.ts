import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * PATCH /api/admin/retraits/[id]
 * Approuver, traiter ou rejeter une demande de retrait
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const retraitId = params.id;
    const body = await request.json();
    const { action, notes_admin } = body; // action: 'approuver', 'traiter', 'rejeter'

    // Récupérer la demande de retrait
    const retrait = await db.selectOne('retraits', { id: retraitId });

    if (!retrait) {
      return NextResponse.json(
        { error: 'Demande de retrait non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer le portefeuille
    const portefeuille = await db.selectOne('portefeuilles', {
      id: retrait.portefeuille_id
    });

    if (!portefeuille) {
      return NextResponse.json(
        { error: 'Portefeuille non trouvé' },
        { status: 404 }
      );
    }

    const montantRetrait = parseFloat(retrait.montant);
    const soldeDisponible = parseFloat(portefeuille.solde || 0);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let updateData: any = {};

    // APPROUVER
    if (action === 'approuver') {
      if (retrait.statut !== 'en_attente') {
        return NextResponse.json(
          { error: 'Seules les demandes en attente peuvent être approuvées' },
          { status: 400 }
        );
      }

      if (soldeDisponible < montantRetrait) {
        return NextResponse.json(
          { 
            error: 'Solde insuffisant',
            solde_disponible: soldeDisponible,
            montant_retrait: montantRetrait
          },
          { status: 400 }
        );
      }

      updateData = {
        statut: 'approuve',
        date_approbation: now,
        notes_admin: notes_admin || null,
      };

      await db.update('retraits', retraitId, updateData);

      return NextResponse.json({
        success: true,
        message: 'Demande de retrait approuvée',
        retrait: { ...retrait, ...updateData }
      });
    }

    // TRAITER (effectuer le retrait)
    else if (action === 'traiter') {
      if (retrait.statut !== 'approuve') {
        return NextResponse.json(
          { error: 'Seules les demandes approuvées peuvent être traitées' },
          { status: 400 }
        );
      }

      if (soldeDisponible < montantRetrait) {
        return NextResponse.json(
          { 
            error: 'Solde insuffisant',
            solde_disponible: soldeDisponible,
            montant_retrait: montantRetrait
          },
          { status: 400 }
        );
      }

      // Débiter le portefeuille
      const nouveauSolde = soldeDisponible - montantRetrait;
      const nouveauTotalRetraits = parseFloat(portefeuille.total_retraits || 0) + montantRetrait;

      await db.update('portefeuilles', portefeuille.id, {
        solde: nouveauSolde,
        total_retraits: nouveauTotalRetraits,
      });

      // Enregistrer la transaction
      const transactionId = uuidv4();
      await db.insert('transactions_financieres', {
        id: transactionId,
        portefeuille_id: portefeuille.id,
        type_transaction: 'debit_retrait',
        montant: -montantRetrait, // Négatif pour un débit
        solde_avant: soldeDisponible,
        solde_apres: nouveauSolde,
        description: `Retrait ${retrait.methode_retrait} - Demande #${retraitId.substring(0, 8)}`,
        metadata: JSON.stringify({
          retrait_id: retraitId,
          methode: retrait.methode_retrait,
          numero_telephone: retrait.numero_telephone,
          notes_admin: notes_admin,
        })
      });

      // Mettre à jour le statut du retrait
      updateData = {
        statut: 'traite',
        date_traitement: now,
        notes_admin: notes_admin || retrait.notes_admin,
      };

      await db.update('retraits', retraitId, updateData);

      return NextResponse.json({
        success: true,
        message: 'Retrait traité avec succès',
        retrait: { ...retrait, ...updateData },
        nouveau_solde: nouveauSolde,
      });
    }

    // REJETER
    else if (action === 'rejeter') {
      if (retrait.statut !== 'en_attente' && retrait.statut !== 'approuve') {
        return NextResponse.json(
          { error: 'Seules les demandes en attente ou approuvées peuvent être rejetées' },
          { status: 400 }
        );
      }

      updateData = {
        statut: 'rejete',
        notes_admin: notes_admin || 'Rejeté par l\'administrateur',
      };

      await db.update('retraits', retraitId, updateData);

      return NextResponse.json({
        success: true,
        message: 'Demande de retrait rejetée',
        retrait: { ...retrait, ...updateData }
      });
    }

    else {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez: approuver, traiter, rejeter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Erreur traitement retrait:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
