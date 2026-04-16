/**
 * Service de notifications pour l'application Tissés de Waraniéné
 * Gère les notifications utilisateur avec react-hot-toast
 */

import toast, { ToastOptions, LoaderIcon } from 'react-hot-toast';

// Types pour les notifications personnalisées
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface CustomToastOptions extends ToastOptions {
  type?: NotificationType;
  persistent?: boolean;
}

// Configuration par défaut des toasts
const DEFAULT_OPTIONS: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  }
};

// Styles personnalisés par type
const TOAST_STYLES = {
  success: {
    style: {
      background: '#10B981',
      color: '#FFFFFF',
      border: '1px solid #059669',
    },
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#10B981',
    }
  },
  error: {
    style: {
      background: '#EF4444',
      color: '#FFFFFF',
      border: '1px solid #DC2626',
    },
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#EF4444',
    }
  },
  warning: {
    style: {
      background: '#F59E0B',
      color: '#FFFFFF',
      border: '1px solid #D97706',
    },
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#F59E0B',
    }
  },
  info: {
    style: {
      background: '#3B82F6',
      color: '#FFFFFF',
      border: '1px solid #2563EB',
    },
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#3B82F6',
    }
  },
  loading: {
    style: {
      background: '#6B7280',
      color: '#FFFFFF',
      border: '1px solid #4B5563',
    }
  }
};

export class NotificationService {
  // Notification de succès
  static success(message: string, options?: CustomToastOptions) {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...TOAST_STYLES.success,
      ...options,
      duration: options?.persistent ? Infinity : (options?.duration || DEFAULT_OPTIONS.duration)
    };

