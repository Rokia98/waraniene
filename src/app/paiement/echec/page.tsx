'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/Header';

function EchecContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const commande_id = searchParams.get('commande_id');

  useEffect(() => {
    if (!commande_id) {
      router.push('/');
    }
  }, [commande_id, router]);

  const handleRetry = () => {
    // Rediriger vers le checkout avec la même commande
    if (commande_id) {
      router.push(`/checkout?retry=${commande_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Icône d'échec */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          {/* Message d'échec */}
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Paiement échoué
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Votre paiement n'a pas pu être traité. Aucun montant n'a été débité de votre compte.
          </p>

          {/* Informations commande */}
          {commande_id && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Numéro de commande</span>
                <span className="font-mono font-semibold text-gray-900">
                  {commande_id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <span className="inline-flex px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                  Paiement échoué
                </span>
              </div>
            </div>
          )}

          {/* Raisons possibles */}
          <div className="text-left bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-yellow-900 mb-3">
              Raisons possibles :
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Solde insuffisant sur votre compte</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Informations de paiement incorrectes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Problème de connexion réseau</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Paiement annulé par l'utilisateur</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer le paiement
            </Button>
            
            <Link href="/produits">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la boutique
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Besoin d'aide ?{' '}
              <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                Contactez notre support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaiementEchecPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    }>
      <EchecContent />
    </Suspense>
  );
}
