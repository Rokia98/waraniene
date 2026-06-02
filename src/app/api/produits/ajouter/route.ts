import { NextResponse } from "next/server";
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();
  const { nom, prix, categorie, description, stock, photos } = body;
  if (!nom || !prix || !categorie || !description || !stock) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  
  try {
    const produit = await db.insert('produits', {
      nom_produit: nom,
      prix,
      categorie,
      description,
      stock,
      photos: JSON.stringify(photos || [])
    });

    if (!produit) {
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }

    return NextResponse.json({ id: produit.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
