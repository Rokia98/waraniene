/**
 * API Test hybride - Teste MySQL ET Supabase
 * GET /api/test-hybrid
 */

import { NextResponse } from 'next/server';
import { db, dbType, checkConnection } from '@/lib/db';

export async function GET() {
  try {
    // Vérifier quel type de DB est utilisé
    const usingDB = dbType;
    
    // Vérifier la connexion
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${usingDB.toUpperCase()} non connecté`,
          dbType: usingDB,
        },
        { status: 500 }
      );
    }

    // Récupérer des statistiques
    const artisans = await db.select('artisans');
    const produits = await db.select('produits');
    const commandes = await db.select('commandes');

    // Récupérer quelques produits avec artisans
    let sampleProducts;
    if (usingDB === 'mysql') {
      const { mysqlQuery } = await import('@/lib/db');
      sampleProducts = await mysqlQuery(
        `SELECT p.nom_produit, p.prix, a.nom as artisan_nom
         FROM produits p
         LEFT JOIN artisans a ON p.artisan_id = a.id
         LIMIT 3`
      );
    } else {
      sampleProducts = await db.select('produits', {
        columns: ['nom_produit', 'prix', 'artisans(nom)'],
        limit: 3
      });
    }

    return NextResponse.json({
      success: true,
      message: `Connexion ${usingDB.toUpperCase()} réussie!`,
      database_type: usingDB,
      database_name: usingDB === 'mysql' 
        ? process.env.MYSQL_DATABASE 
        : 'Supabase Cloud',
      stats: {
        artisans: artisans.length,
        produits: produits.length,
        commandes: commandes.length,
      },
      sample_products: sampleProducts,
      config: {
        can_switch: true,
        instruction: 'Changez DB_TYPE dans .env.local pour basculer entre mysql et supabase',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erreur test hybride:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        dbType: dbType,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
