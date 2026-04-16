'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Acheteur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  date_creation: string;
}

interface AuthContextType {
  acheteur: Acheteur | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, motDePasse: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Acheteur>) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  telephone?: string;
  adresse?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [acheteur, setAcheteur] = useState<Acheteur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le token depuis localStorage au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      // Vérifier la validité du token
      checkAuthStatus(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setAcheteur(userData);
      } else {
        // Token invalide, nettoyer
        logout();
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, motDePasse: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          mot_de_passe: motDePasse
        })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setAcheteur(data.acheteur);
        localStorage.setItem('auth_token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (response.ok) {
        setToken(responseData.token);
        setAcheteur(responseData.acheteur);
        localStorage.setItem('auth_token', responseData.token);
        return { success: true };
      } else {
        return { success: false, error: responseData.error };
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  };

  const logout = () => {
    setToken(null);
    setAcheteur(null);
    localStorage.removeItem('auth_token');
  };

  const updateProfile = async (data: Partial<Acheteur>) => {
    if (!token || !acheteur) {
      return { success: false, error: 'Non connecté' };
    }

    try {
      const response = await fetch(`/api/acheteurs/${acheteur.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (response.ok) {
        setAcheteur({ ...acheteur, ...responseData });
        return { success: true };
      } else {
        return { success: false, error: responseData.error };
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  };

  const value: AuthContextType = {
    acheteur,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}