'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ChevronDown,
  Download,
  MessageSquare,
  Truck,
  Check,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CommandeItem {
  id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  photo: string | null;
}

interface Commande {
  id: string;
  numero_commande: string;
  acheteur_nom: string;
  acheteur_email: string;
  acheteur_telephone: string;
  montant_artisan: number;
  montant_total_commande: number;
  statut_paiement: 'pending' | 'completed' | 'failed';
  statut_livraison: 'preparation' | 'expediee' | 'en_livraison' | 'livree' | 'annule';
  methode_paiement: string;
  adresse_livraison: string;
  date_commande: string;
  date_expedition?: string;
  date_livraison?: string;
  produits: CommandeItem[];
  notes?: string;
}

interface FilterState {
  statut_paiement: string;
  statut_livraison: string;
  search: string;
  date_debut?: string;
  date_fin?: string;
}

export default function CommandesArtisanPage() {
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    statut_paiement: '',
    statut_livraison: '',
    search: '',
    date_debut: '',
    date_fin: ''
  });

  // Charger les commandes
  useEffect(() => {
    loadCommandes();
  }, []);

  // Filtrer les commandes
  useEffect(() => {
    applyFilters();
  }, [commandes, filters]);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const res = await fetch('/api/artisan/commandes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCommandes(data.commandes || []);
      } else if (res.status === 401) {
        router.push('/auth/login');
      } else {
        toast.error('Erreur chargement commandes');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...commandes];

    if (filters.statut_paiement) {
      filtered = filtered.filter(c => c.statut_paiement === filters.statut_paiement);
    }

    if (filters.statut_livraison) {
      filtered = filtered.filter(c => c.statut_livraison === filters.statut_livraison);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.numero_commande.toLowerCase().includes(search) ||
        c.acheteur_nom.toLowerCase().includes(search) ||
        c.acheteur_email.toLowerCase().includes(search)
      );
    }

    if (filters.date_debut) {
      filtered = filtered.filter(c => new Date(c.date_commande) >= new Date(filters.date_debut!));
    }

    if (filters.date_fin) {
      filtered = filtered.filter(c => new Date(c.date_commande) <= new Date(filters.date_fin!));
    }

    setFilteredCommandes(filtered);
  };

  const updateStatutLivraison = async (commandeId: string, newStatut: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Authentification requise');
        return;
      }

      console.log('Mise à jour commande:', commandeId, 'Nouveau statut:', newStatut);

      const res = await fetch(`/api/artisan/commandes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commande_id: commandeId, statut_livraison: newStatut })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('Statut mis à jour');
        await loadCommandes();
      } else {
        console.error('Erreur API:', data);
        toast.error(data?.error || 'Erreur mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur serveur');
    } finally {
      setUpdating(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Numéro', 'Client', 'Email', 'Montant', 'Paiement', 'Livraison', 'Date'];
    const data = filteredCommandes.map(c => [
      c.numero_commande,
      c.acheteur_nom,
      c.acheteur_email,
      c.montant_artisan,
      c.statut_paiement,
      c.statut_livraison,
      new Date(c.date_commande).toLocaleDateString('fr-FR')
    ]);

    const csv = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'preparation': 'bg-blue-100 text-blue-800',
      'expediee': 'bg-purple-100 text-purple-800',
      'en_livraison': 'bg-orange-100 text-orange-800',
      'livree': 'bg-green-100 text-green-800',
      'annule': 'bg-red-100 text-red-800'
    };

    const labels: Record<string, string> = {
      'pending': '⏳ En attente',
      'completed': '✓ Payée',
      'failed': '✗ Échouée',
      'preparation': '🔧 En préparation',
      'expediee': '📦 Expédié',
      'en_livraison': '🚚 En livraison',
      'livree': '✓ Livré',
      'annule': '❌ Annulé'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[statut] || 'bg-gray-100'}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  const stats = {
    total: commandes.length,
    payees: commandes.filter(c => c.statut_paiement === 'completed').length,
    livrees: commandes.filter(c => c.statut_livraison === 'livree').length,
    montant_total: commandes.reduce((sum, c) => sum + c.montant_artisan, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Mes Commandes</h1>
          <p className="text-gray-600">Gérez vos commandes et leur statut de livraison</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total commandes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Paiements confirmés</p>
                <p className="text-3xl font-bold text-green-600">{stats.payees}</p>
              </div>
              <Check className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Livrées</p>
                <p className="text-3xl font-bold text-blue-600">{stats.livrees}</p>
              </div>
              <Truck className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Montant total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.montant_total)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Chercher par numéro, client, email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filtres
              <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>

            <button
              onClick={() => loadCommandes()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-700">Paiement</label>
                <select
                  value={filters.statut_paiement}
                  onChange={(e) => setFilters({ ...filters, statut_paiement: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="completed">Payée</option>
                  <option value="failed">Échouée</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Livraison</label>
                <select
                  value={filters.statut_livraison}
                  onChange={(e) => setFilters({ ...filters, statut_livraison: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tous</option>
                  <option value="preparation">En préparation</option>
                  <option value="expediee">Expédié</option>
                  <option value="en_livraison">En livraison</option>
                  <option value="livree">Livré</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Du</label>
                <input
                  type="date"
                  value={filters.date_debut || ''}
                  onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Au</label>
                <input
                  type="date"
                  value={filters.date_fin || ''}
                  onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    statut_paiement: '',
                    statut_livraison: '',
                    search: '',
                    date_debut: '',
                    date_fin: ''
                  })}
                  className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Commandes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement des commandes...</p>
          </div>
        ) : filteredCommandes.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucune commande</h3>
            <p className="text-gray-600 mt-2">Aucune commande ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommandes.map((commande) => (
              <div key={commande.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                {/* Header */}
                <div
                  onClick={() => setExpandedId(expandedId === commande.id ? null : commande.id)}
                  className="p-4 cursor-pointer border-b hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{commande.numero_commande}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="hidden md:block border-l pl-4">
                          <p className="text-sm text-gray-600">Client</p>
                          <p className="font-medium text-gray-900">{commande.acheteur_nom}</p>
                        </div>
                        <div className="hidden md:block border-l pl-4">
                          <p className="text-sm text-gray-600">Montant</p>
                          <p className="font-bold text-green-600">{formatCurrency(commande.montant_artisan)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {getStatutBadge(commande.statut_paiement)}
                        <div className="mt-1">
                          {getStatutBadge(commande.statut_livraison)}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition ${expandedId === commande.id ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Details */}
                {expandedId === commande.id && (
                  <div className="p-4 bg-gray-50 border-t">
                    {/* Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">📋 Informations client</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{commande.acheteur_nom}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{commande.acheteur_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{commande.acheteur_telephone}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-600">{commande.adresse_livraison}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">💳 Détails paiement</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Méthode:</span>
                            <span className="font-medium">{commande.methode_paiement}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total commande:</span>
                            <span className="font-medium">{formatCurrency(commande.montant_total_commande)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Votre montant:</span>
                            <span className="font-bold text-green-600">{formatCurrency(commande.montant_artisan)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">📦 Produits</h4>
                      <div className="bg-white rounded border">
                        {commande.produits.map((item) => (
                          <div key={item.id} className="p-3 border-b last:border-b-0 flex gap-3">
                            {item.photo && (
                              <img
                                src={item.photo}
                                alt={item.nom}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.nom}</p>
                              <p className="text-sm text-gray-600">Qté: {item.quantite} × {formatCurrency(item.prix_unitaire)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(item.total)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="bg-white rounded border p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">📍 Mettre à jour le statut de livraison</h4>
                      <div className="flex flex-wrap gap-2">
                        {['preparation', 'expediee', 'en_livraison', 'livree', 'annule'].map((statut) => (
                          <button
                            key={statut}
                            onClick={() => updateStatutLivraison(commande.id, statut)}
                            disabled={updating}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                              commande.statut_livraison === statut
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } disabled:opacity-50`}
                          >
                            {statut === 'preparation' && '🔧 En préparation'}
                            {statut === 'expediee' && '📦 Expédié'}
                            {statut === 'en_livraison' && '🚚 En livraison'}
                            {statut === 'livree' && '✓ Livré'}
                            {statut === 'annule' && '❌ Annulé'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/artisan/commandes/${commande.id}`}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium transition"
                      >
                        Voir détails
                      </Link>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
