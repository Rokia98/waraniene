import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const produitId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limite = parseInt(searchParams.get('limite') || '10');
    const offset = (page - 1) * limite;

    // Récupérer tous les avis approuvés pour ce produit
    const allAvis = await db.select('avis', {
      where: { 
        produit_id: produitId,
        statut: 'approuve'
      },
      orderBy: { column: 'created_at', direction: 'desc' }
    });

    const total = (allAvis || []).length;

    // Pagination côté application
    const avis = (allAvis || []).slice(offset, offset + limite);

    // Calculer la note moyenne
    let noteMoyenne = 0;
    if (allAvis && allAvis.length > 0) {
      const sommeNotes = allAvis.reduce((sum: number, a: any) => sum + (a.note || 0), 0);
      noteMoyenne = parseFloat((sommeNotes / allAvis.length).toFixed(1));
    }

    return NextResponse.json({
      success: true,
      avis,
      note_moyenne: noteMoyenne,
      total_avis: total,
      pagination: {
        page,
        limite,
        total,
        pages: Math.ceil(total / limite)
      }
    });

  } catch (error) {
    console.error('Erreur API avis GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const produitId = params.id;
    const body = await request.json();
    
    const {
      nom_acheteur,
      email_acheteur,
      note,
      titre,
      commentaire,
      achete_chez_nous
    } = body;

    // Validation
    if (!nom_acheteur || !email_acheteur || !note || !titre || !commentaire) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (note < 1 || note > 5) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const produits = await db.select('produits', {
      where: { id: produitId },
      limit: 1
    });

    if (!produits || produits.length === 0) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Créer l'avis
    const insertData: any = {
      produit_id: produitId,
      nom_acheteur,
      email_acheteur,
      note: parseInt(note),
      titre,
      commentaire,
      statut: 'en_attente'
    };

    // Ajouter achete_chez_nous seulement s'il est défini
    if (achete_chez_nous !== undefined) {
      insertData.achete_chez_nous = achete_chez_nous === true ? 1 : 0;
    }

    const avis = await db.insert('avis', insertData);

    // Envoyer email de notification à l'admin
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'admin@waraniene.com',
          type: 'avis_a_moderer',
          data: {
            nom_acheteur,
            titre,
            note,
            produit_id: produitId
          }
        })
      });
    } catch (emailError) {
      console.warn('Erreur envoi email admin:', emailError);
    }

    return NextResponse.json({
      success: true,
      avis,
      message: 'Avis soumis avec succès. Il sera publié après modération.'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API avis POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
