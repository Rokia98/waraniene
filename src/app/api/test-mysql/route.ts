/**
 * API Test de connexion MySQL
 * GET /api/test-mysql
 */

import { NextResponse } from 'next/server';
import { checkConnection, query } from '@/lib/mysql';

export async function GET() {
  try {
    // Vérifier la connexion
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'MySQL non connecté',
          config: {
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || '3306',
            database: process.env.MYSQL_DATABASE || 'waraniene_db',
          }
        },
        { status: 500 }
      );
    }

    // Compter les données
    const artisansCount = await query<any>(
      'SELECT COUNT(*) as count FROM artisans'
    );
    const produitsCount = await query<any>(
      'SELECT COUNT(*) as count FROM produits'
    );
    const acheteursCount = await query<any>(
      'SELECT COUNT(*) as count FROM acheteurs'
    );
    const commandesCount = await query<any>(
      'SELECT COUNT(*) as count FROM commandes'
    );
    const codesPromoCount = await query<any>(
      'SELECT COUNT(*) as count FROM codes_promo'
    );

    // Récupérer quelques données d'exemple
    const recentProducts = await query<any>(
      `SELECT p.nom_produit, p.prix, a.nom as artisan_nom
       FROM produits p
       LEFT JOIN artisans a ON p.artisan_id = a.id
       LIMIT 5`
    );

    return NextResponse.json({
      success: true,
      message: 'Connexion MySQL réussie!',
      database: process.env.MYSQL_DATABASE || 'waraniene_db',
      stats: {
        artisans: artisansCount[0]?.count || 0,
        produits: produitsCount[0]?.count || 0,
        acheteurs: acheteursCount[0]?.count || 0,
        commandes: commandesCount[0]?.count || 0,
        codes_promo: codesPromoCount[0]?.count || 0,
      },
      sample_products: recentProducts,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erreur test MySQL:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
