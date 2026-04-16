'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import Link from 'next/link';

export default function DebugAuthPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: 'Test User',
    prenom: 'John',
    email: `test${Date.now()}@example.com`, // Email unique
    mot_de_passe: 'password123',
    telephone: '+22507123456',
    adresse: 'Abidjan, Côte d\'Ivoire'
  });

  const [loginData, setLoginData] = useState({
    email: 'test@example.com',
    mot_de_passe: 'password123'
  });

  const generateUniqueTestData = () => {
    const timestamp = Date.now();
    setFormData(prev => ({
      ...prev,
      nom: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`
    }));
  };

  const useExistingTestData = () => {
    setFormData(prev => ({
      ...prev,
      nom: 'Test User',
      email: 'test@example.com'
    }));
    setLoginData({
      email: 'test@example.com',
      mot_de_passe: 'password123'
    });
  };

  const testRegisterAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Test de l\'API d\'inscription...');
      console.log('Données envoyées:', formData);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const responseData = await response.json();
      console.log('📦 Data de la réponse:', responseData);

      if (!response.ok) {
        setError(`Erreur ${response.status}: ${responseData.error || responseData.message || 'Erreur inconnue'}`);
      } else {
        setResult(responseData);
      }

    } catch (err: any) {
      console.error('❌ Erreur complète:', err);
      setError(`Erreur réseau: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegisterWithService = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Test avec AppService...');
      
      // Import dynamique pour éviter les erreurs de SSR
      const { default: AppService } = await import('@/services');
      
      const registrationData = {
        nom: formData.nom,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
        telephone: formData.telephone,
        adresse: formData.adresse
      };

      console.log('Données envoyées via service:', registrationData);

      const result = await AppService.register(registrationData);
      console.log('📦 Résultat du service:', result);

      if (result.success) {
        setResult(result);
      } else {
        setError((result as any).error || 'Erreur lors de l\'inscription');
      }

    } catch (err: any) {
      console.error('❌ Erreur service:', err);
      setError(`Erreur service: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Test de connexion...');
      console.log('Données de connexion:', loginData);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('📡 Réponse login:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const responseData = await response.json();
      console.log('📦 Data de connexion:', responseData);

      if (!response.ok) {
        setError(`Erreur ${response.status}: ${responseData.error || responseData.message || 'Erreur inconnue'}`);
      } else {
        setResult({
          message: 'Connexion réussie !',
          token: responseData.token ? `${responseData.token.substring(0, 50)}...` : 'Pas de token',
          user: responseData.acheteur
        });
      }

    } catch (err: any) {
      console.error('❌ Erreur login:', err);
      setError(`Erreur réseau: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingUsers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Vérification des utilisateurs existants...');

      const response = await fetch('/api/acheteurs');
      const data = await response.json();
      
      console.log('📡 Utilisateurs en base:', data);
      
      if (data.success) {
        const users = data.data || [];
        const testUser = users.find((u: any) => u.email === 'test@example.com');
        
        setResult({
          message: 'Utilisateurs trouvés',
          totalUsers: users.length,
          testUserExists: !!testUser,
          testUser: testUser ? {
            id: testUser.id,
            email: testUser.email,
            nom: testUser.nom,
            prenom: testUser.prenom
          } : null,
          allUsers: users.map((u: any) => ({
            id: u.id,
            email: u.email,
            nom: u.nom,
            prenom: u.prenom
          }))
        });
      } else {
        setError(`Erreur: ${data.error}`);
      }

    } catch (err: any) {
      console.error('❌ Erreur vérification:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🔧 Debug API d'Authentification</h1>
          <div className="flex gap-4">
            <Link href="/auth" className="text-blue-600 hover:underline">
              → Page d'authentification
            </Link>
            <Link href="/data" className="text-green-600 hover:underline">
              → Page de données
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Données de test inscription */}
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">📝 Données d'inscription</h2>
              <div className="flex gap-2">
                <button
                  onClick={generateUniqueTestData}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  🔄 Nouveaux
                </button>
                <button
                  onClick={useExistingTestData}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  📋 Existants
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Données de test connexion */}
          <div className="bg-white rounded-lg p-6 border">
            <h2 className="font-bold mb-4 text-lg">🔐 Données de connexion</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={loginData.mot_de_passe}
                  onChange={handleLoginInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Message d'aide pour l'erreur 409 */}
          {error && error.includes('409') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2">💡 Erreur 409 - Email déjà utilisé</h3>
              <p className="text-yellow-700 text-sm mb-3">
                Cet email existe déjà dans la base de données. Vous pouvez :
              </p>
              <div className="flex gap-2">
                <button
                  onClick={generateUniqueTestData}
                  className="px-3 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                >
                  🔄 Générer un nouvel email
                </button>
                <button
                  onClick={() => {
                    setLoginData({
                      email: formData.email,
                      mot_de_passe: formData.mot_de_passe
                    });
                    setError(null);
                  }}
                  className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  🔐 Tester la connexion avec ce compte
                </button>
              </div>
            </div>
          )}

          {/* Boutons de test */}
          <div className="bg-white rounded-lg p-6 border">
            <h2 className="font-bold mb-4 text-lg">🧪 Tests</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testRegisterAPI}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? '⏳' : '�'} Test Inscription
              </button>

              <button
                onClick={testLogin}
                disabled={loading}
                className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? '⏳' : '🔐'} Test Connexion
              </button>

              <button
                onClick={testRegisterWithService}
                disabled={loading}
                className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? '⏳' : '🔧'} Service Inscription
              </button>

              <button
                onClick={checkExistingUsers}
                disabled={loading}
                className="px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                {loading ? '⏳' : '�'} Voir Utilisateurs
              </button>

              <button
                onClick={() => { setResult(null); setError(null); }}
                className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                🧹 Clear
              </button>
            </div>
          </div>

          {/* Résultats */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="font-bold text-red-800 mb-2">❌ Erreur</h2>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="font-bold text-green-800 mb-2">✅ Succès</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Guide de diagnostic */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="font-bold text-blue-800 mb-3">🔍 Guide de diagnostic</h2>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Erreur 400 :</strong> Données invalides ou manquantes</p>
              <p><strong>Erreur 401 :</strong> Email ou mot de passe incorrect</p>
              <p><strong>Erreur 409 :</strong> Email déjà utilisé</p>
              <p><strong>Erreur 500 :</strong> Erreur serveur/base de données</p>
              <p><strong>Solutions communes :</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Vérifier que l'utilisateur existe avant de se connecter</li>
                <li>S'assurer que le mot de passe correspond</li>
                <li>Tester avec un email unique pour l'inscription</li>
                <li>Vérifier les variables d'environnement</li>
              </ul>
            </div>
          </div>

          {/* Informations système */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="font-bold text-gray-800 mb-3">⚙️ Informations système</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>URL API:</strong> /api/auth/register</p>
                <p><strong>Méthode:</strong> POST</p>
                <p><strong>Content-Type:</strong> application/json</p>
              </div>
              <div>
                <p><strong>JWT Secret:</strong> {process.env.JWT_SECRET ? '✅ Défini' : '❌ Manquant'}</p>
                <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}