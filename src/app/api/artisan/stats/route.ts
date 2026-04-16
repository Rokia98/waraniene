import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-ultra-securise';

// Helper pour extraire l'artisan du token
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

// GET - Statistiques du dashboard artisan
export async function GET(request: NextRequest) {
  try {
    const artisan_id = getArtisanFromToken(request);
    
    if (!artisan_id) {
      return NextResponse.json(
        { error: 'Non autorisé - artisan requis' },
        { status: 401 }
      );
    }

    console.log('📊 Récupération statistiques artisan:', artisan_id);

    // Récupérer les produits de l'artisan
    const { data: produits } = await supabaseAdmin
      .from('produits')
      .select('id, nom_produit, statut, stock, prix')
      .eq('artisan_id', artisan_id);

    const total_produits = produits?.length || 0;
    const produits_actifs = produits?.filter(p => p.statut === 'actif').length || 0;

    // Récupérer les commandes de l'artisan (via ses produits)
    const produitIds = produits?.map(p => p.id) || [];
    
    let commandes_data: any[] = [];
    let detail_commandes_data: any[] = [];

    if (produitIds.length > 0) {
      // Récupérer les détails de commandes pour les produits de l'artisan
      const { data: details } = await supabaseAdmin
        .from('detail_commandes')
        .select(`
          *,
          commande:commandes(
            id,
            montant_total,
            statut,
            date_commande,
            nom_acheteur,
            email_acheteur
          )
        `)
        .in('produit_id', produitIds);

      detail_commandes_data = details || [];

      // Extraire les commandes uniques
      const commandesMap = new Map();
      details?.forEach(d => {
        if (d.commande && !commandesMap.has(d.commande.id)) {
          commandesMap.set(d.commande.id, d.commande);
        }
      });
      commandes_data = Array.from(commandesMap.values());
    }

    // Calculer les statistiques
    const produits_vendus = detail_commandes_data.reduce(
      (sum, d) => sum + (d.quantite || 0), 
      0
    );

    const revenu_total = detail_commandes_data.reduce(
      (sum, d) => sum + ((d.prix_unitaire || 0) * (d.quantite || 0)), 
      0
    );

    // Ventes du mois en cours
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const ventesMois = detail_commandes_data.filter(d => {
      const dateCommande = new Date(d.commande?.date_commande);
      return dateCommande >= debutMois;
    });

    const ventes_mois = ventesMois.length;
    const revenu_mois = ventesMois.reduce(
      (sum, d) => sum + ((d.prix_unitaire || 0) * (d.quantite || 0)), 
      0
    );

    const commandes_en_cours = commandes_data.filter(
      c => ['en_attente', 'confirmee', 'preparee'].includes(c.statut)
    ).length;

    // Commandes récentes (5 dernières)
    const recentOrders = commandes_data
      .sort((a, b) => new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime())
      .slice(0, 5)
      .map(cmd => {
        const details = detail_commandes_data.filter(d => d.commande?.id === cmd.id);
        const produit_noms = details.map(d => {
          const produit = produits?.find(p => p.id === d.produit_id) as any;
          return produit ? `${produit.nom_produit || 'Produit'}` : 'Produit';
        });

        return {
          id: cmd.id,
          acheteur_nom: cmd.nom_acheteur || 'Acheteur',
          produit_nom: produit_noms.join(', '),
          quantite: details.reduce((sum, d) => sum + d.quantite, 0),
          total: cmd.montant_total,
          statut: cmd.statut,
          date_commande: cmd.date_commande
        };
      });

    const stats = {
      total_produits,
      produits_actifs,
      produits_vendus,
      ventes_mois,
      revenu_total,
      revenu_mois,
      commandes_en_cours
    };

    console.log('✅ Statistiques calculées:', stats);

    return NextResponse.json({
      success: true,
      stats,
      recentOrders
    });

  } catch (error) {
    console.error('❌ Erreur API stats artisan:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
