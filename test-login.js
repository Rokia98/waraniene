/**
 * Script de test pour l'API de connexion artisan
 */

const testLogin = async () => {
  console.log('🧪 TEST DE CONNEXION ARTISAN\n');
  console.log('=' .repeat(50));

  try {
    const loginData = {
      email: 'crokia12@gmail.com',
      mot_de_passe: 'Motdepasse123!'
    };

    console.log('📤 Envoi de la requête de connexion...');
    console.log('Email:', loginData.email);

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    console.log('\n📊 RÉSULTAT:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('\n📦 Données reçues:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ CONNEXION RÉUSSIE !');
      console.log('👤 Artisan:', data.user?.nom);
      console.log('📧 Email:', data.user?.email);
      console.log('🎫 Token:', data.token?.substring(0, 20) + '...');
    } else {
      console.log('\n❌ ÉCHEC DE LA CONNEXION');
      console.log('Erreur:', data.error);
    }

  } catch (error) {
    console.error('\n💥 ERREUR FATALE:', error.message);
    console.error(error);
  }

  console.log('\n' + '='.repeat(50));
};

// Exécuter le test
testLogin();
