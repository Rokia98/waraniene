'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface FavoriItem {
  id: string;
  nom_produit: string;
  prix: number;
  artisan: string;
  image?: string;
  date_ajout: string;
}

interface FavorisContextType {
  favoris: FavoriItem[];
  count: number;
  addFavori: (item: Omit<FavoriItem, 'date_ajout'>) => void;
  removeFavori: (id: string) => void;
  isFavori: (id: string) => boolean;
  toggleFavori: (item: Omit<FavoriItem, 'date_ajout'>) => void;
  clearFavoris: () => void;
}

const STORAGE_KEY = 'waraniene_favoris';

const FavorisContext = createContext<FavorisContextType | undefined>(undefined);

export function FavorisProvider({ children }: { children: React.ReactNode }) {
  const [favoris, setFavoris] = useState<FavoriItem[]>([]);

  // Charger les favoris depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavoris(JSON.parse(stored));
      }
    } catch {
      // localStorage indisponible
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoris));
    } catch {
      // localStorage indisponible
    }
  }, [favoris]);

  const addFavori = useCallback((item: Omit<FavoriItem, 'date_ajout'>) => {
    setFavoris(prev => {
      if (prev.some(f => f.id === item.id)) {
        return prev;
      }
      toast.success('Ajouté aux favoris');
      return [...prev, { ...item, date_ajout: new Date().toISOString() }];
    });
  }, []);

  const removeFavori = useCallback((id: string) => {
    setFavoris(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (filtered.length < prev.length) {
        toast.success('Retiré des favoris');
      }
      return filtered;
    });
  }, []);

  const isFavori = useCallback((id: string) => {
    return favoris.some(f => f.id === id);
  }, [favoris]);

  const toggleFavori = useCallback((item: Omit<FavoriItem, 'date_ajout'>) => {
    if (favoris.some(f => f.id === item.id)) {
      removeFavori(item.id);
    } else {
      addFavori(item);
    }
  }, [favoris, addFavori, removeFavori]);

  const clearFavoris = useCallback(() => {
    setFavoris([]);
  }, []);

  return (
    <FavorisContext.Provider value={{
      favoris,
      count: favoris.length,
      addFavori,
      removeFavori,
      isFavori,
      toggleFavori,
      clearFavoris,
    }}>
      {children}
    </FavorisContext.Provider>
  );
}

export function useFavoris() {
  const context = useContext(FavorisContext);
  if (!context) {
    throw new Error('useFavoris must be used within a FavorisProvider');
  }
  return context;
}
