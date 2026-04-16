/**
 * Service de stockage local pour l'application Tissés de Waraniéné
 * Gère localStorage et sessionStorage avec sécurité et sérialisation
 */

// Types pour le stockage
export type StorageType = 'local' | 'session';

export interface StorageOptions {
  type?: StorageType;
  expiration?: number; // En millisecondes
  encrypt?: boolean;
}

interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiration?: number;
}

// Clés de stockage utilisées dans l'application
export const STORAGE_KEYS = {
  // Authentification
  AUTH_TOKEN: 'waraniene_auth_token',
  USER_DATA: 'waraniene_user_data',
  REMEMBER_ME: 'waraniene_remember_me',
  
  // Panier (pour les utilisateurs non connectés)
  CART_ITEMS: 'waraniene_cart_items',
  CART_TEMP_ID: 'waraniene_cart_temp_id',
  
  // Préférences utilisateur
  USER_PREFERENCES: 'waraniene_preferences',
  LANGUAGE: 'waraniene_language',
  THEME: 'waraniene_theme',
  
  // Navigation et recherche
  RECENT_SEARCHES: 'waraniene_recent_searches',
  VIEWED_PRODUCTS: 'waraniene_viewed_products',
  
  // Filtres et tri
  PRODUCT_FILTERS: 'waraniene_product_filters',
  SORT_PREFERENCES: 'waraniene_sort_preferences',
  
  // Données temporaires
  FORM_DRAFT: 'waraniene_form_draft',
  UPLOAD_PROGRESS: 'waraniene_upload_progress',
} as const;

class StorageService {
  // Vérifier si le stockage est disponible
  public static isStorageAvailable(type: StorageType): boolean {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Obtenir l'objet storage approprié
  private static getStorage(type: StorageType): Storage | null {
    if (!this.isStorageAvailable(type)) return null;
    return type === 'local' ? window.localStorage : window.sessionStorage;
  }

  // Sérialiser les données
  private static serialize<T>(data: T): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Erreur de sérialisation:', error);
      throw new Error('Impossible de sérialiser les données');
    }
  }

  // Désérialiser les données
  private static deserialize<T>(data: string): T {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur de désérialisation:', error);
      throw new Error('Impossible de désérialiser les données');
    }
  }

  // Créer un item de stockage avec métadonnées
  private static createStorageItem<T>(value: T, expiration?: number): StorageItem<T> {
    return {
      value,
      timestamp: Date.now(),
      expiration: expiration ? Date.now() + expiration : undefined
    };
  }

  // Vérifier si un item a expiré
  private static isExpired<T>(item: StorageItem<T>): boolean {
    if (!item.expiration) return false;
    return Date.now() > item.expiration;
  }

  // Stocker des données
  static set<T>(
    key: string, 
    value: T, 
    options: StorageOptions = {}
  ): boolean {
    const { type = 'local', expiration, encrypt = false } = options;
    const storage = this.getStorage(type);
    
    if (!storage) {
      console.warn(`${type} storage non disponible`);
      return false;
    }

    try {
      const storageItem = this.createStorageItem(value, expiration);
      let serializedData = this.serialize(storageItem);
      
      // Chiffrement simple (pas pour données sensibles)
      if (encrypt) {
        serializedData = btoa(serializedData);
      }
      
      storage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error(`Erreur lors du stockage de ${key}:`, error);
      return false;
    }
  }

  // Récupérer des données
  static get<T>(
    key: string, 
    defaultValue?: T,
    options: Omit<StorageOptions, 'expiration'> = {}
  ): T | null {
    const { type = 'local', encrypt = false } = options;
    const storage = this.getStorage(type);
    
    if (!storage) {
      return defaultValue || null;
    }

    try {
      let data = storage.getItem(key);
      if (!data) return defaultValue || null;

      // Déchiffrement simple
      if (encrypt) {
        data = atob(data);
      }

      const storageItem: StorageItem<T> = this.deserialize(data);
      
      // Vérifier l'expiration
      if (this.isExpired(storageItem)) {
        this.remove(key, { type });
        return defaultValue || null;
      }

      return storageItem.value;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return defaultValue || null;
    }
  }

  // Supprimer des données
  static remove(key: string, options: Omit<StorageOptions, 'expiration' | 'encrypt'> = {}): boolean {
    const { type = 'local' } = options;
    const storage = this.getStorage(type);
    
    if (!storage) return false;

    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
      return false;
    }
  }

  // Vider tout le stockage
  static clear(type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    
    if (!storage) return false;

    try {
      storage.clear();
      return true;
    } catch (error) {
      console.error(`Erreur lors du nettoyage du ${type} storage:`, error);
      return false;
    }
  }

  // Obtenir toutes les clés
  static getAllKeys(type: StorageType = 'local'): string[] {
    const storage = this.getStorage(type);
    
    if (!storage) return [];

    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) keys.push(key);
    }
    
    return keys;
  }

  // Obtenir la taille utilisée (approximative)
  static getUsedSpace(type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    
    if (!storage) return 0;

    let totalSize = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const value = storage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
    
    return totalSize;
  }

  // Nettoyer les éléments expirés
  static cleanExpired(type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    
    if (!storage) return 0;

    let cleanedCount = 0;
    const keys = this.getAllKeys(type);
    
    keys.forEach(key => {
      try {
        const data = storage.getItem(key);
        if (data) {
          const storageItem = this.deserialize<any>(data);
          if (storageItem.expiration && this.isExpired(storageItem)) {
            storage.removeItem(key);
            cleanedCount++;
          }
        }
      } catch {
        // Supprimer les éléments corrompus
        storage.removeItem(key);
        cleanedCount++;
      }
    });

    return cleanedCount;
  }
}

