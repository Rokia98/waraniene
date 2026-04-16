import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const acheteurs = await db.select('acheteurs', {
      where: { id: params.id },
      columns: ['id', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'date_creation'],
      limit: 1
    });
    const data = acheteurs && acheteurs.length > 0 ? acheteurs[0] : null;

    if (!data) {
      return NextResponse.json(
        { error: 'Acheteur introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les commandes
    const commandes = await db.select('commandes', {
      where: { acheteur_id: params.id },
      columns: ['id', 'montant_total', 'statut', 'date_commande']
    });

    // Calculer les statistiques
    const statistiques = {
      total_commandes: (commandes || []).length,
      montant_total_depense: (commandes || []).reduce((total, cmd) => total + (cmd.montant_total || 0), 0),
      commandes_par_statut: (commandes || []).reduce((acc, cmd) => {
        acc[cmd.statut] = (acc[cmd.statut] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      ...data,
      commandes: commandes || [],
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      nom, 
      prenom,
      email, 
      telephone,
      adresse,
      mot_de_passe 
    } = body;

    // Vérifier que l'acheteur existe
    const acheteursExistants = await db.select('acheteurs', {
      where: { id: params.id },
      columns: ['id', 'email'],
      limit: 1
    });
    const acheteurExistant = acheteursExistants && acheteursExistants.length > 0 ? acheteursExistants[0] : null;

    if (!acheteurExistant) {
      return NextResponse.json(
        { error: 'Acheteur introuvable' },
        { status: 404 }
      );
    }

    // Validation de l'email si modifié
    if (email && email !== acheteurExistant.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Format d\'email invalide' },
          { status: 400 }
        );
      }

      // Vérifier si le nouvel email existe déjà
      const existingUsers = await db.query(
        'SELECT email FROM acheteurs WHERE email = ? AND id != ?',
        [email, params.id]
      );

      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 409 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (email) updateData.email = email;
    if (telephone) updateData.telephone = telephone;
    if (adresse) updateData.adresse = adresse;

    // Hasher le nouveau mot de passe si fourni
    if (mot_de_passe) {
      updateData.mot_de_passe = await bcrypt.hash(mot_de_passe, 12);
    }

    await db.update('acheteurs', params.id, updateData);

    // Récupérer l'acheteur mis à jour
    const acheteursUpdated = await db.select('acheteurs', {
      where: { id: params.id },
      columns: ['id', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'date_creation', 'updated_at'],
      limit: 1
    });
    const data = acheteursUpdated && acheteursUpdated.length > 0 ? acheteursUpdated[0] : null;

    if (!data) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'acheteur' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que l'acheteur existe
    const acheteurs = await db.select('acheteurs', {
      where: { id: params.id },
      columns: ['id'],
      limit: 1
    });
    const acheteur = acheteurs && acheteurs.length > 0 ? acheteurs[0] : null;

    if (!acheteur) {
      return NextResponse.json(
        { error: 'Acheteur introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les commandes
    const commandes = await db.select('commandes', {
      where: { acheteur_id: params.id },
      columns: ['id', 'statut']
    });

    // Vérifier s'il a des commandes actives
    const commandesActives = (commandes || []).filter(
      (cmd: any) => ['confirmee', 'preparee', 'expediee'].includes(cmd.statut)
    );

    if (commandesActives.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un acheteur ayant des commandes en cours' },
        { status: 400 }
      );
    }

    await db.delete('acheteurs', params.id);

    return NextResponse.json({ 
      message: 'Acheteur supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}