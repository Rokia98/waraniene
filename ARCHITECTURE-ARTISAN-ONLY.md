# Architecture Refactorisée - Artisans Uniquement

## 🎯 Vue d'ensemble

L'architecture a été simplifiée pour se concentrer sur **les artisans uniquement** :

### ✅ Avant (Architecture double-table)
- Table `acheteurs` pour auth
- Table `artisans` pour profils
- Artisans et acheteurs se connectaient
- Système complexe à 2 tables

### ✅ Après (Architecture artisan-only)
- **Une seule table** : `artisans` avec email/password
- **Connexion** : Seulement les artisans
- **Acheteurs** : Achètent sans compte (checkout anonyme)
- **Dashboard** : Accessible uniquement aux artisans connectés

---

## 📋 Modifications apportées

### 1. Base de données (`database/migration-artisan-auth.sql`)

```sql
-- Ajout colonnes auth à table artisans
ALTER TABLE artisans 
ADD COLUMN email VARCHAR(255) UNIQUE,
ADD COLUMN mot_de_passe VARCHAR(255);

-- Commandes avec infos acheteur directes (checkout anonyme)
ALTER TABLE commandes 
ALTER COLUMN acheteur_id DROP NOT NULL,
ADD COLUMN nom_acheteur VARCHAR(255),
ADD COLUMN email_acheteur VARCHAR(255),
ADD COLUMN telephone_acheteur VARCHAR(20);
```

**⚠️ À EXÉCUTER** : Connectez-vous à Supabase et exécutez ce fichier SQL

### 2. API d'authentification

#### `/api/auth/register` 
- ✅ Inscription **artisan uniquement**
- ✅ Champs requis : `nom`, `email`, `mot_de_passe`, `telephone`
- ✅ Champs optionnels : `bio`, `localisation`
- ✅ Création directe dans table `artisans`

#### `/api/auth/login`
- ✅ Connexion artisan par `email`
- ✅ Vérification mot de passe hashé
- ✅ Token JWT avec `type_utilisateur: 'artisan'`
- ✅ Redirection automatique vers `/artisan/dashboard`

### 3. Middleware (`src/middleware.ts`)

```typescript
// ✅ Si artisan connecté accède à /, /produits, /panier
→ Redirection automatique vers /artisan/dashboard

// ✅ Si non-connecté accède à /artisan/dashboard
→ Redirection vers /auth
```

**Logique** :
- Artisans connectés → **Bloqués** de la plateforme publique
- Artisans connectés → **Accès uniquement** au dashboard
- Visiteurs anonymes → **Libre accès** à la boutique

### 4. Header (`src/components/Header.tsx`)

#### Avant :
- 💔 "Mon Dashboard" pour acheteurs
- 💔 Wishlist / Favoris
- 💔 Menu compliqué

#### Après :
- ✅ Icône **personne** uniquement
- ✅ Connexion artisan au clic
- ✅ Si connecté : Menu avec "Mon Dashboard" + "Déconnexion"
- ✅ Panier visible pour tous (acheteurs anonymes)

### 5. Page Auth (`src/app/auth/page.tsx`)

#### Mode Connexion :
- Email artisan
- Mot de passe
- "Se souvenir de moi"

#### Mode Inscription :
- Nom complet
- Email (unique)
- Mot de passe + Confirmation
- Téléphone (**obligatoire**, unique)
- Localisation (optionnel)
- Biographie (optionnel)

**Flux** :
1. Inscription → Connexion automatique → Redirection dashboard
2. Connexion → Redirection dashboard

---

## 🛒 Checkout Anonyme (À implémenter)

Les acheteurs achètent **sans créer de compte** :

```typescript
// Formulaire checkout
interface CheckoutForm {
  nom_acheteur: string;
  email_acheteur: string;
  telephone_acheteur: string;
  adresse_livraison: string;
  mode_paiement: 'orange_money' | 'mtn_money' | 'carte_bancaire';
}

// Commande créée avec
{
  acheteur_id: null,  // Pas de compte
  nom_acheteur: "Jean Dupont",
  email_acheteur: "jean@example.com",
  telephone_acheteur: "+225...",
  adresse_livraison: "...",
  // ... autres champs
}
```

