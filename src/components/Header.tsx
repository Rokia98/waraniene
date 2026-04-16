'use client';

import Link from "next/link";
import { ShoppingCart, Search, Menu, User, Heart, LogOut, UserCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useFavoris } from "@/contexts/FavorisContext";
import { useAuthState } from "@/hooks/useAuth";
import AppService, { notify } from "@/services";
import { useRouter } from "next/navigation";
import CartSlideOver from "@/components/CartSlideOver";
import { User as BaseUser } from "@/types";

// Type étendu pour l'utilisateur authentifié
interface AuthenticatedUser extends BaseUser {
  type_utilisateur?: 'acheteur' | 'artisan';
  prenom?: string;
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { state, toggleCart } = useCart();
  const { count: favorisCount } = useFavoris();
  const { user, isAuthenticated } = useAuthState();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Caster user vers AuthenticatedUser pour accéder à type_utilisateur
  const authenticatedUser = user as AuthenticatedUser;

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AppService.logout();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      notify.error('Erreur lors de la déconnexion');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      AppService.addToRecentSearches(searchQuery);
      router.push(`/produits?recherche=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="font-display text-2xl font-bold text-primary-600">
                  Waraniéné
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Accueil
              </Link>
              <Link 
                href="/produits" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Produits
              </Link>
              <Link 
                href="/artisans" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Artisans
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Espace Artisan - logique conditionnelle */}
              {isAuthenticated && authenticatedUser?.type_utilisateur === 'artisan' ? (
                <Link 
                  href="/artisan/dashboard"
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="text-sm">Mon Dashboard</span>
                </Link>
              ) : (
                <Link 
                  href="/auth?type=artisan"
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="text-sm">Devenir Artisan</span>
                </Link>
              )}

              {/* Search */}
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </form>

              {/* Mobile Search Button */}
              <button className="sm:hidden text-gray-700 hover:text-primary-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Favoris */}
              <Link
                href="/favoris"
                className="text-gray-700 hover:text-primary-600 transition-colors relative"
              >
                <Heart className="w-5 h-5" />
                {favorisCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorisCount}
                  </span>
                )}
              </Link>

              {/* Cart - toujours visible pour acheteurs */}
              <button 
                className="text-gray-700 hover:text-primary-600 transition-colors relative"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-5 h-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:block ml-2 text-sm">
                      {authenticatedUser?.prenom || authenticatedUser?.nom || 'Mon compte'}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      {authenticatedUser?.type_utilisateur === 'artisan' ? (
                        <Link
                          href="/artisan/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 inline mr-3" />
                          Mon Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/profil"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4 inline mr-3" />
                            Mon profil
                          </Link>
                          <Link
                            href="/commandes"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <ShoppingCart className="w-4 h-4 inline mr-3" />
                            Mes commandes
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 inline mr-3" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4">
              <nav className="space-y-2">
                <Link 
                  href="/" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link 
                  href="/produits" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Produits
                </Link>
                <Link 
                  href="/artisans" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Artisans
                </Link>
                <Link 
                  href="/contact" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                <div className="border-t border-gray-200 pt-2 mt-2">
                  {/* Espace Artisan mobile */}
                  {isAuthenticated && authenticatedUser?.type_utilisateur === 'artisan' ? (
                    <Link 
                      href="/artisan/dashboard" 
                      className="block px-4 py-2 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCircle className="w-4 h-4 inline mr-2" />
                      Mon Dashboard
                    </Link>
                  ) : (
                    <Link 
                      href="/auth?type=artisan" 
                      className="block px-4 py-2 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCircle className="w-4 h-4 inline mr-2" />
                      Devenir Artisan
                    </Link>
                  )}
                  
                  {/* Search mobile */}
                  <form onSubmit={handleSearch} className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </form>
                  
                  {/* Favoris mobile */}
                  <Link
                    href="/favoris"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="w-4 h-4 inline mr-2" />
                    Mes favoris {favorisCount > 0 && `(${favorisCount})`}
                  </Link>

                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-primary-600">
                        Bonjour, {authenticatedUser?.prenom || authenticatedUser?.nom || 'Client'}
                      </div>
                      {authenticatedUser?.type_utilisateur === 'artisan' ? (
                        <Link 
                          href="/artisan/dashboard" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Mon Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link 
                            href="/profil" 
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Mon profil
                          </Link>
                          <Link 
                            href="/commandes" 
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Mes commandes
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : null}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Cart Slide Over */}
      <CartSlideOver />
    </>
  );
}
