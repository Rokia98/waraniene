import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

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

    // Récupérer tous les articles du panier
    const { data: panierItems, error } = await supabaseAdmin
      .from('panier')
      .select(`
        id,
        quantite,
        produit:produits(
          id,
          nom_produit,
          prix,
          stock,
          statut
        )
      `)
      .eq('acheteur_id', user.userId);

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la validation du panier' },
        { status: 500 }
      );
    }

    if (!panierItems || panierItems.length === 0) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Votre panier est vide' 
        },
        { status: 400 }
      );
    }

    const validationResults = [];
    const errors = [];
    let totalAmount = 0;
    let allValid = true;

    // Valider chaque article
    for (const item of panierItems) {
      const produit = item.produit as any;
      const validation = {
        panier_id: item.id,
        produit_id: produit.id,
        nom_produit: produit.nom_produit,
        quantite_demandee: item.quantite,
        quantite_disponible: produit.stock,
        prix_unitaire: produit.prix,
        valid: true,
        message: ''
      };

      // Vérifier si le produit est actif
      if (produit.statut !== 'actif') {
        validation.valid = false;
        validation.message = 'Produit non disponible';
        errors.push(`${produit.nom_produit} n'est plus disponible`);
        allValid = false;
      }
      // Vérifier le stock
      else if (produit.stock < item.quantite) {
        validation.valid = false;
        validation.quantite_disponible = produit.stock;
        if (produit.stock > 0) {
          validation.message = `Stock insuffisant. Seulement ${produit.stock} disponible(s)`;
          errors.push(`${produit.nom_produit}: seulement ${produit.stock} disponible(s) sur ${item.quantite} demandé(s)`);
        } else {
          validation.message = 'Rupture de stock';
          errors.push(`${produit.nom_produit} est en rupture de stock`);
        }
        allValid = false;
      }
      // Article valide
      else {
        validation.message = 'Disponible';
        totalAmount += produit.prix * item.quantite;
      }

      validationResults.push(validation);
    }

    // Calculer les frais de livraison (exemple: 2000 FCFA)
    const fraisLivraison = totalAmount > 50000 ? 0 : 2000; // Livraison gratuite au-dessus de 50 000 FCFA
    const montantTotal = totalAmount + fraisLivraison;

    return NextResponse.json({
      valid: allValid,
      items: validationResults,
      summary: {
        nombre_articles: panierItems.length,
        montant_produits: totalAmount,
        frais_livraison: fraisLivraison,
        montant_total: montantTotal,
        livraison_gratuite: fraisLivraison === 0
      },
      errors: errors.length > 0 ? errors : undefined,
      can_proceed: allValid && panierItems.length > 0
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}