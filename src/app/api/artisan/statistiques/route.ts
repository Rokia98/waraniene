import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  type_utilisateur: string;
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Vérifier que c'est un artisan
    if (decoded.type_utilisateur !== 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux artisans' },
        { status: 403 }
      );
    }

    const artisanId = decoded.userId;

    // 1. Récupérer les produits de l'artisan
    const produits = await db.select('produits', {
      where: { artisan_id: artisanId }
    });

    const produitsIds = (produits || []).map((p: any) => p.id);
    const produitsActifs = (produits || []).filter((p: any) => p.statut === 'actif').length;

    // 2. Récupérer les commandes liées aux produits de l'artisan
    let commandes: any[] = [];
    let detailsCommandes: any[] = [];
    
    if (produitsIds.length > 0 && db.query) {
      // Récupérer les détails de commandes pour les produits de l'artisan
      detailsCommandes = await db.query(
        `SELECT dc.*, c.statut, c.date_commande, c.montant_total, c.acheteur_id
         FROM detail_commandes dc
         JOIN commandes c ON dc.commande_id = c.id
         WHERE dc.produit_id IN (${produitsIds.map(() => '?').join(',')})`,
        produitsIds
      );
    }

    // 3. Calculer les statistiques
    let totalVentes = 0;
    let commandesEnCours = 0;
    const commandesIds = new Set<number>();

    detailsCommandes.forEach((detail: any) => {
      commandesIds.add(detail.commande_id);
      totalVentes += parseFloat(detail.prix_unitaire) * detail.quantite;
      
      if (['en_attente', 'confirmee', 'preparee', 'expediee'].includes(detail.statut)) {
        commandesEnCours++;
      }
    });

    // 4. Récupérer les commandes récentes (5 dernières)
    const recentOrdersData: any[] = [];
    if (detailsCommandes.length > 0 && db.query) {
      const uniqueCommandeIds = Array.from(commandesIds);
      const recentCommandes = await db.query(
        `SELECT c.*, a.nom as acheteur_nom, a.prenom as acheteur_prenom
         FROM commandes c
         LEFT JOIN acheteurs a ON c.acheteur_id = a.id
         WHERE c.id IN (${uniqueCommandeIds.map(() => '?').join(',')})
         ORDER BY c.date_commande DESC
         LIMIT 5`,
        uniqueCommandeIds
      );

      for (const cmd of recentCommandes) {
        recentOrdersData.push({
          id: cmd.id,
          numero_commande: cmd.numero_commande,
          client: `${cmd.acheteur_prenom || ''} ${cmd.acheteur_nom || ''}`.trim() || 'Client inconnu',
          total: parseFloat(cmd.montant_total),
          statut: cmd.statut,
          date_commande: cmd.date_commande
        });
      }
    }

    // 5. Calculer les produits les plus vendus
    const produitsVentes = new Map<number, { quantite: number; revenus: number }>();
    
    detailsCommandes.forEach((detail: any) => {
      const current = produitsVentes.get(detail.produit_id) || { quantite: 0, revenus: 0 };
      produitsVentes.set(detail.produit_id, {
        quantite: current.quantite + detail.quantite,
        revenus: current.revenus + (parseFloat(detail.prix_unitaire) * detail.quantite)
      });
    });

    // Trier et récupérer les détails des top 5
    const topProductsIds = Array.from(produitsVentes.entries())
      .sort((a, b) => b[1].quantite - a[1].quantite)
      .slice(0, 5)
      .map(([id]) => id);

    const topProductsData: any[] = [];
    for (const produitId of topProductsIds) {
      const produit = produits.find((p: any) => p.id === produitId);
      if (produit) {
        const stats = produitsVentes.get(produitId)!;
        topProductsData.push({
          id: produit.id,
          nom: produit.nom_produit,
          artisan: 'Vous', // C'est l'artisan connecté
          ventes: stats.quantite,
          revenus: stats.revenus
        });
      }
    }

    // 6. Statistiques globales
    const stats = {
      totalVentes,
      commandesEnCours: Array.from(commandesIds).length, // Nombre de commandes uniques en cours
      produitsActifs,
      artisansActifs: 1, // L'artisan lui-même
      evaluationMoyenne: 4.5, // Valeur par défaut (peut être calculée si vous avez des avis)
      visiteursMois: 0 // Nécessite un système de tracking des visites
    };

    return NextResponse.json({
      success: true,
      stats,
      recentOrders: recentOrdersData,
      topProducts: topProductsData
    });

  } catch (error) {
    console.error('Erreur API statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
