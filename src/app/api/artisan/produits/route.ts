import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-ultra-securise';

// Helper pour extraire l'artisan du token
function getArtisanFromToken(request: NextRequest): string | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type_utilisateur !== 'artisan') return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET - Récupérer les produits de l'artisan
export async function GET(request: NextRequest) {
  try {
    const artisan_id = getArtisanFromToken(request);
    
    if (!artisan_id) {
      return NextResponse.json(
        { error: 'Non autorisé - artisan requis' },
        { status: 401 }
      );
    }

    console.log('📦 Récupération produits artisan:', artisan_id);

    const produits = await db.select('produits', {
      where: { artisan_id },
      orderBy: { column: 'created_at', direction: 'desc' }
    });

    // Parser les photos JSON
    const produitsWithPhotos = (produits || []).map((p: any) => ({
      ...p,
      photos: typeof p.photos === 'string' ? JSON.parse(p.photos) : (p.photos || [])
    }));

    return NextResponse.json({
      success: true,
      produits: produitsWithPhotos,
      total: produitsWithPhotos.length
    });

  } catch (error) {
    console.error('❌ Erreur API produits artisan:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const artisan_id = getArtisanFromToken(request);
    
    if (!artisan_id) {
      return NextResponse.json(
        { error: 'Non autorisé - artisan requis' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      nom_produit,
      description,
      categorie,
      prix,
      stock,
      photos
    } = body;

    // Validation
    if (!nom_produit || !description || !prix || stock === undefined) {
      return NextResponse.json(
        { error: 'Données invalides - nom, description, prix et stock requis' },
        { status: 400 }
      );
    }

    if (prix <= 0) {
      return NextResponse.json(
        { error: 'Le prix doit être supérieur à 0' },
        { status: 400 }
      );
    }

    if (stock < 0) {
      return NextResponse.json(
        { error: 'Le stock ne peut pas être négatif' },
        { status: 400 }
      );
    }

    // Validation et normalisation de la catégorie
    const categoriesValides = ['pagne', 'vetement', 'accessoire'];
    const categorieNormalisee = categorie && categoriesValides.includes(categorie.toLowerCase()) 
      ? categorie.toLowerCase() 
      : 'pagne';

    console.log('➕ Création produit pour artisan:', artisan_id);

    const produit = await db.insert('produits', {
      nom_produit,
      description,
      categorie: categorieNormalisee,
      prix,
      stock,
      photos: JSON.stringify(photos || []),
      artisan_id,
      statut: stock > 0 ? 'actif' : 'rupture'
    });

    if (!produit) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du produit' },
        { status: 500 }
      );
    }

    console.log('✅ Produit créé:', produit.id);

    // Parser les photos pour la réponse
    const produitWithPhotos = {
      ...produit,
      photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || [])
    };

    return NextResponse.json({
      success: true,
      produit: produitWithPhotos,
      message: 'Produit créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur API création produit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un produit
export async function PUT(request: NextRequest) {
  try {
    const artisan_id = getArtisanFromToken(request);
    
    if (!artisan_id) {
      return NextResponse.json(
        { error: 'Non autorisé - artisan requis' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      id,
      nom_produit,
      description,
      categorie,
      prix,
      stock,
      photos,
      statut
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID produit requis' },
        { status: 400 }
      );
    }

    // Vérifier que le produit appartient à l'artisan
    const existing = await db.select('produits', {
      where: { id },
      limit: 1
    });

    if (!existing?.[0] || existing[0].artisan_id !== artisan_id) {
      return NextResponse.json(
        { error: 'Produit non trouvé ou accès refusé' },
        { status: 404 }
      );
    }

    console.log('✏️ Mise à jour produit:', id);

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (nom_produit) updateData.nom_produit = nom_produit;
    if (description) updateData.description = description;
    if (categorie) {
      const categoriesValides = ['pagne', 'vetement', 'accessoire'];
      if (categoriesValides.includes(categorie.toLowerCase())) {
        updateData.categorie = categorie.toLowerCase();
      }
    }
    if (prix !== undefined) updateData.prix = prix;
    if (stock !== undefined) {
      updateData.stock = stock;
      updateData.statut = stock > 0 ? 'actif' : 'rupture';
    }
    if (photos) updateData.photos = JSON.stringify(photos);
    if (statut) updateData.statut = statut;

    await db.update('produits', id, updateData);

    const [produit] = await db.select('produits', {
      where: { id },
      limit: 1
    });

    console.log('✅ Produit mis à jour:', id);

    // Parser les photos pour la réponse
    const produitWithPhotos = {
      ...produit,
      photos: typeof produit.photos === 'string' ? JSON.parse(produit.photos) : (produit.photos || [])
    };

    return NextResponse.json({
      success: true,
      produit: produitWithPhotos,
      message: 'Produit mis à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur API mise à jour produit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request: NextRequest) {
  try {
    const artisan_id = getArtisanFromToken(request);
    
    if (!artisan_id) {
      return NextResponse.json(
        { error: 'Non autorisé - artisan requis' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID produit requis' },
        { status: 400 }
      );
    }

    // Vérifier que le produit appartient à l'artisan
    const existing = await db.select('produits', {
      where: { id },
      limit: 1
    });

    if (!existing?.[0] || existing[0].artisan_id !== artisan_id) {
      return NextResponse.json(
        { error: 'Produit non trouvé ou accès refusé' },
        { status: 404 }
      );
    }

    console.log('🗑️ Suppression produit:', id);

    await db.delete('produits', { id });

    console.log('✅ Produit supprimé:', id);

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur API suppression produit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
