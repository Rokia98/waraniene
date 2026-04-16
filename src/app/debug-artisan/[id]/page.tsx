'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function DebugArtisanPage() {
  const params = useParams();
  const artisanId = params.id as string;
  
  const [artisanData, setArtisanData] = useState<any>(null);
  const [productsData, setProductsData] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testArtisanAPI = async () => {
    setLoading(true);
    try {
      // Test artisan
      const artisanResponse = await fetch(`/api/artisans/${artisanId}`);
      const artisanResult = await artisanResponse.json();
      setArtisanData(artisanResult);

      // Test produits de cet artisan
      const productsResponse = await fetch(`/api/produits?artisan_id=${artisanId}`);
      const productsResult = await productsResponse.json();
      setProductsData(productsResult);

      // Test tous les produits pour voir la structure
      const allProductsResponse = await fetch('/api/produits?limite=5');
      const allProductsResult = await allProductsResponse.json();
      setAllProducts(allProductsResult);

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (artisanId) {
      testArtisanAPI();
    }
  }, [artisanId]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug Artisan {artisanId}</h1>
        
        <Button onClick={testArtisanAPI} disabled={loading} className="mb-6">
          {loading ? 'Test en cours...' : 'Recharger les données'}
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Artisan Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-700">📋 Données Artisan</h3>
            {artisanData ? (
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(artisanData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">Chargement...</p>
            )}
          </div>

          {/* Products for this artisan */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4 text-green-700">🎨 Produits de cet artisan</h3>
            {productsData ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Trouvés:</strong> {productsData.produits?.length || 0} produit(s)
                </p>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(productsData, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500">Chargement...</p>
            )}
          </div>

          {/* All products sample */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4 text-purple-700">📦 Tous les produits (échantillon)</h3>
            {allProducts ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Total:</strong> {allProducts.total || 0} produit(s)
                </p>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(allProducts, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500">Chargement...</p>
            )}
          </div>
        </div>

        {/* Analysis */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4 text-yellow-800">🔍 Analyse</h3>
          
          {artisanData && productsData && allProducts && (
            <div className="space-y-4 text-sm">
              <div>
                <strong>✅ Artisan trouvé:</strong> {artisanData.artisan ? 'Oui' : 'Non'}
                {artisanData.artisan && (
                  <span className="ml-2 text-blue-700">
                    ({artisanData.artisan.nom})
                  </span>
                )}
              </div>
              
              <div>
                <strong>📊 Produits pour cet artisan:</strong> {productsData.produits?.length || 0}
              </div>
              
              <div>
                <strong>📦 Total produits dans la base:</strong> {allProducts.total || 0}
              </div>

              {allProducts.produits && allProducts.produits.length > 0 && (
                <div>
                  <strong>🔗 Artisans dans les produits:</strong>
                  <ul className="ml-4 mt-2">
                    {Array.from(new Set(
                      allProducts.produits
                        .filter((p: any) => p.artisan)
                        .map((p: any) => `${p.artisan.nom} (ID: ${p.artisan_id})`)
                    )).map((artisan: any, index: number) => (
                      <li key={index} className="text-xs text-gray-700">• {artisan}</li>
                    ))}
                  </ul>
                </div>
              )}

              {artisanData.artisan && allProducts.produits && (
                <div className="mt-4 p-4 bg-white rounded border">
                  <strong>🎯 Correspondance:</strong>
                  <p className="text-xs text-gray-700 mt-1">
                    L'artisan avec l'ID "{artisanId}" {
                      allProducts.produits.some((p: any) => p.artisan_id === artisanId)
                        ? '✅ a des produits dans la base'
                        : '❌ n\'a PAS de produits dans la base'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a 
            href={`/artisans/${artisanId}`}
            className="text-primary-600 hover:text-primary-700 underline"
          >
            ← Retour au profil artisan
          </a>
        </div>
      </div>
    </div>
  );
}