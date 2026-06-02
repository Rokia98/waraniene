'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Clock, ArrowDownCircle, ArrowUpCircle, RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Portefeuille {
  id: string | null;
  solde_disponible: number;
  solde_en_attente: number;
  total_revenus: number;
  total_retraits: number;
  statut: string;
}

interface Transaction {
  id: string;
  type: string;
  montant: number;
  solde_avant: number;
  solde_apres: number;
  commande_id: string | null;
  description: string;
  date: string;
}

interface Statistiques {
  total_commandes: number;
  total_ventes: number;
  total_transactions: number;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  credit_vente: { label: 'Vente', color: 'text-green-600' },
  credit_remboursement: { label: 'Remboursement', color: 'text-blue-600' },
  debit_retrait: { label: 'Retrait', color: 'text-red-600' },
  credit_commission: { label: 'Commission', color: 'text-purple-600' },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export default function PortefeuillePage() {
  const [portefeuille, setPortefeuille] = useState<Portefeuille | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/artisan/portefeuille');
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter');
          return;
        }
        throw new Error('Erreur chargement portefeuille');
      }
      const data = await res.json();
      setPortefeuille(data.portefeuille);
      setTransactions(data.transactions || []);
      setStatistiques(data.statistiques);
    } catch {
      toast.error('Impossible de charger le portefeuille');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Portefeuille</h1>
          <p className="text-gray-500 mt-1">Gérez vos revenus et demandez des retraits</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            href="/artisan/retraits"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Demander un retrait
          </Link>
        </div>
      </div>

      {/* Cartes de solde */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-orange-100 text-sm font-medium">Solde disponible</span>
            <Wallet className="w-6 h-6 text-orange-200" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(portefeuille?.solde_disponible || 0)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">En attente</span>
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(portefeuille?.solde_en_attente || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Commandes en cours</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Total revenus</span>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(portefeuille?.total_revenus || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Depuis le début</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Total retiré</span>
            <ArrowUpCircle className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(portefeuille?.total_retraits || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Depuis le début</p>
        </div>
      </div>

      {/* Statistiques */}
      {statistiques && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé des ventes</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-orange-600">{statistiques.total_commandes}</p>
              <p className="text-sm text-gray-500 mt-1">Commandes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(statistiques.total_ventes)}</p>
              <p className="text-sm text-gray-500 mt-1">Volume de ventes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{statistiques.total_transactions}</p>
              <p className="text-sm text-gray-500 mt-1">Transactions</p>
            </div>
          </div>
        </div>
      )}

      {/* Historique des transactions */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Historique des transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Wallet className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>Aucune transaction pour le moment</p>
            <p className="text-sm mt-1">Vos transactions apparaîtront ici après vos premières ventes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const config = typeLabels[tx.type] || { label: tx.type, color: 'text-gray-600' };
              const isCredit = tx.type.startsWith('credit');
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {isCredit
                      ? <ArrowDownCircle className="w-8 h-8 text-green-500 shrink-0" />
                      : <ArrowUpCircle className="w-8 h-8 text-red-500 shrink-0" />
                    }
                    <div>
                      <p className={`font-medium ${config.color}`}>{config.label}</p>
                      {tx.description && <p className="text-xs text-gray-500">{tx.description}</p>}
                      <p className="text-xs text-gray-400">
                        {new Date(tx.date).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(tx.montant)}
                    </p>
                    <p className="text-xs text-gray-400">Solde: {formatCurrency(tx.solde_apres)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
