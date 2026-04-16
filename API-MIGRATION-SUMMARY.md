# Résumé de Migration des API - MySQL/Supabase Hybride

## 📅 Date: 26 Mars 2026

## ✅ API Migrées vers le Système Hybride

Toutes les API suivantes ont été adaptées pour utiliser le système de base de données hybride (`src/lib/db.ts`) qui supporte à la fois MySQL (Laragon) et Supabase selon la variable d'environnement `DB_TYPE`.

### 1. API Artisans ✅

#### `src/app/api/artisans/route.ts`
- **GET**: Liste des artisans avec pagination, recherche et tri
  - Remplacé `supabaseAdmin.from('artisans').select()` par `db.select()`
  - Ajouté comptage de produits par artisan en mémoire
- **POST**: Création d'artisan
  - Vérification d'unicité du téléphone avec `db.select()`
  - Insertion avec `db.insert()`

#### `src/app/api/artisans/[id]/route.ts`
- **GET**: Détails d'un artisan avec ses produits et statistiques
  - Récupération artisan + produits avec `db.select()`
  - Calcul des stats (ventes, commandes) avec requêtes multiples
- **PUT**: Mise à jour d'un artisan
  - Vérification existence avec `db.select()`
  - Mise à jour avec `db.update()`
- **DELETE**: Suppression d'un artisan
  - Vérification absence de produits liés
  - Suppression avec `db.delete()`

---

### 2. API Produits ✅

#### `src/app/api/produits/route.ts`
- **GET**: Liste des produits avec filtres avancés
  - Filtrage par catégorie, artisan, prix
  - Recherche textuelle (nom, description)
  - Enrichissement avec données artisan via `db.select()`
  - Pagination côté application
- **POST**: Création de produit
  - Vérification existence artisan
  - Insertion avec conversion photos en JSON

#### `src/app/api/produits/[id]/route.ts`
- **GET**: Détails d'un produit avec info artisan
  - Récupération produit + artisan avec requêtes séparées
- **PUT**: Mise à jour de produit
  - Mise à jour avec `db.update()`
  - Gestion JSON pour photos
- **DELETE**: Suppression logique (statut → 'inactif')
  - Utilise `db.update()` au lieu de suppression physique

---

### 3. API Panier ✅

#### `src/app/api/panier/route.ts`
- **GET**: Récupération du panier utilisateur
  - Authentification via `requireAuth()`
  - Enrichissement avec produits et artisans
  - Calcul du total côté application
- **POST**: Ajout au panier
  - Vérification stock et disponibilité produit
  - Mise à jour quantité si existant
  - Insertion nouvel item sinon
- **DELETE**: Vidage du panier
  - Suppression de tous les items utilisateur

---

### 4. API Wishlist ✅

#### `src/app/api/wishlist/route.ts`
- **GET**: Liste des favoris ou vérification item
  - Support recherche par `produit_id` (query param)
  - Authentification via `requireAuth()` (plus cohérent)
- **POST**: Ajout aux favoris
  - Vérification doublon
  - Insertion avec date_ajout
- **DELETE**: Retrait des favoris
  - Recherche + suppression par ID

---

### 5. API Codes Promo ✅

#### `src/app/api/codes-promo/route.ts`
- **GET**: Liste des codes promos actifs
  - Filtrage par dates (date_debut/date_fin) côté application
  - Pagination manuelle
- **POST**: Validation d'un code promo
  - Vérification validité, dates, utilisations
  - Retourne réduction et conditions

---

## 🔧 Modifications Techniques Clés

### 1. Imports
```typescript
// Avant
import { supabaseAdmin } from '@/lib/supabase';

// Après
import { db } from '@/lib/db';
```

### 2. Requêtes SELECT
```typescript
// Avant
const { data, error } = await supabaseAdmin
  .from('artisans')
  .select('*')
  .eq('id', id)
  .single();

// Après
const artisans = await db.select('artisans', {
  where: { id },
  limit: 1
});
const artisan = artisans && artisans.length > 0 ? artisans[0] : null;
```

### 3. Requêtes INSERT
```typescript
// Avant
const { data, error } = await supabaseAdmin
  .from('artisans')
  .insert({ nom, bio })
  .select()
  .single();

// Après
const newArtisan = await db.insert('artisans', {
  nom,
  bio
});
```

### 4. Requêtes UPDATE
```typescript
// Avant
const { data, error } = await supabaseAdmin
  .from('artisans')
  .update({ nom })
  .eq('id', id)
  .select()
  .single();

// Après
const updated = await db.update('artisans', id, {
  nom
});
```

