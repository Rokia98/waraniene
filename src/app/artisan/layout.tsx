'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Package, ShoppingCart, BarChart3, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ArtisanLayoutProps {
  children: ReactNode;
}

export default function ArtisanLayout({ children }: ArtisanLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [artisanName, setArtisanName] = useState('Artisan');

  useEffect(() => {
    // Récupérer le nom de l'artisan depuis localStorage ou API
    const loadArtisanData = async () => {
      // Essayer localStorage d'abord
      const storedData = localStorage.getItem('auth_user_data');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setArtisanName(data.nom || data.prenom || 'Artisan');
        } catch (e) {
          console.error('Erreur parsing artisan data:', e);
        }
      }

      // Charger depuis l'API pour être sûr
      try {
        const response = await fetch('/api/artisan/profil');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.artisan) {
            const artisan = result.artisan;
            const fullName = artisan.prenom 
              ? `${artisan.prenom} ${artisan.nom}` 
              : artisan.nom;
            setArtisanName(fullName || 'Artisan');
            // Mettre à jour localStorage
            localStorage.setItem('auth_user_data', JSON.stringify(artisan));
          }
        }
      } catch (error) {
        console.error('Erreur chargement profil artisan:', error);
      }
    };

    loadArtisanData();
  }, []);

  const handleLogout = () => {
    // Supprimer le token et les données
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_data');
    
    // Rediriger vers la page de connexion
    router.push('/auth');
  };

  const navItems = [
    {
      name: 'Tableau de bord',
      href: '/artisan/dashboard',
      icon: BarChart3,
      active: pathname === '/artisan/dashboard'
    },
    {
      name: 'Produits',
      href: '/artisan/dashboard?tab=produits',
      icon: Package,
      active: pathname.includes('/artisan/produits')
    },
    {
      name: 'Commandes',
      href: '/artisan/dashboard?tab=commandes',
      icon: ShoppingCart,
      active: pathname.includes('/artisan/commandes')
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/artisan/dashboard" className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:inline">
                  Tissés de Waraniéné
                </span>
              </Link>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{artisanName}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Navigation Mobile */}
          <nav className="md:hidden border-t border-gray-200 py-2 flex overflow-x-auto space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    item.active
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            © 2025 Tissés de Waraniéné - Plateforme artisanale
          </div>
        </div>
      </footer>
    </div>
  );
}