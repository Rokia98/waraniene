import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-ultra-securise';

function getArtisanIdFromToken(request: NextRequest): string | null {
  try {
    // Cookie en priorité (utilisé par le dashboard)
    let token = request.cookies.get('auth-token')?.value;
    // Fallback : header Authorization
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

// GET - Détails d'une commande
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artisanId = getArtisanIdFromToken(request);
    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const commandeId = params.id;

    const commandes = await db.select('commandes', { where: { id: commandeId }, limit: 1 });
    if (!commandes || commandes.length === 0) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }
    const commande = commandes[0];

    const details = await db.select('detail_commandes', { where: { commande_id: commandeId } });

    let hasArtisanProducts = false;
    const detailsEnrichis = await Promise.all(
      (details || []).map(async (detail: any) => {
        const produits = await db.select('produits', { where: { id: detail.produit_id }, limit: 1 });
        const produit = produits?.[0] || null;
        if (produit?.artisan_id === artisanId) hasArtisanProducts = true;
        return { ...detail, produit };
      })
    );

    if (!hasArtisanProducts) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const produitsArtisan = detailsEnrichis.filter((d: any) => d.produit?.artisan_id === artisanId);

    return NextResponse.json({
      commande: {
        id: commande.id,
        numero_commande: commande.numero_commande || `CMD-${commande.id.substring(0, 8)}`,
        acheteur_nom: commande.nom_acheteur,
        acheteur_email: commande.email_acheteur,
        acheteur_telephone: commande.telephone_acheteur,
        montant_artisan: produitsArtisan.reduce((sum: number, d: any) => sum + (d.prix_unitaire * d.quantite), 0),
        montant_total_commande: commande.montant_total,
        statut_paiement: commande.statut_paiement || 'pending',
        statut_livraison: commande.statut_livraison || 'en_attente',
        methode_paiement: commande.mode_paiement,
        adresse_livraison: commande.adresse_livraison,
        date_commande: commande.date_commande,
        date_expedition: commande.date_expedition,
        date_livraison: commande.date_livraison,
        produits: produitsArtisan.map((d: any) => ({
          id: d.produit_id,
          nom: d.produit?.nom_produit,
          quantite: d.quantite,
          prix_unitaire: d.prix_unitaire,
          total: d.prix_unitaire * d.quantite,
          photo: typeof d.produit?.photos === 'string'
            ? JSON.parse(d.produit.photos)?.[0]
            : d.produit?.photos?.[0]
        }))
      }
    });
  } catch (error: any) {
    console.error('Erreur GET /api/artisan/commandes/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Mettre à jour le statut de livraison
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artisanId = getArtisanIdFromToken(request);
    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const commandeId = params.id;

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }

    const { statut_livraison } = body;
    const validStatuts = ['en_preparation', 'expediee', 'en_livraison', 'livree', 'annule'];
    if (!statut_livraison || !validStatuts.includes(statut_livraison)) {
      return NextResponse.json({ error: 'Statut invalide', valid: validStatuts }, { status: 400 });
    }

    const commandes = await db.select('commandes', { where: { id: commandeId }, limit: 1 });
    if (!commandes?.length) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    // Vérifier que l'artisan a un produit dans cette commande
    const details = await db.select('detail_commandes', { where: { commande_id: commandeId } });
    let hasAccess = false;
    for (const detail of details || []) {
      const produits = await db.select('produits', { where: { id: detail.produit_id }, limit: 1 });
      if (produits?.[0]?.artisan_id === artisanId) { hasAccess = true; break; }
    }
    if (!hasAccess) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const updateData: any = { statut_livraison };
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (statut_livraison === 'expediee' || statut_livraison === 'en_livraison') {
      updateData.date_expedition = now;
    }
    if (statut_livraison === 'livree') {
      updateData.date_livraison = now;
    }

    await db.update('commandes', commandeId, updateData);
    return NextResponse.json({ success: true, message: 'Statut mis à jour' });
  } catch (error: any) {
    console.error('Erreur PUT /api/artisan/commandes/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
