'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Calendar, Mail, Star, Award, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import { formatDate } from '@/lib/utils';
import { Header } from '@/components/Header';
import { useArtisan } from '@/hooks/useArtisansSimple';
import { useProduits } from '@/hooks/useProduits';

export default function ArtisanProfilePage() {
  const params = useParams();
  const artisanId = params.id as string;
  
  // Hooks pour récupérer les données
  const { artisan, loading: artisanLoading, error: artisanError, refetch: refetchArtisan } = useArtisan(artisanId);
  const { 
    produits: products, 
    loading: productsLoading, 
    error: productsError,
    refresh: refetchProducts 
  } = useProduits({ 
    artisan_id: artisanId,
    limite: 20 
  });

  // État local
  const [activeTab, setActiveTab] = useState('produits');
  const [debugMode, setDebugMode] = useState(false);

  const handleContactArtisan = () => {
    if (artisan?.telephone) {
      window.open(`https://wa.me/${artisan.telephone.replace(/\s+/g, '')}`, '_blank');
    }
  };

  // Affichage de chargement
  if (artisanLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-300 rounded-xl mb-6"></div>
                <div className="h-32 bg-gray-300 rounded-xl"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-40 bg-gray-300 rounded-xl mb-6"></div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="h-48 bg-gray-300 rounded-xl"></div>
                  <div className="h-48 bg-gray-300 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (artisanError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Erreur de chargement
            </h1>
            <p className="text-gray-600 mb-8">{artisanError}</p>
            <Button onClick={refetchArtisan}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Artisan non trouvé
  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Artisan introuvable
            </h1>
            <p className="text-gray-600 mb-8">
              L'artisan que vous recherchez n'existe pas ou n'est plus disponible.
            </p>
            <Link href="/artisans">
              <Button>
                Retour aux artisans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-600">Accueil</Link>
          <span>/</span>
          <Link href="/artisans" className="hover:text-primary-600">Artisans</Link>
          <span>/</span>
          <span className="text-gray-900">{artisan.nom}</span>
        </div>

        {/* Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/artisans" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4" />
            Retour aux artisans
          </Link>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? '🔍 Masquer Debug' : '🔧 Mode Debug'}
          </Button>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-3">🔍 Debug Info</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Artisan ID:</strong> {artisanId}<br/>
                <strong>Artisan trouvé:</strong> {artisan ? '✅ Oui' : '❌ Non'}<br/>
                <strong>Artisan loading:</strong> {artisanLoading ? '⏳ Oui' : '✅ Non'}<br/>
                <strong>Artisan error:</strong> {artisanError || 'Aucune'}
              </div>
              <div>
                <strong>Produits trouvés:</strong> {products?.length || 0}<br/>
                <strong>Produits loading:</strong> {productsLoading ? '⏳ Oui' : '✅ Non'}<br/>
                <strong>Produits error:</strong> {productsError || 'Aucune'}<br/>
                <strong>URL API:</strong> /api/produits?artisan_id={artisanId}
              </div>
            </div>
            {products && products.length > 0 && (
              <div className="mt-4">
                <strong>Liste des produits:</strong>
                <ul className="ml-4 mt-2 text-xs">
                  {products.map((p, i) => (
                    <li key={i}>• {p.nom_produit} (ID: {p.id})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Artisan Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo de profil */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {artisan.photo_profil ? (
                    <img 
                      src={artisan.photo_profil} 
                      alt={artisan.nom}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center border-4 border-primary-100">
                      <span className="text-4xl font-bold text-primary-700">
                        {artisan.nom.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  {/* Badge vérifié */}
                  {artisan.est_verifie && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-2 rounded-full border-2 border-white">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
                  {artisan.nom}
                </h1>
                
                {/* Village d'origine */}
                {artisan.village_origine && (
                  <div className="flex items-center justify-center text-primary-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">{artisan.village_origine}</span>
                  </div>
                )}
                
                {/* Évaluation */}
                <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(artisan.note_moyenne || 4.5) 
                          ? 'fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({artisan.note_moyenne || 4.5})
                  </span>
                </div>

                {/* Adresse (si différente du village) */}
                {artisan.adresse && artisan.adresse !== artisan.village_origine && (
                  <div className="flex items-center justify-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{artisan.adresse}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-primary-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary-600">
                      {artisan.annees_experience || artisan.experience || '5+'}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Années d&apos;expérience</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {products?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Créations</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {artisan.telephone && (
                  <Button 
                    onClick={handleContactArtisan}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Contacter l&apos;artisan
                  </Button>
                )}
                
                {artisan.email && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => window.open(`mailto:${artisan.email}`, '_blank')}
                  >
                    <Mail className="w-4 h-4" />
                    Envoyer un email
                  </Button>
                )}
              </div>
            </div>

            {/* Compétences */}
            {artisan.competences && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  Compétences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artisan.competences.split(',').map((competence, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      {competence.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Certifications - si disponibles */}
            {artisan.certifications && Array.isArray(artisan.certifications) && artisan.certifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Certifications
                </h3>
                <div className="space-y-2">
                  {artisan.certifications.map((certification, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-green-900 text-sm"
                    >
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {certification}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Products & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Histoire de l'artisan - Section mise en avant */}
            {artisan.bio && (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-white rounded-2xl shadow-lg p-8 border-2 border-amber-100">
                <div className="flex items-start gap-3 mb-6">
                  <div className="p-3 bg-primary-600 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      L&apos;Histoire de {artisan.nom}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Découvrez le parcours et la passion qui animent cet artisan
                    </p>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line text-base">
                    {artisan.bio}
                  </p>
                </div>
                
                {artisan.date_creation && (
                  <div className="mt-6 pt-6 border-t border-amber-200">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                      <span className="text-sm font-medium">
                        Artisan partenaire depuis {formatDate(artisan.date_creation)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Spécialités - Si disponibles */}
            {artisan.specialites && Array.isArray(artisan.specialites) && artisan.specialites.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  Spécialités Artisanales
                </h3>
                <div className="flex flex-wrap gap-3">
                  {artisan.specialites.map((specialite, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary-100 text-primary-700 text-sm font-medium rounded-lg border border-primary-200"
                    >
                      {specialite}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Techniques maîtrisées - Si disponibles */}
            {artisan.techniques_maitrisees && Array.isArray(artisan.techniques_maitrisees) && artisan.techniques_maitrisees.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Techniques de Tissage Maîtrisées
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {artisan.techniques_maitrisees.map((technique, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200"
                    >
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-purple-900">{technique}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onglets */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('produits')}
                    className={`px-6 py-4 font-medium text-sm transition-colors ${
                      activeTab === 'produits'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Package className="w-4 h-4 inline mr-2" />
                    Ses Créations ({products?.length || 0})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'produits' && (
                  <div>
                    {productsLoading ? (
                      <div className="grid sm:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : productsError ? (
                      <div className="text-center py-8">
                        <p className="text-red-600 mb-4">
                          Erreur lors du chargement des produits: {productsError}
                        </p>
                        <Button onClick={refetchProducts} variant="outline">
                          Réessayer
                        </Button>
                      </div>
                    ) : products && products.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-6">
                        {products.map((produit) => (
                          <ProductCard
                            key={produit.id}
                            produit={produit}
                            onToggleFavorite={() => {}}
                            isFavorite={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Cet artisan n'a pas encore de produits disponibles.
                        </p>
                        <Link href="/produits">
                          <Button variant="outline">
                            Découvrir d'autres produits
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}