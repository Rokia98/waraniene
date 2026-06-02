'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package, CheckCircle, Truck, Clock, XCircle,
  MapPin, Phone, Mail, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Header } from '@/components/Header';
import toast from 'react-hot-toast';

interface ProduitCommande {
  id: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  photo?: string;
}

interface Commande {
  id: string;
  numero_commande: string;
  statut: string;
  statut_paiement?: string;
  montant_total: number;
  frais_livraison?: number;
  reduction?: number;
  mode_paiement: string;
  adresse_livraison: string;
  date_commande: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  numero_suivi?: string;
  produits: ProduitCommande[];
  acheteur?: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
}

const etapes = [
  { statut: 'en_attente', label: 'Commande reçue', icon: Clock },
  { statut: 'confirmee', label: 'Confirmée', icon: CheckCircle },
  { statut: 'en_preparation', label: 'En préparation', icon: Package },
  { statut: 'expediee', label: 'Expédiée', icon: Truck },
  { statut: 'livree', label: 'Livrée', icon: CheckCircle },
];

const statutOrder = ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree'];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export default function SuiviCommandePage() {
  const params = useParams();
  const commandeId = params.id as string;
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadCommande = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/commandes/${commandeId}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error('Erreur chargement commande');
      const data = await res.json();
      setCommande(data.commande || data);
    } catch {
      toast.error('Impossible de charger la commande');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCommande(); }, [commandeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
        </div>
      </div>
    );
  }

  if (notFound || !commande) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <XCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
          <p className="text-gray-500 mb-6">Cette commande n'existe pas ou vous n'y avez pas accès.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = statutOrder.indexOf(commande.statut);
  const isAnnulee = commande.statut === 'annulee';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/profil" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Mes commandes
          </Link>
          <button onClick={loadCommande} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Actualiser">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* En-tête commande */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Commande #{commande.numero_commande}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Passée le {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(commande.montant_total)}</p>
              {commande.numero_suivi && (
                <p className="text-xs text-gray-400 mt-1">Suivi : {commande.numero_suivi}</p>
              )}
            </div>
          </div>
        </div>

        {/* Progression */}
        {!isAnnulee ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Suivi de commande</h2>
            <div className="relative">
              {/* Barre de progression */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 mx-10">
                <div
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, (currentIndex / (etapes.length - 1)) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between relative">
                {etapes.map((etape, i) => {
                  const Icon = etape.icon;
                  const isDone = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  return (
                    <div key={etape.statut} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-colors ${
                        isDone
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs mt-2 text-center font-medium hidden sm:block ${isDone ? 'text-orange-600' : 'text-gray-400'}`}>
                        {etape.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {commande.date_livraison_prevue && (
              <p className="text-sm text-gray-500 mt-6 text-center">
                Livraison prévue le{' '}
                <strong>{new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center gap-3 text-red-700">
            <XCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-semibold">Commande annulée</p>
              <p className="text-sm text-red-500">Cette commande a été annulée.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Produits */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Produits commandés</h2>
            <div className="space-y-4">
              {(commande.produits || []).map((produit) => (
                <div key={produit.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  {produit.photo ? (
                    <img src={produit.photo} alt={produit.nom_produit} className="w-16 h-16 object-cover rounded-xl" />
                  ) : (
                    <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center">
                      <Package className="w-8 h-8 text-orange-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{produit.nom_produit}</p>
                    <p className="text-sm text-gray-500">
                      {produit.quantite} × {formatCurrency(produit.prix_unitaire)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(produit.total)}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
              {commande.frais_livraison !== undefined && commande.frais_livraison > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frais de livraison</span>
                  <span>{formatCurrency(commande.frais_livraison)}</span>
                </div>
              )}
              {commande.reduction !== undefined && commande.reduction > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span>-{formatCurrency(commande.reduction)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-1">
                <span>Total</span>
                <span className="text-orange-600">{formatCurrency(commande.montant_total)}</span>
              </div>
            </div>
          </div>

          {/* Infos livraison & paiement */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Livraison
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{commande.adresse_livraison}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Paiement</h3>
              <p className="text-sm text-gray-600 capitalize">{commande.mode_paiement?.replace('_', ' ')}</p>
              {commande.statut_paiement && (
                <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                  commande.statut_paiement === 'paye' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {commande.statut_paiement === 'paye' ? 'Payé' : commande.statut_paiement}
                </span>
              )}
            </div>

            {commande.acheteur && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">Contact</h3>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p>{commande.acheteur.prenom} {commande.acheteur.nom}</p>
                  {commande.acheteur.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {commande.acheteur.email}
                    </p>
                  )}
                  {commande.acheteur.telephone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {commande.acheteur.telephone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
