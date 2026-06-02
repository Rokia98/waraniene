import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-ultra-securise';

function getArtisanIdFromToken(request: NextRequest): string | null {
  try {
    let token = request.cookies.get('auth-token')?.value;
    if (!token) {
      const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
      token = authHeader?.replace('Bearer ', '');
    }
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type_utilisateur !== 'artisan') return null;
    return decoded.userId || decoded.sub || null;
  } catch {
    return null;
  }
}

// GET - Toutes les commandes (avec filtre optionnel par artisan)
export async function GET(request: NextRequest) {
  try {
    const artisanId = getArtisanIdFromToken(request);
    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const url = new URL(request.url);
    const filtreArtisan = url.searchParams.get('artisan_only') === 'true';

    // Récupérer toutes les commandes triées par date
    const allCommandes = await db.select('commandes', {
      orderBy: { column: 'date_commande', direction: 'desc' }
    });

    const commandesFormatees = [];

    for (const commande of allCommandes || []) {
      // Récupérer les détails de cette commande
      const details = await db.select('detail_commandes', {
        where: { commande_id: commande.id }
      });

      if (!details || details.length === 0) continue;

      // Enrichir chaque ligne avec son produit
      const detailsEnrichis = [];
      let montantArtisan = 0;
      let hasArtisanProduct = false;

      for (const detail of details) {
        const produits = await db.select('produits', {
          where: { id: detail.produit_id },
          limit: 1
        });
        const produit = produits?.[0] || null;

        // Vérifier si ce produit appartient à l'artisan (comparaison en string)
        if (produit && String(produit.artisan_id) === String(artisanId)) {
          hasArtisanProduct = true;
          montantArtisan += (detail.quantite || 1) * (detail.prix_unitaire || 0);
        }

        detailsEnrichis.push({
          id: detail.id,
          produit_id: detail.produit_id,
          nom: produit?.nom_produit || 'Produit inconnu',
          quantite: detail.quantite || 1,
          prix_unitaire: parseFloat(detail.prix_unitaire) || 0,
          total: (detail.quantite || 1) * (parseFloat(detail.prix_unitaire) || 0),
          photo: typeof produit?.photos === 'string'
            ? (() => { try { return JSON.parse(produit.photos)?.[0]; } catch { return null; } })()
            : produit?.photos?.[0] || null,
          artisan_id: produit?.artisan_id || null,
          est_mon_produit: produit ? String(produit.artisan_id) === String(artisanId) : false,
        });
      }

      // Si filtreArtisan=true, ignorer les commandes sans produits de cet artisan
      if (filtreArtisan && !hasArtisanProduct) continue;

      // Récupérer les infos acheteur
      let acheteurInfo = {
        nom: commande.nom_acheteur || commande.nom || 'Client',
        email: commande.email_acheteur || commande.email || '',
        telephone: commande.telephone_acheteur || commande.telephone || commande.tel || '',
      };

      if (commande.acheteur_id) {
        const acheteurs = await db.select('acheteurs', {
          where: { id: commande.acheteur_id },
          limit: 1
        });
        const acheteur = acheteurs?.[0];
        if (acheteur) {
          acheteurInfo = {
            nom: `${acheteur.prenom || ''} ${acheteur.nom || ''}`.trim() || 'Client',
            email: acheteur.email || '',
            telephone: acheteur.telephone || '',
          };
        }
      }

      commandesFormatees.push({
        id: commande.id,
        numero_commande: commande.numero_commande || commande.id?.toString().substring(0, 8).toUpperCase(),
        acheteur_nom: acheteurInfo.nom,
        acheteur_email: acheteurInfo.email,
        acheteur_telephone: acheteurInfo.telephone,
        montant_artisan: hasArtisanProduct ? montantArtisan : parseFloat(commande.montant_total) || 0,
        montant_total_commande: parseFloat(commande.montant_total) || 0,
        statut_paiement: commande.statut_paiement || commande.statut || 'en_attente',
        statut_livraison: commande.statut_livraison || commande.statut || 'en_attente',
        methode_paiement: commande.mode_paiement || '',
        adresse_livraison: commande.adresse_livraison || '',
        date_commande: commande.date_commande || commande.created_at,
        date_expedition: commande.date_expedition || null,
        date_livraison: commande.date_livraison || null,
        contient_mes_produits: hasArtisanProduct,
        produits: detailsEnrichis,
      });
    }

    return NextResponse.json({
      commandes: commandesFormatees,
      total: commandesFormatees.length,
    });

  } catch (error: any) {
    console.error('❌ Erreur GET /api/artisan/commandes:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

// PUT - Mettre à jour le statut de livraison
export async function PUT(request: NextRequest) {
  try {
    const artisanId = getArtisanIdFromToken(request);
    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }

    const { commande_id, statut_livraison } = body;
    if (!commande_id || !statut_livraison) {
      return NextResponse.json({ error: 'commande_id et statut_livraison requis' }, { status: 400 });
    }

    const statutsValides = ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'en_livraison', 'livree', 'annulee'];
    if (!statutsValides.includes(statut_livraison)) {
      return NextResponse.json({ error: 'Statut invalide', valid: statutsValides }, { status: 400 });
    }

    const commandes = await db.select('commandes', { where: { id: commande_id }, limit: 1 });
    if (!commandes?.length) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    const updateData: any = { statut_livraison };
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (['expediee', 'en_livraison'].includes(statut_livraison)) updateData.date_expedition = now;
    if (statut_livraison === 'livree') updateData.date_livraison = now;

    await db.update('commandes', commande_id, updateData);

    return NextResponse.json({ success: true, message: 'Statut mis à jour' });
  } catch (error: any) {
    console.error('❌ Erreur PUT /api/artisan/commandes:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
