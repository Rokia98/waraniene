'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Package, 
  TrendingUp, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  Calendar,
  BarChart3,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { Header } from '@/components/Header';
import { ProductModal } from '@/components/ProductModal';
import { OrderStatusModal } from '@/components/OrderStatusModal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types/product';
import toast from 'react-hot-toast';

interface ArtisanData {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  bio?: string;
  photo?: string;
  localisation?: string;
  specialite?: string;
  date_inscription?: string;
}

interface ProductStats {
  total_produits: number;
  produits_actifs: number;
  produits_vendus: number;
  ventes_mois: number;
  revenu_total: number;
  revenu_mois: number;
  commandes_en_cours: number;
}

interface RecentOrder {
  id: string;
  acheteur_nom: string;
  produit_nom: string;
  quantite: number;
  total: number;
  statut: string;
  date_commande: string;
}

interface Commande {
  id: string;
  numero_commande: string;
  acheteur_nom: string;
  acheteur_email: string;
  acheteur_telephone: string;
  montant_artisan: number;
  montant_total_commande: number;
  statut_paiement: string;
  statut_livraison: string;
  methode_paiement: string;
  adresse_livraison: string;
  date_commande: string;
  contient_mes_produits?: boolean;
  produits: Array<{
    id: string;
    nom: string;
    quantite: number;
    prix_unitaire: number;
    total: number;
    photo: string | null;
    est_mon_produit?: boolean;
  }>;
}

