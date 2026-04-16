import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limite = parseInt(searchParams.get('limite') || '20');
    const offset = (page - 1) * limite;

    // Récupérer tous les codes promos actifs
    const now = new Date().toISOString();
    
    const allPromos = await db.select('codes_promo', {
      where: { actif: true },
      orderBy: { column: 'created_at', direction: 'desc' }
    });

    // Filtrer par dates (côté application car db.select ne supporte pas lte/gte)
    const promosActifs = (allPromos || []).filter((promo: any) => {
      return promo.date_debut <= now && promo.date_fin >= now;
    });

    // Pagination
    const promosPagines = promosActifs.slice(offset, offset + limite);

    return NextResponse.json({
      success: true,
      promos: promosPagines,
      pagination: {
        page,
        limite,
        total: promosActifs.length
      }
    });

  } catch (error) {
    console.error('Erreur GET promos:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Rechercher le code promo
    const promos = await db.select('codes_promo', {
      where: { code: code.toUpperCase(), actif: true },
      limit: 1
    });

    const promo = promos && promos.length > 0 ? promos[0] : null;

    if (!promo) {
      return NextResponse.json(
        { error: 'Code promo invalide' },
        { status: 404 }
      );
    }

    // Vérifier les dates
    if (promo.date_debut > now || promo.date_fin < now) {
      return NextResponse.json(
        { error: 'Code promo expiré' },
        { status: 404 }
      );
    }

    // Vérifier le nombre d'utilisations
    if (promo.utilisations_max && promo.utilisations >= promo.utilisations_max) {
      return NextResponse.json(
        { error: 'Code promo épuisé' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: promo.code,
      reduction: promo.reduction,
      type_reduction: promo.type_reduction, // 'pourcentage' ou 'montant_fixe'
      montant_min: promo.montant_min,
      description: promo.description
    });

  } catch (error) {
    console.error('Erreur validation code:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
