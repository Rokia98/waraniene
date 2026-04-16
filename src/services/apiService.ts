/**
 * Service API centralisé pour l'application Tissés de Waraniéné
 * Gère toutes les interactions avec les APIs backend
 */

const API_BASE_URL = '/api';

// Types pour les réponses API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Utilitaire pour les requêtes HTTP
class ApiClient {
  private static async request<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('auth_token');
      
      console.log('🌐 API Request:', `${API_BASE_URL}${url}`);
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Response not OK:', errorData);
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);
      
      // Si l'API retourne déjà un format avec success, on l'utilise tel quel
      if (data.hasOwnProperty('success')) {
        console.log('✅ API returned success field:', data.success);
        return data;
      }
      
      // Sinon, on wrappe la réponse dans notre format attendu
      console.log('✅ Wrapping response in success format');
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('💥 API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue'
      };
    }
  }

  static get<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' });
  }

  static post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' });
  }

  static uploadFile<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth_token');
    
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }).then(response => response.json());
  }
}

// SERVICE AUTHENTICATION
export const authService = {
  // Inscription d'un acheteur
  async register(userData: {
    nom: string;
    email: string;
    mot_de_passe: string;
    telephone?: string;
    adresse?: string;
  }) {
    return ApiClient.post('/auth/register', userData);
  },

  // Connexion
  async login(credentials: { email: string; mot_de_passe: string; type_utilisateur?: 'artisan' | 'acheteur' }) {
    return ApiClient.post('/auth/login', credentials);
  },

  // Déconnexion
  async logout() {
    return ApiClient.post('/auth/logout', {});
  },

  // Vérifier le token
  async verifyToken() {
    return ApiClient.get('/auth/verify');
  },

  // Profil utilisateur
  async getProfile() {
    return ApiClient.get('/auth/profile');
  },

  // Mettre à jour le profil
  async updateProfile(profileData: {
    nom?: string;
    telephone?: string;
    adresse?: string;
  }) {
    return ApiClient.put('/auth/profile', profileData);
  },

  // Changer mot de passe
  async changePassword(passwordData: {
    ancien_mot_de_passe: string;
    nouveau_mot_de_passe: string;
  }) {
    return ApiClient.put('/auth/password', passwordData);
  }
};

// SERVICE PRODUITS
export const produitsService = {
  // Obtenir tous les produits avec filtres
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categorie?: string;
    artisan_id?: string;
    prix_min?: number;
    prix_max?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString() ? `/produits?${queryParams}` : '/produits';
    return ApiClient.get<PaginatedResponse<any>>(url);
  },

  // Obtenir un produit par ID
  async getProduct(id: string) {
    return ApiClient.get(`/produits/${id}`);
  },

  // Créer un produit (admin/artisan)
  async createProduct(productData: {
    nom_produit: string;
    description: string;
    prix: number;
    categorie: string;
    stock: number;
    artisan_id: string;
  }) {
    return ApiClient.post('/produits', productData);
  },

  // Mettre à jour un produit
  async updateProduct(id: string, productData: Partial<{
    nom_produit: string;
    description: string;
    prix: number;
    categorie: string;
    stock: number;
  }>) {
    return ApiClient.put(`/produits/${id}`, productData);
  },

  // Supprimer un produit
  async deleteProduct(id: string) {
    return ApiClient.delete(`/produits/${id}`);
  },

  // Upload d'images pour un produit
  async uploadProductImages(productId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    return ApiClient.uploadFile(`/produits/${productId}/images`, formData);
  },

  // Recherche de produits
  async searchProducts(query: string) {
    return ApiClient.get(`/produits/search?q=${encodeURIComponent(query)}`);
  }
};

// SERVICE ARTISANS
export const artisansService = {
  // Obtenir tous les artisans
  async getArtisans(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString() ? `/artisans?${queryParams}` : '/artisans';
    return ApiClient.get<PaginatedResponse<any>>(url);
  },

  // Obtenir un artisan par ID
  async getArtisan(id: string) {
    return ApiClient.get(`/artisans/${id}`);
  },

  // Créer un artisan (admin)
  async createArtisan(artisanData: {
    nom: string;
    bio: string;
    localisation: string;
    telephone?: string;
    langue: string;
  }) {
    return ApiClient.post('/artisans', artisanData);
  },

  // Mettre à jour un artisan
  async updateArtisan(id: string, artisanData: Partial<{
    nom: string;
    bio: string;
    localisation: string;
    telephone?: string;
  }>) {
    return ApiClient.put(`/artisans/${id}`, artisanData);
  },

  // Supprimer un artisan
  async deleteArtisan(id: string) {
    return ApiClient.delete(`/artisans/${id}`);
  },

  // Statistiques d'un artisan
  async getArtisanStats(id: string) {
    return ApiClient.get(`/artisans/${id}/statistiques`);
  },

  // Produits d'un artisan
  async getArtisanProducts(id: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString() ? 
      `/artisans/${id}/produits?${queryParams}` : 
      `/artisans/${id}/produits`;
    
    return ApiClient.get<PaginatedResponse<any>>(url);
  }
};