### 5. Requêtes DELETE
```typescript
// Avant
const { error } = await supabaseAdmin
  .from('artisans')
  .delete()
  .eq('id', id);

// Après
const deleted = await db.delete('artisans', id);
```

### 6. Gestion des Tableaux/JSON
```typescript
// Les tableaux sont stockés en JSON dans MySQL
photos: typeof photos === 'string' ? photos : JSON.stringify(photos)
```

---

## 🔍 Points d'Attention

### Limitations du Système db.ts
Le système `db.select()` actuel ne supporte pas :
- Opérateurs de comparaison: `gte`, `lte`, `gt`, `lt`
- Recherche ILIKE/pattern matching direct
- Jointures (relations)
- COUNT avec conditions

### Solutions Appliquées
1. **Filtrage avancé**: Fait côté application après récupération
2. **Jointures**: Requêtes multiples puis enrichissement
3. **Recherche texte**: Filter sur résultats avec `.includes()`
4. **Pagination**: Calculée manuellement avec `.slice()`

---

## 📊 API Restantes à Migrer

Les API suivantes utilisent encore Supabase directement :

### Priorité Moyenne
- `src/app/api/commandes/route.ts` (GET, POST)
- `src/app/api/commandes/[id]/route.ts` (GET, PUT, DELETE)
- `src/app/api/acheteurs/route.ts` (GET, POST)
- `src/app/api/acheteurs/[id]/route.ts` (GET, PUT, DELETE)

### Priorité Basse
- `src/app/api/artisan/commandes/[id]/route.ts`
- `src/app/api/artisan/stats/route.ts`
- `src/app/api/preferences-notifications/route.ts`
- `src/app/api/produits/[id]/avis/route.ts`
- `src/app/api/produits/upload-image/route.ts`

---

## 🧪 Tests Recommandés

Pour chaque API migrée, tester :

### 1. Mode MySQL (DB_TYPE=mysql)
```bash
# Dans .env.local
DB_TYPE=mysql
```

Tester toutes les routes :
- GET /api/artisans
- POST /api/artisans
- GET /api/artisans/[id]
- PUT /api/artisans/[id]
- DELETE /api/artisans/[id]
- (idem pour produits, panier, wishlist, codes-promo)

### 2. Mode Supabase (DB_TYPE=supabase)
```bash
# Dans .env.local
DB_TYPE=supabase
```

Retester les mêmes routes pour s'assurer de la compatibilité.

### 3. Tests Spécifiques
- **Pagination**: Vérifier has_next/has_prev
- **Filtres**: Catégories, prix, recherche
- **Authentification**: Routes protégées (panier, wishlist)
- **Validation**: Contraintes (unicité téléphone, stock)
- **Relations**: Données artisan dans produits

---

## 📝 Prochaines Étapes

1. ✅ Redémarrer le serveur Next.js
2. 🔄 Tester l'API auth/register avec MySQL
3. 🔄 Tester les API artisans avec MySQL
4. 🔄 Tester les API produits avec MySQL
5. 🔄 Tester les API panier/wishlist avec MySQL
6. 📋 Migrer les API commandes et acheteurs
7. 📋 Documenter les différences MySQL vs Supabase
8. 📋 Créer des tests automatisés

---

## 🎯 Avantages du Système Hybride

✅ **Flexibilité**: Bascule entre MySQL et Supabase sans changer le code
✅ **Développement local**: MySQL via Laragon (rapide, pas de quota)
✅ **Production**: Supabase Cloud (scalable, backups auto)
✅ **Migration progressive**: Adapter API par API
✅ **Fallback**: Toujours un système de backup disponible

---

## 📌 Configuration Requise

### Variables d'Environnement (.env.local)
```env
# Choisir le backend
DB_TYPE=mysql

# MySQL (Laragon)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=waraniene_db

# Supabase (backup)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Auth
JWT_SECRET=your-secret-key
```

---

## 🚀 Utilisation

### Basculer vers MySQL
```bash
# Dans .env.local
DB_TYPE=mysql
```

### Basculer vers Supabase
```bash
# Dans .env.local
DB_TYPE=supabase
```

### Vérifier la connexion
```bash
GET http://localhost:3000/api/test-mysql
```

---

**Migration effectuée par**: GitHub Copilot  
**Date**: 26 Mars 2026  
**Statut**: ✅ API Principales Migrées
