'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function TestArtisanProduitsPage() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [selectedArtisan, setSelectedArtisan] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Charger la liste des artisans
  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const response = await fetch('/api/artisans');
        const data = await response.json();
        setArtisans(data.artisans || []);
        if (data.artisans?.length > 0) {
          setSelectedArtisan(data.artisans[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des artisans:', error);
      }
    };
    fetchArtisans();
  }, []);

  // Tester les produits d'un artisan
  const testArtisanProducts = async (artisanId: string) => {
    setLoading(true);
    setError('');
    setProducts([]);

    try {
      const response = await fetch(`/api/produits?artisan_id=${artisanId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setProducts(data.data || []);
      } else {
        setError(data.error || 'Erreur lors du chargement des produits');
      }
    } catch (error) {
      setError('Erreur de connexion API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Produits par Artisan</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sélectionner un artisan</h2>
          
          {artisans.length > 0 ? (
            <div className="flex gap-4 mb-4">
              <select 
                value={selectedArtisan}
                onChange={(e) => setSelectedArtisan(e.target.value)}
                className="border rounded-lg px-3 py-2 flex-1"
              >
                {artisans.map((artisan) => (
                  <option key={artisan.id} value={artisan.id}>
                    {artisan.nom} ({artisan.id})
                  </option>
                ))}
              </select>
              
              <Button
                onClick={() => testArtisanProducts(selectedArtisan)}
                disabled={loading || !selectedArtisan}
              >
                {loading ? 'Chargement...' : 'Tester les produits'}
              </Button>
            </div>
          ) : (
            <p className="text-gray-600">Chargement des artisans...</p>
          )}
        </div>

        {/* Résultats des tests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Résultats</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">❌ Erreur: {error}</p>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-2">Chargement des produits...</p>
            </div>
          )}
          
          {!loading && !error && (
            <div>
              <p className="text-gray-600 mb-4">
                ✅ Trouvé {products.length} produit(s) pour l'artisan sélectionné
              </p>
              
              {products.length > 0 && (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{product.nom_produit}</h3>
                      <p className="text-gray-600 text-sm">{product.description}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-green-600 font-medium">
                          {product.prix?.toLocaleString()} FCFA
                        </span>
                        <span className="text-gray-500">
                          Stock: {product.stock}
                        </span>
                        <span className="text-gray-500">
                          Artisan: {product.artisan?.nom || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {products.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Aucun produit trouvé pour cet artisan.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Cela peut être normal si l'artisan n'a pas encore ajouté de produits.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug info */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">Debug Info</h3>
          <p className="text-sm text-gray-600">
            Artisans chargés: {artisans.length}
          </p>
          <p className="text-sm text-gray-600">
            Artisan sélectionné: {selectedArtisan}
          </p>
          <p className="text-sm text-gray-600">
            URL testée: {selectedArtisan ? `/api/produits?artisan_id=${selectedArtisan}` : 'Aucune'}
          </p>
        </div>
      </div>
    </div>
  );
}