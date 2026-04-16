'use client';

import Link from 'next/link';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function Phase3StatusPage() {
  const tasks = [
    {
      category: '✅ Implémenté',
      items: [
        { name: 'API Avis', status: 'complete', link: '/api/produits/[id]/avis' },
        { name: 'API Codes Promo', status: 'complete', link: '/api/codes-promo' },
        { name: 'API Notifications', status: 'complete', link: '/api/notifications' },
        { name: 'API Wishlist', status: 'complete', link: '/api/wishlist' },
        { name: 'API Admin Modération', status: 'complete', link: '/api/admin/avis' },
        { name: 'Component Avis', status: 'complete', link: 'ReviewsComponent' },
        { name: 'Component Promo', status: 'complete', link: 'PromoCodeInput' },
        { name: 'Component Wishlist', status: 'complete', link: 'WishlistButton' },
        { name: 'Page Admin Avis', status: 'complete', link: '/admin/avis' },
        { name: 'Page Preferences', status: 'complete', link: '/preferences-notifications' },
        { name: 'Migration SQL', status: 'complete', link: 'database/migration-phase3-final.sql' },
        { name: 'Page Tests', status: 'complete', link: '/test-integration' },
      ]
    },
    {
      category: '⏳ À Faire',
      items: [
        { name: 'Exécuter migration SQL Supabase', status: 'pending' },
        { name: 'Intégrer ReviewsComponent dans pages produits', status: 'pending' },
        { name: 'Intégrer PromoCodeInput dans checkout', status: 'pending' },
        { name: 'Ajouter WishlistButton sur cartes produits', status: 'pending' },
        { name: 'Tests intégration complets', status: 'pending' },
        { name: 'Déploiement production', status: 'pending' },
      ]
    },
    {
      category: '📋 Phase 4+',
      items: [
        { name: 'Google Analytics intégration' },
        { name: 'Upload photos pour avis' },
        { name: 'Avis par email post-livraison' },
        { name: 'SMS gateway complet (Twilio)' },
        { name: 'Notifications push web' },
        { name: 'Analytics avis vs conversions' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">📊 Phase 3 - Statut & Roadmap</h1>
          <p className="text-xl text-gray-600">Engagement • Notifications • Favoris • Avis</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-4xl font-bold text-green-600 mb-2">12</div>
            <p className="text-green-700 font-semibold">Fichiers créés</p>
            <p className="text-sm text-green-600">APIs, Components, Pages</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
            <p className="text-blue-700 font-semibold">Tables Supabase</p>
            <p className="text-sm text-blue-600">avis, codes_promo, notifications, etc.</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">4</div>
            <p className="text-purple-700 font-semibold">Composants React</p>
            <p className="text-sm text-purple-600">ReviewsComponent, PromoCodeInput...</p>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {tasks.slice(0, 2).map((section, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    {item.status === 'complete' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.link && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">{item.link}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Phase 4 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">📋 Phase 4 - Roadmap Futur</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tasks[2].items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          <Link href="/test-integration" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg hover:shadow-lg transition">
            <div className="text-2xl mb-2">🧪</div>
            <h3 className="font-semibold mb-1">Tests Intégration</h3>
            <p className="text-xs text-purple-100">Valider tous endpoints</p>
          </Link>

          <Link href="/admin/avis" className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg hover:shadow-lg transition">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold mb-1">Admin - Avis</h3>
            <p className="text-xs text-green-100">Modérer avis clients</p>
          </Link>

          <Link href="/preferences-notifications" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg hover:shadow-lg transition">
            <div className="text-2xl mb-2">🔔</div>
            <h3 className="font-semibold mb-1">Préférences</h3>
            <p className="text-xs text-blue-100">Paramètres notifications</p>
          </Link>

          <Link href="/phase3-summary" className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 rounded-lg hover:shadow-lg transition">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold mb-1">Documentation</h3>
            <p className="text-xs text-amber-100">Résumé Phase 3</p>
          </Link>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">🚀 Prochaines Étapes (Priorité)</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">Exécuter Migration SQL</h3>
                <p className="text-gray-600 text-sm mt-1">Copier <code className="bg-gray-100 px-2 py-1 rounded">database/migration-phase3-final.sql</code> dans Supabase SQL Editor</p>
                <p className="text-xs text-gray-500 mt-2">⏱️ ~2 minutes</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">Valider avec Tests</h3>
                <p className="text-gray-600 text-sm mt-1">Accéder à <Link href="/test-integration" className="text-blue-600 hover:underline">/test-integration</Link> et lancer les tests</p>
                <p className="text-xs text-gray-500 mt-2">⏱️ ~5 minutes</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">Intégrer dans Pages</h3>
                <p className="text-gray-600 text-sm mt-1">Ajouter ReviewsComponent, PromoCodeInput, WishlistButton aux pages existantes</p>
                <p className="text-xs text-gray-500 mt-2">⏱️ ~30 minutes</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">4</div>
              <div>
                <h3 className="font-semibold text-gray-900">Tests Manuels</h3>
                <p className="text-gray-600 text-sm mt-1">Soumettre avis, valider codes promo, vérifier notifications</p>
                <p className="text-xs text-gray-500 mt-2">⏱️ ~15 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Files Created */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📁 Fichiers Phase 3</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">APIs (7)</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ api/produits/[id]/avis/route.ts</li>
                <li>✓ api/codes-promo/route.ts</li>
                <li>✓ api/notifications/route.ts</li>
                <li>✓ api/wishlist/route.ts</li>
                <li>✓ api/admin/avis/route.ts</li>
                <li>✓ api/admin/avis/[id]/route.ts</li>
                <li>✓ api/preferences-notifications/route.ts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Components & Pages (5)</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ components/ReviewsComponent.tsx</li>
                <li>✓ components/PromoCodeInput.tsx</li>
                <li>✓ components/WishlistButton.tsx</li>
                <li>✓ app/admin/avis/page.tsx</li>
                <li>✓ app/preferences-notifications/page.tsx</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
