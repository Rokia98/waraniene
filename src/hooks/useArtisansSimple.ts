'use client';

import { useState, useEffect } from 'react';

// Interface pour les artisans
interface Artisan {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  bio?: string;
  competences?: string;
  experience?: number;
  annees_experience?: number; // Alias pour experience
  photos?: string[];
  date_creation: string;
  updated_at?: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  produits_count?: number;
  localisation?: string; // Alias pour adresse
  note_moyenne?: number; // Note moyenne des avis
}

interface ArtisansResponse {
  artisans: Artisan[];
  total: number;
  hasMore: boolean;
}

export function useArtisans(params?: {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchArtisans = async (resetList = true) => {
    try {
      setLoading(true);
      setError(null);

      // Construire les paramètres de requête
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.offset) searchParams.append('offset', params.offset.toString());
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const url = `/api/artisans${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ArtisansResponse = await response.json();

      if (resetList) {
        setArtisans(data.artisans || []);
      } else {
        setArtisans(prev => [...prev, ...(data.artisans || [])]);
      }

      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(errorMessage);
      console.error('Erreur lors du chargement des artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextParams = {
        ...params,
        offset: artisans.length
      };
      fetchArtisansWithParams(nextParams, false);
    }
  };

  const fetchArtisansWithParams = (newParams: typeof params, reset = true) => {
    const oldParams = params;
    // Mise à jour temporaire des paramètres pour la requête
    Object.assign(params || {}, newParams);
    fetchArtisans(reset).finally(() => {
      // Restaurer les anciens paramètres
      Object.assign(params || {}, oldParams);
    });
  };

  const refetch = () => {
    fetchArtisans(true);
  };

  useEffect(() => {
    fetchArtisans();
  }, [
    params?.search,
    params?.limit,
    params?.sortBy,
    params?.sortOrder
  ]);

  return {
    artisans,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    refetch
  };
}

// Hook pour récupérer un artisan par ID
export function useArtisan(id: string) {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtisan = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/artisans/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setArtisan(data.artisan || null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(errorMessage);
      console.error('Erreur lors du chargement de l\'artisan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisan();
  }, [id]);

  return {
    artisan,
    loading,
    error,
    refetch: fetchArtisan
  };
}

export type { Artisan };