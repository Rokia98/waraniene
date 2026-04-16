'use client';

import Link from "next/link";
import { ShoppingCart, LogOut, User, ChevronDown, Store, BarChart3, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/useAuth";
import AppService, { notify } from "@/services";

export function HeaderV2() {
  const { user, isAuthenticated } = useAuthState();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const isArtisan = isAuthenticated && (user as any)?.type_utilisateur === 'artisan';

  useEffect(() => {
    setIsClient(true);
    // Charger le nombre d'articles du panier
    const loadCartCount = async () => {
      try {
        const cart = await AppService.panier.getCart();
        setCartCount(cart?.length || 0);
      } catch (error) {
        console.error('Erreur panier:', error);
      }
    };
    loadCartCount();
  }, []);

  const handleLogout = async () => {
    try {
      await AppService.logout();
      setIsUserMenuOpen(false);
      router.push('/');
      notify.success('Déconnecté avec succès');
    } catch (error) {
      notify.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isArtisan ? "/artisan/dashboard" : "/"} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-600">🎨</span>
            <span className="font-bold text-xl hidden sm:inline">Waraniéné</span>
          </Link>

          {/* Navigation - Pour clients */}
          {!isArtisan && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-amber-600 font-medium">
                Accueil
              </Link>
              <Link href="/produits" className="text-gray-700 hover:text-amber-600 font-medium">
                Produits
              </Link>
              <Link href="/artisans" className="text-gray-700 hover:text-amber-600 font-medium">
                Artisans
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-amber-600 font-medium">
                Contact
              </Link>
            </nav>
          )}

          {/* Navigation - Pour artisans */}
          {isArtisan && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/artisan/dashboard" 
                className="text-gray-700 hover:text-amber-600 font-medium flex items-center gap-1"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
              <Link 
                href="/artisan/produits" 
                className="text-gray-700 hover:text-amber-600 font-medium flex items-center gap-1"
              >
                <Store className="w-4 h-4" />
                Mes Produits
              </Link>
              <Link 
                href="/artisan/commandes" 
                className="text-gray-700 hover:text-amber-600 font-medium flex items-center gap-1"
              >
                <ShoppingCart className="w-4 h-4" />
                Commandes
              </Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Panier - Clients seulement */}
            {isClient && (
              <Link 
                href="/panier" 
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <User className="w-6 h-6 text-gray-700" />
                  <ChevronDown className="w-4 h-4 text-gray-700" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="font-semibold text-gray-900">{(user as any)?.nom || 'Utilisateur'}</p>
                      <p className="text-sm text-gray-500">{(user as any)?.email}</p>
                    </div>

                    {isArtisan && (
                      <>
                        <Link
                          href="/artisan/profil"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Mon Profil
                        </Link>
                        <Link
                          href="/artisan/parametres"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4 inline mr-2" />
                          Paramètres
                        </Link>
                      </>
                    )}

                    {isClient && (
                      <>
                        <Link
                          href="/profil"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Mon Compte
                        </Link>
                        <Link
                          href="/commandes"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          Mes Commandes
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Login/Register - Non authentifiés */}
            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link 
                  href="/auth"
                  className="px-4 py-2 text-amber-600 font-medium hover:bg-amber-50 rounded-lg transition"
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth?mode=register"
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderV2;
