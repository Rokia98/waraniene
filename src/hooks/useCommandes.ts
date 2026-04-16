'use client';
import { useState, useEffect } from 'react';
import { commandeApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export interface DetailCommande {
  id: string;
  quantite: number;
  prix_unitaire: number;
  produit: {
    id: string;
    nom_produit: string;
    photos: string[];
    artisan?: {
      nom: string;
    };
  };
}

export interface Commande {
  id: string;
  acheteur_id: string;
  date_commande: string;
  statut: 'en_attente' | 'confirmee' | 'preparee' | 'expediee' | 'livree' | 'annulee';
  montant_total: number;
  mode_paiement: 'orange_money' | 'mtn_money' | 'carte_bancaire';
  adresse_livraison?: string;
  notes_admin?: string;
  acheteur?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  detail_commandes: DetailCommande[];
  created_at: string;
  updated_at: string;
}

export interface CommandesResponse {
  commandes: Commande[];
  total: number;
  hasMore: boolean;
}

export function useCommandes(params?: {
  acheteur_id?: string;
  statut?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const { acheteur } = useAuth();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchCommandes = async (resetList = true) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: Record<string, string> = {};
      // Si pas d'acheteur_id spécifié et utilisateur connecté, filtrer par ses commandes
      if (!params?.acheteur_id && acheteur) {
        queryParams.acheteur_id = acheteur.id;
      } else if (params?.acheteur_id) {
        queryParams.acheteur_id = params.acheteur_id;
      }
      
      if (params?.statut) queryParams.statut = params.statut;
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.offset) queryParams.offset = params.offset.toString();
      if (params?.sortBy) queryParams.sortBy = params.sortBy;
      if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await commandeApi.getAll(queryParams);
      
      if (response.success) {
        const data = response.data as CommandesResponse;
        if (resetList) {
          setCommandes(data.commandes);
        } else {
          setCommandes(prev => [...prev, ...data.commandes]);
        }
        setHasMore(data.hasMore);
        setTotal(data.total);
      } else {
        setError(response.error || 'Erreur lors du chargement des commandes');
        toast.error(response.error || 'Erreur lors du chargement des commandes');
      }
    } catch (err) {
      const errorMessage = 'Erreur de connexion';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCommandes(false);
    }
  };

  const refresh = () => {
    fetchCommandes(true);
  };

  useEffect(() => {
    if (acheteur || params?.acheteur_id) {
      fetchCommandes();
    }
  }, [
    acheteur?.id,
    params?.acheteur_id,
    params?.statut,
    params?.sortBy,
    params?.sortOrder
  ]);

  return {
    commandes,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    refresh
  };
}

export function useCommande(id: string) {
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommande = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await commandeApi.getById(id);
      
      if (response.success) {
        setCommande(response.data as Commande);
      } else {
        setError(response.error || 'Commande introuvable');
        toast.error(response.error || 'Commande introuvable');
      }
    } catch (err) {
      const errorMessage = 'Erreur de connexion';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCommande = async (data: { 
    statut?: Commande['statut']; 
    adresse_livraison?: string; 
    notes_admin?: string; 
  }) => {
    try {
      const response = await commandeApi.update(id, data);
      if (response.success) {
        setCommande(response.data as Commande);
        toast.success('Commande mise à jour');
        return true;
      } else {
        toast.error(response.error || 'Erreur lors de la mise à jour');
        return false;
      }
    } catch (err) {
      toast.error('Erreur de connexion');
      return false;
    }
  };

  const cancelCommande = async () => {
    try {
      const response = await commandeApi.delete(id);
      if (response.success) {
        toast.success('Commande annulée');
        return true;
      } else {
        toast.error(response.error || 'Erreur lors de l\'annulation');
        return false;
      }
    } catch (err) {
      toast.error('Erreur de connexion');
      return false;
    }
  };

  useEffect(() => {
    fetchCommande();
  }, [id]);

  return {
    commande,
    loading,
    error,
    refresh: fetchCommande,
    updateCommande,
    cancelCommande
  };
}

export function useCreateCommande() {
  const [loading, setLoading] = useState(false);

  const createCommande = async (data: {
    acheteur_id: string;
    items: Array<{ produit_id: string; quantite: number }>;
    mode_paiement: Commande['mode_paiement'];
    adresse_livraison?: string;
  }) => {
    try {
      setLoading(true);
      const response = await commandeApi.create(data);
      
      if (response.success) {
        toast.success('Commande créée avec succès');
        return { success: true, data: response.data };
      } else {
        toast.error(response.error || 'Erreur lors de la création de la commande');
        return { success: false, error: response.error };
      }
    } catch (err) {
      toast.error('Erreur de connexion');
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  return {
    createCommande,
    loading
  };
}