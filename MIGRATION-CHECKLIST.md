# 🔄 MIGRATION SUPABASE → MYSQL : CHECKLIST

## ✅ Fichiers créés

- [x] `database/mysql-schema.sql` - Schéma MySQL complet
- [x] `src/lib/mysql.ts` - Configuration et connexion MySQL
- [x] `src/lib/auth.ts` - Système d'authentification JWT
- [x] `src/services/productService.mysql.ts` - Service produits adapté
- [x] `src/app/api/test-mysql/route.ts` - Endpoint de test
- [x] `.env.mysql.example` - Variables d'environnement
- [x] `GUIDE-MIGRATION-MYSQL.md` - Guide complet

---

## 📝 Étapes à suivre

### 1. Installation Laragon ⏰ 5 minutes
```bash
# Télécharger: https://laragon.org/download/
# Installer Laragon Full
# Démarrer tous les services
```

### 2. Installer mysql2 ⏰ 1 minute
```bash
cd c:\Users\HP\Documents\waraniene
npm install mysql2
```

### 3. Créer la base de données ⏰ 2 minutes
```bash
# Option 1: HeidiSQL (interface graphique Laragon)
# Fichier → Exécuter un fichier SQL → Sélectionner database/mysql-schema.sql

# Option 2: Ligne de commande
mysql -u root < database/mysql-schema.sql
```

### 4. Configurer .env.local ⏰ 3 minutes
```bash
# Copier le fichier d'exemple
copy .env.mysql.example .env.local

# Éditer et remplir les valeurs (surtout JWT_SECRET et PayDunya)
```

### 5. Tester la connexion ⏰ 2 minutes
```bash
npm run dev
# Ouvrir: http://localhost:3000/api/test-mysql
# Devrait afficher: "success": true avec les stats
```

---

## 🔧 Services à adapter

### Services principaux (src/services/)
- [ ] `artisanService.ts` → Remplacer Supabase par MySQL
- [ ] `productService.ts` → Utiliser `productService.mysql.ts` comme modèle
- [ ] `orderService.ts` → Adapter les requêtes
- [ ] `cartService.ts` → Adapter les requêtes
- [ ] `authService.ts` → Utiliser `src/lib/auth.ts`

### Routes API (src/app/api/)
- [ ] `api/artisans/*` - Tous les endpoints artisans
- [ ] `api/produits/*` - Tous les endpoints produits
- [ ] `api/commandes/*` - Tous les endpoints commandes
- [ ] `api/auth/*` - Authentication endpoints
- [ ] `api/panier/*` - Panier endpoints
- [ ] `api/wishlist/*` - Wishlist endpoints
- [ ] `api/avis/*` - Reviews endpoints
- [ ] `api/codes-promo/*` - Promo codes endpoints

---

## 🖼️ Stockage des images

### Option 1: Stockage local (recommandé pour Laragon)
```bash
mkdir public\uploads
mkdir public\uploads\artisans
mkdir public\uploads\produits
```

Adapter `src/lib/imageUtils.ts`:
- Remplacer Supabase Storage par `fs.writeFile()`
- Retourner les URLs: `/uploads/artisans/...`

### Option 2: Service cloud (Cloudinary, AWS S3)
- Garder la logique d'upload existante
- Changer la destination de Supabase vers Cloudinary/S3

---

## ⚙️ Conversions importantes

### UUID
```typescript
// AVANT (PostgreSQL/Supabase)
uuid: UUID // Type natif

// APRÈS (MySQL)
id: string // CHAR(36)
import { generateUUID } from '@/lib/mysql';
const id = generateUUID();
```

### Arrays JSON
```typescript
// AVANT (PostgreSQL)
photos: TEXT[] // Array natif
photos: ['image1.jpg', 'image2.jpg']

// APRÈS (MySQL)
photos: JSON
photos: JSON.stringify(['image1.jpg', 'image2.jpg'])
// Lecture:
photos: JSON.parse(row.photos)
```

### Requêtes
```typescript
// AVANT (Supabase)
const { data } = await supabase
  .from('produits')
  .select('*, artisans(*)')
  .eq('statut', 'actif');

// APRÈS (MySQL)
const data = await query(
  `SELECT p.*, a.nom as artisan_nom
   FROM produits p
   LEFT JOIN artisans a ON p.artisan_id = a.id
   WHERE p.statut = ?`,
  ['actif']
);
```

### Authentification
```typescript
// AVANT (Supabase Auth)
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});

// APRÈS (JWT custom)
import { loginAcheteur } from '@/lib/auth';
const { success, token, user } = await loginAcheteur(email, password);
```

---

## 🧪 Tests à effectuer

- [ ] Page d'accueil charge les produits
- [ ] Liste des artisans s'affiche
- [ ] Détails d'un produit fonctionnent
- [ ] Ajout au panier fonctionne
- [ ] Checkout fonctionne
- [ ] Authentification acheteur
- [ ] Authentification artisan
- [ ] Dashboard artisan
- [ ] Dashboard admin
- [ ] Codes promo
- [ ] Wishlist
- [ ] Avis produits
- [ ] Notifications

---

## ⚠️ Points d'attention

1. **RLS (Row Level Security)**
   - MySQL n'a pas de RLS natif
   - Gérer la sécurité dans les endpoints API
   - Vérifier les permissions dans chaque route

2. **Transactions**
   - Utiliser la fonction `transaction()` de `mysql.ts`
   - Important pour les commandes (stock + création commande)

3. **Timestamps**
   - MySQL gère `updated_at` automatiquement avec `ON UPDATE CURRENT_TIMESTAMP`
   - Pas besoin de triggers

4. **Performance**
   - Index déjà créés dans le schéma MySQL
   - Utiliser EXPLAIN pour optimiser les requêtes lentes

5. **Backups**
   - Configurer des backups automatiques MySQL
   - Laragon: Menu → MySQL → Backup

---

## 📊 Vérification finale

```bash
# 1. Connexion MySQL OK
http://localhost:3000/api/test-mysql

# 2. Comptage des tables
USE waraniene_db;
SHOW TABLES; -- Devrait afficher 13 tables

# 3. Données de test présentes
SELECT COUNT(*) FROM artisans; -- 3
SELECT COUNT(*) FROM produits; -- 4
SELECT COUNT(*) FROM codes_promo; -- 3

# 4. Serveur Next.js démarre sans erreur
npm run dev

# 5. Pages principales chargent
http://localhost:3000
http://localhost:3000/produits
http://localhost:3000/artisans
```

---

## 🎯 Prochaines étapes après migration

1. **Optimisation**
   - Analyser les requêtes lentes avec EXPLAIN
   - Ajouter des index si nécessaire
   - Mettre en cache les requêtes fréquentes

2. **Déploiement**
   - Choisir un hébergeur supportant MySQL (Hostinger, DigitalOcean, etc.)
   - Configurer les variables d'environnement
   - Migrer les données de test vers production

3. **Monitoring**
   - Configurer des logs MySQL
   - Surveiller les performances
   - Mettre en place des alertes

---

## 📚 Ressources

- [Documentation MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/)
- [npm mysql2](https://www.npmjs.com/package/mysql2)
- [Laragon Documentation](https://laragon.org/docs/)
- [Guide migration PostgreSQL → MySQL](https://www.convert-in.com/mysql-to-postgres-types-mapping.htm)

---

**🚀 Vous êtes prêt! Suivez le GUIDE-MIGRATION-MYSQL.md pour les détails complets.**
