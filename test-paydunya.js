/**
 * Script de test pour l'intégration PayDunya
 * Utilisation: node test-paydunya.js
 */

const PayDunya = require('paydunya');

console.log('🧪 Test de l\'intégration PayDunya\n');

// Configuration
const setup = new PayDunya.Setup({
  masterKey: 'SKMh1Kvp-cJZy-jbPo-6xUo-qGRfbRJg7E16',
  privateKey: 'test_private_xwbfURY3OK62fapRXTwjLJsf1eP',
  token: 'umkCaizgysrDqZnOCoDX',
  mode: 'test'
});

console.log('✅ Setup PayDunya créé');
console.log('   Mode:', setup.baseURL.includes('sandbox') ? 'TEST' : 'LIVE');

// Configuration du magasin
const store = new PayDunya.Store({
  name: 'Tissés de Waraniéné',
  tagline: 'Tissus traditionnels Senoufo',
  phoneNumber: '+2250700000000',
  postalAddress: 'Waraniéné, Côte d\'Ivoire',
  websiteURL: 'http://localhost:3000',
  returnURL: 'http://localhost:3000/paiement/success',
  cancelURL: 'http://localhost:3000/paiement/cancel',
  callbackURL: 'http://localhost:3000/api/paiement/callback'
});

console.log('✅ Store configuré:', store.name);

// Création d'une facture de test
const invoice = new PayDunya.CheckoutInvoice(setup, store);

invoice.addItem('Pagne Traditionnel Senoufo', 1, 45000, 45000, 'Tissu authentique de Waraniéné');
invoice.totalAmount = 45000;
invoice.description = 'Commande test - Pagne Traditionnel';

// Informations client
invoice.invoice_data = {
  customer: {
    name: 'Test Client',
    phone: '+2250700000001',
    email: 'test@example.com'
  }
};

console.log('✅ Invoice créée avec un article de 45000 XOF\n');
console.log('📤 Envoi de la requête à PayDunya...\n');

// Créer la facture
invoice.create()
  .then(() => {
    console.log('✅ Réponse PayDunya reçue (données dans invoice):\n');
    console.log('   Token:', invoice.token);
    console.log('   URL:', invoice.url);
    console.log('   Status:', invoice.status);
    
    if (invoice.token && invoice.url) {
      console.log('\n🎉 SUCCESS! Invoice créée avec succès');
      console.log('   Token:', invoice.token);
      console.log('   URL de paiement:', invoice.url);
      console.log('   Status:', invoice.status);
    } else {
      console.log('\n⚠️  Données manquantes');
    }
  })
  .catch(error => {
    console.error('\n❌ ERREUR lors de la création de l\'invoice:');
    console.error('Type:', typeof error);
    console.error('Message:', error.message);
    if (error.data) {
      console.error('Data:', error.data);
    }
  });
