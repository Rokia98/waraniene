/**
 * Index des services pour l'application Tissés de Waraniéné
 * Point d'entrée centralisé pour tous les services
 */

// Import des services
import apiServiceDefault, { authService, produitsService, artisansService, panierService, commandesService, statistiquesService, uploadService, paiementService } from './apiService';

import validationServiceDefault, { validators, objectValidators, validationUtils, PRODUCT_CATEGORIES, ORDER_STATUSES, PAYMENT_METHODS } from './validationService';

import NotificationServiceDefault, { notify, notifyEcommerce } from './notificationService';

import StorageServiceDefault, { authStorage, cartStorage, preferencesStorage, navigationStorage, formStorage, storageUtils, STORAGE_KEYS } from './storageService';

// Re-export pour l'usage externe
export const apiService = apiServiceDefault;
export { authService, produitsService, artisansService, panierService, commandesService, statistiquesService, uploadService, paiementService };

export const validationService = validationServiceDefault;
export { validators, objectValidators, validationUtils, PRODUCT_CATEGORIES, ORDER_STATUSES, PAYMENT_METHODS };

export const NotificationService = NotificationServiceDefault;
export { notify, notifyEcommerce };

export const StorageService = StorageServiceDefault;
export { authStorage, cartStorage, preferencesStorage, navigationStorage, formStorage, storageUtils, STORAGE_KEYS };

