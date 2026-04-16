'use client';

import { useState } from 'react';
import { Search, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { useArtisans } from '@/hooks/useArtisansSimple';

export default function ArtisansPage() {
  const [search, setSearch] = useState('');

  const { 
    artisans, 
    loading, 
    error, 
    hasMore, 
    total, 
    loadMore,
    refetch
  } = useArtisans({
    search: search.trim() || undefined,
    limit: 12
  });

  const clearSearch = () => {
    setSearch('');
  };

  if (loading && artisans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des artisans...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur lors du chargement des artisans: {error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Nos Artisans
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez les maîtres tisserands de Waraniéné qui perpétuent l&apos;art ancestral 
              du tissage sénoufo. Chaque artisan apporte sa passion et son expertise unique 
              à nos créations authentiques.
            </p>
            {total > 0 && (
              <p className="mt-4 text-sm text-gray-500">
                {total} artisan(s) partenaire(s)
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recherche */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un artisan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {search && (
              <button
                onClick={clearSearch}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        </div>

        {/* Stats et infos */}
        <div className="mb-8">
          <div className="text-center text-sm text-gray-600">
            {artisans.length} artisan(s) affiché(s)
            {total && total > artisans.length && (
              <span className="text-gray-500"> sur {total}</span>
            )}
          </div>
        </div>

        {/* Grille des artisans */}
        {artisans.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun artisan trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier votre recherche
            </p>
            <Button onClick={clearSearch}>
              Effacer la recherche
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {artisans.map((artisan) => (
              <div key={artisan.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* En-tête avec photo */}
                <div className="relative h-56 bg-gradient-to-br from-amber-100 via-orange-100 to-primary-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {artisan.photo_profil ? (
                      <img 
                        src={artisan.photo_profil} 
                        alt={artisan.nom}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-primary-600">
                        {artisan.nom.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Badge vérifié */}
                  {artisan.est_verifie && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Vérifié
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Nom et localisation */}
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {artisan.nom}
                    </h3>
                    
                    {artisan.village_origine && (
                      <div className="flex items-center justify-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1 text-primary-500" />
                        <span className="text-sm font-medium">{artisan.village_origine}</span>
                      </div>
                    )}

                    {/* Évaluation et expérience */}
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold text-gray-700">
                          {artisan.note_moyenne ? artisan.note_moyenne.toFixed(1) : '4.5'}
                        </span>
                        <span className="text-gray-500">
                          ({artisan.nombre_avis || 0} avis)
                        </span>
                      </div>
                      <div className="text-gray-400">•</div>
                      <div className="text-gray-600 font-medium">
                        {artisan.annees_experience || 0}+ ans d&apos;expérience
                      </div>
                    </div>
                  </div>

                  {/* Histoire de l'artisan */}
                  {artisan.bio && (
                    <div className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                      <div className="flex items-start gap-2 mb-2">
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Son Histoire</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {artisan.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Spécialités */}
                  {artisan.specialites && artisan.specialites.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Spécialités
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {artisan.specialites.map((specialite, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                          >
                            {specialite}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Techniques maîtrisées */}
                  {artisan.techniques_maitrisees && artisan.techniques_maitrisees.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Techniques Maîtrisées
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {artisan.techniques_maitrisees.map((technique, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                          >
                            {technique}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {artisan.telephone && (
                    <div className="mb-4 flex items-center justify-center text-gray-600 text-sm">
                      <Phone className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{artisan.telephone}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Link 
                      href={`/artisans/${artisan.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        Voir le profil complet
                      </Button>
                    </Link>
                    <Link 
                      href={`/produits?artisan=${artisan.id}`}
                      className="flex-1"
                    >
                      <Button className="w-full bg-primary-600 hover:bg-primary-700">
                        Ses créations
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton "Charger plus" */}
        {hasMore && (
          <div className="mt-8 text-center">
            <Button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3"
            >
              {loading ? 'Chargement...' : 'Charger plus d\'artisans'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}