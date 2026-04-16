'use client';
import { useState, useEffect } from 'react';
import { statistiquesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export interface Statistiques {
  periode: number;
  produits: {
    total: number;
    actifs: number;
    inactifs: number;
  };
  artisans: {
    total: number;
    actifs: number;
    inactifs: number;
  };
  acheteurs: {
    nouveaux: number;
  };
  commandes: {
    total: number;
    chiffre_affaires: number;
    par_statut: Record<string, number>;
    evolution: Array<{
      date: string;
      commandes: number;
    }>;
  };
  produits_populaires: Array<{
    id: string;
    nom: string;
    totalVendu: number;
  }>;
  genere_le: string;
}

export function useStatistiques(periode: number = 30) {
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistiques = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await statistiquesApi.get(periode.toString());
      
      if (response.success) {
        setStatistiques(response.data as Statistiques);
      } else {
        setError(response.error || 'Erreur lors du chargement des statistiques');
        toast.error(response.error || 'Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      const errorMessage = 'Erreur de connexion';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchStatistiques();
  };

  useEffect(() => {
    fetchStatistiques();
  }, [periode]);

  return {
    statistiques,
    loading,
    error,
    refresh
  };
}

export function useMetriques() {
  const { statistiques, loading, error, refresh } = useStatistiques(30);

  // Métriques calculées dérivées
  const metriques = statistiques ? {
    // Taux de conversion
    tauxConversion: statistiques.commandes.total > 0 && statistiques.acheteurs.nouveaux > 0 
      ? (statistiques.commandes.total / statistiques.acheteurs.nouveaux * 100).toFixed(1)
      : '0',
    
    // Panier moyen
    panierMoyen: statistiques.commandes.total > 0 
      ? (statistiques.commandes.chiffre_affaires / statistiques.commandes.total).toFixed(0)
      : '0',
    
    // Taux de produits actifs
    tauxProduitsActifs: statistiques.produits.total > 0
      ? (statistiques.produits.actifs / statistiques.produits.total * 100).toFixed(1)
      : '0',
    
    // Taux d'artisans actifs
    tauxArtisansActifs: statistiques.artisans.total > 0
      ? (statistiques.artisans.actifs / statistiques.artisans.total * 100).toFixed(1)
      : '0',
    
    // Évolution des ventes (7 derniers jours)
    evolutionVentes: statistiques.commandes.evolution.slice(-7),
    
    // Top 3 produits
    topProduits: statistiques.produits_populaires.slice(0, 3),
    
    // Répartition des commandes par statut (en pourcentages)
    repartitionStatuts: Object.entries(statistiques.commandes.par_statut).map(([statut, count]) => ({
      statut,
      count,
      pourcentage: statistiques.commandes.total > 0 
        ? (count / statistiques.commandes.total * 100).toFixed(1)
        : '0'
    }))
  } : null;

  return {
    statistiques,
    metriques,
    loading,
    error,
    refresh
  };
}