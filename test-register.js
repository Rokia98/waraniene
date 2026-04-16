/**
 * Test de l'API auth/register avec le système hybride MySQL/Supabase
 */

const testData = {
  nom: "Test Artisan",
  email: "test.artisan@waraniene.com",
  mot_de_passe: "TestPassword123",
  telephone: "+225 07 99 88 77 66",
  bio: "Artisan de test pour vérifier le système hybride",
  localisation: "Waraniéné, Test"
};

async function testRegister() {
  console.log('\n🧪 Test d\'inscription artisan...\n');
  console.log('📊 Données envoyées:', testData);
  console.log('\n📡 Envoi de la requête à http://localhost:3000/api/auth/register...\n');

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log('📥 Réponse reçue:');
    console.log('   Status:', response.status);
    console.log('   Body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCÈS! Artisan créé avec le système hybride.');
      console.log('   Type de BDD utilisé:', process.env.DB_TYPE || 'mysql');
      console.log('   Token JWT:', result.token ? result.token.substring(0, 50) + '...' : 'N/A');
      console.log('   Utilisateur:', result.user?.nom, '-', result.user?.email);
    } else {
      console.log('\n⚠️  Erreur:', result.error);
      if (result.error?.includes('déjà utilisé')) {
        console.log('   ℹ️  L\'artisan existe déjà. Testez avec un autre email/téléphone.');
      }
    }

  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    console.error('\n⚠️  Assurez-vous que le serveur Next.js est démarré (npm run dev)');
  }
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/test-mysql');
    if (response.ok) {
      const data = await response.json();
      console.log('🗄️  Serveur actif - Mode:', data.database || 'MySQL');
      console.log('📊 Stats BDD:', data.stats);
      console.log('');
      return true;
    }
  } catch {
    console.log('❌ Serveur non accessible sur http://localhost:3000');
    console.log('   Démarrez-le avec: npm run dev\n');
    return false;
  }
}

// Exécution
(async () => {
  const serverOk = await checkServer();
  if (serverOk) {
    await testRegister();
  }
})();
