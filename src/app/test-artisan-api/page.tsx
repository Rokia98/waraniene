'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function TestArtisanAPIPage() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const response = await fetch('/api/artisans');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setArtisans(data.artisans || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Test APIs Artisans</h1>
          <div className="bg-blue-100 p-4 rounded">
            Chargement des artisans...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Test APIs Artisans</h1>
          <div className="bg-red-100 p-4 rounded mb-4">
            <h3 className="font-semibold text-red-800">Erreur :</h3>
            <p className="text-red-700">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test APIs Artisans</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Résultats API /api/artisans
          </h2>
          
          {artisans.length === 0 ? (
            <div className="bg-yellow-100 p-4 rounded">
              <p className="text-yellow-800">
                Aucun artisan trouvé dans la base de données.
              </p>
              <Link href="/data" className="mt-4 inline-block">
                <Button>
                  Aller créer des données de test
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-green-700 mb-4">
                ✅ {artisans.length} artisan(s) trouvé(s)
              </p>
              
              <div className="space-y-4">
                {artisans.map((artisan) => (
                  <div key={artisan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {artisan.nom} {artisan.prenom}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Email: {artisan.email}
                        </p>
                        {artisan.telephone && (
                          <p className="text-gray-600 text-sm">
                            Téléphone: {artisan.telephone}
                          </p>
                        )}
                        {artisan.adresse && (
                          <p className="text-gray-600 text-sm">
                            Adresse: {artisan.adresse}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/artisans/${artisan.id}`}>
                          <Button size="sm">
                            Voir le profil
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    {artisan.bio && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-gray-700 text-sm">
                          <strong>Bio:</strong> {artisan.bio}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link href="/artisans">
            <Button variant="outline">
              Page artisans normale
            </Button>
          </Link>
          
          <Link href="/data">
            <Button variant="outline">
              Créer des données
            </Button>
          </Link>
          
          <Link href="/test-checkout">
            <Button variant="outline">
              Test checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}