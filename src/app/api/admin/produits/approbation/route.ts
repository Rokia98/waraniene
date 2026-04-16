import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/admin/produits/approbation
 * Récupérer tous les produits en attente d'approbation
 */
export async function GET(request: NextRequest) {
  try {
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statutApprobation = searchParams.get('statut') || 'en_attente'; // en_attente, approuve, rejete

    const produits = await db.query(`
      SELECT 
        p.*,
        a.nom as artisan_nom,
        a.telephone as artisan_telephone,
        a.localisation as artisan_localisation,
        a.statut as artisan_statut,
        (SELECT COUNT(*) FROM detail_commandes dc WHERE dc.produit_id = p.id) as nombre_ventes
      FROM produits p
      INNER JOIN artisans a ON p.artisan_id = a.id
      WHERE p.statut_approbation = ?
      ORDER BY p.created_at DESC
    `, [statutApprobation]);

    return NextResponse.json({
      produits: produits.map((p: any) => ({
        id: p.id,
        nom_produit: p.nom_produit,
        description: p.description,
        categorie: p.categorie,
        prix: parseFloat(p.prix),
        stock: p.stock,
        statut: p.statut,
        statut_approbation: p.statut_approbation,
        date_approbation: p.date_approbation,
        approuve_par: p.approuve_par,
        notes_approbation: p.notes_approbation,
        photos: p.photos ? JSON.parse(p.photos) : [],
        artisan: {
          id: p.artisan_id,
          nom: p.artisan_nom,
          telephone: p.artisan_telephone,
          localisation: p.artisan_localisation,
          statut: p.artisan_statut,
        },
        nombre_ventes: p.nombre_ventes || 0,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }))
    });

  } catch (error) {
    console.error('Erreur récupération produits approbation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/produits/approbation/[id]
 * Approuver ou rejeter un produit
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    const adminId = request.headers.get('x-admin-id');
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const produitId = context.params.id;
    const body = await request.json();
    const { action, notes } = body; // action: 'approuver' ou 'rejeter'

    // Récupérer le produit
    const produit = await db.selectOne('produits', { id: produitId });

    if (!produit) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    if (produit.statut_approbation !== 'en_attente') {
      return NextResponse.json(
        { error: 'Ce produit a déjà été traité' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let updateData: any = {
      date_approbation: now,
      approuve_par: adminId || null,
      notes_approbation: notes || null,
    };

    if (action === 'approuver') {
      updateData.statut_approbation = 'approuve';
      // Rendre le produit actif s'il était en attente
      if (produit.statut === 'inactif') {
        updateData.statut = 'actif';
      }
    } else if (action === 'rejeter') {
      updateData.statut_approbation = 'rejete';
      updateData.statut = 'inactif'; // Désactiver le produit rejeté
    } else {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez: approuver ou rejeter' },
        { status: 400 }
      );
    }

    await db.update('produits', produitId, updateData);

    // TODO: Envoyer notification à l'artisan
    // await notifierArtisan(produit.artisan_id, action, produit.nom_produit, notes);

    return NextResponse.json({
      success: true,
      message: `Produit ${action === 'approuver' ? 'approuvé' : 'rejeté'} avec succès`,
      produit: {
        ...produit,
        ...updateData,
      }
    });

  } catch (error) {
    console.error('Erreur approbation produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