// Types pour TypeScript
interface LoginResponse {
  token: string;
  user: {
    id: string;
    nom: string;
    email: string;
    role?: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Service combiné pour les opérations communes
export class AppService {
  // Initialisation de l'application
  static async initializeApp() {
    try {
      // Nettoyer les données expirées
      const maintenance = storageUtils.performMaintenance();
      console.log('Maintenance du stockage:', maintenance);

      // Vérifier l'authentification
      const token = authStorage.getToken();
      if (token) {
        const result = await apiService.auth.verifyToken();
        if (!result.success) {
          // Token invalide, nettoyer les données auth
          await this.logout();
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      return { success: false, error };
    }
  }

  // Connexion utilisateur
  static async login(credentials: { email: string; mot_de_passe: string; type_utilisateur?: 'artisan' | 'acheteur' }, rememberMe: boolean = false) {
    try {
      // Valider les données
      const validation = objectValidators.userLogin(credentials);
      if (!validation.isValid) {
        notify.error(validationUtils.formatErrors(validation.errors)[0]);
        return { success: false, errors: validation.errors };
      }

      // Appel API
      const result = await apiService.auth.login(credentials);
      
      if (result.success) {
        // Stocker les données d'authentification
        // Si data existe, on l'utilise, sinon on utilise directement result (pour les APIs qui retournent directement les données)
        const loginData = result.data || result;
        
        // L'API retourne 'user' maintenant, avec type_utilisateur
        const user = (loginData as any).user || (loginData as any).acheteur; // Fallback pour compatibilité
        const token = (loginData as any).token;
        const type_utilisateur = (loginData as any).type_utilisateur;
        
        // Ajouter le type d'utilisateur aux données utilisateur
        const userData = { ...user, type_utilisateur };
        
        authStorage.setToken(token, rememberMe);
        authStorage.setUserData(userData, rememberMe);
        
        notifyEcommerce.loginSuccess(user.nom);
        
        return { success: true, data: { token, user } };
      } else {
        notify.error(result.error || 'Erreur de connexion');
        return { success: false, error: result.error };
      }
    } catch (error) {
      notify.error('Erreur de connexion');
      console.error('Login error:', error);
      return { success: false, error };
    }
  }

  // Déconnexion
  static async logout() {
    try {
      // Appel API (peut échouer si hors ligne)
      await apiService.auth.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion API:', error);
    } finally {
      // Nettoyer les données locales dans tous les cas
      authStorage.removeToken();
      authStorage.removeUserData();
      cartStorage.removeItems(); // Vider panier local
      
      notifyEcommerce.logoutSuccess();
    }
  }

  // Vérifier si l'utilisateur est connecté
  static isAuthenticated() {
    return !!authStorage.getToken();
  }

  // Récupérer l'utilisateur actuel
  static getCurrentUser() {
    return authStorage.getUserData();
  }

  // Inscription utilisateur
  static async register(userData: {
    nom: string;
    email: string;
    mot_de_passe: string;
    telephone?: string;
    adresse?: string;
  }) {
    try {
      // Valider les données
      const validation = objectValidators.userRegistration(userData);
      if (!validation.isValid) {
        notify.error(validationUtils.formatErrors(validation.errors)[0]);
        return { success: false, errors: validation.errors };
      }

      // Nettoyer les données
      const cleanedData = {
        ...userData,
        email: validationUtils.sanitizeData.cleanEmail(userData.email),
        telephone: userData.telephone ? validationUtils.sanitizeData.formatPhone(userData.telephone) : undefined
      };

      // Appel API
      const result = await apiService.auth.register(cleanedData);
      
      if (result.success) {
        notifyEcommerce.registrationSuccess();
        return { success: true, data: result.data };
      } else {
        notify.error(result.error || 'Erreur lors de l\'inscription');
        return { success: false, error: result.error };
      }
    } catch (error) {
      notify.error('Erreur lors de l\'inscription');
      console.error('Register error:', error);
      return { success: false, error };
    }
  }

  // Gestion du panier pour utilisateurs non connectés
  static getLocalCart() {
    return cartStorage.getItems();
  }

  static addToLocalCart(product: any, quantity: number = 1) {
    const items = cartStorage.getItems();
    const existingItem = items.find(item => item.produit.id === product.id);

    if (existingItem) {
      existingItem.quantite += quantity;
    } else {
      items.push({
        id: `local_${Date.now()}_${product.id}`,
        produit: product,
        quantite: quantity,
        date_ajout: new Date().toISOString()
      });
    }

    cartStorage.setItems(items);
    notifyEcommerce.itemAdded(product.nom_produit, quantity);
    
    return items;
  }

  static removeFromLocalCart(productId: string) {
    const items = cartStorage.getItems();
    const item = items.find(item => item.produit.id === productId);
    const updatedItems = items.filter(item => item.produit.id !== productId);
    
    cartStorage.setItems(updatedItems);
    
    if (item) {
      notifyEcommerce.itemRemoved(item.produit.nom_produit);
    }
    
    return updatedItems;
  }

  static updateLocalCartQuantity(productId: string, quantity: number) {
    const items = cartStorage.getItems();
    const item = items.find(item => item.produit.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        return this.removeFromLocalCart(productId);
      }
      
      item.quantite = quantity;
      cartStorage.setItems(items);
      notifyEcommerce.quantityUpdated(item.produit.nom_produit, quantity);
    }
    
    return items;
  }

  static clearLocalCart() {
    cartStorage.removeItems();
    notifyEcommerce.cartCleared();
  }

  // Synchroniser panier local avec le serveur lors de la connexion
  static async syncLocalCartToServer() {
    const localItems = cartStorage.getItems();
    
    if (localItems.length === 0) return { success: true };

    try {
      const results = [];
      
      for (const item of localItems) {
        const result = await apiService.panier.addToCart(item.produit.id, item.quantite);
        results.push(result);
      }

      // Si tout s'est bien passé, vider le panier local
      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        cartStorage.removeItems();
        notify.success(`${localItems.length} article(s) synchronisé(s) avec votre compte`);
      }

      return { success: allSuccess, results };
    } catch (error) {
      console.error('Erreur sync panier:', error);
      return { success: false, error };
    }
  }

  // Gestion des recherches et navigation
  static addToRecentSearches(query: string) {
    if (query.trim().length >= 3) {
      navigationStorage.addRecentSearch(query.trim());
    }
  }

  static addToViewedProducts(productId: string) {
    navigationStorage.addViewedProduct(productId);
  }

  // Sauvegarde de brouillon de formulaire
  static saveFormDraft(formId: string, data: any) {
    formStorage.saveDraft(formId, data);
  }

  static getFormDraft(formId: string) {
    return formStorage.getDraft(formId);
  }

  static clearFormDraft(formId: string) {
    formStorage.removeDraft(formId);
  }

  // Gestion des préférences
  static setUserPreference(key: string, value: any) {
    preferencesStorage.updatePreference(key, value);
  }

  static getUserPreferences() {
    return preferencesStorage.getPreferences();
  }

  // Gestion des erreurs réseau
  static handleNetworkError(error: any) {
    if (!navigator.onLine) {
      notify.error('Pas de connexion internet. Vérifiez votre connexion.');
    } else if (error.status >= 500) {
      notifyEcommerce.serverError();
    } else if (error.status === 401) {
      notify.warning('Session expirée. Veuillez vous reconnecter.');
      this.logout();
    } else {
      notifyEcommerce.networkError();
    }
  }

  // Validation et nettoyage des données avant envoi API
  static prepareProductData(rawData: any) {
    return {
      nom_produit: validationUtils.sanitizeData.cleanString(rawData.nom_produit),
      description: validationUtils.sanitizeData.cleanString(rawData.description),
      prix: validationUtils.sanitizeData.formatPrice(rawData.prix),
      categorie: rawData.categorie,
      stock: parseInt(rawData.stock),
      artisan_id: rawData.artisan_id
    };
  }

  static prepareOrderData(rawData: any) {
    return {
      adresse_livraison: validationUtils.sanitizeData.cleanString(rawData.adresse_livraison),
      telephone_livraison: validationUtils.sanitizeData.formatPhone(rawData.telephone_livraison),
      methode_paiement: rawData.methode_paiement,
      numero_paiement: rawData.numero_paiement ? validationUtils.sanitizeData.formatPhone(rawData.numero_paiement) : undefined
    };
  }

  // Utilitaires de debug et monitoring
  static getAppStatus() {
    return {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      storage: storageUtils.getStorageInfo(),
      authentication: {
        isAuthenticated: !!authStorage.getToken(),
        userData: authStorage.getUserData()
      },
      cart: {
        localItems: cartStorage.getItems().length,
        preferences: preferencesStorage.getPreferences()
      }
    };
  }

  static exportUserData() {
    return {
      preferences: preferencesStorage.getPreferences(),
      recentSearches: navigationStorage.getRecentSearches(),
      viewedProducts: navigationStorage.getViewedProducts(),
      cartItems: cartStorage.getItems(),
      formDrafts: formStorage.getDrafts(),
      exportDate: new Date().toISOString()
    };
  }
}

// Export du service principal
export default AppService;