# 🔄 MODE HYBRIDE : MySQL (Laragon) + Supabase

## 🎯 Vue d'ensemble

Votre application supporte maintenant **DEUX bases de données** :
- **MySQL** (via Laragon) - Base de données locale
- **Supabase** (PostgreSQL cloud) - Base de données distante

Vous pouvez **basculer entre les deux** sans changer de code !

---

## ⚙️ Comment basculer ?

### Ouvrir `.env.local` et modifier :

```env
# Choisir le type de base de données
DB_TYPE=mysql      # ← Pour utiliser MySQL/Laragon
# OU
DB_TYPE=supabase   # ← Pour utiliser Supabase
```

**C'est tout !** Redémarrez `npm run dev` et l'application utilisera la base choisie.

---

## 🗄️ Comparaison des deux modes

| Critère | MySQL (Laragon) | Supabase |
|---------|-----------------|----------|
| **Localisation** | Local (votre PC) | Cloud (internet requis) |
| **Performance** | Très rapide | Dépend de la connexion |
| **Hors ligne** | ✅ Fonctionne | ❌ Nécessite internet |
| **Coût** | Gratuit | Gratuit (limite) puis payant |
| **Stockage images** | Local (`public/uploads/`) | Supabase Storage |
| **Backup** | Manuel | Automatique |
| **Collaboration** | Difficile | Facile (cloud partagé) |
| **Production** | Nécessite hébergement MySQL | Déjà hébergé |

---

## 📋 Configuration requise

### Pour MySQL (Laragon) :

```env
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=waraniene_db
```

**Prérequis :**
- Laragon installé et démarré
- Base de données créée (voir [MIGRATION-DEMARRAGE-RAPIDE.md](MIGRATION-DEMARRAGE-RAPIDE.md))

### Pour Supabase :

```env
DB_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

**Prérequis :**
- Compte Supabase créé
- Projet configuré avec les tables (voir schéma)

---

## 🧪 Tester les deux modes

### 1. Tester MySQL :

```env
# Dans .env.local
DB_TYPE=mysql
```

```bash
npm run dev
```

Ouvrir : http://localhost:3000/api/test-hybrid

**Résultat attendu :**
```json
{
  "success": true,
  "database_type": "mysql",
  "database_name": "waraniene_db"
}
```

### 2. Tester Supabase :

```env
# Dans .env.local
DB_TYPE=supabase
```

```bash
npm run dev
```

Ouvrir : http://localhost:3000/api/test-hybrid

**Résultat attendu :**
```json
{
  "success": true,
  "database_type": "supabase",
  "database_name": "Supabase Cloud"
}
```

---

## 💻 Utilisation dans le code

### Avec la couche d'abstraction (recommandé)

```typescript
import { db } from '@/lib/db';

// Même code pour MySQL ET Supabase !
const produits = await db.select('produits', {
  where: { statut: 'actif' },
  orderBy: { column: 'created_at', direction: 'desc' },
  limit: 10
});
```

### Avec détection du type de DB

```typescript
import { db, dbType, mysqlQuery } from '@/lib/db';

if (dbType === 'mysql') {
  // Code spécifique MySQL (requêtes complexes avec JOIN)
  const results = await mysqlQuery(`
    SELECT p.*, a.nom as artisan_nom
    FROM produits p
    JOIN artisans a ON p.artisan_id = a.id
  `);
} else {
  // Code spécifique Supabase (relations)
  const results = await db.select('produits', {
    columns: ['*, artisans(nom)']
  });
}
```

---

## 📚 Services hybrides créés

### 1. `src/lib/db.ts` - Couche d'abstraction
Interface unifiée pour les deux bases de données.

**Méthodes disponibles :**
- `db.select()` - SELECT
- `db.selectById()` - SELECT par ID
- `db.insert()` - INSERT
- `db.update()` - UPDATE
- `db.delete()` - DELETE
- `checkConnection()` - Test connexion
- `generateUUID()` - Générer UUID compatible

### 2. `src/services/productService.hybrid.ts` - Service produits hybride
Exemple complet d'un service qui fonctionne avec les deux DB.

**Fonctions :**
- `getActiveProducts()` - Liste produits actifs
- `getProductsByCategory()` - Filtrer par catégorie
- `getProductById()` - Détail produit
- `createProduct()` - Créer
- `updateProduct()` - Modifier
- `deleteProduct()` - Supprimer
- `searchProducts()` - Recherche

### 3. `src/app/api/test-hybrid/route.ts` - Endpoint de test
Teste automatiquement la base de données configurée.

---

## 🔀 Scénarios d'utilisation

### Développement local (MySQL recommandé)

```env
DB_TYPE=mysql
```

**Avantages :**
- ✅ Pas besoin d'internet
- ✅ Modifications rapides
- ✅ Tests sans limite
- ✅ Pas de coûts

### Tests avec données réelles (Supabase)

```env
DB_TYPE=supabase
```

**Avantages :**
- ✅ Données synchronisées
- ✅ Accessible de partout
- ✅ Collaboration équipe
- ✅ Backups automatiques

### Production

**Option A : MySQL hébergé**
- Hébergeur avec MySQL (Hostinger, DigitalOcean, etc.)
- Configuration : `DB_TYPE=mysql`

**Option B : Supabase**
- Directement sur Supabase
- Configuration : `DB_TYPE=supabase`

---

## 🚨 Points d'attention

### 1. Photos produits

**MySQL :**
- Stockage local : `public/uploads/artisans/`, `public/uploads/produits/`
- Photos enregistrées dans JSON : `["photo1.jpg", "photo2.jpg"]`

**Supabase :**
- Supabase Storage (cloud)
- URLs complètes stockées : `["https://...supabase.co/storage/v1/..."]`

### 2. UUID

**MySQL :**
- Type : `CHAR(36)`
- Génération : `generateUUID()` de `crypto`

**Supabase :**
- Type : `UUID` natif PostgreSQL
- Génération : Automatique par Supabase

### 3. Arrays (photos, etc.)

**MySQL :**
- Stockage : JSON string `JSON.stringify(array)`
- Lecture : `JSON.parse(string)`

**Supabase :**
- Type array natif PostgreSQL
- Pas de conversion nécessaire

### 4. Transactions

**MySQL :**
- ✅ Supportées via `transaction(callback)`

**Supabase :**
- ⚠️ Limitées (pas de transactions manuelles)
- Alternative : RPC functions

---

## 🔧 Migration de données

### De Supabase vers MySQL

```bash
# 1. Exporter depuis Supabase
# Dashboard Supabase → Database → Export

