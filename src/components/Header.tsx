'use client';

import Link from "next/link";
import { ShoppingCart, Search, Menu, X, User, Heart, LogOut, UserCircle, ChevronDown, Phone } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useFavoris } from "@/contexts/FavorisContext";
import { useAuthState } from "@/hooks/useAuth";
import AppService, { notify } from "@/services";
import { useRouter, usePathname } from "next/navigation";
import CartSlideOver from "@/components/CartSlideOver";
import { User as BaseUser } from "@/types";

interface AuthenticatedUser extends BaseUser {
  type_utilisateur?: 'acheteur' | 'artisan';
  prenom?: string;
}

const navLinks = [
  { href: '/',         label: 'Accueil' },
  { href: '/produits', label: 'Boutique' },
  { href: '/artisans', label: 'Artisans' },
  { href: '/blog',     label: 'Blog' },
  { href: '/contact',  label: 'Contact' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen]     = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [isSearchOpen, setIsSearchOpen]         = useState(false);
  const [isScrolled, setIsScrolled]             = useState(false);

  const { state, toggleCart } = useCart();
  const { count: favorisCount } = useFavoris();
  const { user, isAuthenticated } = useAuthState();
  const router   = useRouter();
  const pathname = usePathname();
  const userMenuRef  = useRef<HTMLDivElement>(null);
  const searchRef    = useRef<HTMLInputElement>(null);
  const authenticatedUser = user as AuthenticatedUser;

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── close user menu on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── focus search input ── */
  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  const handleLogout = async () => {
    try {
      await AppService.logout();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch {
      notify.error('Erreur lors de la déconnexion');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      AppService.addToRecentSearches(searchQuery);
      router.push(`/produits?recherche=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Barre d'annonce ─────────────────────────────────────── */}
      <div className="bg-primary-800 text-white text-xs sm:text-sm py-2 px-4 text-center flex items-center justify-center gap-4">
        <span className="hidden sm:flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 opacity-70" />
          +225 07 00 00 00 00
        </span>
        <span className="text-primary-200 hidden sm:inline">•</span>
        <span>🎁 Livraison gratuite en Côte d'Ivoire dès 50 000 FCFA</span>
        <span className="text-primary-200 hidden sm:inline">•</span>
        <Link href="/auth" className="hidden sm:inline font-semibold text-primary-100 hover:text-white underline underline-offset-2 transition-colors">
          Espace artisan →
        </Link>
      </div>

      {/* ── Header principal ─────────────────────────────────────── */}
      <header className={`bg-white sticky top-0 z-40 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18 gap-4">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-btn group-hover:shadow-btn-hover transition-shadow">
                {/* Icône stylisée métier du tissage */}
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" aria-hidden="true">
                  <path d="M3 6h18M3 12h18M3 18h18M6 3v18M12 3v18M18 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="7" y="7" width="4" height="4" fill="currentColor" opacity="0.6" rx="0.5"/>
                  <rect x="13" y="13" width="4" height="4" fill="currentColor" opacity="0.6" rx="0.5"/>
                </svg>
              </div>
              <div className="hidden xs:block">
                <span className="font-display text-lg font-bold text-gray-900 leading-none block">
                  Tissés de
                </span>
                <span className="font-display text-lg font-bold text-primary-600 leading-none block -mt-0.5">
                  Waraniéné
                </span>
              </div>
            </Link>

            {/* ── Navigation desktop ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Actions droite ── */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Recherche desktop */}
              <div className="hidden md:block relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center animate-scale-in">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Rechercher…"
                      className="w-48 lg:w-64 pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    aria-label="Rechercher"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Bouton recherche mobile */}
              <button
                className="md:hidden p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                onClick={() => setIsSearchOpen(v => !v)}
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Favoris */}
              <Link
                href="/favoris"
                className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label="Favoris"
              >
                <Heart className="w-5 h-5" />
                {favorisCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-2xs rounded-full flex items-center justify-center font-bold animate-scale-in">
                    {favorisCount > 9 ? '9+' : favorisCount}
                  </span>
                )}
              </Link>

              {/* Panier */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label="Panier"
              >
                <ShoppingCart className="w-5 h-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-2xs rounded-full flex items-center justify-center font-bold animate-scale-in">
                    {state.itemCount > 9 ? '9+' : state.itemCount}
                  </span>
                )}
              </button>

              {/* Compte utilisateur */}
              {isAuthenticated ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="hidden md:inline max-w-[100px] truncate">
                      {authenticatedUser?.prenom || authenticatedUser?.nom || 'Mon compte'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-2 z-50 animate-slide-down">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400">Connecté en tant que</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {authenticatedUser?.prenom || authenticatedUser?.nom || authenticatedUser?.email}
                        </p>
                      </div>

                      {authenticatedUser?.type_utilisateur === 'artisan' ? (
                        <Link href="/artisan/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <UserCircle className="w-4 h-4 text-primary-500" />
                          Mon espace artisan
                        </Link>
                      ) : (
                        <>
                          <Link href="/profil" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                            <User className="w-4 h-4 text-gray-400" />
                            Mon profil
                          </Link>
                          <Link href="/commandes" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                            <ShoppingCart className="w-4 h-4 text-gray-400" />
                            Mes commandes
                          </Link>
                          <Link href="/favoris" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                            <Heart className="w-4 h-4 text-gray-400" />
                            Mes favoris
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-2xl">
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Bouton connexion pour visiteurs non connectés */
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/auth"
                    className="px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="px-4 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-btn hover:shadow-btn-hover transition-all hover:-translate-y-0.5"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

              {/* Bouton menu mobile */}
              <button
                className="lg:hidden p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(v => !v)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Recherche mobile (sous le header) */}
          {isSearchOpen && (
            <div className="md:hidden pb-3 animate-slide-down">
              <form onSubmit={handleSearch} className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des produits…"
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white"
                />
              </form>
            </div>
          )}
        </div>

        {/* ── Menu mobile ── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down">
            <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="max-w-7xl mx-auto px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-400">Connecté en tant que</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {authenticatedUser?.prenom || authenticatedUser?.nom || 'Utilisateur'}
                    </p>
                  </div>
                  {authenticatedUser?.type_utilisateur === 'artisan' ? (
                    <Link href="/artisan/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-primary-700 bg-primary-50">
                      <UserCircle className="w-4 h-4" /> Mon espace artisan
                    </Link>
                  ) : (
                    <Link href="/profil" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4 text-gray-400" /> Mon profil
                    </Link>
                  )}
                  <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors">
                    Connexion
                  </Link>
                  <Link href="/auth?mode=register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center px-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <CartSlideOver />
    </>
  );
}
