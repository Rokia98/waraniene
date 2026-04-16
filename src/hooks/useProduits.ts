'use client';
import { useState, useEffect } from 'react';
import { Produit, ProductFilters } from '@/types';

export function useProduits(params?: ProductFilters) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchProduits = async (resetList = true) => {
    try {
      setLoading(true);
      setError(null);

      // Construire les paramètres de l'API
      const apiParams = new URLSearchParams();
      if (params?.categorie) apiParams.append('categorie', params.categorie);
      if (params?.artisan_id) apiParams.append('artisan_id', params.artisan_id);
      if (params?.prix_min) apiParams.append('prix_min', params.prix_min.toString());
      if (params?.prix_max) apiParams.append('prix_max', params.prix_max.toString());
      if (params?.recherche) apiParams.append('search', params.recherche);
      if (params?.limite) apiParams.append('limite', params.limite.toString());
      if (params?.page) {
        const offset = (params.page - 1) * (params.limite || 20);
        apiParams.append('offset', offset.toString());
      }
      if (params?.sortBy) apiParams.append('sortBy', params.sortBy);

      const url = `/api/produits${apiParams.toString() ? '?' + apiParams.toString() : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const items = data.data || [];
        const pagination = data.pagination || { 
          total: items.length, 
          has_next: false, 
          has_prev: false 
        };

        if (resetList) {
          setProduits(items);
        } else {
          setProduits(prev => [...prev, ...items]);
        }
        setHasMore(pagination.has_next);
        setTotal(pagination.total);
      } else {
        setError(data.error || 'Erreur lors du chargement des produits');
        console.error('Erreur API produits:', data.error);
      }
    } catch (err: any) {
      const errorMessage = 'Erreur de connexion à l\'API';
      setError(errorMessage);
      console.error('Erreur réseau:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && params) {
      const nextPage = (params.page || 1) + 1;
      const nextParams = { ...params, page: nextPage };
      fetchProduits(false);
    }
  };

  const refresh = () => {
    fetchProduits(true);
  };

  useEffect(() => {
    fetchProduits();
  }, [
    params?.recherche,
    params?.categorie,
    params?.artisan_id,
    params?.prix_min,
    params?.prix_max,
    params?.trier_par,
    params?.page
  ]);

  return {
    produits,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    refresh
  };
}

export function useProduit(id: string) {
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduit = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/produits/${id}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setProduit(data.data);
      } else {
        setError(data.error || 'Produit introuvable');
      }
    } catch (err: any) {
      const errorMessage = 'Erreur de connexion à l\'API';
      setError(errorMessage);
      console.error('Erreur réseau:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProduit = async (data: Partial<Produit>) => {
    try {
      const response = await fetch(`/api/produits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setProduit(result.data);
        return true;
      } else {
        console.error('Erreur mise à jour:', result.error);
        return false;
      }
    } catch (err: any) {
      console.error('Erreur réseau:', err);
      return false;
    }
  };

  const deleteProduit = async () => {
    try {
      const response = await fetch(`/api/produits/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return true;
      } else {
        console.error('Erreur suppression:', result.error);
        return false;
      }
    } catch (err: any) {
      console.error('Erreur réseau:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchProduit();
  }, [id]);

  return {
    produit,
    loading,
    error,
    refresh: fetchProduit,
    updateProduit,
    deleteProduit
  };
}

export function useCreateProduit() {
  const [loading, setLoading] = useState(false);

  const createProduit = async (data: any) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/produits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error || 'Erreur lors de la création' };
      }
    } catch (err: any) {
      console.error('Erreur réseau:', err);
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduit,
    loading
  };
}