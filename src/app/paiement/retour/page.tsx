'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Page de retour après paiement FusionPay
 * Reçoit le token dans l'URL et vérifie le statut
 */
export default function RetourPaiementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'failed' | 'pending' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setMessage('Token de paiement manquant');
      setStatus('failed');
      setLoading(false);
      return;
    }

    // Vérifier le statut du paiement
    checkPaymentStatus(token);
  }, [searchParams]);

  const checkPaymentStatus = async (token: string) => {
    try {
      const res = await fetch(`/api/paiement/statut/${token}`);
      const data = await res.json();

      if (res.ok && data.fusionpay_status?.data) {
        const paymentStatus = data.fusionpay_status.data.statut;
        
        if (paymentStatus === 'paid') {
          setStatus('success');
          setMessage('Paiement effectué avec succès !');
          
          // Rediriger vers la page de succès après 2 secondes
          setTimeout(() => {
            const commande_id = data.fusionpay_status.data.personal_Info?.[0]?.commande_id;
            if (commande_id) {
              router.push(`/paiement/succes?commande_id=${commande_id}`);
            } else {
              router.push('/paiement/succes');
            }
          }, 2000);
        } else if (paymentStatus === 'failed') {
          setStatus('failed');
          setMessage('Le paiement a échoué.');
          
          // Rediriger vers la page d'échec après 2 secondes
          setTimeout(() => {
            router.push('/paiement/echec');
          }, 2000);
        } else {
          setStatus('pending');
          setMessage('Paiement en cours de traitement...');
          
          // Revérifier après 5 secondes
          setTimeout(() => checkPaymentStatus(token), 5000);
        }
      } else {
        throw new Error('Erreur lors de la vérification du paiement');
      }
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      setStatus('failed');
      setMessage('Erreur lors de la vérification du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vérification du paiement...
            </h2>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous confirmons votre paiement.
            </p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="text-green-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement réussi !
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirection en cours...
            </p>
          </>
        ) : status === 'failed' ? (
          <>
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement échoué
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/checkout"
                className="block w-full bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 transition-colors"
              >
                Réessayer
              </Link>
              <Link
                href="/"
                className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="animate-pulse text-amber-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement en cours
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Vérification automatique toutes les 5 secondes...
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
