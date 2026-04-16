'use client';
import { useState, useEffect } from 'react';
import { Bell, Mail, Phone, Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    email_commande: true,
    email_promo: true,
    email_avis: true,
    sms_commande: false,
    sms_promo: false,
    sms_avis: false
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/preferences-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (res.ok) {
        toast.success('Préférences enregistrées!');
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Préférences de Notifications</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Email Notifications */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Notifications Email</h2>
            </div>

            <div className="space-y-3 ml-7">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={preferences.email_commande}
                  onChange={() => handleToggle('email_commande')}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-700">
                  <strong>Commandes</strong>
                  <br />
                  <span className="text-sm text-gray-500">Confirmation et mises à jour de commandes</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={preferences.email_promo}
                  onChange={() => handleToggle('email_promo')}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-700">
                  <strong>Promotions</strong>
                  <br />
                  <span className="text-sm text-gray-500">Offres spéciales et réductions</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={preferences.email_avis}
                  onChange={() => handleToggle('email_avis')}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-700">
                  <strong>Avis & Produits</strong>
                  <br />
                  <span className="text-sm text-gray-500">Demandes d'avis et recommandations</span>
                </span>
              </label>
            </div>
          </div>

          {/* SMS Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Notifications SMS</h2>
            </div>

            <div className="space-y-3 ml-7">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={preferences.sms_commande}
                  onChange={() => handleToggle('sms_commande')}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-700">
                  <strong>Commandes</strong>
                  <br />
                  <span className="text-sm text-gray-500">Alertes de livraison (frais peuvent s'appliquer)</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={preferences.sms_promo}
                  onChange={() => handleToggle('sms_promo')}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-700">
                  <strong>Promotions</strong>
                  <br />
                  <span className="text-sm text-gray-500">Offres limitées par SMS</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={preferences.sms_avis}
                  onChange={() => handleToggle('sms_avis')}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-700">
                  <strong>Avis & Produits</strong>
                  <br />
                  <span className="text-sm text-gray-500">Demandes d'avis par SMS</span>
                </span>
              </label>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p>Vous recevrez uniquement les notifications que vous avez sélectionnées. Vous pouvez modifier vos préférences à tout moment.</p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Enregistrer les préférences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
