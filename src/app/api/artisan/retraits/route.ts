import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/artisan/retraits
 * Récupérer l'historique des demandes de retrait
 */
export async function GET(request: NextRequest) {
  try {
    const artisanId = request.headers.get('x-artisan-id');
    
    if (!artisanId) {
      return NextResponse.json(
        { error: 'Artisan non authentifié' },
        { status: 401 }
      );
    }

    const retraits = await db.query(`
      SELECT 
        r.*,
        p.solde as solde_actuel
      FROM retraits r
      INNER JOIN portefeuilles p ON r.portefeuille_id = p.id
      WHERE r.artisan_id = ?
      ORDER BY r.created_at DESC
    `, [artisanId]);

    return NextResponse.json({
      retraits: retraits.map((r: any) => ({
        id: r.id,
        montant: parseFloat(r.montant),
        statut: r.statut,
        methode_retrait: r.methode_retrait,
        numero_telephone: r.numero_telephone,
        notes_artisan: r.notes_artisan,
        notes_admin: r.notes_admin,
        date_approbation: r.date_approbation,
        date_traitement: r.date_traitement,
        created_at: r.created_at,
        solde_actuel: parseFloat(r.solde_actuel),
      }))
    });

  } catch (error) {
    console.error('Erreur récupération retraits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/artisan/retraits
 * Créer une nouvelle demande de retrait
 */
export async function POST(request: NextRequest) {
  try {
    const artisanId = request.headers.get('x-artisan-id');
    
    if (!artisanId) {
      return NextResponse.json(
        { error: 'Artisan non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      montant, 
      methode_retrait, 
      numero_telephone, 
      coordonnees_bancaires, 
      notes 
    } = body;

    // Validation
    if (!montant || montant <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    if (!methode_retrait || !['orange_money', 'mtn_money', 'virement', 'especes'].includes(methode_retrait)) {
      return NextResponse.json(
        { error: 'Méthode de retrait invalide' },
        { status: 400 }
      );
    }

    if ((methode_retrait === 'orange_money' || methode_retrait === 'mtn_money') && !numero_telephone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis pour Mobile Money' },
        { status: 400 }
      );
    }

    // Récupérer le portefeuille
    const portefeuille = await db.selectOne(
      'portefeuilles',
      { artisan_id: artisanId }
    );

    if (!portefeuille) {
      return NextResponse.json(
        { error: 'Portefeuille non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le solde est suffisant
    const soldeDisponible = parseFloat(portefeuille.solde || 0);
    if (soldeDisponible < montant) {
      return NextResponse.json(
        { 
          error: 'Solde insuffisant',
          solde_disponible: soldeDisponible,
          montant_demande: montant
        },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas de demande en attente
    const retraitEnAttente = await db.selectOne('retraits', {
      artisan_id: artisanId,
      statut: 'en_attente'
    });

    if (retraitEnAttente) {
      return NextResponse.json(
        { error: 'Vous avez déjà une demande de retrait en attente' },
        { status: 400 }
      );
    }

    // Créer la demande de retrait
    const retraitId = uuidv4();
    const retraitData: any = {
      id: retraitId,
      portefeuille_id: portefeuille.id,
      artisan_id: artisanId,
      montant: montant,
      statut: 'en_attente',
      methode_retrait: methode_retrait,
      notes_artisan: notes || null,
    };

    if (numero_telephone) {
      retraitData.numero_telephone = numero_telephone;
    }

    if (coordonnees_bancaires) {
      retraitData.coordonnees_bancaires = coordonnees_bancaires;
    }

    const retrait = await db.insert('retraits', retraitData);

    return NextResponse.json({
      success: true,
      retrait: {
        id: retrait.id,
        montant: parseFloat(retrait.montant),
        statut: retrait.statut,
        methode_retrait: retrait.methode_retrait,
        created_at: retrait.created_at,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création demande retrait:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
