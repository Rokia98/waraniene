/**
 * Types TypeScript pour l'application Tissés de Waraniéné
 * Définitions de types centralisées pour toute l'application
 */

// =================== Types de base ===================
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// =================== Types d'utilisateur ===================
export interface User extends BaseEntity {
  email: string;
  nom: string;
  prenom?: string; // Ajouté pour les APIs
  telephone?: string;
  adresse?: string;
  role: 'client' | 'artisan' | 'admin';
  type_utilisateur?: 'acheteur' | 'artisan'; // Ajouté pour l'authentification
  avatar_url?: string;
  est_actif: boolean;
}

export interface UserRegistration {
  nom: string;
  email: string;
  mot_de_passe: string;
  telephone?: string;
  adresse?: string;
}

export interface UserLogin {
  email: string;
  mot_de_passe: string;
}

export interface UserProfile {
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  avatar_url?: string;
}

// =================== Types d'artisan (mis à jour) ===================
export interface Artisan extends BaseEntity {
  user_id: string;
  nom: string; // Pour compatibilité
  photo?: string; // Pour compatibilité
  bio?: string;
  specialites: string[];
  annees_experience: number;
  village_origine: string;
  localisation: string; // Pour compatibilité
  techniques_maitrisees: string[];
  photo_profil?: string;
  galerie_photos?: string[];
  certifications?: string[];
  note_moyenne: number;
  nombre_avis: number;
  est_verifie: boolean;
  telephone: string; // Pour compatibilité
  langue: string; // Pour compatibilité
  date_inscription: string; // Pour compatibilité
  user?: User; // Relation avec User
}

export interface ArtisanInput {
  bio?: string;
  specialites: string[];
  annees_experience: number;
  village_origine: string;
  techniques_maitrisees: string[];
  photo_profil?: string;
}

// =================== Types de produit (mis à jour) ===================
export interface Produit extends BaseEntity {
  nom_produit: string;
  description: string;
  prix: number;
  categorie: ProductCategory;
  stock: number;
  stock_disponible: number; // Pour compatibilité
  images: string[];
  photos: string[]; // Pour compatibilité
  artisan_id: string;
  dimensions?: {
    longueur?: number;
    largeur?: number;
    hauteur?: number;
    poids?: number;
  };
  materiaux: string[];
  couleurs: string[];
  temps_fabrication?: number; // en jours
  instructions_entretien?: string;
  est_personnalisable: boolean;
  est_actif: boolean;
  note_moyenne: number;
  nombre_avis: number;
  artisan?: Artisan; // Relation avec Artisan
  ventes_totales: number;
}

export type ProductCategory = 
  | 'boubou'
  | 'pagne'
  | 'foulard'
  | 'chemise'
  | 'robe'
  | 'vetement' // Pour compatibilité
  | 'accessoire'
  | 'decoration'
  | 'autre';

export interface ProduitInput {
  nom_produit: string;
  description: string;
  prix: number;
  categorie: ProductCategory;
  stock: number;
  materiaux: string[];
  couleurs: string[];
  dimensions?: {
    longueur?: number;
    largeur?: number;
    hauteur?: number;
    poids?: number;
  };
  temps_fabrication?: number;
  instructions_entretien?: string;
  est_personnalisable: boolean;
}

export interface ProductFilters {
  categorie?: ProductCategory | string;
  prix_min?: number;
  prix_max?: number;
  couleurs?: string[];
  materiaux?: string[];
  artisan_id?: string;
  est_personnalisable?: boolean;
  en_stock_seulement?: boolean;
  trier_par?: 'nom' | 'prix_asc' | 'prix_desc' | 'date_desc' | 'popularite' | 'note';
  sortBy?: 'nom' | 'prix_asc' | 'prix_desc' | 'date_desc' | 'popularite' | 'note' | 'created_at'; // Alias pour trier_par
  page?: number;
  limite?: number;
  recherche?: string;
  search?: string; // Pour compatibilité
}

// =================== Types de panier ===================
export interface PanierItemAPI extends BaseEntity {
  user_id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  options_personnalisation?: Record<string, any>;
  produit?: Produit; // Relation avec Produit
}

export interface PanierLocal {
  id: string;
  produit: Produit;
  quantite: number;
  options_personnalisation?: Record<string, any>;
  date_ajout: string;
}

// Types pour compatibilité
export interface PanierItem {
  produit_id: string;
  quantite: number;
}

export interface Panier {
  id: string;
  acheteur_id: string;
  items: PanierItem[];
  created_at: string;
  updated_at: string;
}

// =================== Types de commande (mis à jour) ===================
export interface Commande extends BaseEntity {
  user_id: string;
  acheteur_id: string; // Pour compatibilité
  numero_commande: string;
  statut: OrderStatus;
  total: number;
  montant_total: number; // Pour compatibilité
  sous_total: number;
  frais_livraison: number;
  taxes?: number;
  code_promo?: string;
  reduction?: number;
  adresse_livraison: AdresseLivraison;
  methode_paiement: PaymentMethod;
  mode_paiement: PaymentMethod; // Pour compatibilité
  statut_paiement: PaymentStatus;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  date_commande: string; // Pour compatibilité
  commentaires?: string;
  numero_suivi?: string;
  notes_internes?: string;
  user?: User; // Relation avec User
  acheteur?: Acheteur; // Pour compatibilité
  items?: CommandeItem[]; // Relation avec CommandeItem
}