// SERVICE PANIER
export const panierService = {
  // Obtenir le panier de l'utilisateur
  async getCart() {
    return ApiClient.get('/panier');
  },

  // Ajouter un produit au panier
  async addToCart(produitId: string, quantite: number = 1) {
    return ApiClient.post('/panier/ajouter', { produit_id: produitId, quantite });
  },

  // Mettre à jour la quantité d'un article
  async updateCartItem(itemId: string, quantite: number) {
    return ApiClient.put(`/panier/items/${itemId}`, { quantite });
  },

  // Supprimer un article du panier
  async removeFromCart(itemId: string) {
    return ApiClient.delete(`/panier/items/${itemId}`);
  },

  // Vider le panier
  async clearCart() {
    return ApiClient.delete('/panier');
  },

  // Valider le panier avant commande
  async validateCart() {
    return ApiClient.post('/panier/valider', {});
  }
};

// SERVICE COMMANDES
export const commandesService = {
  // Obtenir les commandes de l'utilisateur
  async getOrders(params?: {
    page?: number;
    limit?: number;
    statut?: string;
    date_debut?: string;
    date_fin?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString() ? `/commandes?${queryParams}` : '/commandes';
    return ApiClient.get<PaginatedResponse<any>>(url);
  },

  // Obtenir une commande par ID
  async getOrder(id: string) {
    return ApiClient.get(`/commandes/${id}`);
  },

  // Créer une nouvelle commande
  async createOrder(orderData: {
    adresse_livraison: string;
    telephone_livraison: string;
    methode_paiement: 'orange_money' | 'mtn_money' | 'carte_bancaire';
    numero_paiement?: string;
  }) {
    return ApiClient.post('/commandes', orderData);
  },

  // Annuler une commande
  async cancelOrder(id: string, raison?: string) {
    return ApiClient.put(`/commandes/${id}/annuler`, { raison });
  },

  // Confirmer le paiement d'une commande
  async confirmPayment(id: string, paiementData: {
    numero_transaction: string;
    montant_paye: number;
  }) {
    return ApiClient.put(`/commandes/${id}/paiement`, paiementData);
  },

  // Mettre à jour le statut de livraison
  async updateDeliveryStatus(id: string, statut: string, commentaire?: string) {
    return ApiClient.put(`/commandes/${id}/livraison`, { statut, commentaire });
  }
};

// SERVICE STATISTIQUES
export const statistiquesService = {
  // Statistiques générales (admin)
  async getGeneralStats() {
    return ApiClient.get('/statistiques');
  },

  // Statistiques de ventes (admin)
  async getSalesStats(params?: {
    periode?: 'jour' | 'semaine' | 'mois' | 'annee';
    date_debut?: string;
    date_fin?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString() ? 
      `/statistiques/ventes?${queryParams}` : 
      '/statistiques/ventes';
    
    return ApiClient.get(url);
  },

  // Statistiques par artisan (admin)
  async getArtisanStats(artisanId?: string) {
    const url = artisanId ? 
      `/statistiques/artisans/${artisanId}` : 
      '/statistiques/artisans';
    
    return ApiClient.get(url);
  },

  // Top produits (admin)
  async getTopProducts(limit: number = 10) {
    return ApiClient.get(`/statistiques/produits/top?limit=${limit}`);
  },

  // Revenus par mois (admin)
  async getMonthlyRevenue(year?: number) {
    const url = year ? 
      `/statistiques/revenus/mensuel?annee=${year}` : 
      '/statistiques/revenus/mensuel';
    
    return ApiClient.get(url);
  }
};

// SERVICE UPLOAD
export const uploadService = {
  // Upload d'un fichier générique
  async uploadFile(file: File, type: 'produit' | 'artisan' | 'avatar' = 'produit') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return ApiClient.uploadFile('/upload', formData);
  },

  // Upload multiple de fichiers
  async uploadFiles(files: File[], type: 'produit' | 'artisan' | 'avatar' = 'produit') {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    formData.append('type', type);

    return ApiClient.uploadFile('/upload/multiple', formData);
  },

  // Supprimer un fichier
  async deleteFile(fileUrl: string) {
    return ApiClient.delete(`/upload?file=${encodeURIComponent(fileUrl)}`);
  }
};

// SERVICE PAIEMENT
export const paiementService = {
  // Initier un paiement PayDunya
  async initiatePayment(orderData: {
    commande_id: string;
    montant: number;
    methode: 'orange_money' | 'mtn_money' | 'carte_bancaire';
    numero_telephone?: string;
  }) {
    return ApiClient.post('/paiement/initier', orderData);
  },

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(transactionId: string) {
    return ApiClient.get(`/paiement/statut/${transactionId}`);
  },

  // Confirmer un paiement mobile money
  async confirmMobilePayment(transactionData: {
    transaction_id: string;
    code_confirmation: string;
  }) {
    return ApiClient.post('/paiement/confirmer', transactionData);
  },

  // Historique des paiements
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    methode?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString() ? 
      `/paiement/historique?${queryParams}` : 
      '/paiement/historique';
    
    return ApiClient.get<PaginatedResponse<any>>(url);
  }
};

// Export du service principal
export const apiService = {
  auth: authService,
  produits: produitsService,
  artisans: artisansService,
  panier: panierService,
  commandes: commandesService,
  statistiques: statistiquesService,
  upload: uploadService,
  paiement: paiementService
};

export default apiService;