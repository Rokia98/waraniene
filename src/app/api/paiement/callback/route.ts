import { NextRequest, NextResponse } from 'next/server';
import { getKkiapayPublicKey } from '@/lib/kkiapay';
import { supabaseAdmin } from '@/lib/supabase';



// Callback Kkiapay (à appeler depuis le frontend après paiement réussi)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_token, status, details } = body;

    if (!transaction_token || !status) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Mettre à jour le paiement dans la base de données
    const { error: updateError } = await supabaseAdmin
      .from('paiements')
      .update({
        statut: status === 'SUCCESS' ? 'succeeded' : 'echec',
        methode_paiement: 'kkiapay',
        date_paiement: new Date().toISOString(),
        details_paiement: details,
        updated_at: new Date().toISOString(),
      })
      .eq('numero_transaction', transaction_token);

    if (updateError) {
      return NextResponse.json({ error: 'Erreur mise à jour paiement' }, { status: 500 });
    }

    // Si le paiement est réussi, mettre à jour la commande
    if (status === 'SUCCESS') {
      // Récupérer la commande liée
      const { data: paiement } = await supabaseAdmin
        .from('paiements')
        .select('commande_id')
        .eq('numero_transaction', transaction_token)
        .single();

      if (paiement?.commande_id) {
        await supabaseAdmin
          .from('commandes')
          .update({
            statut: 'confirmee',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paiement.commande_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
