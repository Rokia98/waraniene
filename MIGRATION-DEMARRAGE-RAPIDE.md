# 🎉 MIGRATION VERS LARAGON + MYSQL - DÉMARRAGE RAPIDE

## 📦 Ce qui a été préparé pour vous

J'ai créé tous les fichiers nécessaires pour migrer votre projet de **Supabase (PostgreSQL)** vers **Laragon (MySQL)**. Voici ce qui est prêt:

### ✅ Fichiers créés

| Fichier | Description |
|---------|-------------|
| `database/mysql-schema.sql` | **Schéma MySQL complet** avec toutes les 13 tables |
| `src/lib/mysql.ts` | **Configuration MySQL** - Pool de connexions et fonctions query/execute |
| `src/lib/auth.ts` | **Authentification JWT** - Remplacement de Supabase Auth |
| `src/services/productService.mysql.ts` | **Exemple de service** adapté pour MySQL |
| `src/app/api/test-mysql/route.ts` | **Endpoint de test** pour vérifier la connexion |
| `.env.mysql.example` | **Variables d'environnement** pour MySQL |
| `GUIDE-MIGRATION-MYSQL.md` | **Guide complet détaillé** (en français) |
| `MIGRATION-CHECKLIST.md` | **Checklist rapide** pour ne rien oublier |

---

## 🚀 DÉMARRAGE EN 5 ÉTAPES (15 minutes)

### ÉTAPE 1: Installer Laragon (5 min)

```
1. Télécharger Laragon: https://laragon.org/download/
2. Installer (version Full recommandée)
3. Lancer Laragon
4. Cliquer sur "Démarrer tout"
```

**Vérification:** L'icône Laragon devient verte ✅

---

### ÉTAPE 2: Installer mysql2 (1 min)

```bash
cd c:\Users\HP\Documents\waraniene
npm install mysql2
```

---

### ÉTAPE 3: Créer la base de données (3 min)

**Méthode simple (avec HeidiSQL):**

```
1. Dans Laragon, cliquer: Menu → Database → HeidiSQL
2. Cliquer: Fichier → Exécuter un fichier SQL
3. Sélectionner: database/mysql-schema.sql
4. Cliquer: Exécuter (▶)
5. Attendre "Succès"
```

**Vérification dans HeidiSQL:**
- Base de données: `waraniene_db` créée
- 13 tables visibles dans le panneau gauche
- 3 artisans, 4 produits, 3 codes promo insérés

---

### ÉTAPE 4: Configurer l'environnement (3 min)

```bash
# Copier le fichier modèle
copy .env.mysql.example .env.local
```

**Ouvrir `.env.local` et modifier:**

```env
# MySQL (laisser par défaut pour Laragon)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=waraniene_db

# JWT - IMPORTANT: Changer cette valeur!
JWT_SECRET=mon_super_secret_jwt_changez_moi_123456

# PayDunya - Mettre vos vraies clés
PAYDUNYA_MASTER_KEY=votre_vraie_cle
PAYDUNYA_PRIVATE_KEY=votre_vraie_cle
PAYDUNYA_PUBLIC_KEY=votre_vraie_cle
PAYDUNYA_TOKEN=votre_vrai_token
```

---

### ÉTAPE 5: Tester (3 min)

```bash
# Démarrer le serveur
npm run dev
```

**Ouvrir dans le navigateur:**
```
http://localhost:3000/api/test-mysql
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "Connexion MySQL réussie!",
  "stats": {
    "artisans": 3,
    "produits": 4,
    "codes_promo": 3
  }
}
```

✅ **Si vous voyez ça, la migration est fonctionnelle!**

---

## 📝 Prochaines étapes

Maintenant que MySQL fonctionne, vous devez adapter votre code existant:

### Fichiers à modifier

1. **Services** (`src/services/`)
   - Remplacer les appels `supabase.from('table').select()`
   - Par des appels `query('SELECT * FROM table WHERE ...')`
   - Voir `productService.mysql.ts` comme exemple

