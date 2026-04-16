import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorie = searchParams.get('categorie');
    const search = searchParams.get('search');

    // Construire la requête avec JOIN artisan
    let sql = `
      SELECT a.*, art.nom as artisan_nom, art.photo as artisan_photo, art.bio as artisan_bio, art.id as artisan_ref_id
      FROM articles_blog a
      LEFT JOIN artisans art ON a.artisan_id = art.id
      WHERE a.statut = 'publie'
    `;
    const params: any[] = [];

    if (categorie && categorie !== 'Toutes') {
      sql += ' AND a.categorie = ?';
      params.push(categorie);
    }

    sql += ' ORDER BY a.date_publication DESC';

    const articles = await db.query(sql, params);

    // Filtrer par recherche si spécifié
    let filteredArticles = articles || [];
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter((article: any) => 
        article.titre.toLowerCase().includes(searchLower) ||
        article.extrait.toLowerCase().includes(searchLower) ||
        (article.artisan_nom && article.artisan_nom.toLowerCase().includes(searchLower))
      );
    }

    // Parser les tags JSON et structurer les données artisan
    const articlesAvecTags = filteredArticles.map((article: any) => ({
      ...article,
      tags: typeof article.tags === 'string' ? JSON.parse(article.tags) : (article.tags || []),
      artisan: article.artisan_ref_id ? {
        id: article.artisan_ref_id,
        nom: article.artisan_nom,
        photo: article.artisan_photo,
        bio: article.artisan_bio,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      articles: articlesAvecTags
    });

  } catch (error) {
    console.error('Erreur API blog:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titre, extrait, contenu, image, auteur, date_publication, temps_lecture, categorie, tags } = body;

    // Validation
    if (!titre || !extrait || !contenu || !auteur || !categorie) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Insérer l'article
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : '[]';
    
    const result = await db.insert('articles_blog', {
      titre,
      extrait,
      contenu,
      image: image || null,
      auteur,
      date_publication: date_publication || new Date().toISOString().split('T')[0],
      temps_lecture: temps_lecture || 5,
      categorie,
      tags: tagsJson,
      statut: 'publie'
    });

    return NextResponse.json({
      success: true,
      message: 'Article créé avec succès',
      id: result.insertId
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    );
  }
}
