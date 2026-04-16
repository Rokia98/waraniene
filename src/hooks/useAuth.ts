'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import AppService from '@/services';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  refresh: () => void;
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'état d'authentification au chargement
    const checkAuth = () => {
      try {
        const isAuth = AppService.isAuthenticated();
        if (isAuth) {
          const currentUser = AppService.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refresh = () => {
    const isAuth = AppService.isAuthenticated();
    if (isAuth) {
      const currentUser = AppService.getCurrentUser();
      setUser(currentUser);
    } else {
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    refresh
  };
}