import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getArtisanIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No auth token found');
      return null;
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const artisanId = (verified.payload as any).sub;

    if (!artisanId) {
      console.log('❌ No artisan ID in token');
      return null;
    }

    return artisanId;
  } catch (error) {
    console.error('❌ Error verifying token:', error);
    return null;
  }
}

// GET - Récupérer toutes les commandes de l'artisan
export async function GET(request: NextRequest) {
  try {
    const artisanId = await getArtisanIdFromToken(request);
    
    if (!artisanId) {
      console.log('❌ No artisan ID found');
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    console.log('📦 Fetching orders for artisan:', artisanId);

    // Récupérer toutes les commandes
    const allCommandes = await db.select('commandes', {
      orderBy: { column: 'date_commande', direction: 'desc' }
    });

    console.log('✓ Total commandes found:', allCommandes?.length || 0);

    // Pour chaque commande, récupérer les détails et filtrer par artisan
    const artisanCommandes = [];
    
    for (const commande of allCommandes || []) {
      // Récupérer les détails de cette commande
      const details = await db.select('detail_commandes', {
        where: { commande_id: commande.id }
      });

      // Récupérer les produits pour ces détails
      const artisanDetails = [];
      for (const detail of details || []) {
        const produits = await db.select('produits', {
          where: { id: detail.produit_id },
          limit: 1
        });
        const produit = produits?.[0];
        
        // Garder seulement les produits de cet artisan
        if (produit && produit.artisan_id === artisanId) {
          artisanDetails.push({
            ...detail,
            produit
          });
        }
      }

      // Si la commande contient des produits de cet artisan
      if (artisanDetails.length > 0) {
        const montantArtisan = artisanDetails.reduce(
          (sum, detail) => sum + (detail.quantite * detail.prix_unitaire),
          0
        );

        // Récupérer l'acheteur si présent
        let acheteurInfo = {
          nom: commande.nom || 'N/A',
          email: commande.email || '',
          telephone: commande.tel || ''
        };

        if (commande.acheteur_id) {
          const acheteurs = await db.select('acheteurs', {
            where: { id: commande.acheteur_id },
            limit: 1
          });
          const acheteur = acheteurs?.[0];
          if (acheteur) {
            acheteurInfo = {
              nom: `${acheteur.prenom} ${acheteur.nom}`,
              email: acheteur.email,
              telephone: acheteur.telephone
            };
          }
        }

        artisanCommandes.push({
          id: commande.id,
          numero_commande: commande.id,
          acheteur_nom: acheteurInfo.nom,
          acheteur_email: acheteurInfo.email,
          acheteur_telephone: acheteurInfo.telephone,
          montant_artisan: montantArtisan,
          montant_total_commande: commande.montant_total,
          statut_paiement: commande.statut || 'en_attente',
          statut_livraison: 'preparation',
          adresse_livraison: commande.adresse_livraison || '',
          date_commande: commande.date_commande,
          date_expedition: null,
          date_livraison: null,
          produits: artisanDetails.map(detail => ({
            id: detail.produit_id,
            nom: detail.produit.nom_produit,
            quantite: detail.quantite,
            prix_unitaire: detail.prix_unitaire,
            total: detail.quantite * detail.prix_unitaire,
            photos: typeof detail.produit.photos === 'string' ? JSON.parse(detail.produit.photos) : (detail.produit.photos || [])
          }))
        });
      }
    }

    console.log('✅ Found', artisanCommandes.length, 'orders for artisan');

    return NextResponse.json({
      commandes: artisanCommandes,
      total: artisanCommandes.length,
      debug: {
        artisanId,
        totalCommandesInDb: commandes?.length || 0,
        filterredForArtisan: artisanCommandes.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error in GET /api/artisan/commandes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le statut de livraison d'une commande
export async function PUT(request: NextRequest) {
  try {
    const artisanId = await getArtisanIdFromToken(request);
    
    if (!artisanId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }

    const { commande_id, statut_livraison } = body;

    if (!commande_id || !statut_livraison) {
      return NextResponse.json(
        { error: 'ID de commande et statut requis' },
        { status: 400 }
      );
    }

    // Valider le statut
    const statutsValides = ['preparation', 'expediee', 'en_livraison', 'livree', 'annule'];
    if (!statutsValides.includes(statut_livraison)) {
      return NextResponse.json(
        { error: 'Statut invalide', valid: statutsValides },
        { status: 400 }
      );
    }

    console.log('📝 Updating order status:', { commande_id, statut_livraison });

    // Vérifier que la commande existe et contient des produits de cet artisan
    const commandes = await db.select('commandes', {
      where: { id: commande_id },
      limit: 1
    });

    const commande = commandes?.[0];

    if (!commande) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'artisan a au moins un produit dans cette commande
    const details = await db.select('detail_commandes', {
      where: { commande_id }
    });

    let hasArtisanProduct = false;
    for (const detail of details || []) {
      const produits = await db.select('produits', {
        where: { id: detail.produit_id },
        limit: 1
      });
      if (produits?.[0]?.artisan_id === artisanId) {
        hasArtisanProduct = true;
        break;
      }
    }

    if (!hasArtisanProduct) {
      return NextResponse.json(
        { error: 'Non autorisé - Cette commande ne contient pas vos produits' },
        { status: 403 }
      );
    }

    // Mettre à jour le statut de livraison
    // Note: Pour MySQL, on garde seulement les champs de base
    const updateData: any = { statut: statut_livraison };

    await db.update('commandes', commande_id, updateData);

    console.log('✅ Order status updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour'
    });

  } catch (error) {
    console.error('❌ Error in PUT /api/artisan/commandes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
