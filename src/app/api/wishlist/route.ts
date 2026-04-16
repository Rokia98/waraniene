import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Check if in wishlist or list user's wishlist
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const produitId = request.nextUrl.searchParams.get('produit_id');

    if (produitId) {
      // Vérifier si le produit est dans la wishlist
      const data = await db.select('wishlist', {
        where: { acheteur_id: user.userId, produit_id: produitId },
        limit: 1
      });

      return NextResponse.json({
        inWishlist: data && data.length > 0
      });
    } else {
      // Lister tous les favoris
      const data = await db.select('wishlist', {
        where: { acheteur_id: user.userId }
      });

      return NextResponse.json({
        wishlist: data || []
      });
    }
  } catch (error: any) {
    console.error('Erreur GET /api/wishlist:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { produit_id } = await request.json();

    // Vérifier si déjà dans wishlist
    const existing = await db.select('wishlist', {
      where: { acheteur_id: user.userId, produit_id },
      limit: 1
    });

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Déjà dans les favoris' },
        { status: 400 }
      );
    }

    // Ajouter à wishlist
    const newItem = await db.insert('wishlist', {
      acheteur_id: user.userId,
      produit_id: produit_id,
      date_ajout: new Date().toISOString()
    });

    if (!newItem) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout aux favoris' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Ajouté aux favoris',
      wishlist: newItem
    });
  } catch (error: any) {
    console.error('Erreur POST /api/wishlist:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const produitId = request.nextUrl.searchParams.get('produit_id');

    if (!produitId) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      );
    }

    // Trouver l'item dans la wishlist
    const items = await db.select('wishlist', {
      where: { acheteur_id: user.userId, produit_id: produitId },
      limit: 1
    });

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Item non trouvé dans les favoris' },
        { status: 404 }
      );
    }

    // Supprimer de la wishlist
    const deleted = await db.delete('wishlist', items[0].id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression des favoris' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Retiré des favoris'
    });
  } catch (error: any) {
    console.error('Erreur DELETE /api/wishlist:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
