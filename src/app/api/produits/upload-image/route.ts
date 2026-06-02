import { NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer le répertoire s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'produits');
    await mkdir(uploadDir, { recursive: true });

    // Sauvegarder le fichier
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Retourner l'URL locale
    const url = `/images/produits/${fileName}`;
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
