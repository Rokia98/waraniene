import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = (verified.payload as any).sub as string;
    const preferences = await request.json();

    // Vérifier si l'enregistrement existe
    const { data: existing } = await supabase
      .from('preferences_notifications')
      .select('id')
      .eq('acheteur_id', userId)
      .single();

    if (existing) {
      // Mettre à jour
      const { data, error } = await supabase
        .from('preferences_notifications')
        .update(preferences)
        .eq('acheteur_id', userId)
        .select();

      if (error) throw error;
      return NextResponse.json({
        message: 'Préférences mises à jour',
        preferences: data[0]
      });
    } else {
      // Créer
      const { data, error } = await supabase
        .from('preferences_notifications')
        .insert({
          acheteur_id: userId,
          ...preferences
        })
        .select();

      if (error) throw error;
      return NextResponse.json({
        message: 'Préférences enregistrées',
        preferences: data[0]
      });
    }
  } catch (error: any) {
    console.error('Erreur POST /api/preferences-notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Récupérer les préférences
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = (verified.payload as any).sub as string;

    const { data, error } = await supabase
      .from('preferences_notifications')
      .select('*')
      .eq('acheteur_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Retourner les préférences par défaut si n'existe pas
    return NextResponse.json({
      preferences: data || {
        email_commande: true,
        email_promo: true,
        email_avis: true,
        sms_commande: false,
        sms_promo: false,
        sms_avis: false
      }
    });
  } catch (error: any) {
    console.error('Erreur GET /api/preferences-notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
