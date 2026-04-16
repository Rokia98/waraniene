import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get('periode') || '30'; // nombre de jours

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - parseInt(periode));
    const dateDebutISO = dateDebut.toISOString();

    // Statistiques des produits
    const produitsStats = await db.select('produits', {
      columns: ['id', 'statut']
    });

    // Statistiques des artisans
    const artisansStats = await db.select('artisans', {
      columns: ['id', 'statut']
    });

    // Statistiques des acheteurs (nouveaux sur la période)
    const allAcheteurs = await db.select('acheteurs', {
      columns: ['id', 'date_creation']
    });
    const acheteursStats = (allAcheteurs || []).filter(a => 
      new Date(a.date_creation) >= dateDebut
    );

    // Statistiques des commandes (sur la période)
    const allCommandes = await db.select('commandes', {
      columns: ['id', 'montant_total', 'statut', 'date_commande']
    });
    const commandesStats = (allCommandes || []).filter(c => 
      new Date(c.date_commande) >= dateDebut
    );

    // Calcul des métriques
    const totalProduits = (produitsStats || []).length;
    const produitsActifs = (produitsStats || []).filter(p => p.statut === 'actif').length;

    const totalArtisans = (artisansStats || []).length;
    const artisansActifs = (artisansStats || []).filter(a => a.statut === 'actif').length;

    const nouveauxAcheteurs = acheteursStats.length;

    const totalCommandes = commandesStats.length;
    const chiffreAffaires = commandesStats.reduce((total, cmd) => total + (cmd.montant_total || 0), 0);

    const commandesParStatut = commandesStats.reduce((acc, cmd) => {
      acc[cmd.statut] = (acc[cmd.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Évolution des commandes par jour (derniers 7 jours)
    const evolutionCommandes = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const commandesDuJour = commandesStats.filter(cmd => 
        cmd.date_commande.split('T')[0] === dateStr
      ).length;

      evolutionCommandes.push({
        date: dateStr,
        commandes: commandesDuJour
      });
    }

    // Top 5 des produits les plus commandés
    const allDetails = await db.select('detail_commandes', {
      columns: ['produit_id', 'quantite', 'created_at']
    });
    const topProduits = (allDetails || []).filter(d => 
      new Date(d.created_at) >= dateDebut
    );

    // Enrichir avec les noms de produits
    const produitsPopulaires: Record<string, { nom: string; totalVendu: number }> = {};
    
    for (const detail of topProduits) {
      const produitId = detail.produit_id;
      
      if (!produitsPopulaires[produitId]) {
        // Récupérer le nom du produit
        const produits = await db.select('produits', {
          where: { id: produitId },
          columns: ['nom_produit'],
          limit: 1
        });
        const produit = produits && produits.length > 0 ? produits[0] : null;
        
        produitsPopulaires[produitId] = {
          nom: produit?.nom_produit || 'Produit inconnu',
          totalVendu: 0
        };
      }
      
      produitsPopulaires[produitId].totalVendu += detail.quantite;
    }

    const topProduitsArray = Object.entries(produitsPopulaires)
      .sort(([, a], [, b]) => b.totalVendu - a.totalVendu)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    return NextResponse.json({
      periode: parseInt(periode),
      produits: {
        total: totalProduits,
        actifs: produitsActifs,
        inactifs: totalProduits - produitsActifs
      },
      artisans: {
        total: totalArtisans,
        actifs: artisansActifs,
        inactifs: totalArtisans - artisansActifs
      },
      acheteurs: {
        nouveaux: nouveauxAcheteurs
      },
      commandes: {
        total: totalCommandes,
        chiffre_affaires: chiffreAffaires,
        par_statut: commandesParStatut,
        evolution: evolutionCommandes
      },
      produits_populaires: topProduitsArray,
      genere_le: new Date().toISOString()
    });
        inactifs: totalProduits - produitsActifs
      },
      artisans: {
        total: totalArtisans,
        actifs: artisansActifs,
        inactifs: totalArtisans - artisansActifs
      },
      acheteurs: {
        nouveaux: nouveauxAcheteurs
      },
      commandes: {
        total: totalCommandes,
        chiffre_affaires: chiffreAffaires,
        par_statut: commandesParStatut,
        evolution: evolutionCommandes
      },
      produits_populaires: topProduitsArray,
      genere_le: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}