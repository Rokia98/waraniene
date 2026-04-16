'use client';
import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function CheckoutPhase1TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (name: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setResults(prev => [...prev, { name, status, message, data }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Auth - Register
      addResult('Auth Register', 'pending', 'Test en cours...');
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: 'Test Artisan Phase1',
          email: `test-${Date.now()}@waraniene.ci`,
          mot_de_passe: 'Password123!',
          telephone: `+22507${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
        })
      });
      const registerData = await registerRes.json();
      
      if (registerRes.ok || registerRes.status === 409) {
        setResults(prev => prev.map(r => 
          r.name === 'Auth Register' 
            ? { ...r, status: 'success', message: '✅ Inscription artisan réussie' }
            : r
        ));
      } else {
        setResults(prev => prev.map(r => 
          r.name === 'Auth Register'
            ? { ...r, status: 'error', message: `❌ ${registerData.error}` }
            : r
        ));
      }

      // Test 2: Get Artisans
      addResult('Get Artisans', 'pending', 'Récupération des artisans...');
      const artisansRes = await fetch('/api/artisans?limite=3');
      const artisansData = await artisansRes.json();
      
      if (artisansRes.ok && artisansData.data?.length > 0) {
        const firstArtisan = artisansData.data[0];
        setResults(prev => prev.map(r =>
          r.name === 'Get Artisans'
            ? { ...r, status: 'success', message: `✅ ${artisansData.data.length} artisans trouvés`, data: firstArtisan.id }
            : r
        ));
      } else {
        setResults(prev => prev.map(r =>
          r.name === 'Get Artisans'
            ? { ...r, status: 'error', message: '❌ Erreur récupération artisans' }
            : r
        ));
      }

      // Test 3: Get Produits
      addResult('Get Produits', 'pending', 'Récupération des produits...');
      const produitsRes = await fetch('/api/produits?limite=5');
      const produitsData = await produitsRes.json();
      
      if (produitsRes.ok && produitsData.data?.length > 0) {
        setResults(prev => prev.map(r =>
          r.name === 'Get Produits'
            ? { ...r, status: 'success', message: `✅ ${produitsData.data.length} produits trouvés`, data: produitsData.data.slice(0, 2) }
            : r
        ));
      } else {
        setResults(prev => prev.map(r =>
          r.name === 'Get Produits'
            ? { ...r, status: 'error', message: '❌ Erreur récupération produits' }
            : r
        ));
      }

      // Test 4: Create Commande
      addResult('Create Commande', 'pending', 'Création de commande...');
      const produitsForOrder = produitsData.data?.slice(0, 2) || [];
      
      if (produitsForOrder.length === 0) {
        setResults(prev => prev.map(r =>
          r.name === 'Create Commande'
            ? { ...r, status: 'error', message: '❌ Pas de produits disponibles' }
            : r
        ));
      } else {
        const commandeRes = await fetch('/api/commandes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom_acheteur: 'Jean Dupont',
            email_acheteur: 'jean@example.com',
            telephone_acheteur: '+225 07 12 34 56 78',
            adresse_livraison: '123 Rue de la Paix, Korhogo',
            methode_paiement: 'orange_money',
            articles: produitsForOrder.map(p => ({
              produit_id: p.id,
              quantite: 1
            })),
            montant_total: produitsForOrder.reduce((sum, p) => sum + (p.prix || 0), 0)
          })
        });
        const commandeData = await commandeRes.json();

        if (commandeRes.ok && commandeData.commande) {
          setResults(prev => prev.map(r =>
            r.name === 'Create Commande'
              ? { ...r, status: 'success', message: '✅ Commande créée avec succès', data: commandeData.commande }
              : r
          ));

          // Test 5: Initiate Payment
          addResult('Initiate Payment', 'pending', 'Initialisation du paiement...');
          const paiementRes = await fetch('/api/paiement/initier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              commande_id: commandeData.commande.id,
              montant: commandeData.commande.montant_total,
              customer: {
                name: 'Jean Dupont',
                email: 'jean@example.com',
                phone: '+225 07 12 34 56 78'
              },
              metadata: {
                reason: 'Commande de produits Waraniéné'
              }
            })
          });
          const paiementData = await paiementRes.json();

          if (paiementRes.ok && paiementData.success) {
            setResults(prev => prev.map(r =>
              r.name === 'Initiate Payment'
                ? { ...r, status: 'success', message: '✅ Paiement initié avec succès', data: paiementData }
                : r
            ));
          } else {
            setResults(prev => prev.map(r =>
              r.name === 'Initiate Payment'
                ? { ...r, status: 'error', message: `❌ ${paiementData.error}` }
                : r
            ));
          }
        } else {
          setResults(prev => prev.map(r =>
            r.name === 'Create Commande'
              ? { ...r, status: 'error', message: `❌ ${commandeData.error}` }
              : r
          ));
        }
      }

    } catch (error) {
      console.error('Test error:', error);
      addResult('Test', 'error', '❌ Erreur pendant les tests');
    }

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Phase 1 - Test Checkout</h1>
          <p className="text-gray-600 mb-6">Tests complets du flux e-commerce</p>

          <button
            onClick={runTests}
            disabled={isRunning}
            className={`w-full py-3 px-4 rounded-lg font-semibold mb-6 transition ${
              isRunning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Tests en cours...
              </span>
            ) : (
              '▶️ Lancer les tests'
            )}
          </button>

          <div className="space-y-4">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-500'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  )}
                  {result.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  {result.status === 'pending' && (
                    <Loader className="w-5 h-5 text-yellow-600 animate-spin flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{result.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 font-medium">
                          Voir détails
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Résumé</h3>
              <p className="text-sm text-blue-800">
                {results.filter(r => r.status === 'success').length}/{results.length} tests réussis
              </p>
              {results.every(r => r.status === 'success') && (
                <p className="text-sm text-green-600 font-semibold mt-2">✅ Tous les tests sont passés!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
