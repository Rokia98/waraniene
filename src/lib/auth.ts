import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-ultra-securise';

export interface JwtPayload {
  userId: string;
  email: string;
  nom: string;
  prenom: string;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Erreur vérification token:', error);
    return null;
  }
}

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Enlever "Bearer "
}

export function requireAuth(request: Request): { user: JwtPayload } | { error: string; status: number } {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    return { error: 'Token manquant', status: 401 };
  }
  
  const user = verifyToken(token);
  
  if (!user) {
    return { error: 'Token invalide', status: 401 };
  }
  
  return { user };
}