---

## 🎨 Dashboard Artisan

Accessible après connexion à `/artisan/dashboard` :

### Fonctionnalités actuelles :
- ✅ Vue d'ensemble statistiques
- ✅ Liste des produits
- ✅ Commandes récentes
- ✅ Profil artisan

### À compléter :
- [ ] Ajout/Édition produits
- [ ] Gestion stock
- [ ] Suivi détaillé des ventes
- [ ] Graphiques statistiques
- [ ] Gestion des photos produits

---

## 🧪 Tests à effectuer

1. **Migration BDD** :
   ```bash
   # Dans Supabase SQL Editor
   # Exécuter : database/migration-artisan-auth.sql
   ```

2. **Test Inscription Artisan** :
   - Aller sur `/auth`
   - Mode "Inscription"
   - Remplir tous les champs
   - Vérifier connexion auto + redirection dashboard

3. **Test Connexion** :
   - Se déconnecter
   - Aller sur `/auth`
   - Mode "Connexion"
   - Vérifier redirection dashboard

4. **Test Middleware** :
   - Connecté comme artisan
   - Essayer d'accéder à `/` ou `/produits`
   - Doit rediriger vers `/artisan/dashboard`

5. **Test Checkout Anonyme** (après implémentation) :
   - Non connecté
   - Ajouter produit au panier
   - Aller au checkout
   - Remplir infos sans compte
   - Valider commande

---

## 📊 Structure des données

### Table `artisans` (mise à jour)
```sql
CREATE TABLE artisans (
  id UUID PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,          -- ✅ NOUVEAU
  mot_de_passe VARCHAR(255),          -- ✅ NOUVEAU
  photo TEXT,
  bio TEXT NOT NULL,
  localisation VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL UNIQUE,
  langue VARCHAR(10) DEFAULT 'fr',
  statut VARCHAR(20) DEFAULT 'actif',
  date_inscription DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `commandes` (mise à jour)
```sql
CREATE TABLE commandes (
  id UUID PRIMARY KEY,
  acheteur_id UUID,                    -- ✅ Maintenant NULL
  nom_acheteur VARCHAR(255),           -- ✅ NOUVEAU
  email_acheteur VARCHAR(255),         -- ✅ NOUVEAU
  telephone_acheteur VARCHAR(20),      -- ✅ NOUVEAU
  date_commande TIMESTAMP DEFAULT NOW(),
  statut VARCHAR(20),
  montant_total DECIMAL(10,2),
  mode_paiement VARCHAR(20),
  adresse_livraison TEXT,
  notes_admin TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Prochaines étapes

1. ✅ **Exécuter la migration SQL** dans Supabase
2. ✅ **Tester l'inscription et connexion** artisan
3. 🔜 **Implémenter le checkout anonyme**
4. 🔜 **Compléter le dashboard artisan**
5. 🔜 **Ajouter gestion des photos produits**

---

## 💡 Avantages de cette architecture

✅ **Simplicité** : Une seule table pour l'authentification  
✅ **Séparation claire** : Artisans (dashboard) vs Acheteurs (boutique)  
✅ **Expérience fluide** : Acheteurs sans friction (pas de compte requis)  
✅ **Sécurité** : Artisans ont accès protégé à leur espace  
✅ **Évolutivité** : Plus facile à maintenir et étendre  

---

## 📝 Notes importantes

- ⚠️ Table `acheteurs` reste en BDD mais n'est plus utilisée
- ⚠️ Les anciennes données acheteurs/artisans ne sont pas migrées automatiquement
- ⚠️ Si vous avez des données existantes, créer un script de migration séparé
- ✅ Nouveaux artisans s'inscrivent directement dans table `artisans`
