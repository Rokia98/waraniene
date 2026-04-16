import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'nom';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Construire les conditions de recherche
    const where: any = {};
    let searchConditions = undefined;
    
    if (search) {
      searchConditions = [
        { nom: { like: `%${search}%` } },
        { bio: { like: `%${search}%` } },
        { localisation: { like: `%${search}%` } }
      ];
    }

    // Récupérer les artisans
    const artisans = await db.select('artisans', {
      where: searchConditions ? undefined : where,
      searchOr: searchConditions,
      orderBy: sortBy,
      orderDirection: sortOrder as 'asc' | 'desc',
      limit,
      offset
    });

    // Compter le total (pour la pagination)
    const totalArtisans = await db.select('artisans', { where: searchConditions ? undefined : where, searchOr: searchConditions });
    const total = totalArtisans?.length || 0;

    // Récupérer le nombre de produits pour chaque artisan
    const artisansWithCount = await Promise.all(
      (artisans || []).map(async (artisan: any) => {
        const produits = await db.select('produits', { where: { artisan_id: artisan.id } });
        return {
          ...artisan,
          produits: { count: produits?.length || 0 }
        };
      })
    );

    return NextResponse.json({
      artisans: artisansWithCount || [],
      total,
      hasMore: offset + limit < total
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      nom, 
      bio, 
      localisation, 
      telephone, 
      langue = 'fr',
      photo 
    } = body;

    // Validation des données
    if (!nom || !bio || !localisation || !telephone) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    // Vérifier l'unicité du téléphone
    const existingArtisan = await db.select('artisans', {
      where: { telephone },
      limit: 1
    });

    if (existingArtisan && existingArtisan.length > 0) {
      return NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà utilisé' },
        { status: 409 }
      );
    }

    // Créer l'artisan
    const newArtisan = await db.insert('artisans', {
      nom,
      bio,
      localisation,
      telephone,
      langue,
      photo,
      date_inscription: new Date().toISOString()
    });

    if (!newArtisan) {
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'artisan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ artisan: newArtisan }, { status: 201 });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}