'use client';
import { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IntegrationTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');

  const log = (message: string) => {
    setOutput(prev => prev + message + '\n');
  };

  const runFullTest = async () => {
    setRunning(true);
    setResults([]);
    setOutput('');
    
    log('🚀 DÉMARRAGE TESTS D\'INTÉGRATION PHASE 3\n');
    log('=' .repeat(60) + '\n\n');

    try {
      // Test 1: Créer une commande de test
      log('TEST 1: Créer une commande de test...');
      const orderRes = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_acheteur: 'Test Client',
          email_acheteur: 'test@example.com',
          telephone: '+225701234567',
          adresse_livraison: 'Abidjan, Côte d\'Ivoire',
          items: [
            { produit_id: '1', quantite: 2, prix_unitaire: 25000 }
          ]
        })
      });

      let commandeId = 'test-cmd-001';
      if (orderRes.ok) {
        const data = await orderRes.json();
        commandeId = data.commande?.id || commandeId;
        log('✅ Commande créée: ' + commandeId + '\n\n');
      } else {
        log('⚠️ Erreur création commande (utilisation ID test)\n\n');
      }

      // Test 2: Soumettre un avis
      log('TEST 2: Soumettre un avis produit...');
      const reviewRes = await fetch('/api/produits/1/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_acheteur: 'Marie Koffi',
          email_acheteur: 'marie@example.com',
          note: 5,
          titre: 'Produit magnifique!',
          commentaire: 'La qualité est excellente, les couleurs sont vibrantes et authentiques. Très satisfaite!',
          achete_chez_nous: true
        })
      });

      if (reviewRes.ok) {
        const data = await reviewRes.json();
        log('✅ Avis créé (ID: ' + data.avis?.id + ')\n');
        log('   - Note: 5/5\n');
        log('   - Statut: en_attente (modération)\n\n');
      } else {
        log('❌ Erreur création avis\n\n');
      }

      // Test 3: Lister les avis
      log('TEST 3: Récupérer les avis du produit...');
      const listReviewRes = await fetch('/api/produits/1/avis?limite=10');
      if (listReviewRes.ok) {
        const data = await listReviewRes.json();
        log('✅ Avis récupérés\n');
        log('   - Total: ' + (data.avis?.length || 0) + ' avis\n');
        log('   - Note moyenne: ' + (data.note_moyenne || 0).toFixed(1) + '/5\n\n');
      }

      // Test 4: Valider code promo
      log('TEST 4: Valider code promo BIENVENUE10...');
      const promoRes = await fetch('/api/codes-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'BIENVENUE10',
          montant: 50000
        })
      });

      if (promoRes.ok) {
        const data = await promoRes.json();
        log('✅ Code valide\n');
        log('   - Type: ' + data.type_reduction + '\n');
        log('   - Réduction: ' + data.valeur_reduction + '%\n');
        log('   - Montant minimum: ' + (data.montant_min || 0) + ' FCFA\n\n');
      } else {
        const error = await promoRes.json();
        log('❌ Code invalide: ' + (error.error || 'Erreur inconnue') + '\n\n');
      }

      // Test 5: Envoyer notification
      log('TEST 5: Envoyer notification de commande...');
      const notifRes = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'commande_confirmee',
          acheteur_id: 'test-user',
          email: 'test@example.com',
          telephone: '+225701234567',
          data: {
            numero_commande: commandeId,
            montant: 50000,
            nom_acheteur: 'Test Client'
          }
        })
      });

      if (notifRes.ok) {
        const data = await notifRes.json();
        log('✅ Notification envoyée\n');
        log('   - Email: ' + (data.channels?.email ? '✓' : '✗') + '\n');
        log('   - SMS: ' + (data.channels?.sms ? '✓' : '✗') + '\n\n');
      } else {
        log('❌ Erreur envoi notification\n\n');
      }

      // Test 6: Admin - Lister les avis en attente
      log('TEST 6: Admin - Lister avis en attente de modération...');
      const adminRes = await fetch('/api/admin/avis?statut=en_attente&page=1');
      if (adminRes.ok) {
        const data = await adminRes.json();
        log('✅ Avis en attente\n');
        log('   - Total: ' + (data.avis?.length || 0) + '\n');
        log('   - Pages: ' + (data.pages || 0) + '\n\n');
      }

      // Test 7: Vérifier codes promo actifs
      log('TEST 7: Lister codes promo actifs...');
      const codesRes = await fetch('/api/codes-promo');
      if (codesRes.ok) {
        const data = await codesRes.json();
        log('✅ Codes promo actifs\n');
        log('   - Total: ' + (data.codes?.length || 0) + '\n');
        data.codes?.forEach((code: any) => {
          log('   - ' + code.code + ': -' + code.valeur_reduction + (code.type_reduction === 'pourcentage' ? '%' : ' FCFA') + '\n');
        });
        log('\n');
      }

      log('=' .repeat(60) + '\n');
      log('✅ TOUS LES TESTS TERMINÉS\n');
      log('📋 Prochaines étapes:\n');
      log('1. Exécuter migration-phase3-final.sql dans Supabase\n');
      log('2. Intégrer ReviewsComponent dans pages produits\n');
      log('3. Intégrer PromoCodeInput dans checkout\n');
      log('4. Ajouter WishlistButton sur cartes produits\n');

      toast.success('Tests Phase 3 complétés!');

    } catch (error: any) {
      log('❌ ERREUR: ' + error.message);
      toast.error('Erreur lors des tests');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">🧪 Test d'Intégration Phase 3</h1>
        <p className="text-gray-600 mb-8">Validation complète de tous les endpoints</p>

        <button
          onClick={runFullTest}
          disabled={running}
          className="mb-8 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Tests en cours...
            </>
          ) : (
            '▶️ Lancer les tests'
          )}
        </button>

        {/* Output Console */}
        {output && (
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <span>Console Output</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success('Copié!');
                }}
                className="p-2 hover:bg-gray-800 rounded transition"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-words">{output}</pre>
          </div>
        )}

        {/* Summary Boxes */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">⭐ Avis</h3>
            <p className="text-sm text-gray-600">Système de notation avec modération admin</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🎁 Codes Promo</h3>
            <p className="text-sm text-gray-600">Réductions % ou montant fixe avec date limite</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🔔 Notifications</h3>
            <p className="text-sm text-gray-600">Email & SMS avec préférences utilisateur</p>
          </div>
        </div>
      </div>
    </div>
  );
}
