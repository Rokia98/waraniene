'use client';

import HeaderV2 from '@/components/HeaderV2';

export default function TestHeaderPage() {
  return (
    <div>
      <HeaderV2 />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">🎨 Test Header V2</h1>
        <div className="bg-blue-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Features:</h2>
          <ul className="space-y-2 text-lg">
            <li>✅ Menu dynamique pour Artisans et Clients</li>
            <li>✅ Navigation différente selon le type d'utilisateur</li>
            <li>✅ Compteur du panier</li>
            <li>✅ Menu utilisateur avec déconnexion</li>
            <li>✅ Responsive design</li>
            <li>✅ Support authentification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
