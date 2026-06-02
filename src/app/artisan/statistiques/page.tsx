'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingCart, Star, RefreshCw, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';

interface Stats {
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
  statut: string;
  date_commande: string;
}

interface TopProduct {
  id: string;
  nom: string;
  artisan: string;
  ventes: number;
  revenus: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export default function StatistiquesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch('/api/artisan/statistiques', { headers });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Session expirée');
          return;
        }
        throw new Error('Erreur chargement statistiques');
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setTopProducts(data.topProducts || []);
      }
    } catch {
      toast.error('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Préparer données pour graphiques
  const statusData = recentOrders.reduce((acc: Record<string, number>, o) => {
    acc[o.statut] = (acc[o.statut] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusData).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  const topProductsChartData = topProducts.map(p => ({
    nom: p.nom.length > 15 ? p.nom.substring(0, 15) + '…' : p.nom,
    ventes: p.ventes,
    revenus: p.revenus,
  }));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-500 mt-1">Suivez vos performances de vente</p>
        </div>
        <button onClick={loadData} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Actualiser">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100 text-sm">Volume de ventes</span>
            <TrendingUp className="w-5 h-5 text-orange-200" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats?.totalVentes || 0)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Commandes en cours</span>
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.commandesEnCours || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Produits actifs</span>
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.produitsActifs || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Note moyenne</span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.evaluationMoyenne?.toFixed(1) || '—'}</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Produits les plus vendus */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Produits les plus vendus
          </h2>
          {topProductsChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>Aucune donnée disponible</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProductsChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [value, 'Ventes']} />
                <Bar dataKey="ventes" fill="#f97316" radius={[4, 4, 0, 0]} name="Ventes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Répartition des statuts commandes */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            Statuts des commandes
          </h2>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>Aucune commande récente</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={(props: any) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Revenus par produit */}
      {topProductsChartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Revenus par produit (FCFA)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProductsChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
              <Tooltip formatter={(value: any) => [formatCurrency(value ?? 0), 'Revenus']} />
              <Bar dataKey="revenus" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Commandes récentes */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Commandes récentes</h2>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Aucune commande récente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Commande</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Client</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-orange-600">#{order.numero_commande}</td>
                    <td className="py-3 px-3 text-gray-700">{order.client}</td>
                    <td className="py-3 px-3 font-semibold">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {order.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {new Date(order.date_commande).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
