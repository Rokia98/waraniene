import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Déconnexion demandée');

    // Créer une réponse de succès
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });

    // Supprimer le cookie auth-token
    response.cookies.delete('auth-token');

    console.log('✅ Cookie auth-token supprimé');

    return response;

  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
