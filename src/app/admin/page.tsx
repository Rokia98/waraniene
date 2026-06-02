'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Package, Users, TrendingUp,
  Clock, CheckCircle, Truck, RefreshCw, ArrowRight, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminStats {
  total_commandes: number;
  commandes_en_attente: number;
  commandes_confirmees: number;
  commandes_expediees: number;
  commandes_livrees: number;
  revenue_total: number;
  revenue_mois: number;
  total_produits: number;
  total_artisans: number;
}

interface RecentCommande {
  id: string;
  nom_acheteur?: string;
  email_acheteur?: string;
  montant_total: number;
  statut: string;
  mode_paiement: string;
  created_at: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

const statutConfig: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmee: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  en_preparation: { label: 'En préparation', color: 'bg-purple-100 text-purple-800' },
  expediee: { label: 'Expédiée', color: 'bg-cyan-100 text-cyan-800' },
  livree: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentCommandes, setRecentCommandes] = useState<RecentCommande[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, commandesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/commandes?limite=5&page=1'),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      if (commandesRes.ok) {
        const data = await commandesRes.json();
        setRecentCommandes(data.commandes || []);
      }
    } catch {
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total commandes',
      value: stats?.total_commandes || 0,
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-500',
      href: '/admin/commandes',
    },
    {
      label: 'Revenu total',
      value: formatCurrency(stats?.revenue_total || 0),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      href: '/admin/commandes',
    },
    {
      label: 'Total produits',
      value: stats?.total_produits || 0,
      icon: Package,
      color: 'from-blue-500 to-indigo-600',
      href: '/admin/produits',
    },
    {
      label: 'Artisans',
      value: stats?.total_artisans || 0,
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      href: '/admin/artisans',
    },
  ];

  const commandeStatuts = [
    { label: 'En attente', value: stats?.commandes_en_attente || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Confirmées', value: stats?.commandes_confirmees || 0, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Expédiées', value: stats?.commandes_expediees || 0, icon: Truck, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Livrées', value: stats?.commandes_livrees || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-0.5">Vue d'ensemble de la plateforme</p>
        </div>
        <button onClick={loadData} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Actualiser">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">{kpi.label}</span>
                <Icon className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Revenu du mois */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Revenu ce mois</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats?.revenue_mois || 0)}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Total : {formatCurrency(stats?.revenue_total || 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Statuts commandes */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Statuts des commandes</h2>
            <Link href="/admin/commandes" className="text-orange-600 hover:underline text-sm flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {commandeStatuts.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${s.color}`} />
                    <span className="text-sm font-medium text-gray-700">{s.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Commandes récentes</h2>
            <Link href="/admin/commandes" className="text-orange-600 hover:underline text-sm flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentCommandes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Aucune commande</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCommandes.map((cmd) => {
                const config = statutConfig[cmd.statut] || statutConfig.en_attente;
                return (
                  <div key={cmd.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cmd.nom_acheteur || cmd.email_acheteur || 'Client inconnu'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">{formatCurrency(cmd.montant_total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Gérer commandes', href: '/admin/commandes', color: 'bg-orange-50 text-orange-700 border-orange-200' },
            { label: 'Approuver produits', href: '/admin/produits', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Modérer avis', href: '/admin/avis', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { label: 'Traiter retraits', href: '/admin/retraits', color: 'bg-green-50 text-green-700 border-green-200' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`p-4 rounded-xl border font-medium text-sm text-center hover:opacity-80 transition-opacity ${action.color}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
