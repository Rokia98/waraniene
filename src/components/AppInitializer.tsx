'use client';

import { useEffect } from 'react';

/**
 * Composant d'initialisation de l'application
 * Gère l'initialisation de base de l'application
 */
export default function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeApp = () => {
      try {
        // Initialisation de base
        console.log('✅ Application Tissés de Waraniéné initialisée');
        
        // Vérifier si on est côté client
        if (typeof window !== 'undefined') {
          // Initialiser le stockage local si nécessaire
          if (!localStorage.getItem('waraniene_visited')) {
            localStorage.setItem('waraniene_visited', 'true');
            localStorage.setItem('waraniene_visit_date', new Date().toISOString());
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
      }
    };

    initializeApp();
  }, []);

  return <>{children}</>;
}