import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/admin/portefeuilles
 * Récupérer tous les portefeuilles (artisans + admin)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier authentification admin
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer tous les portefeuilles avec infos artisan
    const portefeuilles = await db.query(`
      SELECT 
        p.id,
        p.artisan_id,
        p.type_portefeuille,
        p.solde,
        p.solde_en_attente,
        p.total_revenus,
        p.total_retraits,
        p.statut,
        p.created_at,
        a.nom as artisan_nom,
        a.telephone as artisan_telephone,
        a.localisation as artisan_localisation,
        (SELECT COUNT(*) FROM retraits r WHERE r.portefeuille_id = p.id AND r.statut = 'en_attente') as retraits_en_attente,
        (SELECT COUNT(*) FROM transactions_financieres tf WHERE tf.portefeuille_id = p.id) as total_transactions
      FROM portefeuilles p
      LEFT JOIN artisans a ON p.artisan_id = a.id
      ORDER BY p.type_portefeuille DESC, p.total_revenus DESC
    `);

    // Statistiques globales
    const statsGlobales = await db.query(`
      SELECT 
        SUM(solde) as total_soldes,
        SUM(solde_en_attente) as total_en_attente,
        SUM(total_revenus) as total_revenus_plateforme,
        SUM(total_retraits) as total_retraits_plateforme,
        COUNT(*) as nombre_portefeuilles
      FROM portefeuilles
    `);

    // Commission admin
    const adminWallet = await db.selectOne('portefeuilles', {
      type_portefeuille: 'admin'
    });

    return NextResponse.json({
      portefeuilles: portefeuilles.map((p: any) => ({
        id: p.id,
        artisan_id: p.artisan_id,
        type: p.type_portefeuille,
        artisan: p.artisan_nom ? {
          nom: p.artisan_nom,
          telephone: p.artisan_telephone,
          localisation: p.artisan_localisation,
        } : null,
        solde_disponible: parseFloat(p.solde || 0),
        solde_en_attente: parseFloat(p.solde_en_attente || 0),
        total_revenus: parseFloat(p.total_revenus || 0),
        total_retraits: parseFloat(p.total_retraits || 0),
        statut: p.statut,
        retraits_en_attente: p.retraits_en_attente || 0,
        total_transactions: p.total_transactions || 0,
        created_at: p.created_at,
      })),
      statistiques: {
        total_soldes: parseFloat(statsGlobales[0]?.total_soldes || 0),
        total_en_attente: parseFloat(statsGlobales[0]?.total_en_attente || 0),
        total_revenus_plateforme: parseFloat(statsGlobales[0]?.total_revenus_plateforme || 0),
        total_retraits_plateforme: parseFloat(statsGlobales[0]?.total_retraits_plateforme || 0),
        nombre_portefeuilles: statsGlobales[0]?.nombre_portefeuilles || 0,
        commission_admin: {
          solde_disponible: parseFloat(adminWallet?.solde || 0),
          solde_en_attente: parseFloat(adminWallet?.solde_en_attente || 0),
          total_commissions: parseFloat(adminWallet?.total_revenus || 0),
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération portefeuilles admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
