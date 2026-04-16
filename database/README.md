# Base de Données - Tissés de Waraniéné

## 📊 **Structure des Tables**

### 🎨 **artisans**
- Profils des artisans tisserands
- **Colonnes clés** : `nom`, `bio`, `localisation`, `telephone`, `statut`, `photo`
- **Statuts** : `actif`, `inactif`, `suspendu`

### 🛍️ **produits** 
- Catalogue des articles (pagnes, vêtements, accessoires)
- **Colonnes clés** : `nom_produit`, `description`, `categorie`, `prix`, `stock`, `statut`
- **Catégories** : `pagne`, `vetement`, `accessoire`
- **Statuts** : `actif`, `inactif`, `rupture`

### 👥 **acheteurs**
- Comptes clients avec authentification
- **Colonnes clés** : `nom`, `prenom`, `email`, `mot_de_passe`, `telephone`, `adresse`
- Mots de passe hashés avec bcrypt

### 📦 **commandes**
- Historique des commandes clients  
- **Statuts** : `en_attente` → `confirmee` → `preparee` → `expediee` → `livree` / `annulee`
- **Paiements** : `orange_money`, `mtn_money`, `carte_bancaire`

### 📋 **detail_commandes**
- Détails des articles par commande
- Liaison `commandes` ↔ `produits` avec quantités et prix

### 🛒 **panier**
- Panier d'achat normalisé (une ligne par produit)
- Contrainte unique : un produit par acheteur
- Auto-synchronisation avec localStorage

### 🔧 **Autres tables**
- **qr_codes** : Codes QR pour partage produits
- **admins** : Comptes administrateurs

---

## 🚀 **Installation**

### 1. **Nouvelle base de données**
```sql
-- Exécuter dans Supabase SQL Editor
\i schema.sql
\i storage-setup.sql
```

### 2. **Migration d'une base existante**
```sql
-- Exécuter dans Supabase SQL Editor
\i migration.sql
\i storage-setup.sql
```

---

## 🔐 **Sécurité**

### **Row Level Security (RLS)**
- ✅ Activé sur toutes les tables
- 🔑 Policies configurées pour `service_role`
- 📖 Lecture publique : `artisans`, `produits`, `qr_codes`

### **Authentification**
- 🔒 JWT custom (non Supabase Auth)
- 🛡️ Mots de passe hashés bcrypt
- 🔑 APIs protégées par middleware

### **Storage**
- 📁 Bucket `images` public en lecture
- 📤 Upload restreint aux dossiers : `produits/`, `artisans/`, `general/`
- 🗂️ Limite : 5MB par fichier
- 🎨 Formats : JPEG, PNG, WebP, GIF

---

## 📈 **Optimisations**

### **Index de performance**
```sql
-- Recherches fréquentes
idx_produits_artisan_id, idx_produits_categorie, idx_produits_statut
idx_commandes_acheteur_id, idx_commandes_statut  
idx_panier_acheteur_id, idx_panier_produit_id
idx_acheteurs_email
```

### **Triggers automatiques**
- `updated_at` mis à jour automatiquement
- Contraintes d'intégrité strictes
- Validation des statuts et prix

---

## 🔄 **Relations**

```
artisans (1) ←→ (N) produits
acheteurs (1) ←→ (N) commandes  
acheteurs (1) ←→ (N) panier
commandes (1) ←→ (N) detail_commandes ←→ (1) produits
produits (1) ←→ (N) qr_codes
```

---

## 📊 **Données de Test**

Le schéma inclut des données d'exemple :
- 3 artisans actifs de Waraniéné
- 4 produits dans différentes catégories
- Prêt pour les tests d'intégration

---

## 🛠️ **Utilisation avec APIs**

Toutes les APIs Next.js sont configurées pour :
- ✅ Authentification JWT
- ✅ Validation des données  
- ✅ Gestion des erreurs
- ✅ Pagination et filtrage
- ✅ Upload d'images
- ✅ Synchronisation panier

---

## 🔍 **Maintenance**

### Requêtes utiles :
```sql
-- Statistiques produits
SELECT statut, COUNT(*) FROM produits GROUP BY statut;

-- Commandes récentes  
SELECT * FROM commandes WHERE date_commande >= NOW() - INTERVAL '30 days';

-- Stock faible
SELECT nom_produit, stock FROM produits WHERE stock < 5 AND statut = 'actif';

-- Paniers abandonnés
SELECT COUNT(DISTINCT acheteur_id) FROM panier 
WHERE date_ajout < NOW() - INTERVAL '7 days';
```