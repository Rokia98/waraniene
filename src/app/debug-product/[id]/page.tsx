'use client';

import { useParams } from 'next/navigation';
import { useProduit } from '@/hooks/useProduits';
import { Header } from '@/components/Header';
import Link from 'next/link';

export default function DebugProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const { produit, loading, error } = useProduit(productId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🔍 Debug Produit ID: {productId}</h1>
          <div className="flex gap-4">
            <Link href={`/produits/${productId}`} className="text-blue-600 hover:underline">
              → Voir la vraie page produit
            </Link>
            <Link href="/data" className="text-green-600 hover:underline">
              → Page de données
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Status */}
          <div className="bg-white rounded-lg p-4 border">
            <h2 className="font-bold mb-2">📊 État de chargement</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? '⏳ Oui' : '✅ Non'}</p>
              <p><strong>Error:</strong> {error ? `❌ ${error}` : '✅ Aucune'}</p>
              <p><strong>Produit trouvé:</strong> {produit ? '✅ Oui' : '❌ Non'}</p>
            </div>
          </div>

          {/* API Call Info */}
          <div className="bg-white rounded-lg p-4 border">
            <h2 className="font-bold mb-2">🔗 Appel API</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Endpoint:</strong> <code>/api/produits/{productId}</code></p>
              <p><strong>URL complète:</strong> <code>http://localhost:3002/api/produits/{productId}</code></p>
              <p><strong>Hook utilisé:</strong> useProduit (real API)</p>
            </div>
          </div>

          {/* Product Data */}
          {produit && (
            <div className="bg-white rounded-lg p-4 border">
              <h2 className="font-bold mb-2">📦 Données du produit</h2>
              <div className="space-y-3">
                <div>
                  <strong>ID:</strong> {produit.id}
                </div>
                <div>
                  <strong>Nom:</strong> {produit.nom_produit}
                </div>
                <div>
                  <strong>Description:</strong> 
                  <p className="mt-1 text-gray-600 text-sm">{produit.description}</p>
                </div>
                <div>
                  <strong>Catégorie:</strong> {produit.categorie}
                </div>
                <div>
                  <strong>Prix:</strong> {produit.prix} FCFA
                </div>
                <div>
                  <strong>Stock:</strong> {produit.stock}
                </div>
                <div>
                  <strong>Artisan ID:</strong> {produit.artisan_id}
                </div>
                <div>
                  <strong>Photos:</strong> {produit.photos?.length || 0} image(s)
                  {produit.photos && produit.photos.length > 0 && (
                    <ul className="mt-1 text-sm text-gray-600">
                      {produit.photos.map((photo, index) => (
                        <li key={index}>• {photo}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Artisan Data */}
          {produit?.artisan && (
            <div className="bg-white rounded-lg p-4 border">
              <h2 className="font-bold mb-2">👨‍🎨 Données de l'artisan</h2>
              <div className="space-y-2">
                <div><strong>ID:</strong> {produit.artisan.id}</div>
                <div><strong>Nom:</strong> {produit.artisan.nom}</div>
                <div><strong>Bio:</strong> {produit.artisan.bio}</div>
                <div><strong>Localisation:</strong> {produit.artisan.localisation}</div>
                <div><strong>Téléphone:</strong> {produit.artisan.telephone}</div>
                <div><strong>Langue:</strong> {produit.artisan.langue}</div>
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-auto">
            <h2 className="font-bold mb-2 text-white">🔧 JSON brut</h2>
            <pre className="text-xs whitespace-pre-wrap">
              {produit ? JSON.stringify(produit, null, 2) : 'Aucune donnée'}
            </pre>
          </div>

          {/* Test Actions */}
          <div className="bg-white rounded-lg p-4 border">
            <h2 className="font-bold mb-2">🧪 Actions de test</h2>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔄 Recharger la page
              </button>
              <button
                onClick={() => {
                  console.log('Produit:', produit);
                  console.log('Error:', error);
                  console.log('Loading:', loading);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                📝 Log dans console
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}