export type OrderStatus = 
  | 'en_attente'
  | 'confirmee'
  | 'en_preparation'
  | 'expediee'
  | 'livree'
  | 'annulee'
  | 'retournee';

export type DeliveryStatus = 
  | 'preparation'
  | 'expediee'
  | 'en_livraison'
  | 'livree'
  | 'annule';

export type PaymentMethod = 
  | 'orange_money'
  | 'mtn_money'
  | 'carte_bancaire'
  | 'especes'
  | 'virement';

export type PaymentStatus = 
  | 'en_attente'
  | 'paye'
  | 'echec'
  | 'rembourse'
  | 'partiellement_rembourse';

export interface CommandeItem extends BaseEntity {
  commande_id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
  options_personnalisation?: Record<string, any>;
  statut_item: 'en_attente' | 'confirme' | 'prepare' | 'expedie' | 'livre' | 'annule';
  produit?: Produit; // Relation avec Produit
}

// Types pour compatibilité
export interface DetailCommande {
  id: string;
  commande_id: string;
  commande?: Commande;
  produit_id: string;
  produit?: Produit;
  quantite: number;
  prix_unitaire: number;
  created_at: string;
}

export interface Acheteur {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  pays: string;
  date_inscription: string;
  created_at: string;
  updated_at: string;
}

export interface AdresseLivraison {
  nom_complet: string;
  telephone: string;
  adresse_ligne1: string;
  adresse_ligne2?: string;
  ville: string;
  code_postal?: string;
  pays: string;
  instructions_livraison?: string;
}

export interface CommandeInput {
  adresse_livraison: AdresseLivraison;
  methode_paiement: PaymentMethod;
  numero_paiement?: string;
  commentaires?: string;
  code_promo?: string;
}

// =================== Types de paiement ===================
export interface Paiement extends BaseEntity {
  commande_id: string;
  montant: number;
  methode_paiement: PaymentMethod;
  statut: PaymentStatus;
  numero_transaction?: string;
  numero_reference?: string;
  details_paiement?: Record<string, any>;
  date_paiement?: string;
  commande?: Commande; // Relation avec Commande
}

export interface PaymentRequest {
  commande_id: string;
  methode_paiement: PaymentMethod;
  numero_paiement?: string;
  callback_url?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  reference?: string;
  message?: string;
}

// =================== Types d'avis ===================
export interface Avis extends BaseEntity {
  user_id: string;
  produit_id?: string;
  artisan_id?: string;
  commande_id?: string;
  note: number; // 1-5
  commentaire?: string;
  photos?: string[];
  est_verifie: boolean;
  est_modere: boolean;
  reponse_artisan?: string;
  date_reponse?: string;
  user?: User; // Relation avec User
  produit?: Produit; // Relation avec Produit
  artisan?: Artisan; // Relation avec Artisan
}

export interface AvisInput {
  produit_id?: string;
  artisan_id?: string;
  commande_id?: string;
  note: number;
  commentaire?: string;
  photos?: string[];
}

// =================== Types de statistiques ===================
export interface StatistiquesVentes {
  ventes_totales: number;
  chiffre_affaires: number;
  nombre_commandes: number;
  panier_moyen: number;
  produits_vendus: number;
  taux_conversion: number;
  periode: {
    debut: string;
    fin: string;
  };
}

export interface StatistiquesArtisan {
  artisan_id: string;
  ventes_totales: number;
  chiffre_affaires: number;
  nombre_produits: number;
  note_moyenne: number;
  nombre_avis: number;
  commandes_completees: number;
  taux_satisfaction: number;
}

export interface StatistiquesProduit {
  produit_id: string;
  vues: number;
  ajouts_panier: number;
  achats: number;
  taux_conversion: number;
  note_moyenne: number;
  nombre_avis: number;
  revenus: number;
}

// =================== Types de recherche ===================
export interface SearchResults<T> {
  items: T[];
  total: number;
  page: number;
  limite: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchFilters {
  query?: string;
  categorie?: ProductCategory;
  prix_min?: number;
  prix_max?: number;
  note_min?: number;
  artisan_id?: string;
  trier_par?: string;
  page?: number;
  limite?: number;
}

// =================== Types d'API ===================
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
  status?: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      page: number;
      limite: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

// =================== Types de validation ===================
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface FieldValidator {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: FieldValidator;
}

// =================== Autres types (pour compatibilité) ===================
export interface QRCode {
  id: string;
  produit_id: string;
  produit?: Produit;
  url: string;
  created_at: string;
}

export interface Admin {
  id: string;
  nom: string;
  email: string;
  mot_de_passe: string;
  role: 'admin' | 'moderateur';
  created_at: string;
  updated_at: string;
}

// Types pour les composants
export interface ProductCardProps {
  produit: Produit;
  onAddToCart?: (productId: string) => void;
}

export interface ArtisanCardProps {
  artisan: Artisan;
}

// Types pour les formulaires
export interface CheckoutData {
  acheteur: {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    ville: string;
    pays: string;
  };
  mode_paiement: 'orange_money' | 'mtn_money' | 'carte_bancaire';
  items: PanierItem[];
}

// =================== Types de stockage local ===================
export interface StorageItem<T = any> {
  value: T;
  expiry?: number;
  encrypted?: boolean;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: 'fr' | 'en';
  currency?: 'XOF' | 'EUR' | 'USD';
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy?: {
    show_profile: boolean;
    show_reviews: boolean;
    marketing_emails: boolean;
  };
}

// =================== Types utilitaires ===================
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
}