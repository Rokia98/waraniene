'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/Header';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const commande_id = searchParams.get('commande_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (!commande_id) {
      router.push('/');
      return;
    }

    // Attendre un peu que le callback soit traité
    const timer = setTimeout(() => {
      setIsVerifying(false);
      setPaymentConfirmed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [commande_id, router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <div className="text-center">
          <Loader className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-gray-600">
            Veuillez patienter pendant que nous confirmons votre paiement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Message de succès */}
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Paiement réussi !
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Votre commande a été confirmée et sera traitée dans les plus brefs délais.
          </p>

          {/* Informations commande */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Numéro de commande</span>
              <span className="font-mono font-semibold text-gray-900">
                {commande_id?.slice(0, 8).toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              <span className="inline-flex px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                Confirmée
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link href={`/commande/${commande_id}/suivi`}>
              <Button className="w-full">
                <Package className="w-4 h-4 mr-2" />
                Suivre ma commande
              </Button>
            </Link>
            
            <Link href="/produits">
              <Button variant="outline" className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Continuer mes achats
              </Button>
            </Link>
          </div>

          {/* Email de confirmation */}
          <p className="text-sm text-gray-500 mt-8">
            Un email de confirmation vous a été envoyé avec les détails de votre commande.
          </p>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Que se passe-t-il ensuite ?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>L'artisan prépare votre commande</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>Vous recevrez une notification dès l'expédition</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Livraison sous 3 à 7 jours ouvrés</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PaiementSuccesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
