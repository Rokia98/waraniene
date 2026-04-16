'use client';
import { useState, useEffect } from 'react';
import { Package, Users, TrendingUp, AlertCircle, Loader, DownloadCloud } from 'lucide-react';

interface AdminStats {
  total_commandes: number;
  commandes_en_attente: number;
  commandes_confirmees: number;
  commandes_livrees: number;
  revenue_total: number;
  revenue_mois: number;
  total_produits: number;
  total_artisans: number;
}

interface Commande {
  id: string;
  nom_acheteur: string;
  email_acheteur: string;
  montant_total: number;
  statut: string;
  mode_paiement: string;
  created_at: string;
  detail_commandes?: any[];
}

export default function AdminCommandesPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'en_attente' | 'confirmee' | 'expediee' | 'livree'>('all');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filter, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Charger les commandes
      const query = new URLSearchParams({
        page: page.toString(),
        limite: '20',
        ...(filter !== 'all' && { statut: filter })
      });
      
      const commandesRes = await fetch(`/api/commandes?${query}`);
      if (commandesRes.ok) {
        const commandesData = await commandesRes.json();
        setCommandes(commandesData.commandes || commandesData.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusCommande = async (commandeId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/commandes/${commandeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus })
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Client', 'Email', 'Montant', 'Statut', 'Méthode', 'Date'];
    const rows = commandes.map(c => [
      c.id,
      c.nom_acheteur,
      c.email_acheteur,
      c.montant_total,
      c.statut,
      c.mode_paiement,
      new Date(c.created_at).toLocaleDateString('fr-FR')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`bg-white rounded-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12 opacity-20" />
      </div>
    </div>
  );

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📊 Panel Admin</h1>
          <p className="text-gray-600 mt-2">Gestion complète des commandes</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Package}
              label="Total Commandes"
              value={stats.total_commandes}
              color="border-blue-500"
            />
            <StatCard
              icon={AlertCircle}
              label="En Attente"
              value={stats.commandes_en_attente}
              color="border-yellow-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Revenus Mois"
              value={`${(stats.revenue_mois / 1000).toFixed(1)}K`}
              color="border-green-500"
            />
            <StatCard
              icon={Users}
              label="Total Artisans"
              value={stats.total_artisans}
              color="border-purple-500"
            />
          </div>
        )}

        {/* Filtres et Actions */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Rechercher par client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="expediee">Expédiée</option>
              <option value="livree">Livrée</option>
            </select>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <DownloadCloud className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tableau des commandes */}
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Montant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Méthode</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandes
                  .filter(c => 
                    !searchTerm || 
                    c.nom_acheteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.email_acheteur.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((commande) => (
                    <tr key={commande.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{commande.nom_acheteur}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{commande.email_acheteur}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{commande.montant_total.toLocaleString('fr-CI')} CFA</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {commande.mode_paiement}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={commande.statut}
                          onChange={(e) => updateStatusCommande(commande.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                            commande.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                            commande.statut === 'confirmee' ? 'bg-blue-100 text-blue-800' :
                            commande.statut === 'expediee' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          <option value="en_attente">En attente</option>
                          <option value="confirmee">Confirmée</option>
                          <option value="expediee">Expédiée</option>
                          <option value="livree">Livrée</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {commandes.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Aucune commande trouvée
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
