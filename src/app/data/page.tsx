'use client';

import { useState } from 'react';

export default function DataPage() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const checkDataRelationships = async () => {
    setLoading(true);
    addMessage('🔍 Vérification des relations artisans-produits...');
    
    try {
      // Récupérer tous les artisans
      const artisansResponse = await fetch('/api/artisans');
      const artisansData = await artisansResponse.json();
      
      if (!artisansData.success) {
        addMessage(`❌ Erreur artisans: ${artisansData.error}`);
        return;
      }
      
      const artisans = artisansData.data;
      addMessage(`✅ Trouvé ${artisans.length} artisan(s)`);
      
      // Pour chaque artisan, vérifier ses produits
      const relationships: any = {};
      
      for (const artisan of artisans) {
        addMessage(`🔍 Vérification des produits pour ${artisan.nom} (ID: ${artisan.id})`);
        
        const produitsResponse = await fetch(`/api/produits?artisan_id=${artisan.id}`);
        const produitsData = await produitsResponse.json();
        
        if (produitsData.success) {
          const produits = produitsData.data;
          addMessage(`   └─ ${produits.length} produit(s) trouvé(s)`);
          
          relationships[artisan.id] = {
            artisan: artisan,
            produits: produits,
            count: produits.length
          };
          
          if (produits.length > 0) {
            produits.forEach((p: any, index: number) => {
              addMessage(`   └─ ${index + 1}. ${p.nom_produit} (${p.prix} FCFA)`);
            });
          }
        } else {
          addMessage(`   └─ ❌ Erreur: ${produitsData.error}`);
          relationships[artisan.id] = {
            artisan: artisan,
            produits: [],
            count: 0,
            error: produitsData.error
          };
        }
      }
      
      setDebugInfo(relationships);
      addMessage('✅ Vérification terminée !');
      
    } catch (error) {
      addMessage(`❌ Erreur réseau: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createSampleArtisan = async () => {
    setLoading(true);
    addMessage('Création de l\'artisan de test...');
    
    try {
      const response = await fetch('/api/artisans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: 'Aminata Koné',
          bio: 'Artisane passionnée spécialisée dans les textiles traditionnels sénoufo de Waraniéné. Plus de 20 ans d\'expérience dans l\'art du tissage ancestral.',
          localisation: 'Korhogo, Côte d\'Ivoire',
          telephone: '+22507123456',
          langue: 'fr',
          photo: '/images/placeholder-artisan.svg'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        addMessage(`✅ Artisan créé avec succès ! ID: ${result.data.id}`);
        return result.data.id;
      } else {
        addMessage(`❌ Erreur: ${result.error}`);
        return null;
      }
    } catch (error) {
      addMessage(`❌ Erreur réseau: ${error}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSampleProduct = async (artisanId: string) => {
    setLoading(true);
    addMessage('Création du produit de test...');
    
    try {
      const response = await fetch('/api/produits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom_produit: 'Pagne Traditionnel Sénoufo',
          description: 'Magnifique pagne traditionnel tissé à la main selon les techniques ancestrales sénoufo. Motifs géométriques authentiques en coton bio. Parfait pour les cérémonies ou le port quotidien.',
          categorie: 'pagne',
          prix: 25000,
          stock: 5,
          artisan_id: artisanId,
          photos: ['/images/placeholder-produit.svg']
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        addMessage(`✅ Produit créé avec succès ! ID: ${result.data.id}`);
        return result.data.id;
      } else {
        addMessage(`❌ Erreur: ${result.error}`);
        return null;
      }
    } catch (error) {
      addMessage(`❌ Erreur réseau: ${error}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    addMessage('🚀 Début de la création des données de test...');
    
    // Créer un artisan
    const artisanId = await createSampleArtisan();
    
    if (artisanId) {
      // Créer quelques produits
      await createSampleProduct(artisanId);
      
      // Créer un second produit
      setLoading(true);
      addMessage('Création du deuxième produit...');
      
      try {
        const response = await fetch('/api/produits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom_produit: 'Boubou Traditionnel Homme',
            description: 'Boubou élégant pour homme, confectionné dans le respect de la tradition. Broderies raffinées et finitions impeccables. Idéal pour les grandes occasions.',
            categorie: 'vetement',
            prix: 45000,
            stock: 3,
            artisan_id: artisanId,
            photos: ['/images/placeholder-produit.svg']
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          addMessage(`✅ Deuxième produit créé ! ID: ${result.data.id}`);
        } else {
          addMessage(`❌ Erreur: ${result.error}`);
        }
      } catch (error) {
        addMessage(`❌ Erreur réseau: ${error}`);
      } finally {
        setLoading(false);
      }
      
      // Créer un troisième produit
      setLoading(true);
      addMessage('Création du troisième produit...');
      
      try {
        const response = await fetch('/api/produits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom_produit: 'Foulard Artisanal',
            description: 'Foulard léger aux motifs traditionnels, parfait pour agrémenter votre tenue. Tissage fin et coloris naturels. Accessoire incontournable.',
            categorie: 'accessoire',
            prix: 15000,
            stock: 8,
            artisan_id: artisanId,
            photos: ['/images/placeholder-produit.svg']
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          addMessage(`✅ Troisième produit créé ! ID: ${result.data.id}`);
        } else {
          addMessage(`❌ Erreur: ${result.error}`);
        }
      } catch (error) {
        addMessage(`❌ Erreur réseau: ${error}`);
      } finally {
        setLoading(false);
      }
      
      addMessage('🎉 Création des données de test terminée !');
      addMessage('💡 Vous pouvez maintenant retourner sur la page d\'accueil pour voir les produits.');
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Création de données de test</h1>
        <p className="text-gray-600">
          Utilisez cette page pour créer des données de test dans votre base Supabase.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Créer des données de test</h2>
          <p className="text-gray-600 mb-4">
            Ceci va créer un artisan exemple avec quelques produits pour tester la plateforme.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={createSampleData}
              disabled={loading}
              className={`px-6 py-3 bg-primary-600 text-white rounded-lg font-medium transition-colors ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary-700'
              }`}
            >
              {loading ? 'Création en cours...' : 'Créer des données de test'}
            </button>
            
            <button
              onClick={checkDataRelationships}
              disabled={loading}
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700'
              }`}
            >
              {loading ? 'Vérification...' : 'Vérifier les relations'}
            </button>
            
            <button
              onClick={clearMessages}
              className="px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Effacer les messages
            </button>
          </div>
        </div>

        {debugInfo && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Relations artisans-produits détectées</h2>
            <div className="space-y-4">
              {Object.values(debugInfo).map((relation: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{relation.artisan.nom}</h3>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      ID: {relation.artisan.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{relation.artisan.bio}</p>
                  
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">
                      Produits associés ({relation.count})
                    </h4>
                    {relation.count > 0 ? (
                      <div className="grid gap-2">
                        {relation.produits.map((produit: any, pIndex: number) => (
                          <div key={pIndex} className="bg-gray-50 p-3 rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">{produit.nom_produit}</h5>
                                <p className="text-sm text-gray-600">{produit.description}</p>
                                <p className="text-sm text-gray-500">Catégorie: {produit.categorie}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">{produit.prix} FCFA</p>
                                <p className="text-sm text-gray-500">Stock: {produit.stock}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Aucun produit associé</p>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <a 
                      href={`/artisans/${relation.artisan.id}`}
                      className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 Voir la page de l'artisan
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Journal des opérations</h2>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <div key={index} className="text-sm font-mono">
                    {message}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucune opération effectuée pour le moment.
              </p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation rapide</h2>
          <div className="flex gap-4">
            <a 
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🏠 Page d'accueil
            </a>
            <a 
              href="/test"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              🧪 Test API
            </a>
            <a 
              href="/produits"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              🛍️ Catalogue
            </a>
            <a 
              href="/artisans"
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              👥 Artisans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}