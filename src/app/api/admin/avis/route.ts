import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const statut = request.nextUrl.searchParams.get('statut') || 'en_attente';
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limite = 20;
    const offset = (page - 1) * limite;

    // Récupérer tous les avis avec le statut demandé
    const allAvis = await db.select('avis', {
      where: { statut },
      orderBy: { column: 'created_at', direction: 'desc' }
    });

    const total = (allAvis || []).length;

    // Pagination côté application
    const avisPagines = (allAvis || []).slice(offset, offset + limite);

    // Enrichir avec les noms de produits
    const avisEnrichis = await Promise.all(
      avisPagines.map(async (a: any) => {
        const produits = await db.select('produits', {
          where: { id: a.produit_id },
          limit: 1
        });
        const produit = produits && produits.length > 0 ? produits[0] : null;

        return {
          id: a.id,
          produit_id: a.produit_id,
          produit_nom: produit?.nom_produit || 'Produit inconnu',
          nom_acheteur: a.nom_acheteur,
          note: a.note,
          titre: a.titre,
          commentaire: a.commentaire,
          statut: a.statut,
          created_at: a.created_at
        };
      })
    );

    return NextResponse.json({
      avis: avisEnrichis,
      total,
      page,
      pages: Math.ceil(total / limite)
    });
  } catch (error: any) {
    console.error('Erreur GET /api/admin/avis:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
