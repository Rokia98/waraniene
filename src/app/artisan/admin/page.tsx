'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, ShoppingBag, Star, TrendingUp, Eye, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Header } from '@/components/Header';

interface DashboardStats {
  totalVentes: number;
  commandesEnCours: number;
  produitsActifs: number;
  artisansActifs: number;
  evaluationMoyenne: number;
  visiteursMois: number;
}

interface RecentOrder {
  id: string;
  numero_commande: string;
  client: string;
  total: number;
  statut: 'en_attente' | 'confirmee' | 'preparee' | 'expediee' | 'livree' | 'annulee';
  date_commande: string;
}

interface TopProduct {
  id: string;
  nom: string;
  artisan: string;
  ventes: number;
  revenus: number;
}

type TabType = 'dashboard' | 'products' | 'orders' | 'artisans' | 'analytics';

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les statistiques au montage du composant
  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        const response = await fetch('/api/artisan/statistiques', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }

        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
          setTopProducts(data.topProducts || []);
        } else {
          setError('Erreur lors du chargement des statistiques');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistiques();
  }, []);

  const getStatusColor = (statut: RecentOrder['statut']) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-gray-100 text-gray-800';
      case 'confirmee':
        return 'bg-blue-100 text-blue-800';
      case 'preparee':
        return 'bg-yellow-100 text-yellow-800';
      case 'expediee':
        return 'bg-purple-100 text-purple-800';
      case 'livree':
        return 'bg-green-100 text-green-800';
      case 'annulee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (statut: RecentOrder['statut']) => {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'confirmee':
        return 'Confirmée';
      case 'preparee':
        return 'Préparée';
      case 'expediee':
        return 'Expédiée';
      case 'livree':
        return 'Livrée';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error || 'Erreur lors du chargement'}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Tableau de bord', icon: BarChart3 },
    { id: 'products' as TabType, label: 'Produits', icon: Package },
    { id: 'orders' as TabType, label: 'Commandes', icon: ShoppingBag },
    { id: 'artisans' as TabType, label: 'Artisans', icon: Users },
    { id: 'analytics' as TabType, label: 'Analyses', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            Gérez votre plateforme Tissés de Waraniéné
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ventes totales</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalVentes)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commandes en cours</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.commandesEnCours}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Produits actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.produitsActifs}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Artisans actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.artisansActifs}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Note moyenne</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.evaluationMoyenne}/5</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Visiteurs/mois</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.visiteursMois.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900">Commandes récentes</h3>
                  <Button variant="outline" size="sm">Voir tout</Button>
                </div>
                
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.numero_commande}</p>
                        <p className="text-sm text-gray-600">{order.client}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(order.statut)}`}>
                          {getStatusText(order.statut)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.date_commande)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900">Produits populaires</h3>
                  <Button variant="outline" size="sm">Voir tout</Button>
                </div>
                
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.nom}</p>
                        <p className="text-sm text-gray-600">Par {product.artisan}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(product.revenus)}</p>
                        <p className="text-sm text-gray-600">{product.ventes} ventes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-bold">Gestion des produits</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artisan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Sample product rows */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-md flex items-center justify-center mr-3">
                          <span className="text-xs text-primary-700 font-medium">IMG</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Pagne Traditionnel Sénoufo</div>
                          <div className="text-sm text-gray-500">Coton Bio</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mamadou Koné</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">25 000 FCFA</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Actif
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-bold">Gestion des commandes</h2>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>Tous les statuts</option>
                  <option>Confirmée</option>
                  <option>En préparation</option>
                  <option>Expédiée</option>
                  <option>Livrée</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.numero_commande}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.client}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.date_commande)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.statut)}`}>
                          {getStatusText(order.statut)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Artisans Tab */}
        {activeTab === 'artisans' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-bold">Gestion des artisans</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un artisan
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample artisan cards */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 mb-2">Mamadou Koné</h3>
                  <p className="text-sm text-gray-600 mb-4">Tisserand traditionnel</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">15</p>
                      <p className="text-xs text-gray-600">Produits</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">4.8</p>
                      <p className="text-xs text-gray-600">Note</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-display text-xl font-bold mb-6">Analyses et rapports</h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Ventes par mois</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Graphique des ventes</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Produits par catégorie</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Graphique en secteurs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}