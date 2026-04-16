'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { panierApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProduitPanier {
  id: string;
  nom_produit: string;
  prix: number;
  photos: string[];
  stock: number;
  artisan: {
    nom: string;
  };
}

interface ItemPanier {
  id: string;
  quantite: number;
  date_ajout: string;
  produit: ProduitPanier;
}

interface PanierContextType {
  items: ItemPanier[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  addItem: (produitId: string, quantite?: number) => Promise<void>;
  updateItem: (itemId: string, quantite: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  validateCart: () => Promise<any>;
  refreshCart: () => Promise<void>;
}

const PanierContext = createContext<PanierContextType | undefined>(undefined);

export function PanierProvider({ children }: { children: ReactNode }) {
  const { acheteur, token } = useAuth();
  const [items, setItems] = useState<ItemPanier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculer les totaux
  const totalItems = items.reduce((sum, item) => sum + item.quantite, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.produit.prix * item.quantite), 0);

  // Charger le panier au changement d'authentification
  useEffect(() => {
    if (acheteur && token) {
      loadCartFromAPI();
    } else {
      // Utilisateur non connecté, charger depuis localStorage
      loadCartFromLocalStorage();
    }
  }, [acheteur, token]);

  const loadCartFromAPI = async () => {
    setIsLoading(true);
    try {
      const response = await panierApi.get();
      if (response.success) {
        setItems((response.data as any)?.items || []);
        
        // Synchroniser avec localStorage si nécessaire
        const localCart = getLocalCartItems();
        if (localCart.length > 0) {
          // Synchroniser le panier local avec la base de données
          await syncLocalCartToAPI(localCart);
          clearLocalCart();
        }
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      toast.error('Erreur lors du chargement du panier');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCartFromLocalStorage = () => {
    const localItems = getLocalCartItems();
    // Simuler la structure des items de l'API (sans les détails du produit)
    // En mode non connecté, on stocke juste les IDs et quantités
    setItems([]); // On ne peut pas afficher les détails sans être connecté
  };

  const syncLocalCartToAPI = async (localItems: Array<{produit_id: string; quantite: number}>) => {
    if (!token || localItems.length === 0) return;

    try {
      const response = await panierApi.sync(localItems);
      if (response.success) {
        const data = response.data as any;
        setItems(data?.items || []);
        if (data?.errors && data.errors.length > 0) {
          data.errors.forEach((error: string) => {
            toast.error(error);
          });
        }
        toast.success(`Panier synchronisé: ${data?.synchronized || 0} article(s)`);
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      toast.error('Erreur lors de la synchronisation du panier');
    }
  };

  const getLocalCartItems = (): Array<{produit_id: string; quantite: number}> => {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  };

  const saveToLocalStorage = (cartItems: Array<{produit_id: string; quantite: number}>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  };

  const clearLocalCart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  };

  const addItem = async (produitId: string, quantite: number = 1) => {
    if (acheteur && token) {
      // Utilisateur connecté: ajouter via API
      setIsLoading(true);
      try {
        const response = await panierApi.add(produitId, quantite);
        if (response.success) {
          await refreshCart();
          toast.success((response.data as any)?.message || 'Produit ajouté au panier');
        } else {
          toast.error(response.error || 'Erreur lors de l\'ajout');
        }
      } catch (error) {
        console.error('Erreur ajout panier:', error);
        toast.error('Erreur lors de l\'ajout au panier');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Utilisateur non connecté: sauvegarder en local
      const localItems = getLocalCartItems();
      const existingIndex = localItems.findIndex(item => item.produit_id === produitId);
      
      if (existingIndex >= 0) {
        localItems[existingIndex].quantite += quantite;
      } else {
        localItems.push({ produit_id: produitId, quantite });
      }
      
      saveToLocalStorage(localItems);
      toast.success('Produit ajouté au panier (connectez-vous pour synchroniser)');
    }
  };

  const updateItem = async (itemId: string, quantite: number) => {
    if (!acheteur || !token) {
      toast.error('Connectez-vous pour modifier le panier');
      return;
    }

    setIsLoading(true);
    try {
      const response = await panierApi.update(itemId, quantite);
      if (response.success) {
        await refreshCart();
        toast.success('Quantité mise à jour');
      } else {
        toast.error(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!acheteur || !token) {
      toast.error('Connectez-vous pour modifier le panier');
      return;
    }

    setIsLoading(true);
    try {
      const response = await panierApi.remove(itemId);
      if (response.success) {
        await refreshCart();
        toast.success('Article retiré du panier');
      } else {
        toast.error(response.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (acheteur && token) {
      setIsLoading(true);
      try {
        const response = await panierApi.clear();
        if (response.success) {
          setItems([]);
          toast.success('Panier vidé');
        } else {
          toast.error(response.error || 'Erreur lors du vidage');
        }
      } catch (error) {
        console.error('Erreur vidage:', error);
        toast.error('Erreur lors du vidage du panier');
      } finally {
        setIsLoading(false);
      }
    } else {
      clearLocalCart();
      setItems([]);
      toast.success('Panier vidé');
    }
  };

  const validateCart = async () => {
    if (!acheteur || !token) {
      toast.error('Connectez-vous pour valider le panier');
      return { valid: false };
    }

    try {
      const response = await panierApi.validate();
      return response.success ? response.data : { valid: false };
    } catch (error) {
      console.error('Erreur validation:', error);
      return { valid: false };
    }
  };

  const refreshCart = async () => {
    if (acheteur && token) {
      await loadCartFromAPI();
    }
  };

  const value: PanierContextType = {
    items,
    totalItems,
    totalAmount,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    validateCart,
    refreshCart
  };

  return (
    <PanierContext.Provider value={value}>
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier() {
  const context = useContext(PanierContext);
  if (context === undefined) {
    throw new Error('usePanier must be used within a PanierProvider');
  }
  return context;
}