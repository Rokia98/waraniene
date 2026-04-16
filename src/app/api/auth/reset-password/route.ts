import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token ou mot de passe manquant.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }


    // Chercher l'artisan par token de reset
    const { data: artisan, error } = await supabaseAdmin
      .from('artisans')
      .select('*')
      .eq('reset_token', token)
      .single();
    if (error || !artisan) {
      return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 });
    }

    // Hasher le nouveau mot de passe
    const hashed = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe et supprimer le token
    const { error: updateError } = await supabaseAdmin
      .from('artisans')
      .update({ password: hashed, reset_token: null })
      .eq('id', artisan.id);
    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
