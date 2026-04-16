import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Récupérer les données complètes de l'utilisateur
    const acheteurs = await db.select('acheteurs', {
      where: { id: user.userId },
      limit: 1
    });
    const acheteur = acheteurs && acheteurs.length > 0 ? acheteurs[0] : null;

    if (!acheteur) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les commandes de l'utilisateur
    const commandes = await db.select('commandes', {
      where: { acheteur_id: user.userId },
      orderBy: 'date_commande',
      orderDirection: 'desc' as 'asc' | 'desc'
    }) || [];

    // Calculer les statistiques
    const statistiques = {
      total_commandes: commandes.length,
      montant_total_depense: commandes.reduce((total: number, cmd: any) => total + (cmd.montant_total || 0), 0),
      derniere_commande: commandes.length > 0 ? commandes[0] : null
    };

    // Retirer le mot de passe de la réponse
    const { mot_de_passe, ...acheteurSafe } = acheteur;

    return NextResponse.json({
      ...acheteurSafe,
      commandes,
      statistiques
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}