import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;

    // Récupérer l'article avec les infos artisan
    const articles = await db.query(
      `SELECT a.*, art.nom as artisan_nom, art.photo as artisan_photo, art.bio as artisan_bio, art.id as artisan_ref_id
       FROM articles_blog a
       LEFT JOIN artisans art ON a.artisan_id = art.id
       WHERE a.id = ? AND a.statut = 'publie'
       LIMIT 1`,
      [articleId]
    );

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: 'Article introuvable' },
        { status: 404 }
      );
    }

    const article = articles[0];

    // Parser les tags JSON et structurer l'artisan
    const articleAvecTags = {
      ...article,
      tags: typeof article.tags === 'string' ? JSON.parse(article.tags) : (article.tags || []),
      artisan: article.artisan_ref_id ? {
        id: article.artisan_ref_id,
        nom: article.artisan_nom,
        photo: article.artisan_photo,
        bio: article.artisan_bio,
      } : null,
    };

    return NextResponse.json({
      success: true,
      article: articleAvecTags
    });

  } catch (error) {
    console.error('Erreur API blog:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { titre, extrait, contenu, image, auteur, date_publication, temps_lecture, categorie, tags, statut } = body;

    // Vérifier que l'article existe
    const articlesExistants = await db.select('articles_blog', {
      where: { id: params.id },
      limit: 1
    });

    if (!articlesExistants || articlesExistants.length === 0) {
      return NextResponse.json(
        { error: 'Article introuvable' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (titre) updateData.titre = titre;
    if (extrait) updateData.extrait = extrait;
    if (contenu) updateData.contenu = contenu;
    if (image !== undefined) updateData.image = image;
    if (auteur) updateData.auteur = auteur;
    if (date_publication) updateData.date_publication = date_publication;
    if (temps_lecture) updateData.temps_lecture = temps_lecture;
    if (categorie) updateData.categorie = categorie;
    if (tags) updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    if (statut) updateData.statut = statut;

    // Mettre à jour l'article
    await db.update('articles_blog', updateData, {
      where: { id: params.id }
    });

    // Récupérer l'article mis à jour
    const articlesUpdated = await db.select('articles_blog', {
      where: { id: params.id },
      limit: 1
    });

    const article = articlesUpdated[0];
    const articleAvecTags = {
      ...article,
      tags: typeof article.tags === 'string' ? JSON.parse(article.tags) : (article.tags || [])
    };

    return NextResponse.json({
      success: true,
      article: articleAvecTags,
      message: 'Article mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que l'article existe
    const articlesExistants = await db.select('articles_blog', {
      where: { id: params.id },
      limit: 1
    });

    if (!articlesExistants || articlesExistants.length === 0) {
      return NextResponse.json(
        { error: 'Article introuvable' },
        { status: 404 }
      );
    }

    // Supprimer l'article (note: db.delete prend le where en 2e paramètre)
    if (db.query) {
      await db.query(
        'DELETE FROM articles_blog WHERE id = ?',
        [params.id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    );
  }
}
