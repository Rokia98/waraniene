'use client';
import { useState } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  details?: any;
}

export default function Phase3TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const addResult = (name: string, status: 'pending' | 'success' | 'error', message?: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runTests = async () => {
    setRunning(true);
    setResults([]);

    try {
      // Test 1: Créer une review
      addResult('Création d\'avis', 'pending');
      const reviewRes = await fetch('/api/produits/1/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_acheteur: 'Test Client',
          email_acheteur: 'test@example.com',
          note: 4,
          titre: 'Très beau tissu!',
          commentaire: 'Tissu de haute qualité avec des couleurs authentiques. Livraison rapide.',
          achete_chez_nous: true
        })
      });
      if (reviewRes.ok) {
        const data = await reviewRes.json();
        addResult('Création d\'avis', 'success', 'Avis créé avec ID: ' + data.avis?.id);
      } else {
        addResult('Création d\'avis', 'error', await reviewRes.text());
      }

      // Test 2: Récupérer les avis
      addResult('Récupération des avis', 'pending');
      const getReviewRes = await fetch('/api/produits/1/avis');
      if (getReviewRes.ok) {
        const data = await getReviewRes.json();
        addResult('Récupération des avis', 'success', `${data.avis?.length} avis trouvés`, {
          note_moyenne: data.note_moyenne
        });
      } else {
        addResult('Récupération des avis', 'error');
      }

      // Test 3: Valider un code promo
      addResult('Validation code promo', 'pending');
      const promoRes = await fetch('/api/codes-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'BIENVENUE10',
          montant: 50000
        })
      });
      if (promoRes.ok) {
        const data = await promoRes.json();
        addResult('Validation code promo', 'success', `Code valide: -${data.valeur_reduction}%`, data);
      } else {
        const error = await promoRes.json();
        addResult('Validation code promo', 'error', error.error);
      }

      // Test 4: Envoyer une notification
      addResult('Envoi notification', 'pending');
      const notifRes = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'commande_confirmee',
          acheteur_id: 'test-user',
          email: 'test@example.com',
          telephone: '+225701234567',
          data: {
            numero_commande: 'CMD-TEST-001',
            montant: 125000,
            nom_acheteur: 'Test Client'
          }
        })
      });
      if (notifRes.ok) {
        const data = await notifRes.json();
        addResult('Envoi notification', 'success', 'Notification envoyée', data.channels);
      } else {
        addResult('Envoi notification', 'error', await notifRes.text());
      }

      // Test 5: Admin - Lister les avis
      addResult('Admin - Lister avis', 'pending');
      const adminRes = await fetch('/api/admin/avis?statut=en_attente');
      if (adminRes.ok) {
        const data = await adminRes.json();
        addResult('Admin - Lister avis', 'success', `${data.avis?.length} avis en attente`);
      } else {
        addResult('Admin - Lister avis', 'error');
      }

    } catch (error: any) {
      addResult('Erreur globale', 'error', error.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">🧪 Tests Phase 3</h1>
        <p className="text-gray-600 mb-8">Avis • Codes Promo • Notifications • Wishlist</p>

        <button
          onClick={runTests}
          disabled={running}
          className="mb-8 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Tests en cours...
            </>
          ) : (
            '▶️ Lancer les tests'
          )}
        </button>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`border-l-4 p-4 rounded ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-500'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  {result.status === 'error' && (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  {result.status === 'pending' && (
                    <Loader className="w-6 h-6 text-yellow-600 animate-spin flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{result.name}</h3>
                    {result.message && (
                      <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                    )}
                    {result.details && (
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