export default function DashboardArtisanPage() {
  const router = useRouter();
  const [artisanData, setArtisanData] = useState<ArtisanData | null>(null);
  const [stats, setStats] = useState<ProductStats>({
    total_produits: 0,
    produits_actifs: 0,
    produits_vendus: 0,
    ventes_mois: 0,
    revenu_total: 0,
    revenu_mois: 0,
    commandes_en_cours: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Commande | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Charger les stats
      const statsResponse = await fetch('/api/artisan/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
        setRecentOrders(statsData.recentOrders || []);
      }

      // Charger les produits
      const produitsResponse = await fetch('/api/artisan/produits');
      if (produitsResponse.ok) {
        const produitsData = await produitsResponse.json();
        setProducts(produitsData.produits || []);
      }

      // Charger les commandes
      const commandesResponse = await fetch('/api/artisan/commandes');
      if (commandesResponse.ok) {
        const commandesData = await commandesResponse.json();
        setCommandes(commandesData.commandes || []);
      }

      // Charger les données artisan depuis l'API
      const profilResponse = await fetch('/api/artisan/profil');
      if (profilResponse.ok) {
        const profilData = await profilResponse.json();
        if (profilData.success && profilData.artisan) {
          setArtisanData(profilData.artisan);
          // Mettre à jour le localStorage pour la prochaine fois
          localStorage.setItem('auth_user_data', JSON.stringify(profilData.artisan));
        }
      } else {
        // Fallback: essayer de charger depuis localStorage
        const userDataStr = localStorage.getItem('auth_user_data');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setArtisanData(userData);
        }
      }

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/artisan/produits?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      toast.success('Produit supprimé avec succès');
      loadDashboardData();

    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression du produit');
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddProduct = () => {
    router.push('/artisan/produits/ajouter');
  };

  const handleProductModalClose = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductSuccess = () => {
    loadDashboardData();
  };

  const handleUpdateOrderStatus = (order: Commande) => {
    setSelectedOrder(order);
    setIsOrderStatusModalOpen(true);
  };

  const handleOrderStatusModalClose = () => {
    setIsOrderStatusModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderStatusSuccess = () => {
    loadDashboardData();
  };

  const filteredCommandes = orderStatusFilter === 'all'
    ? commandes
    : commandes.filter(c =>
        c.statut_livraison === orderStatusFilter ||
        c.statut_paiement === orderStatusFilter
      );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'en_preparation': { label: 'En préparation', color: 'bg-yellow-100 text-yellow-800' },
      'expedie': { label: 'Expédié', color: 'bg-blue-100 text-blue-800' },
      'livre': { label: 'Livré', color: 'bg-green-100 text-green-800' },
      'annule': { label: 'Annulé', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_preparation;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de votre espace artisan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!artisanData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Erreur lors du chargement des données artisan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête avec statistiques */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Bienvenue {artisanData.prenom} {artisanData.nom}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total produits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_produits}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventes ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ventes_mois}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenu_mois)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes en cours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.commandes_en_cours}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d&apos;ensemble
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes produits
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Commandes
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Commandes récentes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Commandes récentes</h2>
              <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Produit</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantité</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{order.acheteur_nom}</td>
                            <td className="py-3 px-4">{order.produit_nom}</td>
                            <td className="py-3 px-4">{order.quantite}</td>
                            <td className="py-3 px-4 font-semibold">{formatCurrency(order.total)}</td>
                            <td className="py-3 px-4">{getStatusBadge(order.statut)}</td>
                            <td className="py-3 px-4 text-gray-500">
                              {new Date(order.date_commande).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Actions rapides</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
                    >
                      <Plus className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold mb-2">Ajouter un produit</h3>
                      <p className="text-sm text-blue-100">Créez une nouvelle création</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="p-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105"
                    >
                      <ShoppingCart className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold mb-2">Gérer les commandes</h3>
                      <p className="text-sm text-green-100">Suivez vos ventes</p>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                    >
                      <User className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold mb-2">Modifier le profil</h3>
                      <p className="text-sm text-orange-100">Mettez à jour vos infos</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mes produits</h2>
                    <p className="text-gray-600 mt-1">{products.length} produit{products.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={loadDashboardData}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualiser
                    </button>
                    <button 
                      onClick={handleAddProduct}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Nouveau produit
                    </button>
                  </div>
                </div>
                
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun produit</h3>
                    <p className="text-gray-500 mb-6">Commencez par créer votre premier produit</p>
                    <button 
                      onClick={handleAddProduct}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Créer mon premier produit
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prix
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.nom_produit}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {product.description.substring(0, 50)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                {product.categorie}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {formatCurrency(product.prix)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.stock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.statut === 'actif'
                                  ? 'bg-green-100 text-green-800'
                                  : product.statut === 'rupture'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              } capitalize`}>
                                {product.statut}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-primary-600 hover:text-primary-900 transition-colors p-2"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (product.id) {
                                      handleDeleteProduct(product.id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 transition-colors p-2"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">Gestion des commandes</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => loadDashboardData()}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Actualiser"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Filtres de statut */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { key: 'all',           label: 'Toutes',         color: 'bg-primary-500' },
                    { key: 'en_attente',    label: 'En attente',     color: 'bg-yellow-500' },
                    { key: 'confirmee',     label: 'Confirmées',     color: 'bg-blue-500' },
                    { key: 'en_preparation',label: 'En préparation', color: 'bg-purple-500' },
                    { key: 'expediee',      label: 'Expédiées',      color: 'bg-cyan-600' },
                    { key: 'livree',        label: 'Livrées',        color: 'bg-green-600' },
                  ].map(({ key, label, color }) => (
                    <button
                      key={key}
                      onClick={() => setOrderStatusFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        orderStatusFilter === key
                          ? `${color} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({key === 'all' ? commandes.length : commandes.filter(c => c.statut_livraison === key || c.statut_paiement === key).length})
                    </button>
                  ))}
                </div>

                {/* Liste des commandes */}
                {filteredCommandes.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune commande</h3>
                    <p className="text-gray-500">Les commandes des clients apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCommandes.map((commande) => {
                      const statut = commande.statut_livraison || commande.statut_paiement || 'en_attente';
                      const statutLabel: Record<string, string> = {
                        en_attente: 'En attente', confirmee: 'Confirmée',
                        en_preparation: 'En préparation', expediee: 'Expédiée',
                        en_livraison: 'En livraison', livree: 'Livrée', annulee: 'Annulée',
                        paye: 'Payé', echec: 'Échec',
                      };
                      const statutColor: Record<string, string> = {
                        en_attente: 'bg-yellow-100 text-yellow-800',
                        confirmee: 'bg-blue-100 text-blue-800',
                        en_preparation: 'bg-purple-100 text-purple-800',
                        expediee: 'bg-cyan-100 text-cyan-800',
                        en_livraison: 'bg-indigo-100 text-indigo-800',
                        livree: 'bg-green-100 text-green-800',
                        annulee: 'bg-red-100 text-red-800',
                        paye: 'bg-green-100 text-green-800',
                        echec: 'bg-red-100 text-red-800',
                      };

                      return (
                        <div key={commande.id} className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
                          {/* En-tête */}
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-base font-bold text-gray-900">
                                  Commande #{commande.numero_commande}
                                </h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statutColor[statut] || 'bg-gray-100 text-gray-700'}`}>
                                  {statutLabel[statut] || statut}
                                </span>
                                {commande.contient_mes_produits && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                                    ✦ Mes produits
                                  </span>
                                )}
                              </div>

                              {/* Infos client */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                <div className="flex items-center gap-1.5 text-gray-700">
                                  <span className="text-gray-400">👤</span>
                                  <span className="font-medium truncate">{commande.acheteur_nom || 'Client inconnu'}</span>
                                </div>
                                {commande.acheteur_email && (
                                  <div className="flex items-center gap-1.5 text-gray-500 truncate">
                                    <span className="text-gray-400">✉</span>
                                    <span className="truncate">{commande.acheteur_email}</span>
                                  </div>
                                )}
                                {commande.acheteur_telephone && (
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <span className="text-gray-400">📞</span>
                                    {commande.acheteur_telephone}
                                  </div>
                                )}
                              </div>

                              <p className="text-xs text-gray-400 mt-1.5">
                                {commande.date_commande
                                  ? new Date(commande.date_commande).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                  : '—'}
                                {commande.methode_paiement && (
                                  <span className="ml-2 text-gray-400">· {commande.methode_paiement.replace('_', ' ')}</span>
                                )}
                              </p>
                            </div>

                            <Button onClick={() => handleUpdateOrderStatus(commande)} variant="outline" size="sm" className="shrink-0">
                              <Edit className="w-3.5 h-3.5 mr-1.5" />
                              Statut
                            </Button>
                          </div>

                          {/* Produits */}
                          <div className="border-t border-gray-100 pt-3 mt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Produits ({commande.produits?.length || 0})
                            </p>
                            <div className="space-y-2">
                              {(commande.produits || []).map((produit, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl ${produit.est_mon_produit ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'}`}>
                                  <div className="flex items-center gap-3 min-w-0">
                                    {produit.photo ? (
                                      <img src={produit.photo} alt={produit.nom} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs">📦</div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 text-sm truncate">{produit.nom}</p>
                                      <p className="text-xs text-gray-500">{produit.quantite} × {formatCurrency(produit.prix_unitaire)}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 ml-2">
                                    <p className="font-bold text-gray-900 text-sm">{formatCurrency(produit.total)}</p>
                                    {produit.est_mon_produit && (
                                      <span className="text-2xs text-orange-600 font-semibold">Mon produit</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Footer : adresse + totaux */}
                          <div className="border-t border-gray-100 pt-3 mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                            {commande.adresse_livraison && (
                              <div className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">Livraison :</span>{' '}
                                {commande.adresse_livraison}
                              </div>
                            )}
                            <div className="text-right shrink-0">
                              <p className="text-xl font-bold text-primary-600">{formatCurrency(commande.montant_total_commande)}</p>
                              <p className="text-xs text-gray-400">Total commande</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Profil artisan</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{artisanData.prenom}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{artisanData.nom}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-800">{artisanData.specialite}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800">{artisanData.email}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <Edit className="w-5 h-5" />
                      <span>Modifier mon profil</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Modal de gestion des produits */}
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={handleProductModalClose}
          onSuccess={handleProductSuccess}
          product={selectedProduct}
        />

        {/* Modal de gestion du statut des commandes */}
        {selectedOrder && (
          <OrderStatusModal
            isOpen={isOrderStatusModalOpen}
            onClose={handleOrderStatusModalClose}
            onSuccess={handleOrderStatusSuccess}
            orderId={selectedOrder.id}
            currentStatus={selectedOrder.statut_livraison}
            orderNumber={selectedOrder.numero_commande}
          />
        )}
      </div>
    );
  }
