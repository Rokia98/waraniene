import { NextRequest, NextResponse } from 'next/server';
import { getKkiapayPublicKey, isKkiapaySandbox } from '@/lib/kkiapay';
import { db, generateUUID } from '@/lib/db';



// Démarre un paiement Kkiapay côté serveur (enregistre la transaction, fournit la config au frontend)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commande_id, montant, customer, metadata } = body;

    if (!commande_id || !montant || !customer) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Vérifier que la commande existe
    const commandes = await db.select('commandes', {
      where: { id: commande_id },
      limit: 1
    });
    const commande = commandes && commandes.length > 0 ? commandes[0] : null;

    if (!commande) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (Math.abs(commande.montant_total - montant) > 1) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Générer un token de transaction unique
    const transaction_token = generateUUID();

    // Enregistrer la transaction dans la base de données
    try {
      await db.insert('paiements', {
        id: generateUUID(),
        commande_id,
        montant,
        methode_paiement: 'kkiapay',
        statut: 'en_attente',
        numero_transaction: transaction_token,
        numero_reference: transaction_token,
        details_paiement: JSON.stringify({
          provider: 'kkiapay',
          ...metadata,
        }),
        date_paiement: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
    } catch (paiementError: any) {
      console.error('Erreur enregistrement paiement:', paiementError);
      return NextResponse.json({ error: 'Erreur enregistrement paiement' }, { status: 500 });
    }

    // Retourner la config pour le widget Kkiapay côté frontend
    return NextResponse.json({
      success: true,
      transaction_token,
      kkiapay: {
        publicKey: getKkiapayPublicKey(),
        sandbox: isKkiapaySandbox(),
        amount: montant,
        name: customer.name || commande.nom_acheteur || 'Client',
        email: customer.email || commande.email_acheteur || 'client@waraniene.com',
        phone: customer.phone || '',
        reason: metadata?.reason || `Commande ${commande_id.slice(0, 8)} - Tissés de Waraniéné`,
      },
    });
  } catch (error: any) {
    console.error('Erreur API paiement initier:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

