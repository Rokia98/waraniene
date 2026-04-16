import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

console.log('🔐 API Login JWT_SECRET:', JWT_SECRET?.substring(0, 10) + '...');

export async function POST(request: NextRequest) {
  console.log('🔐 API Login - Début de la requête');
  
  try {
    const body = await request.json();
    const { email, mot_de_passe, type_utilisateur = 'artisan' } = body;
    
    console.log('📧 Email reçu:', email);
    console.log('👤 Type utilisateur:', type_utilisateur);

    // Validation des données
    if (!email || !mot_de_passe) {
      console.log('❌ Validation échouée - données manquantes');
      return NextResponse.json(
        { error: 'Email et mot de passe sont obligatoires' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur dans la table appropriée
    const table = type_utilisateur === 'artisan' ? 'artisans' : 'acheteurs';
    console.log(`🔍 Recherche de l'utilisateur dans la table ${table}...`);
    
    const users = await db.select(table, {
      where: { email },
      limit: 1
    });

    if (!users || users.length === 0) {
      console.log(`❌ Utilisateur non trouvé: Pas d'utilisateur avec cet email dans ${table}`);
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    console.log('✅ Utilisateur trouvé:', user.nom, user.email);

    // Vérifier le statut (seulement pour artisans)
    if (type_utilisateur === 'artisan' && user.statut !== 'actif') {
      console.log('❌ Compte non actif:', user.statut);
      return NextResponse.json(
        { error: 'Votre compte est ' + user.statut },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    console.log('🔑 Vérification du mot de passe...');
    const passwordField = type_utilisateur === 'artisan' ? user.password : user.mot_de_passe;
    const motDePasseValide = await bcrypt.compare(mot_de_passe, passwordField);

    if (!motDePasseValide) {
      console.log('❌ Mot de passe invalide');
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    console.log('✅ Mot de passe valide');

    // Créer le token JWT
    console.log('🎫 Création du token JWT...');
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
    
    console.log('✅ Token créé avec succès');

    // Retourner les données utilisateur (sans le mot de passe)
    const { password, mot_de_passe: _, ...userData } = user;

    console.log('🎉 Connexion réussie, envoi de la réponse...');
    
    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: userData,
      type_utilisateur,
      message: `Connexion ${type_utilisateur} réussie`
    });
    
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
    console.error('💥 Erreur authentification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}