# 2. Adapter le SQL pour MySQL (voir mysql-schema.sql)

# 3. Importer dans MySQL
mysql -u root waraniene_db < export.sql
```

### De MySQL vers Supabase

```bash
# 1. Exporter MySQL
mysqldump -u root waraniene_db > export.sql

# 2. Adapter pour PostgreSQL (UUID, arrays, etc.)

# 3. Importer dans Supabase
# Dashboard Supabase → SQL Editor → Exécuter
```

---

## 📊 Monitoring

### Vérifier quelle DB est active

```bash
# Démarrer le serveur
npm run dev

# Regarder la console
# Vous verrez: "🗄️  Mode base de données: MYSQL" 
# ou: "🗄️  Mode base de données: SUPABASE"
```

### Endpoint de diagnostic

```
GET /api/test-hybrid
```

Retourne :
- Type de DB actif
- Statistiques (artisans, produits, commandes)
- Échantillon de données
- Configuration

---

## 🎓 Bonnes pratiques

### 1. Utiliser la couche d'abstraction

```typescript
// ✅ BON
import { db } from '@/lib/db';
const produits = await db.select('produits');

// ❌ ÉVITER
import { supabase } from '@/lib/supabase';
const { data } = await supabase.from('produits').select();
```

### 2. Gérer les spécificités

```typescript
import { dbType } from '@/lib/db';

// Code adapté selon la DB
const photos = dbType === 'mysql' 
  ? JSON.parse(produit.photos) 
  : produit.photos;
```

### 3. Tester les deux modes

Avant de déployer, testez avec `DB_TYPE=mysql` ET `DB_TYPE=supabase`

### 4. Documentation

Documentez dans votre code quel mode est recommandé pour chaque environnement.

---

## 🆘 Dépannage

### Erreur "DB_TYPE non défini"

```env
# Ajouter dans .env.local
DB_TYPE=mysql
```

### Erreur "Cannot connect to MySQL"

```bash
# Vérifier Laragon démarré
# Vérifier MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD
```

### Erreur "Supabase not configured"

```env
# Vérifier les clés Supabase dans .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Photos ne s'affichent pas

**MySQL :** Vérifier que `public/uploads/` existe  
**Supabase :** Vérifier Supabase Storage configuré et policies RLS

---

## 🎉 Conclusion

Vous avez maintenant **le meilleur des deux mondes** :

- 🏠 **Développement local rapide** avec MySQL
- ☁️ **Production cloud robuste** avec Supabase
- 🔄 **Bascule en 1 ligne** de configuration
- 📦 **Code unique** pour les deux

**Recommandation :**
- **En développement :** `DB_TYPE=mysql` (rapide, hors ligne)
- **En production :** `DB_TYPE=supabase` (scalable, managé)

---

**Besoin d'aide ?** Consultez :
- [GUIDE-MIGRATION-MYSQL.md](GUIDE-MIGRATION-MYSQL.md) - Guide MySQL complet
- [MIGRATION-CHECKLIST.md](MIGRATION-CHECKLIST.md) - Checklist migration
- [README.md](README.md) - Documentation générale
