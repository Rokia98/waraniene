import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const DB_TYPE = process.env.DB_TYPE || 'supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  // MySQL: Sauvegarder localement
  if (DB_TYPE === 'mysql') {
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
      console.error('Erreur upload local:', error);
      return NextResponse.json({ error: error.message || 'Erreur lors de l\'upload' }, { status: 500 });
    }
  }

  // Supabase: Utiliser le stockage cloud
  const { data, error } = await supabase.storage
    .from("waraniene")
    .upload(fileName, file, { contentType: file.type });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const url = supabase.storage.from("waraniene").getPublicUrl(fileName).data.publicUrl;
  return NextResponse.json({ url });
}
