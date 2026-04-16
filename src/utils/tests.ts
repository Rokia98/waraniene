// Tests simples pour les utilitaires et fonctions
import { formatCurrency } from '@/lib/utils';
import { createMockProduit, createMockArtisan } from '@/lib/mockData';

export function runTests() {
  console.log('🧪 Début des tests...');
  
  let passed = 0;
  let failed = 0;

  function test(name: string, testFn: () => boolean) {
    try {
      const result = testFn();
      if (result) {
        console.log(`✅ ${name}`);
        passed++;
      } else {
        console.log(`❌ ${name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name} - Erreur: ${error}`);
      failed++;
    }
  }

  // Tests pour formatCurrency
  test('formatCurrency formate correctement les nombres', () => {
    return formatCurrency(25000) === '25 000 FCFA';
  });

  test('formatCurrency gère les nombres avec décimales', () => {
    return formatCurrency(25000.50) === '25 001 FCFA';
  });

  test('formatCurrency gère les petits nombres', () => {
    return formatCurrency(100) === '100 FCFA';
  });

  // Tests pour createMockProduit
  test('createMockProduit crée un produit valide', () => {
    const produit = createMockProduit();
    return produit.id !== undefined && 
           produit.nom_produit !== undefined && 
           produit.prix !== undefined;
  });

  test('createMockProduit accepte des overrides', () => {
    const produit = createMockProduit({ nom_produit: 'Test Custom' });
    return produit.nom_produit === 'Test Custom';
  });

  // Tests pour createMockArtisan
  test('createMockArtisan crée un artisan valide', () => {
    const artisan = createMockArtisan();
    return artisan.id !== undefined && 
           artisan.nom !== undefined && 
           artisan.specialites.length > 0;
  });

  test('createMockArtisan accepte des overrides', () => {
    const artisan = createMockArtisan({ nom: 'Artisan Test' });
    return artisan.nom === 'Artisan Test';
  });

  // Tests pour les types de données
  test('Produit mock a toutes les propriétés requises', () => {
    const produit = createMockProduit();
    const requiredProps = [
      'id', 'nom_produit', 'description', 'categorie', 'prix', 
      'stock', 'stock_disponible', 'artisan_id', 'images', 
      'materiaux', 'couleurs', 'est_personnalisable', 'est_actif'
    ];
    
    return requiredProps.every(prop => produit.hasOwnProperty(prop));
  });

  test('Artisan mock a toutes les propriétés requises', () => {
    const artisan = createMockArtisan();
    const requiredProps = [
      'id', 'user_id', 'nom', 'specialites', 'annees_experience',
      'village_origine', 'localisation', 'techniques_maitrisees'
    ];
    
    return requiredProps.every(prop => artisan.hasOwnProperty(prop));
  });

  console.log(`\n📊 Résultats des tests:`);
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  return { passed, failed };
}

// Exportons aussi des fonctions utilitaires pour tester manuellement
export const testUtils = {
  // Tester un composant visuellement
  logComponent: (name: string, props: any) => {
    console.log(`🔍 Composant: ${name}`);
    console.log('Props:', props);
  },

  // Tester une API call
  testApiCall: async (apiCall: () => Promise<any>, expectedFields: string[]) => {
    try {
      const result = await apiCall();
      console.log(`📡 API Call réussie:`, result);
      
      const missingFields = expectedFields.filter(field => !(field in result));
      if (missingFields.length > 0) {
        console.warn(`⚠️ Champs manquants:`, missingFields);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ API Call échouée:`, error);
      throw error;
    }
  },

  // Vérifier la structure d'un objet
  validateStructure: (obj: any, requiredFields: string[]) => {
    const missing = requiredFields.filter(field => !(field in obj));
    if (missing.length > 0) {
      console.error(`❌ Structure invalide. Champs manquants:`, missing);
      return false;
    }
    console.log(`✅ Structure valide`);
    return true;
  }
};

// Si on est en environnement de développement, lancer les tests
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // On peut lancer les tests depuis la console du navigateur
  (window as any).runTests = runTests;
  (window as any).testUtils = testUtils;
}