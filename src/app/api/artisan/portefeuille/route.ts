import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/artisan/portefeuille
 * Récupérer les informations du portefeuille de l'artisan connecté
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Récupérer l'ID artisan depuis le JWT/session
    const artisanId = request.headers.get('x-artisan-id');
    
    if (!artisanId) {
      return NextResponse.json(
        { error: 'Artisan non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les infos du portefeuille
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

    // Récupérer les 20 dernières transactions
    const transactions = await db.query(`
      SELECT 
        id,
        type_transaction,
        montant,
        solde_avant,
        solde_apres,
        commande_id,
        produit_id,
        description,
        metadata,
        created_at
      FROM transactions_financieres
      WHERE portefeuille_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [portefeuille.id]);

    // Récupérer les statistiques de ventes
    const stats = await db.query(`
      SELECT 
        COUNT(DISTINCT commande_id) as total_commandes,
        SUM(montant) as total_ventes,
        COUNT(*) as total_transactions
      FROM transactions_financieres
      WHERE portefeuille_id = ?
        AND type_transaction = 'credit_vente'
    `, [portefeuille.id]);

    return NextResponse.json({
      portefeuille: {
        id: portefeuille.id,
        solde_disponible: parseFloat(portefeuille.solde || 0),
        solde_en_attente: parseFloat(portefeuille.solde_en_attente || 0),
        total_revenus: parseFloat(portefeuille.total_revenus || 0),
        total_retraits: parseFloat(portefeuille.total_retraits || 0),
        statut: portefeuille.statut,
      },
      transactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type_transaction,
        montant: parseFloat(t.montant),
        solde_avant: parseFloat(t.solde_avant),
        solde_apres: parseFloat(t.solde_apres),
        commande_id: t.commande_id,
        produit_id: t.produit_id,
        description: t.description,
        metadata: t.metadata ? JSON.parse(t.metadata) : null,
        date: t.created_at,
      })),
      statistiques: {
        total_commandes: stats[0]?.total_commandes || 0,
        total_ventes: parseFloat(stats[0]?.total_ventes || 0),
        total_transactions: stats[0]?.total_transactions || 0,
      }
    });

  } catch (error) {
    console.error('Erreur récupération portefeuille:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
