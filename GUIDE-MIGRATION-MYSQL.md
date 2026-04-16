# 🔄 GUIDE DE MIGRATION VERS LARAGON + MYSQL

## Vue d'ensemble

Ce guide vous accompagne dans la migration du projet **Tissés de Waraniéné** de **Supabase (PostgreSQL)** vers **Laragon (MySQL)**.

---

## 📋 Prérequis

### 1. Installer Laragon
- Télécharger Laragon depuis: https://laragon.org/download/
- Installer Laragon (Full version recommandée)
- Laragon inclut: Apache, MySQL, PHP, Node.js

### 2. Vérifier l'installation
```bash
# Démarrer Laragon
# Cliquer sur "Démarrer tout" dans l'interface Laragon

# Vérifier MySQL
# Ouvrir HeidiSQL (inclus dans Laragon) ou phpMyAdmin
# Connexion par défaut: localhost:3306, user: root, password: (vide)
```

---

## 🚀 ÉTAPES DE MIGRATION

### ÉTAPE 1: Installer les dépendances MySQL

```bash
cd c:\Users\HP\Documents\waraniene
npm install mysql2
```

### ÉTAPE 2: Créer la base de données MySQL

**Option A: Via HeidiSQL (Interface graphique)**
1. Ouvrir HeidiSQL depuis Laragon
2. Cliquer sur "Fichier" → "Exécuter un fichier SQL"
3. Sélectionner: `database/mysql-schema.sql`
4. Cliquer sur "Exécuter"

**Option B: Via ligne de commande**
```bash
# Depuis Laragon, ouvrir le terminal MySQL
# Menu Laragon → MySQL → MySQL CLI

# Ou utiliser la commande:
mysql -u root -p < database/mysql-schema.sql
# (Appuyer sur Entrée si pas de mot de passe)
```

**Vérification:**
```sql
USE waraniene_db;
SHOW TABLES;
-- Vous devriez voir 13 tables
```

### ÉTAPE 3: Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
copy .env.mysql.example .env.local

# Éditer .env.local et remplir les valeurs
```

**Variables importantes:**
```env
# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=waraniene_db

# JWT
JWT_SECRET=changez_moi_par_une_valeur_securisee

