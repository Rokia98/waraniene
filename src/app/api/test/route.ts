import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Test simple de connexion à Supabase
    const { data, error } = await supabaseAdmin
      .from('produits')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Erreur Supabase test:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Erreur de connexion à Supabase'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion Supabase réussie',
      timestamp: new Date().toISOString(),
      dataCount: data?.length || 0
    });

  } catch (error) {
    console.error('Erreur test API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}