'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export interface CartItem {
  id: string;
  nom_produit: string;
  prix: number;
  quantite: number;
  stock_disponible: number;
  artisan: string;
  image?: string;
  couleur?: string;
  taille?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantite'> & { quantite?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantite: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      const quantiteToAdd = action.payload.quantite || 1;
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        const existingItem = state.items[existingItemIndex];
        const newQuantite = existingItem.quantite + quantiteToAdd;
        
        if (newQuantite > existingItem.stock_disponible) {
          toast.error(`Stock insuffisant. Seulement ${existingItem.stock_disponible} disponible(s).`);
          return state;
        }
        
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantite: newQuantite }
            : item
        );
      } else {
        if (quantiteToAdd > action.payload.stock_disponible) {
          toast.error(`Stock insuffisant. Seulement ${action.payload.stock_disponible} disponible(s).`);
          return state;
        }
        
        newItems = [
          ...state.items,
          { ...action.payload, quantite: quantiteToAdd } as CartItem
        ];
      }
      
      const newTotal = newItems.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantite, 0);
      
      toast.success(`${action.payload.nom_produit} ajouté au panier`);
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const newTotal = newItems.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantite, 0);
      
      toast.success('Produit retiré du panier');
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantite } = action.payload;
      
      if (quantite <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: id });
      }
      
      const newItems = state.items.map(item => {
        if (item.id === id) {
          if (quantite > item.stock_disponible) {
            toast.error(`Stock insuffisant. Seulement ${item.stock_disponible} disponible(s).`);
            return item;
          }
          return { ...item, quantite };
        }
        return item;
      });
      
      const newTotal = newItems.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantite, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }
    
    case 'CLEAR_CART':
      toast.success('Panier vidé');
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };
    
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };
    
    case 'LOAD_CART': {
      const newTotal = action.payload.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
      const newItemCount = action.payload.reduce((sum, item) => sum + item.quantite, 0);
      
      return {
        ...state,
        items: action.payload,
        total: newTotal,
        itemCount: newItemCount,
      };
    }
    
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantite'> & { quantite?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantite: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (id: string) => number;
  isItemInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Sauvegarder le panier dans le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('waraniene_cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  // Charger le panier depuis le localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('waraniene_cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error);
        }
      }
    }
  }, []);

  const addItem = (item: Omit<CartItem, 'quantite'> & { quantite?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantite: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantite } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const getItemQuantity = (id: string): number => {
    const item = state.items.find(item => item.id === id);
    return item ? item.quantite : 0;
  };

  const isItemInCart = (id: string): boolean => {
    return state.items.some(item => item.id === id);
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getItemQuantity,
    isItemInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};