import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

interface CartItem {
  produit_id: string;
  quantite: number;
}

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
    const body = await request.json();
    const { items = [] } = body as { items: CartItem[] };

    // Validation des données
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Vider le panier existant de l'utilisateur
    await supabaseAdmin
      .from('panier')
      .delete()
      .eq('acheteur_id', user.userId);

    // Si pas d'articles à synchroniser, retourner succès
    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Panier synchronisé (vide)',
        items: []
      });
    }

    // Vérifier tous les produits et préparer les données
    const validItems = [];
    const errors = [];

    for (const item of items) {
      if (!item.produit_id || !item.quantite || item.quantite < 1) {
        errors.push(`Article invalide: ${item.produit_id}`);
        continue;
      }

      // Vérifier le produit
      const { data: produit } = await supabaseAdmin
        .from('produits')
        .select('id, nom_produit, prix, stock, statut')
        .eq('id', item.produit_id)
        .single();

      if (!produit) {
        errors.push(`Produit introuvable: ${item.produit_id}`);
        continue;
      }

      if (produit.statut !== 'actif') {
        errors.push(`Produit non disponible: ${produit.nom_produit}`);
        continue;
      }

      if (produit.stock < item.quantite) {
        // Ajuster la quantité au stock disponible
        if (produit.stock > 0) {
          validItems.push({
            acheteur_id: user.userId,
            produit_id: item.produit_id,
            quantite: produit.stock,
            date_ajout: new Date().toISOString()
          });
          errors.push(`Stock insuffisant pour ${produit.nom_produit}. Quantité ajustée à ${produit.stock}.`);
        } else {
          errors.push(`${produit.nom_produit} est en rupture de stock.`);
        }
      } else {
        validItems.push({
          acheteur_id: user.userId,
          produit_id: item.produit_id,
          quantite: item.quantite,
          date_ajout: new Date().toISOString()
        });
      }
    }

    // Insérer les articles valides
    let insertedItems: any[] = [];
    if (validItems.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('panier')
        .insert(validItems)
        .select(`
          id,
          quantite,
          date_ajout,
          produit:produits(
            id,
            nom_produit,
            prix,
            photos,
            stock,
            artisan:artisans(nom)
          )
        `);

      if (error) {
        console.error('Erreur insertion panier:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la synchronisation' },
          { status: 500 }
        );
      }

      insertedItems = data || [];
    }

    return NextResponse.json({
      success: true,
      message: 'Panier synchronisé avec succès',
      items: insertedItems,
      errors: errors.length > 0 ? errors : undefined,
      synchronized: validItems.length,
      skipped: items.length - validItems.length
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}