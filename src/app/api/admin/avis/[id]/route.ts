import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { statut } = await request.json();

    if (!['approuve', 'rejete'].includes(statut)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'avis existe
    const avisExistants = await db.select('avis', {
      where: { id: params.id },
      limit: 1
    });

    if (!avisExistants || avisExistants.length === 0) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    await db.update('avis', params.id, { statut });

    // Récupérer l'avis mis à jour
    const avisMisAJour = await db.select('avis', {
      where: { id: params.id },
      limit: 1
    });

    const avis = avisMisAJour && avisMisAJour.length > 0 ? avisMisAJour[0] : null;

    // Envoyer une notification à l'acheteur (optionnel)
    if (statut === 'approuve') {
      // Vous pouvez ajouter une notification d'approbation ici
    }

    return NextResponse.json({
      message: `Avis ${statut}`,
      avis
    });
  } catch (error: any) {
    console.error('Erreur PUT /api/admin/avis/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
