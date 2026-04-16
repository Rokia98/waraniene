'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Printer,
  Download,
  MessageSquare,
  AlertCircle,
  Check,
  Truck
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CommandeDetail {
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
  produits: Array<{
    id: string;
    nom: string;
    quantite: number;
    prix_unitaire: number;
    total: number;
    photo: string | null;
  }>;
}

export default function CommandeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const commandeId = params.id as string;

  const [commande, setCommande] = useState<CommandeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCommande();
  }, [commandeId]);

  const loadCommande = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const res = await fetch(`/api/artisan/commandes/${commandeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCommande(data.commande);
      } else if (res.status === 401) {
        router.push('/auth/login');
      } else {
        toast.error('Erreur chargement commande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (newStatut: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Authentification requise');
        router.push('/auth/login');
        return;
      }

      const res = await fetch(`/api/artisan/commandes/${commandeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statut_livraison: newStatut })
      });

      if (res.ok) {
        toast.success('Statut mis à jour');
        await loadCommande();
      } else {
        const data = await res.json();
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

  const printCommande = () => {
    window.print();
  };

  const getStatutStyle = (statut: string) => {
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
    return styles[statut] || 'bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Commande non trouvée</h2>
            <Link href="/artisan/commandes" className="mt-4 text-blue-600 hover:underline">
              ← Retour aux commandes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/artisan/commandes"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux commandes
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{commande.numero_commande}</h1>
              <p className="text-gray-600 mt-1">
                {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={printCommande}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-3">
            <span className={`px-4 py-2 rounded-full font-medium text-sm ${getStatutStyle(commande.statut_paiement)}`}>
              {commande.statut_paiement === 'pending' && '⏳ Paiement en attente'}
              {commande.statut_paiement === 'completed' && '✓ Paiement confirmé'}
              {commande.statut_paiement === 'failed' && '✗ Paiement échoué'}
            </span>
            <span className={`px-4 py-2 rounded-full font-medium text-sm ${getStatutStyle(commande.statut_livraison)}`}>
              {commande.statut_livraison === 'preparation' && '🔧 En préparation'}
              {commande.statut_livraison === 'expediee' && '📦 Expédié'}
              {commande.statut_livraison === 'en_livraison' && '🚚 En livraison'}
              {commande.statut_livraison === 'livree' && '✓ Livré'}
              {commande.statut_livraison === 'annule' && '❌ Annulé'}
            </span>
          </div>
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Informations client</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">{commande.acheteur_nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 mt-1">
                    <a href={`mailto:${commande.acheteur_email}`} className="text-blue-600 hover:underline">
                      {commande.acheteur_email}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="text-gray-900 mt-1">
                    <a href={`tel:${commande.acheteur_telephone}`} className="text-blue-600 hover:underline">
                      {commande.acheteur_telephone}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Adresse de livraison</p>
                  <p className="text-gray-900 mt-1 text-sm">{commande.adresse_livraison}</p>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📦 Produits commandés</h2>
              <div className="space-y-3">
                {commande.produits.map((produit) => (
                  <div key={produit.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    {produit.photo && (
                      <img
                        src={produit.photo}
                        alt={produit.nom}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{produit.nom}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantité: {produit.quantite} × {formatCurrency(produit.prix_unitaire)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(produit.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Mettre à jour le statut</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {['preparation', 'expediee', 'en_livraison', 'livree', 'annule'].map((statut) => (
                    <button
                      key={statut}
                      onClick={() => updateStatut(statut)}
                      disabled={updating || commande.statut_livraison === statut}
                      className={`py-3 px-4 rounded-lg font-medium transition ${
                        commande.statut_livraison === statut
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {statut === 'preparation' && '🔧\nEn préparation'}
                      {statut === 'expediee' && '📦\nExpédié'}
                      {statut === 'en_livraison' && '🚚\nEn livraison'}
                      {statut === 'livree' && '✓\nLivré'}
                      {statut === 'annule' && '❌\nAnnulé'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Summary */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="font-semibold text-gray-900 mb-4">💰 Résumé financier</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="text-gray-900">{formatCurrency(commande.montant_artisan)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Frais:</span>
                  <span className="text-gray-900">-</span>
                </div>
                <div className="flex justify-between py-3 bg-blue-50 -mx-6 px-6 rounded-lg">
                  <span className="font-semibold text-gray-900">Votre montant:</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(commande.montant_artisan)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Méthode de paiement</p>
                  <p className="font-medium text-gray-900 mt-1">{commande.methode_paiement}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Date commande</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {commande.date_expedition && (
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Date expédition</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(commande.date_expedition).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {commande.date_livraison && (
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Date livraison</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(commande.date_livraison).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                <MessageSquare className="w-4 h-4" />
                Contacter le client
              </button>
              <Link
                href="/artisan/commandes"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none; }
        }
      `}</style>
    </div>
  );
}
