import { Produit, Artisan } from '@/types';

// Template pour un artisan valide
export const createMockArtisan = (overrides: Partial<Artisan> = {}): Artisan => ({
  id: '1',
  user_id: 'user-1',
  nom: 'Artisan Test',
  photo: '',
  bio: 'Description de l\'artisan',
  localisation: 'Waraniéné, Korhogo',
  telephone: '+225 07 12 34 56 78',
  langue: 'fr',
  specialites: ['tissage'],
  annees_experience: 10,
  village_origine: 'Waraniéné',
  techniques_maitrisees: ['tissage'],
  note_moyenne: 4.5,
  nombre_avis: 10,
  est_verifie: true,
  date_inscription: '2024-01-15',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides
});

// Template pour un produit valide
export const createMockProduit = (overrides: Partial<Produit> = {}): Produit => ({
  id: '1',
  nom_produit: 'Produit Test',
  description: 'Description du produit',
  categorie: 'pagne',
  prix: 25000,
  stock: 10,
  stock_disponible: 10,
  artisan_id: '1',
  photos: [],
  images: [],
  dimensions: { longueur: 200, largeur: 100 },
  materiaux: ['coton'],
  couleurs: ['rouge'],
  temps_fabrication: 7,
  est_personnalisable: true,
  est_actif: true,
  note_moyenne: 4.5,
  nombre_avis: 5,
  ventes_totales: 10,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  ...overrides
});