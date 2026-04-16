interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getToken();
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Erreur inconnue' };
      }
    } catch (error) {
      console.error('Erreur API:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint: string, formData: FormData): Promise<ApiResponse<any>> {
    try {
      const token = this.getToken();
      
      const config: RequestInit = {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Erreur d\'upload' };
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }
}

// Instance par défaut
export const api = new ApiClient('/api');

// Méthodes spécifiques pour les entités

export const produitApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/produits${query}`);
  },
  getById: (id: string) => api.get(`/produits/${id}`),
  create: (data: any) => api.post('/produits', data),
  update: (id: string, data: any) => api.put(`/produits/${id}`, data),
  delete: (id: string) => api.delete(`/produits/${id}`),
};

export const artisanApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/artisans${query}`);
  },
  getById: (id: string) => api.get(`/artisans/${id}`),
  create: (data: any) => api.post('/artisans', data),
  update: (id: string, data: any) => api.put(`/artisans/${id}`, data),
  delete: (id: string) => api.delete(`/artisans/${id}`),
};

export const commandeApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/commandes${query}`);
  },
  getById: (id: string) => api.get(`/commandes/${id}`),
  create: (data: any) => api.post('/commandes', data),
  update: (id: string, data: any) => api.put(`/commandes/${id}`, data),
  delete: (id: string) => api.delete(`/commandes/${id}`),
};

export const acheteurApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/acheteurs${query}`);
  },
  getById: (id: string) => api.get(`/acheteurs/${id}`),
  create: (data: any) => api.post('/acheteurs', data),
  update: (id: string, data: any) => api.put(`/acheteurs/${id}`, data),
  delete: (id: string) => api.delete(`/acheteurs/${id}`),
};

export const authApi = {
  login: (email: string, motDePasse: string) => 
    api.post('/auth/login', { email, mot_de_passe: motDePasse }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const statistiquesApi = {
  get: (periode?: string) => {
    const query = periode ? `?periode=${periode}` : '';
    return api.get(`/statistiques${query}`);
  },
};

export const uploadApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.upload('/upload', formData);
  },
  deleteImage: (filePath: string) => api.delete(`/upload?filePath=${filePath}`),
};

export const panierApi = {
  get: () => api.get('/panier'),
  add: (produit_id: string, quantite: number = 1) => 
    api.post('/panier', { produit_id, quantite }),
  update: (id: string, quantite: number) => 
    api.put(`/panier/${id}`, { quantite }),
  remove: (id: string) => api.delete(`/panier/${id}`),
  clear: () => api.delete('/panier'),
  getItem: (id: string) => api.get(`/panier/${id}`),
  sync: (items: Array<{ produit_id: string; quantite: number }>) =>
    api.post('/panier/sync', { items }),
  count: () => api.get('/panier/count'),
  validate: () => api.post('/panier/validate', {}),
};