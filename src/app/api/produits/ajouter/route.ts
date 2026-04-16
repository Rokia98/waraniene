import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { nom, prix, categorie, description, stock, photos } = body;
  if (!nom || !prix || !categorie || !description || !stock) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  const { data, error } = await supabase.from("produits").insert([
    { nom, prix, categorie, description, stock, photos }
  ]).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
