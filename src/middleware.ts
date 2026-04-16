import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

console.log('🔐 Middleware JWT_SECRET:', JWT_SECRET?.substring(0, 10) + '...');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔒 Middleware - Path:', pathname);
  
  // Routes protégées pour artisans (dashboard uniquement)
  const protectedArtisanRoutes = ['/artisan/dashboard', '/artisan/'];
  
  // Routes publiques de la plateforme (accessibles à tous sauf artisans connectés)
  const publicShopRoutes = ['/', '/produits', '/panier', '/checkout'];
  
  // Vérifier si l'utilisateur a un token d'authentification
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = !!token;
  
  console.log('🔑 Token présent:', isAuthenticated);
  
  let userType: string | null = null;
  
  // Décoder le token pour connaître le type d'utilisateur
  if (isAuthenticated && token) {
    try {
      console.log('🔍 Vérification du token avec jose...');
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      userType = payload.type_utilisateur as string;
      console.log('👤 Type utilisateur:', userType);
    } catch (error) {
      console.log('❌ Token invalide, suppression. Erreur:', error);
      // Token invalide, le supprimer
      const response = NextResponse.redirect(new URL('/auth', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }
  
  // Si non connecté et essaie d'accéder au dashboard artisan
  if (!isAuthenticated || userType !== 'artisan') {
    if (protectedArtisanRoutes.some(route => pathname.startsWith(route))) {
      console.log('🚫 Non authentifié, redirection vers /auth');
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      loginUrl.searchParams.set('message', 'Veuillez vous connecter en tant qu\'artisan');
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Si l'artisan est connecté et essaie d'accéder à la plateforme publique
  if (isAuthenticated && userType === 'artisan') {
    // Rediriger SEULEMENT si on est sur les routes publiques (/, /produits, etc.)
    // PAS si on est déjà sur une route artisan
    const isOnPublicRoute = publicShopRoutes.some(route => pathname === route || pathname.startsWith(route));
    const isOnArtisanRoute = protectedArtisanRoutes.some(route => pathname.startsWith(route));
    
    if (isOnPublicRoute && !isOnArtisanRoute) {
      console.log('🔄 Artisan sur route publique, redirection vers dashboard');
      return NextResponse.redirect(new URL('/artisan/dashboard', request.url));
    }
    
    // Sinon, laisser passer (déjà sur une route artisan)
    if (isOnArtisanRoute) {
      console.log('✅ Artisan authentifié sur route artisan, accès autorisé');
      return NextResponse.next();
    }
  }
  
  console.log('✅ Middleware - Accès autorisé');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclure les fichiers statiques et les routes API internes de Next.js
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};