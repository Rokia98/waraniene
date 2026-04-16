import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Récupérer tous les acheteurs
    let acheteurs = await db.select('acheteurs', {
      orderBy: sortBy,
      orderDirection: sortOrder as 'asc' | 'desc'
    });

    // Filtrer par recherche côté application
    if (search) {
      const searchLower = search.toLowerCase();
      acheteurs = (acheteurs || []).filter((a: any) => {
        return (
          a.nom?.toLowerCase().includes(searchLower) ||
          a.prenom?.toLowerCase().includes(searchLower) ||
          a.email?.toLowerCase().includes(searchLower) ||
          a.telephone?.includes(search)
        );
      });
    }

    const total = acheteurs?.length || 0;

    // Pagination côté application
    const acheteursPageines = (acheteurs || []).slice(offset, offset + limit);

    // Ajouter le nombre de commandes pour chaque acheteur
    const acheteursAvecCount = await Promise.all(
      acheteursPageines.map(async (acheteur: any) => {
        const commandes = await db.select('commandes', {
          where: { acheteur_id: acheteur.id }
        });
        return {
          ...acheteur,
          commandes: { count: commandes?.length || 0 }
        };
      })
    );

    return NextResponse.json({
      acheteurs: acheteursAvecCount,
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
      prenom,
      email, 
      mot_de_passe,
      telephone,
      adresse 
    } = body;

    // Validation des données
    if (!nom || !prenom || !email || !mot_de_passe) {
      return NextResponse.json(
        { error: 'Nom, prénom, email et mot de passe sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUsers = await db.select('acheteurs', {
      where: { email },
      limit: 1
    });

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 12);

    const newAcheteur = await db.insert('acheteurs', {
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      telephone,
      adresse,
      date_creation: new Date().toISOString()
    });

    if (!newAcheteur) {
      console.error('Erreur création acheteur');
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    // Retourner les données sans le mot de passe
    const { mot_de_passe: _, ...acheteurData } = newAcheteur;

    return NextResponse.json({ 
      acheteur: acheteurData 
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}