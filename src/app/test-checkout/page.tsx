'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ShoppingCart, Package, CreditCard, CheckCircle } from 'lucide-react';

export default function TestCheckoutPage() {
  const { state, addItem, clearCart } = useCart();
  const [testStep, setTestStep] = useState(0);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `✅ ${message}`]);
  };

  const addError = (message: string) => {
    setResults(prev => [...prev, `❌ ${message}`]);
  };

  // Produit de test
  const testProduct = {
    id: 'test-product-1',
    nom_produit: 'Pagne Test Sénoufo',
    prix: 25000,
    stock_disponible: 10,
    artisan: 'Artisan Test',
    image: undefined
  };

  const testSteps = [
    {
      title: '1. Ajouter un produit au panier',
      action: () => {
        try {
          addItem(testProduct);
          addResult('Produit ajouté au panier avec succès');
          setTestStep(1);
        } catch (error) {
          addError(`Erreur ajout au panier: ${error}`);
        }
      },
      completed: state.items.length > 0
    },
    {
      title: '2. Vérifier le panier',
      action: () => {
        if (state.items.length > 0) {
          addResult(`Panier contient ${state.itemCount} article(s) pour un total de ${formatCurrency(state.total)}`);
          setTestStep(2);
        } else {
          addError('Aucun article dans le panier');
        }
      },
      completed: state.items.length > 0 && testStep >= 1
    },
    {
      title: '3. Tester l\'API des acheteurs',
      action: async () => {
        try {
          const testBuyer = {
            nom: 'Test',
            prenom: 'User',
            email: `test-${Date.now()}@example.com`,
            mot_de_passe: 'testpassword',
            telephone: '0123456789',
            adresse: 'Abidjan, Test'
          };

          const response = await fetch('/api/acheteurs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testBuyer)
          });

          if (response.ok) {
            const data = await response.json();
            addResult(`Acheteur créé avec ID: ${data.acheteur?.id}`);
            setTestStep(3);
          } else {
            const errorData = await response.json();
            addError(`Erreur API acheteur: ${errorData.error}`);
          }
        } catch (error) {
          addError(`Erreur réseau API acheteur: ${error}`);
        }
      },
      completed: testStep >= 2
    },
    {
      title: '4. Tester l\'API des commandes',
      action: async () => {
        try {
          // Créer d'abord un acheteur de test
          const testBuyer = {
            nom: 'CommandeTest',
            prenom: 'User',
            email: `commande-test-${Date.now()}@example.com`,
            mot_de_passe: 'testpassword',
            telephone: '0123456789',
            adresse: 'Abidjan, Test Commande'
          };

          const buyerResponse = await fetch('/api/acheteurs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testBuyer)
          });

          if (!buyerResponse.ok) {
            throw new Error('Impossible de créer l\'acheteur de test');
          }

          const buyerData = await buyerResponse.json();
          const acheteur_id = buyerData.acheteur?.id;

          // Créer une commande de test
          const testOrder = {
            acheteur_id,
            items: state.items.map(item => ({
              produit_id: item.id,
              quantite: item.quantite
            })),
            mode_paiement: 'orange_money',
            adresse_livraison: JSON.stringify(testBuyer)
          };

          const orderResponse = await fetch('/api/commandes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testOrder)
          });

          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            addResult(`Commande créée avec ID: ${orderData.commande?.id}`);
            setTestStep(4);
          } else {
            const errorData = await orderResponse.json();
            addError(`Erreur API commande: ${errorData.error}`);
          }
        } catch (error) {
          addError(`Erreur test commande: ${error}`);
        }
      },
      completed: testStep >= 3
    }
  ];

  const runAllTests = async () => {
    setResults([]);
    setTestStep(0);
    
    // Vider le panier d'abord
    clearCart();
    
    // Exécuter tous les tests séquentiellement
    for (let i = 0; i < testSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Petite pause
      await testSteps[i].action();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Test du Flow Panier-Checkout
          </h1>
          
          <p className="text-gray-600 mb-8">
            Cette page teste automatiquement le flow complet du panier au checkout avec les vraies APIs.
          </p>

          {/* État actuel du panier */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              État actuel du panier
            </h3>
            <p className="text-blue-700">
              {state.items.length} article(s) • Total: {formatCurrency(state.total)}
            </p>
            {state.items.map(item => (
              <div key={item.id} className="text-sm text-blue-600 mt-1">
                • {item.nom_produit} (x{item.quantite}) - {formatCurrency(item.prix * item.quantite)}
              </div>
            ))}
          </div>

          {/* Étapes de test */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-gray-900">Étapes de test</h3>
            
            {testSteps.map((step, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  step.completed 
                    ? 'border-green-300 bg-green-50' 
                    : testStep === index 
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <div className="flex items-center gap-2">
                    {step.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <Button
                      onClick={step.action}
                      disabled={index > 0 && !testSteps[index - 1].completed}
                      size="sm"
                      variant={step.completed ? 'outline' : 'primary'}
                    >
                      {step.completed ? 'Refaire' : 'Tester'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions globales */}
          <div className="flex gap-4 mb-8">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Lancer tous les tests
            </Button>
            
            <Button onClick={clearCart} variant="outline">
              Vider le panier
            </Button>

            <Link href="/checkout">
              <Button variant="outline" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Aller au Checkout
              </Button>
            </Link>
          </div>

          {/* Résultats */}
          {results.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Résultats des tests</h3>
              <div className="space-y-1 font-mono text-sm">
                {results.map((result, index) => (
                  <div key={index} className={
                    result.startsWith('✅') ? 'text-green-700' : 'text-red-700'
                  }>
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <Link href="/" className="text-primary-600 hover:text-primary-700">
                ← Retour à l'accueil
              </Link>
              
              <div className="flex gap-4">
                <Link href="/produits" className="text-primary-600 hover:text-primary-700">
                  Voir les produits
                </Link>
                <Link href="/panier" className="text-primary-600 hover:text-primary-700">
                  Voir le panier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}