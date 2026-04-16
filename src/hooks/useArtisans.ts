'use client';
import { useState, useEffect } from 'react';
import { apiService, notify } from '@/services';
import { Artisan } from '@/types';

export function useArtisans(params?: {
  page?: number;
  limit?: number;
  search?: string;
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

      const response = await apiService.artisans.getArtisans(params || {});
      
      if (response.success && response.data) {
        const data = response.data as any;
        const items = data.items || data.artisans || [];
        const pagination = data.pagination || { 
          total: items.length, 
          has_next: false, 
          has_prev: false 
        };

        if (resetList) {
          setArtisans(items);
        } else {
          setArtisans(prev => [...prev, ...items]);
        }

        setTotal(pagination.total);
        setHasMore(pagination.has_next);
      } else {
        setError(response.error || 'Erreur lors du chargement des artisans');
        notify.error(response.error || 'Erreur lors du chargement des artisans');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de connexion';
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = Math.floor(artisans.length / (params?.limit || 10)) + 1;
      fetchArtisans(false);
    }
  };

  return {
    artisans,
    loading,
    error,
    hasMore,
    total,
    refetch: () => fetchArtisans(true),
    loadMore
  };
}

// Hook pour récupérer un artisan par ID
export function useArtisan(id: string) {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtisan = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.artisans.getArtisan(id);
      
      if (response.success && response.data) {
        setArtisan(response.data as Artisan);
      } else {
        setError(response.error || 'Artisan introuvable');
        notify.error(response.error || 'Artisan introuvable');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de connexion';
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchArtisan();
    }
  }, [id]);

  return {
    artisan,
    loading,
    error,
    refetch: fetchArtisan
  };
}