# PayDunya (vos vraies clés)
PAYDUNYA_MASTER_KEY=...
PAYDUNYA_PRIVATE_KEY=...
PAYDUNYA_PUBLIC_KEY=...
PAYDUNYA_TOKEN=...
```

### ÉTAPE 4: Modifier package.json (ajouter mysql2)

Le fichier `package.json` doit maintenant inclure:

```json
{
  "dependencies": {
    "mysql2": "^3.6.5",
    ...autres dépendances existantes
  }
}
```

### ÉTAPE 5: Adapter les services et APIs

Les fichiers suivants doivent être mis à jour pour utiliser MySQL au lieu de Supabase:

#### Fichiers à modifier:

**1. Services principaux:**
- `src/services/artisanService.ts`
- `src/services/productService.ts`
- `src/services/orderService.ts`
- `src/services/authService.ts`

**2. Routes API:**
- `src/app/api/*/route.ts` (tous les fichiers route.ts)

**Exemple de conversion:**

**AVANT (Supabase):**
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('produits')
  .select('*')
  .eq('statut', 'actif');
```

**APRÈS (MySQL):**
```typescript
import { query } from '@/lib/mysql';

const produits = await query(
  'SELECT * FROM produits WHERE statut = ?',
  ['actif']
);
```

### ÉTAPE 6: Gérer le stockage des images

**Option A: Stockage local (recommandé pour Laragon)**

Créer le dossier uploads:
```bash
mkdir public\uploads
mkdir public\uploads\artisans
mkdir public\uploads\produits
```

Modifier `src/lib/imageUtils.ts`:
```typescript
// Remplacer upload Supabase Storage par système de fichiers local
import fs from 'fs/promises';
import path from 'path';

export async function uploadImage(file: File, folder: 'artisans' | 'produits') {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);
  
  return `/uploads/${folder}/${filename}`;
}
```

**Option B: Utiliser un service cloud (Cloudinary, AWS S3)**

### ÉTAPE 7: Adapter l'authentification

**Remplacer Supabase Auth par JWT custom + sessions MySQL**

Créer la table sessions:
```sql
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  acheteur_id CHAR(36),
  artisan_id CHAR(36),
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_token (token(255))
) ENGINE=InnoDB;
```

Créer `src/lib/auth.ts`:
```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, execute } from './mysql';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, role: 'acheteur' | 'artisan'): string {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch {
    return null;
  }
}
```

### ÉTAPE 8: Tester la migration

**1. Démarrer le serveur de développement:**
```bash
npm run dev
```

**2. Tester les fonctionnalités:**
- ✅ Page d'accueil: http://localhost:3000
- ✅ Liste produits: http://localhost:3000/produits
- ✅ Liste artisans: http://localhost:3000/artisans
- ✅ Panier
- ✅ Checkout
- ✅ Authentication

**3. Vérifier la connexion MySQL:**
Créer un endpoint de test `src/app/api/test-db/route.ts`:
```typescript
import { checkConnection, query } from '@/lib/mysql';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'MySQL non connecté' }, { status: 500 });
    }

    const artisans = await query('SELECT COUNT(*) as count FROM artisans');
    const produits = await query('SELECT COUNT(*) as count FROM produits');

    return NextResponse.json({
      status: 'OK',
      database: 'waraniene_db',
      artisans: artisans[0].count,
      produits: produits[0].count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Tester: http://localhost:3000/api/test-db

---

## 📂 Nouveaux fichiers créés

```
waraniene/
├── database/
│   └── mysql-schema.sql           # Schéma MySQL complet
├── src/
│   └── lib/
│       ├── mysql.ts               # Configuration MySQL
│       └── auth.ts                # Authentification JWT (nouveau)
├── .env.mysql.example             # Variables d'environnement MySQL
└── GUIDE-MIGRATION-MYSQL.md       # Ce guide
```

---

## ⚠️ Points d'attention

### 1. **UUID vs AUTO_INCREMENT**
MySQL utilise `CHAR(36)` pour les UUID au lieu des UUID natifs PostgreSQL.

### 2. **JSON Arrays**
PostgreSQL: `TEXT[]` → MySQL: `JSON`

**Conversion:**
```typescript
// PostgreSQL array
photos: ['image1.jpg', 'image2.jpg']

// MySQL JSON
photos: JSON.stringify(['image1.jpg', 'image2.jpg'])
```

### 3. **ENUM vs CHECK**
MySQL supporte ENUM nativement, simplifiant les contraintes.

### 4. **Timestamps**
MySQL: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
PostgreSQL: Nécessitait des triggers

### 5. **Row Level Security (RLS)**
MySQL n'a pas de RLS natif. Gérer la sécurité dans l'application:
```typescript
// Vérifier les permissions dans chaque endpoint API
if (user.role !== 'admin') {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
}
```

---

## 🔧 Commandes utiles Laragon

```bash
# Démarrer tous les services
# Via interface Laragon: Clic droit → Démarrer tout

# Accéder à MySQL CLI
# Menu Laragon → MySQL → MySQL-CLI

# Ouvrir HeidiSQL
# Menu Laragon → Database → HeidiSQL

# Redémarrer MySQL
# Clic droit sur Laragon → MySQL → Redémarrer

# Voir les logs MySQL
# C:\laragon\data\mysql-8.0.30\data\*.err
```

---

## 📊 Vérification post-migration

**Checklist:**
- [ ] MySQL démarre sans erreur
- [ ] Base de données `waraniene_db` créée
- [ ] 13 tables créées
- [ ] Données de test insérées (3 artisans, 4 produits, 3 codes promo)
- [ ] Serveur Next.js démarre: `npm run dev`
- [ ] Endpoint `/api/test-db` fonctionne
- [ ] Page d'accueil charge les produits
- [ ] Images des produits visibles
- [ ] Panier fonctionne
- [ ] Authentification fonctionne

---

## 🆘 Dépannage

### Erreur: "Cannot connect to MySQL"
```bash
# Vérifier que MySQL est démarré dans Laragon
# Vérifier .env.local: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
```

### Erreur: "Database does not exist"
```bash
# Exécuter à nouveau le script SQL
mysql -u root < database/mysql-schema.sql
```

### Erreur: "Module 'mysql2' not found"
```bash
npm install mysql2
```

### Les images ne s'affichent pas
```bash
# Créer les dossiers uploads
mkdir public\uploads\artisans
mkdir public\uploads\produits

# Copier les images existantes si nécessaire
```

---

## 📝 Prochaines étapes

1. **Migrer les données existantes** (si vous aviez des données dans Supabase)
2. **Adapter tous les services** pour utiliser MySQL
3. **Tester toutes les fonctionnalités**
4. **Optimiser les requêtes** avec les index MySQL
5. **Configurer les backups** MySQL automatiques
6. **Déploiement** sur un serveur de production

---

## 🎯 Avantages de MySQL + Laragon

✅ **Performance locale**: MySQL sur Laragon est plus rapide que les appels API Supabase  
✅ **Développement offline**: Pas besoin de connexion Internet  
✅ **Contrôle total**: Base de données locale, backups faciles  
✅ **Coût zéro**: Pas d'abonnement Supabase nécessaire  
✅ **Simplicité**: Tout dans Laragon (Apache, MySQL, PHP)  
✅ **Compatibilité**: MySQL est supporté partout pour le déploiement  

---

**🎉 Vous êtes prêt pour la migration MySQL!**
