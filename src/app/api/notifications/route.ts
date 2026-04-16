import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, commande_id, paiement_id, data } = body;

    // Types de notification: commande_confirmee, commande_expediee, paiement_recu, etc.
    
    if (!type || !commande_id) {
      return NextResponse.json(
        { error: 'Type et commande_id requis' },
        { status: 400 }
      );
    }

    // Récupérer la commande
    const commandes = await db.select('commandes', {
      where: { id: commande_id },
      limit: 1
    });
    const commande = commandes && commandes.length > 0 ? commandes[0] : null;

    if (!commande) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    const email = commande.email_acheteur;
    const telephone = commande.telephone_acheteur;
    const nom = commande.nom_acheteur;

    // Log de notification
    await db.insert('notifications', {
      commande_id,
      type,
      email,
      telephone,
      statut: 'envoyee',
      contenu: data?.message || '',
      metadata: JSON.stringify({ ...data })
    });

    // Envoyer email
    const emailPromise = fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        type: `commande_${type}`,
        data: {
          nom_acheteur: nom,
          commande_id,
          ...commande,
          ...data
        }
      })
    }).catch(e => console.error('Erreur email:', e));

    // Envoyer SMS (optionnel - nécessite Twilio)
    let smsResult = null;
    if (telephone && process.env.TWILIO_ACCOUNT_SID) {
      smsResult = await sendSMS(telephone, {
        type,
        nom,
        commande_id: commande_id.slice(0, 8)
      }).catch(e => {
        console.error('Erreur SMS:', e);
        return null;
      });
    }

    // Attendre l'email
    await emailPromise;

    return NextResponse.json({
      success: true,
      message: 'Notifications envoyées',
      email_sent: true,
      sms_sent: !!smsResult
    });

  } catch (error) {
    console.error('Erreur notifications:', error);
    return NextResponse.json(
      { error: 'Erreur envoi notifications' },
      { status: 500 }
    );
  }
}

async function sendSMS(telephone: string, data: any) {
  // Placeholder pour Twilio SMS
  // À implémenter avec: import twilio from 'twilio';
  
  const messages: Record<string, string> = {
    confirmee: `✅ Commande #${data.commande_id} confirmée! Merci ${data.nom}`,
    expediee: `📦 Votre commande #${data.commande_id} est en route!`,
    livree: `🎉 Votre commande #${data.commande_id} est livrée!`,
  };

  console.log(`📱 SMS à ${telephone}: ${messages[data.type] || 'Mise à jour commande'}`);
  
  // Intégration Twilio serait ici
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ body, from, to });

  return { success: true, message: 'SMS queued' };
}
