'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [testResults, setTestResults] = useState({
    connection: null,
    produits: null,
    artisans: null
  });
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string, name: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${endpoint}`);
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: response.ok ? 'success' : 'error',
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    await testAPI('test', 'connection');
    await testAPI('produits', 'produits');
    await testAPI('artisans', 'artisans');
  };

  useEffect(() => {
    testAll();
  }, []);

  const TestResult = ({ name, result }: { name: string; result: any }) => (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className={`px-3 py-1 rounded text-sm ${
          result?.status === 'success' ? 'bg-green-100 text-green-800' :
          result?.status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {result?.status || 'En attente...'}
        </div>
      </div>
      
      {result?.timestamp && (
        <p className="text-sm text-gray-500 mb-2">
          Testé à {result.timestamp}
        </p>
      )}
      
      {result?.data && (
        <div className="bg-gray-50 p-3 rounded text-sm">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
      
      {result?.error && (
        <div className="bg-red-50 p-3 rounded text-sm text-red-700">
          Erreur: {result.error}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Test API Supabase</h1>
        <p className="text-gray-600">
          Vérification de la connexion et des endpoints API pour la plateforme Tissés de Waraniéné
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testAll}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester toutes les API'}
        </button>
        
        <button
          onClick={() => testAPI('test', 'connection')}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test connexion
        </button>
        
        <button
          onClick={() => testAPI('produits', 'produits')}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test produits
        </button>
        
        <button
          onClick={() => testAPI('artisans', 'artisans')}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test artisans
        </button>
      </div>

      <div className="grid gap-6">
        <TestResult name="Test de connexion Supabase" result={testResults.connection} />
        <TestResult name="API Produits" result={testResults.produits} />
        <TestResult name="API Artisans" result={testResults.artisans} />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Endpoints disponibles :</h3>
        <ul className="space-y-1 text-sm">
          <li><code className="bg-white px-2 py-1 rounded">GET /api/test</code> - Test de connexion</li>
          <li><code className="bg-white px-2 py-1 rounded">GET /api/produits</code> - Liste des produits</li>
          <li><code className="bg-white px-2 py-1 rounded">POST /api/produits</code> - Créer un produit</li>
          <li><code className="bg-white px-2 py-1 rounded">GET /api/artisans</code> - Liste des artisans</li>
          <li><code className="bg-white px-2 py-1 rounded">POST /api/artisans</code> - Créer un artisan</li>
        </ul>
      </div>
    </div>
  );
}