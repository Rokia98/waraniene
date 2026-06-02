import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';

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
    const existing = await db.select('preferences_notifications', {
      where: { acheteur_id: userId },
      limit: 1
    });

    if (existing && existing.length > 0) {
      // Mettre à jour
      await db.update('preferences_notifications', existing[0].id, preferences);
      return NextResponse.json({
        message: 'Préférences mises à jour',
        preferences: { ...existing[0], ...preferences }
      });
    } else {
      // Créer
      const created = await db.insert('preferences_notifications', {
        acheteur_id: userId,
        ...preferences
      });
      return NextResponse.json({
        message: 'Préférences enregistrées',
        preferences: created
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

    const results = await db.select('preferences_notifications', {
      where: { acheteur_id: userId },
      limit: 1
    });

    // Retourner les préférences par défaut si n'existe pas
    return NextResponse.json({
      preferences: (results && results.length > 0) ? results[0] : {
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
