'use client';

import { useState, useEffect } from 'react';
import { ArrowUpCircle, Clock, CheckCircle, XCircle, RefreshCw, Send } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Retrait {
  id: string;
  montant: number;
  statut: 'en_attente' | 'approuve' | 'traite' | 'rejete';
  methode_retrait: string;
  numero_telephone: string | null;
  notes_artisan: string | null;
  notes_admin: string | null;
  date_approbation: string | null;
  date_traitement: string | null;
  created_at: string;
  solde_actuel: number;
}

const statutConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approuve: { label: 'Approuvé', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  traite: { label: 'Traité', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const methodeLabels: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn_money: 'MTN Money',
  virement: 'Virement bancaire',
  especes: 'Espèces',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export default function RetraitsPage() {
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [soldeDisponible, setSoldeDisponible] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [montant, setMontant] = useState('');
  const [methode, setMethode] = useState('orange_money');
  const [telephone, setTelephone] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [retraitsRes, portefeuilleRes] = await Promise.all([
        fetch('/api/artisan/retraits'),
        fetch('/api/artisan/portefeuille'),
      ]);

      if (retraitsRes.ok) {
        const data = await retraitsRes.json();
        setRetraits(data.retraits || []);
      }

      if (portefeuilleRes.ok) {
        const data = await portefeuilleRes.json();
        setSoldeDisponible(data.portefeuille?.solde_disponible || 0);
      }
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montantNum = parseFloat(montant);

    if (!montantNum || montantNum <= 0) {
      toast.error('Montant invalide');
      return;
    }
    if (montantNum > soldeDisponible) {
      toast.error('Solde insuffisant');
      return;
    }
    if ((methode === 'orange_money' || methode === 'mtn_money') && !telephone) {
      toast.error('Numéro de téléphone requis');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/artisan/retraits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant: montantNum,
          methode_retrait: methode,
          numero_telephone: telephone || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la demande');

      toast.success('Demande de retrait envoyée avec succès !');
      setShowForm(false);
      setMontant('');
      setTelephone('');
      setNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
      </div>
    );
  }

  const aRetraitEnAttente = retraits.some(r => r.statut === 'en_attente');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demandes de retrait</h1>
          <p className="text-gray-500 mt-1">
            Solde disponible : <span className="font-semibold text-orange-600">{formatCurrency(soldeDisponible)}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Actualiser">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={aRetraitEnAttente || soldeDisponible <= 0}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            Nouveau retrait
          </button>
        </div>
      </div>

      {aRetraitEnAttente && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-yellow-800 text-sm">
          Vous avez déjà une demande de retrait en attente. Attendez qu'elle soit traitée avant d'en créer une nouvelle.
        </div>
      )}

      {/* Formulaire de retrait */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Nouvelle demande de retrait</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (FCFA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  max={soldeDisponible}
                  value={montant}
                  onChange={e => setMontant(e.target.value)}
                  placeholder="Ex: 50000"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Max : {formatCurrency(soldeDisponible)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de retrait <span className="text-red-500">*</span>
                </label>
                <select
                  value={methode}
                  onChange={e => setMethode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn_money">MTN Money</option>
                  <option value="virement">Virement bancaire</option>
                  <option value="especes">Espèces</option>
                </select>
              </div>
            </div>

            {(methode === 'orange_money' || methode === 'mtn_money') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  placeholder="Ex: 07 00 00 00 00"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Instructions supplémentaires..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg font-medium transition-colors"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Envoi...' : 'Envoyer la demande'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des retraits */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Historique des retraits</h2>
        {retraits.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ArrowUpCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>Aucune demande de retrait</p>
            <p className="text-sm mt-1">Vos demandes de retrait apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {retraits.map((retrait) => {
              const config = statutConfig[retrait.statut] || statutConfig.en_attente;
              const Icon = config.icon;
              return (
                <div key={retrait.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <ArrowUpCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formatCurrency(retrait.montant)}</p>
                      <p className="text-sm text-gray-500">{methodeLabels[retrait.methode_retrait] || retrait.methode_retrait}</p>
                      {retrait.numero_telephone && (
                        <p className="text-xs text-gray-400">{retrait.numero_telephone}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(retrait.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                    {retrait.notes_admin && (
                      <p className="text-xs text-gray-500 mt-1 max-w-xs text-right">{retrait.notes_admin}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/artisan/portefeuille" className="text-orange-600 hover:underline text-sm">
          ← Retour au portefeuille
        </Link>
      </div>
    </div>
  );
}
