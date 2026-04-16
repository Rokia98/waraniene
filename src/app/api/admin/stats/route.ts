import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les commandes
    const allCommandes = await db.select('commandes', {
      columns: ['id', 'statut', 'montant_total', 'created_at']
    });

    const totalCommandes = (allCommandes || []).length;

    // Compter par statut
    const enAttente = (allCommandes || []).filter(c => c.statut === 'en_attente').length;
    const confirmees = (allCommandes || []).filter(c => c.statut === 'confirmee').length;
    const expediees = (allCommandes || []).filter(c => c.statut === 'expediee').length;
    const livrees = (allCommandes || []).filter(c => c.statut === 'livree').length;

    // Calculer les revenus
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const revenueTotal = (allCommandes || []).reduce((sum, c) => sum + (c.montant_total || 0), 0);
    const revenueMois = (allCommandes || [])
      .filter(c => new Date(c.created_at) >= firstDayOfMonth)
      .reduce((sum, c) => sum + (c.montant_total || 0), 0);

    // Total produits et artisans
    const allProduits = await db.select('produits', { columns: ['id'] });
    const totalProduits = (allProduits || []).length;

    const allArtisans = await db.select('artisans', { columns: ['id'] });
    const totalArtisans = (allArtisans || []).length;

    return NextResponse.json({
      total_commandes: totalCommandes,
      commandes_en_attente: enAttente,
      commandes_confirmees: confirmees,
      commandes_expediees: expediees,
      commandes_livrees: livrees,
      revenue_total: revenueTotal,
      revenue_mois: revenueMois,
      total_produits: totalProduits,
      total_artisans: totalArtisans
    });

  } catch (error) {
    console.error('Erreur stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    );
  }
}
