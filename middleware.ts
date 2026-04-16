import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Routes qui nécessitent une authentification artisan
const artisanRoutes = [
  '/artisan'
];

// Routes qui nécessitent une authentification acheteur
const acheteurRoutes = [
  '/profil',
  '/commandes',
  '/panier/checkout'
];

// Routes publiques (utilisateurs non connectés uniquement)
const publicOnlyRoutes = [
  '/auth',
  '/inscription',
  '/connexion'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Récupérer le token depuis les cookies
  const token = request.cookies.get('auth-token')?.value;

  let decodedToken: any = null;
  let isAuthenticated = false;
  let userType: string | null = null;

  if (token) {
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as any;
      isAuthenticated = true;
      userType = decodedToken.type_utilisateur;
    } catch (error) {
      console.error('Token invalide:', error);
    }
  }
  
  // Vérifier si la route nécessite une authentification artisan
  const isArtisanRoute = artisanRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Vérifier si la route nécessite une authentification acheteur
  const isAcheteurRoute = acheteurRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Vérifier si la route est publique uniquement
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Rediriger les utilisateurs non authentifiés vers la page de connexion
  if ((isArtisanRoute || isAcheteurRoute) && !isAuthenticated) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rediriger les artisans qui tentent d'accéder aux routes acheteurs
  if (isAcheteurRoute && isAuthenticated && userType === 'artisan') {
    return NextResponse.redirect(new URL('/artisan/dashboard', request.url));
  }

  // Rediriger les acheteurs qui tentent d'accéder aux routes artisans
  if (isArtisanRoute && isAuthenticated && userType === 'acheteur') {
    return NextResponse.redirect(new URL('/profil', request.url));
  }

  // Rediriger les utilisateurs authentifiés loin des pages publiques
  if (isPublicOnlyRoute && isAuthenticated) {
    const defaultRoute = userType === 'artisan' ? '/artisan/dashboard' : '/profil';
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || defaultRoute;
    return NextResponse.redirect(new URL(returnUrl, request.url));
  }

  // Ajouter des headers de sécurité
  const response = NextResponse.next();
  
  // Headers de sécurité CORS pour l'API
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Headers de sécurité généraux
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Configurer quelles routes sont couvertes par le middleware
export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - api/auth/* (routes d'authentification)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - fichiers publics avec extensions
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};