// Services spécialisés pour différents types de données
export const authStorage = {
  // Token d'authentification
  setToken: (token: string, rememberMe: boolean = false) => {
    const options: StorageOptions = {
      type: rememberMe ? 'local' : 'session',
      expiration: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined, // 30 jours si remember me
      encrypt: true
    };
    
    // Également stocker dans les cookies pour le middleware
    if (typeof document !== 'undefined') {
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 jours ou 1 jour
      document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
    
    return StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token, options);
  },

  getToken: (): string | null => {
    // Essayer d'abord localStorage, puis sessionStorage
    let token = StorageService.get<string>(STORAGE_KEYS.AUTH_TOKEN, undefined, { encrypt: true });
    if (!token) {
      token = StorageService.get<string>(STORAGE_KEYS.AUTH_TOKEN, undefined, { type: 'session', encrypt: true });
    }
    return token;
  },

  removeToken: () => {
    StorageService.remove(STORAGE_KEYS.AUTH_TOKEN, { type: 'local' });
    StorageService.remove(STORAGE_KEYS.AUTH_TOKEN, { type: 'session' });
    
    // Supprimer aussi le cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax';
    }
  },

  // Données utilisateur
  setUserData: (userData: any, rememberMe: boolean = false) => {
    const options: StorageOptions = {
      type: rememberMe ? 'local' : 'session',
      expiration: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
    };
    return StorageService.set(STORAGE_KEYS.USER_DATA, userData, options);
  },

  getUserData: (): any | null => {
    let userData = StorageService.get(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      userData = StorageService.get(STORAGE_KEYS.USER_DATA, undefined, { type: 'session' });
    }
    return userData;
  },

  removeUserData: () => {
    StorageService.remove(STORAGE_KEYS.USER_DATA, { type: 'local' });
    StorageService.remove(STORAGE_KEYS.USER_DATA, { type: 'session' });
  }
};

export const cartStorage = {
  // Items du panier pour utilisateurs non connectés
  setItems: (items: any[]) => {
    return StorageService.set(STORAGE_KEYS.CART_ITEMS, items, { 
      expiration: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });
  },

  getItems: (): any[] => {
    return StorageService.get<any[]>(STORAGE_KEYS.CART_ITEMS, []) || [];
  },

  removeItems: () => {
    StorageService.remove(STORAGE_KEYS.CART_ITEMS);
  },

  // ID temporaire pour associer panier à la session
  setTempId: (tempId: string) => {
    return StorageService.set(STORAGE_KEYS.CART_TEMP_ID, tempId);
  },

  getTempId: (): string | null => {
    return StorageService.get(STORAGE_KEYS.CART_TEMP_ID);
  }
};

export const preferencesStorage = {
  // Préférences utilisateur
  setPreferences: (preferences: any) => {
    return StorageService.set(STORAGE_KEYS.USER_PREFERENCES, preferences, {
      expiration: 365 * 24 * 60 * 60 * 1000 // 1 an
    });
  },

  getPreferences: (): any | null => {
    return StorageService.get(STORAGE_KEYS.USER_PREFERENCES, {});
  },

  updatePreference: (key: string, value: any) => {
    const preferences = preferencesStorage.getPreferences() || {};
    preferences[key] = value;
    return preferencesStorage.setPreferences(preferences);
  },

  // Langue
  setLanguage: (language: string) => {
    return StorageService.set(STORAGE_KEYS.LANGUAGE, language, {
      expiration: 365 * 24 * 60 * 60 * 1000
    });
  },

  getLanguage: (): string => {
    return StorageService.get<string>(STORAGE_KEYS.LANGUAGE, 'fr') || 'fr';
  },

  // Thème
  setTheme: (theme: string) => {
    return StorageService.set(STORAGE_KEYS.THEME, theme, {
      expiration: 365 * 24 * 60 * 60 * 1000
    });
  },

  getTheme: (): string => {
    return StorageService.get<string>(STORAGE_KEYS.THEME, 'light') || 'light';
  }
};

