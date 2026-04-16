import { NextRequest, NextResponse } from 'next/server';
import { getKkiapayPublicKey } from '@/lib/kkiapay';
import { supabaseAdmin } from '@/lib/supabase';



// Vérifie le statut d'un paiement Kkiapay dans la base
export async function GET(request: NextRequest, { params }: { params: { transaction_id: string } }) {
  try {
    const { transaction_id } = params;
    if (!transaction_id) {
      return NextResponse.json({ error: 'Paramètre manquant' }, { status: 400 });
    }

    // Chercher le paiement dans la base
    const { data: paiement, error } = await supabaseAdmin
      .from('paiements')
      .select('*')
      .eq('numero_transaction', transaction_id)
      .single();

    if (error || !paiement) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payment: {
        transaction_id,
        status: paiement.statut,
        amount: paiement.montant,
        customer: paiement.details_paiement?.customer,
        created_at: paiement.created_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
