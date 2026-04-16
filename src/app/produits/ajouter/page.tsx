"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AjouterProduitPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState(0);
  const [categorie, setCategorie] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    let imageUrls: string[] = [];
    try {
      // Upload images to Supabase Storage
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/produits/upload-image", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (res.ok && data.url) {
            imageUrls.push(data.url);
          } else {
            setMessage("Erreur lors de l'upload d'une image");
            setLoading(false);
            return;
          }
        }
      }
      // Créer le produit
      const res = await fetch("/api/produits/ajouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prix, categorie, description, stock, photos: imageUrls }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Produit ajouté avec succès !");
        router.push(`/produits/${data.id}`);
      } else {
        setMessage(data.error || "Erreur lors de l'ajout du produit");
      }
    } catch (err) {
      setMessage("Erreur réseau ou serveur");
    } finally {
      setLoading(false);
    }
  }

  // Fonction pour supprimer une image sélectionnée
  function removeImage(idx: number) {
    setImageFiles(files => files.filter((_, i) => i !== idx));
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Ajouter un produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" required placeholder="Nom du produit" value={nom} onChange={e => setNom(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="number" required min={0} placeholder="Prix (FCFA)" value={prix} onChange={e => setPrix(Number(e.target.value))} className="w-full border px-3 py-2 rounded" />
        <input type="text" required placeholder="Catégorie" value={categorie} onChange={e => setCategorie(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <textarea required placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="number" required min={1} placeholder="Stock" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full border px-3 py-2 rounded" />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
          className="w-full"
        />
        {imageFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {imageFiles.map((file, idx) => (
              <div key={idx} className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-50">
          {loading ? "Ajout..." : "Ajouter le produit"}
        </button>
      </form>
      {message && <div className="mt-4 text-center text-sm text-gray-700">{message}</div>}
    </div>
  );
}
