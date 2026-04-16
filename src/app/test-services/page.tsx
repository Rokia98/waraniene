'use client';
import { useState } from 'react';
import AppService, { notify, notifyEcommerce } from '@/services';

export default function ServiceTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const result = await AppService.login({ email, mot_de_passe: password }, false);
      console.log('Login result:', result);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      const result = await AppService.register({ 
        nom: name, 
        email, 
        mot_de_passe: password 
      });
      console.log('Register result:', result);
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testNotifications = () => {
    notify.success('Test de notification success !');
    notify.error('Test de notification error !');
    notify.warning('Test de notification warning !');
    notify.info('Test de notification info !');

    // Test notifications e-commerce
    setTimeout(() => {
      notifyEcommerce.itemAdded('Boubou traditionnel', 2);
    }, 1000);

    setTimeout(() => {
      notifyEcommerce.orderConfirmed('CMD-12345');
    }, 2000);
  };

  const testStorage = () => {
    // Test du stockage local
    AppService.setUserPreference('theme', 'dark');
    AppService.addToRecentSearches('boubou traditionnel');
    AppService.saveFormDraft('test-form', { email, name });

    notify.success('Données sauvegardées en local');

    // Log des données
    console.log('App Status:', AppService.getAppStatus());
    console.log('User Data Export:', AppService.exportUserData());
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    notify.info('Stockage local vidé');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Test des Services Waraniéné
          </h1>

          {/* Test Authentification */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🔐 Test Authentification</h2>
            
            <div className="space-y-4 mb-4">
              <input
                type="text"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={testRegister}
                disabled={loading || !name || !email || !password}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'En cours...' : 'Tester Inscription'}
              </button>
              <button
                onClick={testLogin}
                disabled={loading || !email || !password}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'En cours...' : 'Tester Connexion'}
              </button>
            </div>
          </div>

          {/* Test Notifications */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🔔 Test Notifications</h2>
            <button
              onClick={testNotifications}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Tester Toutes les Notifications
            </button>
          </div>

          {/* Test Stockage */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">💾 Test Stockage Local</h2>
            <div className="flex gap-4">
              <button
                onClick={testStorage}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Sauvegarder Données
              </button>
              <button
                onClick={clearStorage}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Vider Stockage
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Instructions</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Ouvrez la console pour voir les logs détaillés</li>
              <li>• Testez les notifications pour vérifier react-hot-toast</li>
              <li>• Testez l&apos;authentification avec des données valides</li>
              <li>• Vérifiez le stockage local dans DevTools &gt; Application &gt; Local Storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}