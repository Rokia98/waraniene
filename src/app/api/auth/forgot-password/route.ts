import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
    }

    // Config Mailtrap
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT) || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    // Générer un token de reset (à stocker en base pour la vraie prod)
    const resetToken = Math.random().toString(36).slice(2);
    // Lien de reset (à adapter en prod)
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    // Enregistrer le token dans la base (champ reset_token) pour les artisans
    // Nécessite que le champ reset_token existe dans la table artisans
    const { supabaseAdmin } = await import('@/lib/supabase');
    await supabaseAdmin
      .from('artisans')
      .update({ reset_token: resetToken })
      .eq('email', email);

    // Envoyer l'email
    await transporter.sendMail({
      from: 'no-reply@waraniene.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Pour réinitialiser votre mot de passe, cliquez sur ce lien :<br/><a href="${resetUrl}">${resetUrl}</a></p>`
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur lors de l’envoi de l’email.' }, { status: 500 });
  }
}
