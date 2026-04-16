/**
 * Script pour créer la base de données MySQL
 * Exécuter avec: node create-database.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement manuellement
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

async function createDatabase() {
  console.log('🚀 Démarrage de la création de la base de données...\n');

  try {
    // Connexion à MySQL (sans spécifier de base de données)
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      multipleStatements: true,
    });

    console.log('✅ Connexion à MySQL réussie!');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'database', 'mysql-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('\n📄 Exécution du script SQL...');

    // Exécuter le script SQL
    await connection.query(sql);

    console.log('✅ Base de données créée avec succès!');

    // Vérifier les données
    await connection.query('USE waraniene_db');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📊 Tables créées: ${tables.length}`);
    tables.forEach((table) => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    const [artisans] = await connection.query('SELECT COUNT(*) as count FROM artisans');
    const [produits] = await connection.query('SELECT COUNT(*) as count FROM produits');
    const [codes] = await connection.query('SELECT COUNT(*) as count FROM codes_promo');

    console.log(`\n📈 Données de test insérées:`);
    console.log(`  - Artisans: ${artisans[0].count}`);
    console.log(`  - Produits: ${produits[0].count}`);
    console.log(`  - Codes promo: ${codes[0].count}`);

    await connection.end();

    console.log('\n🎉 Migration terminée avec succès!');
    console.log('\n📝 Prochaines étapes:');
    console.log('  1. Démarrer le serveur: npm run dev');
    console.log('  2. Tester la connexion: http://localhost:3000/api/test-mysql');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  MySQL n\'est pas démarré!');
      console.error('   → Ouvrez Laragon et cliquez sur "Démarrer tout"');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Accès refusé à MySQL!');
      console.error('   → Vérifiez MYSQL_USER et MYSQL_PASSWORD dans .env.local');
    }
    
    process.exit(1);
  }
}

createDatabase();
