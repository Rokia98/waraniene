import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage, extractPathFromUrl } from '@/lib/imageUtils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Valider le dossier
    const allowedFolders = ['produits', 'artisans', 'general'];
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json(
        { error: 'Dossier non autorisé' },
        { status: 400 }
      );
    }

    // Upload avec les utilitaires
    const result = await uploadImage(file, { 
      folder: folder as 'produits' | 'artisans' | 'general'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Erreur API upload:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');
    const fileUrl = searchParams.get('fileUrl');

    let pathToDelete = filePath;
    
    // Si on a une URL complète, extraire le path
    if (fileUrl && !filePath) {
      pathToDelete = extractPathFromUrl(fileUrl);
    }

    if (!pathToDelete) {
      return NextResponse.json(
        { error: 'Chemin du fichier manquant' },
        { status: 400 }
      );
    }

    // Supprimer avec les utilitaires
    const result = await deleteImage(pathToDelete);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur API suppression:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}