import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// GET - Récupérer les détails d'une commande
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const artisanId = (verified.payload as any).sub;
    const commandeId = params.id;

    // Récupérer la commande avec ses articles
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .select(`
        *,
        articles_commandes (
          id,
          produit_id,
          quantite,
          prix_unitaire,
          produits (
            id,
            nom_produit,
            artisan_id,
            photos
          )
        )
      `)
      .eq('id', commandeId)
      .single();

    if (commandeError || !commande) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    // Vérifier que l'artisan a des produits dans cette commande
    const hasArtisanProducts = commande.articles_commandes.some((item: any) =>
      item.produits?.artisan_id === artisanId
    );

    if (!hasArtisanProducts) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Préparer la réponse
    const commandeDetail = {
      id: commande.id,
      numero_commande: commande.numero_commande || `CMD-${commande.id.substring(0, 8)}`,
      acheteur_nom: commande.nom_acheteur,
      acheteur_email: commande.email_acheteur,
      acheteur_telephone: commande.telephone_acheteur,
      montant_artisan: commande.articles_commandes
        .filter((item: any) => item.produits?.artisan_id === artisanId)
        .reduce((sum: number, item: any) => sum + (item.prix_unitaire * item.quantite), 0),
      montant_total_commande: commande.montant_total,
      statut_paiement: commande.statut_paiement || 'pending',
      statut_livraison: commande.statut_livraison || 'en_attente',
      methode_paiement: commande.mode_paiement,
      adresse_livraison: commande.adresse_livraison,
      date_commande: commande.date_commande,
      date_expedition: commande.date_expedition,
      date_livraison: commande.date_livraison,
      produits: commande.articles_commandes
        .filter((item: any) => item.produits?.artisan_id === artisanId)
        .map((item: any) => ({
          id: item.produit_id,
          nom: item.produits?.nom_produit,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          total: item.prix_unitaire * item.quantite,
          photo: item.produits?.photos?.[0]
        }))
    };

    return NextResponse.json({ commande: commandeDetail });
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
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const artisanId = (verified.payload as any).sub;
    const commandeId = params.id;
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }
    
    const statut_livraison = body?.statut_livraison;

    // Valider le statut
    const validStatuts = ['preparation', 'expediee', 'en_livraison', 'livree', 'annule'];
    if (!statut_livraison || !validStatuts.includes(statut_livraison)) {
      console.error('Statut invalide reçu:', statut_livraison, 'Type:', typeof statut_livraison);
      return NextResponse.json({ 
        error: 'Statut invalide', 
        received: statut_livraison,
        valid: validStatuts 
      }, { status: 400 });
    }

    // Vérifier l'accès
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .select('articles_commandes(produits(artisan_id))')
      .eq('id', commandeId)
      .single();

    if (!commande) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    const hasAccess = commande.articles_commandes.some((item: any) =>
      item.produits?.artisan_id === artisanId
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Mettre à jour
    const { error: updateError } = await supabase
      .from('commandes')
      .update({
        statut_livraison,
        date_expedition: (statut_livraison === 'expediee' || statut_livraison === 'en_livraison') ? new Date().toISOString() : undefined,
        date_livraison: statut_livraison === 'livree' ? new Date().toISOString() : undefined
      })
      .eq('id', commandeId);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Statut mis à jour' });
  } catch (error: any) {
    console.error('Erreur PUT /api/artisan/commandes/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
