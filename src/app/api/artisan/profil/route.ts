import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

async function getArtisanFromToken(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('❌ Pas de token dans les cookies');
      return null;
    }

    // Vérifier le token avec jose
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    
    if (payload.type_utilisateur !== 'artisan') {
      console.log('❌ Type utilisateur non artisan:', payload.type_utilisateur);
      return null;
    }

    return (payload.userId as string) || (payload.id as string);
  } catch (error) {
    console.error('❌ Erreur vérification token:', error);
    return null;
  }
}

// GET - Récupérer le profil de l'artisan connecté
export async function GET(request: NextRequest) {
  try {
    const artisan_id = await getArtisanFromToken(request);
    
    if (!artisan_id) {
      return NextResponse.json(
        { error: 'Non autorisé - artisan requis' },
        { status: 401 }
      );
    }

    console.log('👤 Récupération profil artisan:', artisan_id);

    const artisans = await db.select('artisans', {
      where: { id: artisan_id },
      limit: 1
    });

    const artisan = artisans?.[0];

    if (!artisan) {
      console.error('❌ Erreur récupération artisan');
      return NextResponse.json(
        { error: 'Artisan introuvable' },
        { status: 404 }
      );
    }

    console.log('✅ Profil artisan récupéré:', artisan.nom);

    return NextResponse.json({
      success: true,
      artisan
    });

  } catch (error) {
    console.error('❌ Erreur API profil artisan:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le profil de l'artisan
export async function PUT(request: NextRequest) {
  try {
    const artisan_id = await getArtisanFromToken(request);
    
    if (!artisan_id) {
      return NextResponse.json(
        { error: 'Non autorisé - artisan requis' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nom, prenom, telephone, bio, localisation, specialite, photo } = body;

    console.log('✏️ Mise à jour profil artisan:', artisan_id);

    const updateData: any = {};
    
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (bio !== undefined) updateData.bio = bio;
    if (localisation !== undefined) updateData.localisation = localisation;
    if (specialite !== undefined) updateData.specialite = specialite;
    if (photo !== undefined) updateData.photo = photo;

    await db.update('artisans', artisan_id, updateData);

    const artisans = await db.select('artisans', {
      where: { id: artisan_id },
      limit: 1
    });

    const artisan = artisans?.[0];

    if (!artisan) {
      console.error('❌ Erreur mise à jour artisan');
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      );
    }

    console.log('✅ Profil artisan mis à jour');

    return NextResponse.json({
      success: true,
      artisan
    });

  } catch (error) {
    console.error('❌ Erreur API mise à jour profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
