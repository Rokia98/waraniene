import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Fonction utilitaire pour extraire et vérifier le token
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    console.error('Token invalide:', error);
    return null;
  }
}

// GET - Récupérer le profil de l'acheteur connecté
export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que c'est bien un acheteur
    if (decoded.type_utilisateur !== 'acheteur') {
      return NextResponse.json(
        { error: 'Accès refusé: endpoint réservé aux acheteurs' },
        { status: 403 }
      );
    }

    const acheteur_id = decoded.userId;

    // Récupérer le profil de l'acheteur
    const acheteurs = await db.select('acheteurs', {
      where: { id: acheteur_id },
      limit: 1
    });

    if (!acheteurs || acheteurs.length === 0) {
      return NextResponse.json(
        { error: 'Acheteur non trouvé' },
        { status: 404 }
      );
    }

    const acheteur = acheteurs[0];

    // Ne pas retourner le mot de passe
    const { mot_de_passe, ...acheteurData } = acheteur;

    return NextResponse.json({
      success: true,
      acheteur: acheteurData
    });

  } catch (error) {
    console.error('Erreur API profil acheteur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Modifier le profil de l'acheteur connecté
export async function PUT(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que c'est bien un acheteur
    if (decoded.type_utilisateur !== 'acheteur') {
      return NextResponse.json(
        { error: 'Accès refusé: endpoint réservé aux acheteurs' },
        { status: 403 }
      );
    }

    const acheteur_id = decoded.userId;
    const body = await request.json();

    // Champs modifiables
    const { 
      nom, 
      prenom, 
      telephone, 
      adresse,
      mot_de_passe,
      ancien_mot_de_passe
    } = body;

    // Vérifier que l'acheteur existe
    const acheteurs = await db.select('acheteurs', {
      where: { id: acheteur_id },
      limit: 1
    });

    if (!acheteurs || acheteurs.length === 0) {
      return NextResponse.json(
        { error: 'Acheteur non trouvé' },
        { status: 404 }
      );
    }

    const acheteur = acheteurs[0];

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (adresse !== undefined) updateData.adresse = adresse;

    // Changement de mot de passe (nécessite l'ancien mot de passe)
    if (mot_de_passe && ancien_mot_de_passe) {
      const motDePasseValide = await bcrypt.compare(ancien_mot_de_passe, acheteur.mot_de_passe);
      
      if (!motDePasseValide) {
        return NextResponse.json(
          { error: 'Ancien mot de passe incorrect' },
          { status: 400 }
        );
      }

      // Valider le nouveau mot de passe
      if (mot_de_passe.length < 8) {
        return NextResponse.json(
          { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(mot_de_passe, 12);
      updateData.mot_de_passe = hashedPassword;
    }

    // Si aucune donnée à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    // Mettre à jour le profil
    await db.update('acheteurs', acheteur_id, updateData);

    // Récupérer le profil mis à jour
    const acheteursUpdated = await db.select('acheteurs', {
      where: { id: acheteur_id },
      limit: 1
    });

    const acheteurUpdated = acheteursUpdated[0];
    const { mot_de_passe: _, ...acheteurData } = acheteurUpdated;

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      acheteur: acheteurData
    });

  } catch (error) {
    console.error('Erreur modification profil acheteur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