2. **Routes API** (`src/app/api/*/route.ts`)
   - Importer `{ query, execute }` de `@/lib/mysql`
   - Remplacer la logique Supabase

3. **Authentification**
   - Utiliser `src/lib/auth.ts` au lieu de Supabase Auth
   - Fonctions disponibles: `loginAcheteur()`, `registerAcheteur()`, `loginArtisan()`

4. **Images**
   - **Option A:** Stockage local dans `public/uploads/`
   - **Option B:** Garder Supabase Storage ou migrer vers Cloudinary

---

## 📖 Ressources

- **Guide complet:** [GUIDE-MIGRATION-MYSQL.md](./GUIDE-MIGRATION-MYSQL.md)
- **Checklist détaillée:** [MIGRATION-CHECKLIST.md](./MIGRATION-CHECKLIST.md)
- **Schéma SQL:** [database/mysql-schema.sql](./database/mysql-schema.sql)

---

## ⚠️ Points importants

### 1. UUID
```typescript
// Générer un UUID
import { generateUUID } from '@/lib/mysql';
const id = generateUUID();
```

### 2. Photos (JSON Array)
```typescript
// Sauvegarder
const photosJson = JSON.stringify(['image1.jpg', 'image2.jpg']);

// Lire
const photos = JSON.parse(row.photos);
```

### 3. Requêtes avec paramètres
```typescript
// TOUJOURS utiliser des paramètres (protection SQL injection)
await query('SELECT * FROM produits WHERE id = ?', [productId]);
```

### 4. Transactions (important pour commandes)
```typescript
import { transaction } from '@/lib/mysql';

await transaction(async (conn) => {
  // Déduire stock
  await conn.execute('UPDATE produits SET stock = stock - ? WHERE id = ?', [qty, id]);
  // Créer commande
  await conn.execute('INSERT INTO commandes ...', [...]);
});
```

---

## 🆘 Problèmes courants

### ❌ "Cannot connect to MySQL"
```bash
# Vérifier que Laragon est démarré
# Vérifier que MySQL est en vert dans Laragon
# Redémarrer MySQL: Laragon → MySQL → Redémarrer
```

### ❌ "Database 'waraniene_db' does not exist"
```bash
# Re-exécuter le script SQL
# Via HeidiSQL ou: mysql -u root < database/mysql-schema.sql
```

### ❌ "Module 'mysql2' not found"
```bash
npm install mysql2
```

### ❌ "JWT_SECRET not configured"
```bash
# Éditer .env.local
# Ajouter: JWT_SECRET=une_valeur_securisee
```

---

## ✅ Checklist de vérification

- [ ] Laragon installé et démarré
- [ ] MySQL en cours d'exécution (icône verte)
- [ ] Base de données `waraniene_db` créée
- [ ] 13 tables créées
- [ ] Données de test présentes (3 artisans, 4 produits)
- [ ] `npm install mysql2` exécuté
- [ ] `.env.local` configuré
- [ ] `npm run dev` démarre sans erreur
- [ ] `/api/test-mysql` retourne `success: true`

---

## 🎯 Résumé

**✅ FAIT:**
- Schéma MySQL créé et optimisé
- Configuration MySQL prête
- Système d'authentification JWT
- Exemples de services adaptés
- Guides complets en français

**📋 À FAIRE:**
- Adapter vos services existants
- Adapter vos routes API
- Gérer le stockage des images
- Tester toutes les fonctionnalités

**⏱️ Temps estimé pour compléter la migration:** 2-4 heures

---

## 💡 Conseil

Migrez **une fonctionnalité à la fois:**
1. Commencez par les produits (plus simple)
2. Puis les artisans
3. Puis l'authentification
4. Puis les commandes
5. Enfin les fonctionnalités avancées (wishlist, avis, etc.)

Testez après chaque étape! 🧪

---

**Bonne migration! 🚀**

Consultez le `GUIDE-MIGRATION-MYSQL.md` pour tous les détails techniques.
