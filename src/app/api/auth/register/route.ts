import { NextRequest, NextResponse } from 'next/server';
import { db, DB_TYPE, generateUUID } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nom, 
      prenom,
      email, 
      mot_de_passe,
      telephone,
      adresse,
      bio,
      localisation,
      type_utilisateur = 'artisan'
    } = body;

    console.log('📝 Inscription:', { nom, prenom, email, type_utilisateur });

    // Validation des données obligatoires communes
    if (!nom || !email || !mot_de_passe || !telephone) {
      return NextResponse.json(
        { error: 'Nom, email, mot de passe et téléphone sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation supplémentaire pour acheteur (prenom requis)
    if (type_utilisateur === 'acheteur' && !prenom) {
      return NextResponse.json(
        { error: 'Le prénom est obligatoire pour les acheteurs' },
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

    // Validation du mot de passe (minimum 8 caractères)
    if (mot_de_passe.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà dans les deux tables
    const existingArtisanByEmail = await db.select('artisans', {
      columns: ['id', 'email'],
      where: { email },
      limit: 1
    });

    const existingAcheteurByEmail = await db.select('acheteurs', {
      columns: ['id', 'email'],
      where: { email },
      limit: 1
    });

    if (existingArtisanByEmail.length > 0 || existingAcheteurByEmail.length > 0) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Vérifier si le téléphone existe déjà dans les deux tables
    const existingArtisanByPhone = await db.select('artisans', {
      columns: ['id', 'telephone'],
      where: { telephone },
      limit: 1
    });

    const existingAcheteurByPhone = await db.select('acheteurs', {
      columns: ['id', 'telephone'],
      where: { telephone },
      limit: 1
    });

    if (existingArtisanByPhone.length > 0 || existingAcheteurByPhone.length > 0) {
      return NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 12);

    let user;
    const userId = generateUUID();

    if (type_utilisateur === 'artisan') {
      // Créer l'artisan
      const artisanData = {
        id: userId,
        nom: nom.trim(),
        email,
        password: hashedPassword,
        bio: bio || `Artisan tisserand de Waraniéné spécialisé dans les textiles traditionnels sénoufo.`,
        localisation: localisation || adresse || 'Waraniéné, Côte d\'Ivoire',
        telephone,
        langue: 'fr',
        statut: 'actif'
      };

      try {
        user = await db.insert('artisans', artisanData);
        console.log(`✅ Artisan créé via ${DB_TYPE.toUpperCase()}:`, user.email);
      } catch (error: any) {
        console.error('❌ Erreur création artisan:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la création du compte artisan' },
          { status: 500 }
        );
      }
    } else {
      // Créer l'acheteur
      const acheteurData = {
        id: userId,
        nom: nom.trim(),
        prenom: prenom?.trim() || '',
        email,
        mot_de_passe: hashedPassword,  // Les acheteurs utilisent mot_de_passe pas password
        telephone,
        adresse: adresse || ''
        // date_creation utilise DEFAULT CURRENT_TIMESTAMP dans MySQL
      };

      try {
        user = await db.insert('acheteurs', acheteurData);
        console.log(`✅ Acheteur créé via ${DB_TYPE.toUpperCase()}:`, user.email);
      } catch (error: any) {
        console.error('❌ Erreur création acheteur:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la création du compte acheteur' },
          { status: 500 }
        );
      }
    }

    // Créer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        nom: user.nom,
        prenom: user.prenom || null,
        telephone: user.telephone,
        type_utilisateur
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      token,
      user,
      type_utilisateur,
      message: `Compte ${type_utilisateur} créé avec succès`
    }, { status: 201 });
    
    // Définir le cookie côté serveur pour le middleware
    response.cookies.set('auth-token', token, {
      httpOnly: false, // Doit être accessible au JavaScript pour le localStorage
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
      path: '/'
    });
    
    return response;

  } catch (error) {
    console.error('❌ Erreur API inscription:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}