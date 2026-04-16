import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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

    // Compter les articles dans le panier
    const { data, error, count } = await supabaseAdmin
      .from('panier')
      .select('quantite', { count: 'exact' })
      .eq('acheteur_id', user.userId);

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors du comptage du panier' },
        { status: 500 }
      );
    }

    // Calculer le nombre total d'articles (somme des quantités)
    const totalItems = data?.reduce((sum, item) => sum + item.quantite, 0) || 0;

    return NextResponse.json({
      count: count || 0, // Nombre d'entrées différentes
      totalItems, // Somme de toutes les quantités
      isEmpty: totalItems === 0
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}