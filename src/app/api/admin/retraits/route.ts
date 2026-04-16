import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/admin/retraits
 * Récupérer toutes les demandes de retrait
 */
export async function GET(request: NextRequest) {
  try {
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut'); // en_attente, approuve, traite, rejete

    let query = `
      SELECT 
        r.*,
        a.nom as artisan_nom,
        a.telephone as artisan_telephone,
        a.localisation as artisan_localisation,
        p.solde as solde_actuel_portefeuille
      FROM retraits r
      INNER JOIN artisans a ON r.artisan_id = a.id
      INNER JOIN portefeuilles p ON r.portefeuille_id = p.id
    `;

    const params: any[] = [];

    if (statut) {
      query += ' WHERE r.statut = ?';
      params.push(statut);
    }

    query += ' ORDER BY r.created_at DESC';

    const retraits = await db.query(query, params);

    return NextResponse.json({
      retraits: retraits.map((r: any) => ({
        id: r.id,
        artisan: {
          id: r.artisan_id,
          nom: r.artisan_nom,
          telephone: r.artisan_telephone,
          localisation: r.artisan_localisation,
        },
        montant: parseFloat(r.montant),
        statut: r.statut,
        methode_retrait: r.methode_retrait,
        numero_telephone: r.numero_telephone,
        coordonnees_bancaires: r.coordonnees_bancaires,
        notes_artisan: r.notes_artisan,
        notes_admin: r.notes_admin,
        solde_portefeuille: parseFloat(r.solde_actuel_portefeuille || 0),
        date_approbation: r.date_approbation,
        date_traitement: r.date_traitement,
        created_at: r.created_at,
      }))
    });

  } catch (error) {
    console.error('Erreur récupération retraits admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