    return toast.success(message, mergedOptions);
  }

  // Notification d'erreur
  static error(message: string, options?: CustomToastOptions) {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...TOAST_STYLES.error,
      ...options,
      duration: options?.persistent ? Infinity : (options?.duration || 6000) // Plus long pour les erreurs
    };

    return toast.error(message, mergedOptions);
  }

  // Notification d'avertissement
  static warning(message: string, options?: CustomToastOptions) {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...TOAST_STYLES.warning,
      ...options,
      duration: options?.persistent ? Infinity : (options?.duration || 5000)
    };

    return toast(message, mergedOptions);
  }

  // Notification d'information
  static info(message: string, options?: CustomToastOptions) {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...TOAST_STYLES.info,
      ...options,
      duration: options?.persistent ? Infinity : (options?.duration || DEFAULT_OPTIONS.duration)
    };

    return toast(message, mergedOptions);
  }

  // Notification de chargement
  static loading(message: string, options?: CustomToastOptions) {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...TOAST_STYLES.loading,
      ...options
    };

    return toast.loading(message, mergedOptions);
  }

  // Toast personnalisé avec promesse
  static async promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: CustomToastOptions
  ): Promise<T> {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: mergedOptions.style,
        success: {
          ...TOAST_STYLES.success,
          duration: mergedOptions.duration,
        },
        error: {
          ...TOAST_STYLES.error,
          duration: 6000,
        },
        loading: {
          ...TOAST_STYLES.loading,
        }
      }
    );
  }

  // Fermer un toast spécifique
  static dismiss(toastId?: string) {
    toast.dismiss(toastId);
  }

  // Fermer tous les toasts
  static dismissAll() {
    toast.dismiss();
  }

  // Notifications spécifiques à l'e-commerce
  static ecommerce = {
    // Panier
    itemAdded: (productName: string, quantity: number = 1) => {
      return NotificationService.success(
        `${productName} (${quantity}) ajouté${quantity > 1 ? 's' : ''} au panier`,
        { duration: 3000 }
      );
    },

    itemRemoved: (productName: string) => {
      return NotificationService.info(
        `${productName} retiré du panier`,
        { duration: 3000 }
      );
    },

    cartCleared: () => {
      return NotificationService.info(
        'Panier vidé',
        { duration: 3000 }
      );
    },

    quantityUpdated: (productName: string, quantity: number) => {
      return NotificationService.info(
        `Quantité de ${productName} mise à jour: ${quantity}`,
        { duration: 2000 }
      );
    },

    // Commandes
    orderCreated: (orderId: string) => {
      return NotificationService.success(
        `Commande ${orderId} créée avec succès`,
        { duration: 5000 }
      );
    },

    orderConfirmed: (orderId: string) => {
      return NotificationService.success(
        `Commande ${orderId} confirmée`,
        { duration: 4000 }
      );
    },

    orderCancelled: (orderId: string) => {
      return NotificationService.warning(
        `Commande ${orderId} annulée`,
        { duration: 4000 }
      );
    },

    orderDelivered: (orderId: string) => {
      return NotificationService.success(
        `Commande ${orderId} livrée`,
        { duration: 5000 }
      );
    },

    // Paiements
    paymentSuccess: (amount: number) => {
      return NotificationService.success(
        `Paiement de ${amount.toLocaleString()} FCFA confirmé`,
        { duration: 6000 }
      );
    },

    paymentFailed: (reason?: string) => {
      return NotificationService.error(
        `Échec du paiement${reason ? `: ${reason}` : ''}`,
        { persistent: true }
      );
    },

    paymentPending: () => {
      return NotificationService.loading(
        'Traitement du paiement en cours...'
      );
    },

    // Authentification
    loginSuccess: (userName: string) => {
      return NotificationService.success(
        `Bon retour, ${userName}!`,
        { duration: 3000 }
      );
    },

    logoutSuccess: () => {
      return NotificationService.info(
        'Déconnexion réussie',
        { duration: 2000 }
      );
    },

    registrationSuccess: () => {
      return NotificationService.success(
        'Inscription réussie! Vous pouvez maintenant vous connecter',
        { duration: 5000 }
      );
    },

    // Produits
    productCreated: (productName: string) => {
      return NotificationService.success(
        `Produit "${productName}" créé avec succès`,
        { duration: 4000 }
      );
    },

    productUpdated: (productName: string) => {
      return NotificationService.success(
        `Produit "${productName}" mis à jour`,
        { duration: 3000 }
      );
    },

    productDeleted: (productName: string) => {
      return NotificationService.warning(
        `Produit "${productName}" supprimé`,
        { duration: 4000 }
      );
    },

    // Upload
    uploadProgress: (progress: number) => {
      return NotificationService.loading(
        `Upload en cours: ${progress}%`
      );
    },

    uploadSuccess: (fileName: string) => {
      return NotificationService.success(
        `${fileName} uploadé avec succès`,
        { duration: 3000 }
      );
    },

    uploadError: (fileName: string, error?: string) => {
      return NotificationService.error(
        `Erreur upload ${fileName}${error ? `: ${error}` : ''}`,
        { duration: 5000 }
      );
    },

    // Erreurs réseau
    networkError: () => {
      return NotificationService.error(
        'Problème de connexion. Vérifiez votre connexion internet.',
        { persistent: true }
      );
    },

    serverError: () => {
      return NotificationService.error(
        'Erreur serveur. Veuillez réessayer plus tard.',
        { duration: 6000 }
      );
    },

    // Validations
    validationError: (message: string) => {
      return NotificationService.error(
        message,
        { duration: 4000 }
      );
    },

    fieldRequired: (fieldName: string) => {
      return NotificationService.warning(
        `Le champ "${fieldName}" est requis`,
        { duration: 3000 }
      );
    },

    // Succès génériques
    dataUpdated: () => {
      return NotificationService.success(
        'Données mises à jour avec succès',
        { duration: 3000 }
      );
    },

    dataSaved: () => {
      return NotificationService.success(
        'Données sauvegardées',
        { duration: 3000 }
      );
    },

    dataDeleted: () => {
      return NotificationService.warning(
        'Données supprimées',
        { duration: 3000 }
      );
    }
  };

  // Utilitaires
  static utils = {
    // Créer un toast de confirmation avec actions
    confirm: async (
      message: string,
      onConfirm: () => void | Promise<void>,
      onCancel?: () => void
    ): Promise<void> => {
      return new Promise((resolve) => {
        const toastId = toast(
          (t) => (
            `<div style="display: flex; flex-direction: column; gap: 12px;">
              <span style="font-weight: 500;">${message}</span>
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button 
                  onclick="document.dispatchEvent(new CustomEvent('toast-cancel', {detail: '${t.id}'}))"
                  style="padding: 6px 12px; background: #6B7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
                >
                  Annuler
                </button>
                <button 
                  onclick="document.dispatchEvent(new CustomEvent('toast-confirm', {detail: '${t.id}'}))"
                  style="padding: 6px 12px; background: #EF4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
                >
                  Confirmer
                </button>
              </div>
            </div>`
          ),
          {
            duration: Infinity,
            style: {
              background: '#FFFFFF',
              color: '#1F2937',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '16px',
              maxWidth: '400px',
            }
          }
        );

        // Gestion des événements
        const handleConfirm = async (e: any) => {
          if (e.detail === toastId) {
            toast.dismiss(toastId);
            document.removeEventListener('toast-confirm', handleConfirm);
            document.removeEventListener('toast-cancel', handleCancel);
            await onConfirm();
            resolve();
          }
        };

        const handleCancel = (e: any) => {
          if (e.detail === toastId) {
            toast.dismiss(toastId);
            document.removeEventListener('toast-confirm', handleConfirm);
            document.removeEventListener('toast-cancel', handleCancel);
            onCancel?.();
            resolve();
          }
        };

        document.addEventListener('toast-confirm', handleConfirm);
        document.addEventListener('toast-cancel', handleCancel);
      });
    },

    // Afficher un toast avec bouton d'action
    withAction: (
      message: string,
      actionText: string,
      onAction: () => void,
      type: NotificationType = 'info'
    ) => {
      const toastStyles = TOAST_STYLES[type] || TOAST_STYLES.info;
      
      return toast(
        (t) => (
          `<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <span>${message}</span>
            <button 
              onclick="document.dispatchEvent(new CustomEvent('toast-action', {detail: '${t.id}'}))"
              style="padding: 4px 8px; background: rgba(255,255,255,0.2); color: inherit; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; cursor: pointer; font-size: 12px;"
            >
              ${actionText}
            </button>
          </div>`
        ),
        {
          ...DEFAULT_OPTIONS,
          ...toastStyles,
          duration: Infinity,
        }
      );
    }
  };
}

// Export des méthodes principales pour usage direct
export const notify = NotificationService;
export const notifyEcommerce = NotificationService.ecommerce;

export default NotificationService;