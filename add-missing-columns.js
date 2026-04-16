/**
 * Script pour ajouter les colonnes manquantes à la table artisans
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
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

async function addMissingColumns() {
  console.log('🔧 Ajout des colonnes manquantes à la table artisans...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'waraniene_db',
    });

    console.log('✅ Connexion à MySQL réussie!');

    // Vérifier les colonnes existantes
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'artisans'
    `, [process.env.MYSQL_DATABASE || 'waraniene_db']);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('\n📋 Colonnes existantes:', existingColumns.join(', '));

    // Ajouter email si manquant
    if (!existingColumns.includes('email')) {
      console.log('\n➕ Ajout de la colonne "email"...');
      await connection.query(`
        ALTER TABLE artisans 
        ADD COLUMN email VARCHAR(255) UNIQUE AFTER nom
      `);
      console.log('✅ Colonne "email" ajoutée');
    } else {
      console.log('\n✓ Colonne "email" déjà présente');
    }

    // Ajouter password si manquant
    if (!existingColumns.includes('password')) {
      console.log('\n➕ Ajout de la colonne "password"...');
      await connection.query(`
        ALTER TABLE artisans 
        ADD COLUMN password VARCHAR(255) AFTER email
      `);
      console.log('✅ Colonne "password" ajoutée');
    } else {
      console.log('\n✓ Colonne "password" déjà présente');
    }

    // Créer index sur email
    const [indexes] = await connection.query(`
      SHOW INDEX FROM artisans WHERE Column_name = 'email'
    `);
    
    if (indexes.length === 0) {
      console.log('\n➕ Création de l\'index sur "email"...');
      await connection.query(`
        CREATE INDEX idx_artisans_email ON artisans(email)
      `);
      console.log('✅ Index créé');
    }

    // Afficher la structure finale
    const [finalColumns] = await connection.query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        COLUMN_KEY,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'artisans'
      ORDER BY ORDINAL_POSITION
    `, [process.env.MYSQL_DATABASE || 'waraniene_db']);

    console.log('\n📊 Structure finale de la table artisans:');
    console.table(finalColumns);

    await connection.end();

    console.log('\n🎉 Migration terminée avec succès!');
    console.log('\n📝 Prochaine étape: Redémarrer le serveur (npm run dev)');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

addMissingColumns();
