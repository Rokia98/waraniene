export interface Product {
  id?: string;
  nom_produit: string;
  description: string;
  categorie: 'pagne' | 'vetement' | 'accessoire';
  prix: number;
  stock: number;
  statut?: string;
  photos: string[];
  created_at?: string;
}

export interface ProductFormData {
  nom_produit: string;
  description: string;
  categorie: 'pagne' | 'vetement' | 'accessoire';
  prix: number;
  stock: number;
  photos: string[];
}
