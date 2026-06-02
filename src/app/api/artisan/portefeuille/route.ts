import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-ultra-securise';

function getArtisanFromToken(request: NextRequest): string | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type_utilisateur !== 'artisan') return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const artisanId = getArtisanFromToken(request);

    if (!artisanId) {
      return NextResponse.json({ error: 'Artisan non authentifié' }, { status: 401 });
    }

    // Récupérer le portefeuille
    const portefeuilles = await db.select('portefeuilles', { where: { artisan_id: artisanId } });
    const portefeuille = portefeuilles[0] || null;

    if (!portefeuille) {
      // Retourner un portefeuille vide si non trouvé
      return NextResponse.json({
        portefeuille: {
          id: null,
          solde_disponible: 0,
          solde_en_attente: 0,
          total_revenus: 0,
          total_retraits: 0,
          statut: 'actif',
        },
        transactions: [],
        statistiques: { total_commandes: 0, total_ventes: 0, total_transactions: 0 }
      });
    }

    let transactions: any[] = [];
    let statsData: any[] = [];

    if (db.query) {
      transactions = await db.query(`
        SELECT id, type_transaction, montant, solde_avant, solde_apres,
               commande_id, description, metadata, created_at
        FROM transactions_financieres
        WHERE portefeuille_id = ?
        ORDER BY created_at DESC
        LIMIT 20
      `, [portefeuille.id]);

      statsData = await db.query(`
        SELECT
          COUNT(DISTINCT commande_id) as total_commandes,
          SUM(montant) as total_ventes,
          COUNT(*) as total_transactions
        FROM transactions_financieres
        WHERE portefeuille_id = ? AND type_transaction = 'credit_vente'
      `, [portefeuille.id]);
    }

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
        description: t.description,
        metadata: t.metadata ? JSON.parse(t.metadata) : null,
        date: t.created_at,
      })),
      statistiques: {
        total_commandes: statsData[0]?.total_commandes || 0,
        total_ventes: parseFloat(statsData[0]?.total_ventes || 0),
        total_transactions: statsData[0]?.total_transactions || 0,
      }
    });

  } catch (error) {
    console.error('Erreur récupération portefeuille:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