export const navigationStorage = {
  // Recherches récentes
  addRecentSearch: (query: string) => {
    const searches = navigationStorage.getRecentSearches();
    const updatedSearches = [query, ...searches.filter(s => s !== query)].slice(0, 10);
    return StorageService.set(STORAGE_KEYS.RECENT_SEARCHES, updatedSearches, {
      expiration: 30 * 24 * 60 * 60 * 1000 // 30 jours
    });
  },

  getRecentSearches: (): string[] => {
    return StorageService.get<string[]>(STORAGE_KEYS.RECENT_SEARCHES, []) || [];
  },

  clearRecentSearches: () => {
    return StorageService.remove(STORAGE_KEYS.RECENT_SEARCHES);
  },

  // Produits vus récemment
  addViewedProduct: (productId: string) => {
    const viewed = navigationStorage.getViewedProducts();
    const updatedViewed = [productId, ...viewed.filter(id => id !== productId)].slice(0, 20);
    return StorageService.set(STORAGE_KEYS.VIEWED_PRODUCTS, updatedViewed, {
      expiration: 30 * 24 * 60 * 60 * 1000 // 30 jours
    });
  },

  getViewedProducts: (): string[] => {
    return StorageService.get<string[]>(STORAGE_KEYS.VIEWED_PRODUCTS, []) || [];
  },

  // Filtres de produits
  setProductFilters: (filters: any) => {
    return StorageService.set(STORAGE_KEYS.PRODUCT_FILTERS, filters, { type: 'session' });
  },

  getProductFilters: (): any => {
    return StorageService.get(STORAGE_KEYS.PRODUCT_FILTERS, {}, { type: 'session' });
  },

  // Préférences de tri
  setSortPreferences: (sortData: any) => {
    return StorageService.set(STORAGE_KEYS.SORT_PREFERENCES, sortData, {
      expiration: 30 * 24 * 60 * 60 * 1000
    });
  },

  getSortPreferences: (): any => {
    return StorageService.get(STORAGE_KEYS.SORT_PREFERENCES, {});
  }
};

export const formStorage = {
  // Brouillons de formulaires
  saveDraft: (formId: string, data: any) => {
    const drafts = formStorage.getDrafts();
    drafts[formId] = {
      data,
      timestamp: Date.now()
    };
    return StorageService.set(STORAGE_KEYS.FORM_DRAFT, drafts, {
      expiration: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });
  },

  getDraft: (formId: string): any | null => {
    const drafts = formStorage.getDrafts();
    return drafts[formId]?.data || null;
  },

  getDrafts: (): Record<string, any> => {
    return StorageService.get(STORAGE_KEYS.FORM_DRAFT, {}) || {};
  },

  removeDraft: (formId: string) => {
    const drafts = formStorage.getDrafts();
    delete drafts[formId];
    return StorageService.set(STORAGE_KEYS.FORM_DRAFT, drafts);
  },

  clearAllDrafts: () => {
    return StorageService.remove(STORAGE_KEYS.FORM_DRAFT);
  }
};

// Utilitaires de maintenance
export const storageUtils = {
  // Nettoyer automatiquement le stockage
  performMaintenance: () => {
    const localCleaned = StorageService.cleanExpired('local');
    const sessionCleaned = StorageService.cleanExpired('session');
    
    console.log(`Maintenance du stockage: ${localCleaned + sessionCleaned} éléments nettoyés`);
    
    return {
      localCleaned,
      sessionCleaned,
      total: localCleaned + sessionCleaned
    };
  },

  // Obtenir des informations sur l'utilisation
  getStorageInfo: () => {
    return {
      localStorage: {
        available: StorageService.isStorageAvailable('local'),
        usedSpace: StorageService.getUsedSpace('local'),
        keysCount: StorageService.getAllKeys('local').length
      },
      sessionStorage: {
        available: StorageService.isStorageAvailable('session'),
        usedSpace: StorageService.getUsedSpace('session'),
        keysCount: StorageService.getAllKeys('session').length
      }
    };
  },

  // Exporter toutes les données (pour backup)
  exportData: () => {
    const localKeys = StorageService.getAllKeys('local');
    const sessionKeys = StorageService.getAllKeys('session');
    
    const localData: Record<string, any> = {};
    const sessionData: Record<string, any> = {};
    
    localKeys.forEach(key => {
      localData[key] = StorageService.get(key);
    });
    
    sessionKeys.forEach(key => {
      sessionData[key] = StorageService.get(key, null, { type: 'session' });
    });
    
    return {
      localStorage: localData,
      sessionStorage: sessionData,
      exportDate: new Date().toISOString()
    };
  }
};

// Export principal
export default StorageService;
export { StorageService };