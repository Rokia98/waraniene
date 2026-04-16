# Configuration Supabase - Tissés de Waraniéné

Ce guide vous accompagne dans la configuration complète de Supabase pour votre plateforme e-commerce de textiles traditionnels.

## 📋 Prérequis

- Compte Supabase actif
- Projet Supabase créé (vous l'avez déjà : `ydzstpjvqwawrbzeepry`)
- Accès au dashboard Supabase

## 🔧 Étapes de configuration

### 1. Récupération des clés API

1. **Allez sur votre dashboard Supabase** : https://supabase.com/dashboard/
2. **Sélectionnez votre projet** : `ydzstpjvqwawrbzeepry`
3. **Allez dans Settings > API**
4. **Copiez les clés suivantes** :
   - Project URL (déjà configurée)
   - `anon public` key (déjà configurée)
   - **`service_role` key** ← IMPORTANT : C'est celle qui manque !

### 2. Mise à jour du fichier .env.local

Remplacez la ligne suivante dans votre `.env.local` :

```bash
# Remplacez cette ligne :
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Par votre vraie clé service_role depuis le dashboard
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Initialisation de la base de données

#### Option A : Interface Supabase (Recommandée)

1. **Allez dans SQL Editor** : https://supabase.com/dashboard/project/ydzstpjvqwawrbzeepry/sql
2. **Exécutez le schéma principal** :
   - Ouvrez le fichier `supabase-schema.sql`
   - Copiez tout le contenu
   - Collez dans l'éditeur SQL
   - Cliquez "Run"

3. **Configurez le Storage** :
   - Ouvrez le fichier `supabase-storage.sql` 
   - Copiez tout le contenu
   - Collez dans l'éditeur SQL
   - Cliquez "Run"

#### Option B : CLI Supabase

```bash
# Installer la CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref ydzstpjvqwawrbzeepry

# Appliquer les migrations
supabase db push
```

### 4. Vérification de la configuration

Après avoir exécuté les scripts SQL, vérifiez que :

#### Tables créées ✅
- [ ] `users` - Utilisateurs du système
- [ ] `artisans` - Profils des artisans
- [ ] `produits` - Catalogue des produits
- [ ] `commandes` - Commandes des clients
- [ ] `commande_details` - Détails des commandes
- [ ] `panier` - Paniers d'achat
- [ ] `avis_produits` - Avis sur les produits
- [ ] `avis_artisans` - Avis sur les artisans
- [ ] `categories` - Catégories de produits
- [ ] `user_sessions` - Sessions utilisateur

#### Buckets Storage créés ✅
- [ ] `produits` - Images des produits (public)
- [ ] `artisans` - Photos des artisans (public)
- [ ] `avatars` - Avatars des utilisateurs (public)
- [ ] `documents` - Documents privés

#### Politiques RLS activées ✅
- [ ] Sécurité au niveau des lignes pour toutes les tables
- [ ] Politiques d'accès appropriées

## 🧪 Test de la configuration

### Test de connexion

1. **Redémarrez le serveur de développement** :
```bash
npm run dev
```

2. **Vérifiez la console** :
   - Plus d'erreurs "Invalid API key"
   - Connexion Supabase réussie

3. **Testez les API** :
   - `GET /api/produits` - Doit fonctionner
   - `GET /api/artisans` - Doit fonctionner

### Test des fonctionnalités

1. **Navigation** :
   - Page d'accueil : http://localhost:3000
   - Page produits : http://localhost:3000/produits
   - Page artisans : http://localhost:3000/artisans

2. **API endpoints** :
   - `http://localhost:3000/api/produits`
   - `http://localhost:3000/api/artisans`

## 📊 Données d'exemple

Pour peupler votre base avec des données de test :

```sql
-- Insérer un utilisateur artisan
INSERT INTO users (email, nom, prenom, type_utilisateur, est_verifie, telephone) VALUES
('aminata@waraniene.ci', 'Koné', 'Aminata', 'artisan', true, '+22507123456');

-- Insérer le profil artisan
INSERT INTO artisans (user_id, bio, specialites, annees_experience, village_origine, localisation, est_verifie) VALUES
((SELECT id FROM users WHERE email = 'aminata@waraniene.ci'), 
 'Artisane passionnée spécialisée dans les boubous traditionnels', 
 ARRAY['boubou', 'tissage'], 
 15, 
 'Waraniéné', 
 'Korhogo', 
 true);

-- Insérer des produits d'exemple
INSERT INTO produits (artisan_id, nom_produit, description, prix, categorie, stock, couleurs, materiaux) VALUES
((SELECT id FROM artisans WHERE user_id = (SELECT id FROM users WHERE email = 'aminata@waraniene.ci')),
 'Boubou Traditionnel Rouge',
 'Magnifique boubou tissé à la main avec des motifs traditionnels senoufo',
 75000,
 'boubou',
 5,
 ARRAY['Rouge', 'Or'],
 ARRAY['Coton', 'Fil doré']);
```

## 🚨 Sécurité

### Points importants :

1. **Clé Service Role** : Ne jamais exposer côté client
2. **RLS activé** : Toutes les tables sensibles sont protégées
3. **Politiques strictes** : Accès limité selon les rôles
4. **Storage sécurisé** : Fichiers organisés par utilisateur

### Variables d'environnement sécurisées :

```bash
# ✅ Côté client (public)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 🔒 Côté serveur uniquement (privé)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🆘 Dépannage

### Erreur "Invalid API key"
- ✅ Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correcte
- ✅ Redémarrez le serveur après modification

### Erreur "relation does not exist"
- ✅ Exécutez le script `supabase-schema.sql`
- ✅ Vérifiez que toutes les tables sont créées

### Erreur d'upload de fichiers
- ✅ Exécutez le script `supabase-storage.sql`
- ✅ Vérifiez que les buckets sont créés

### Erreur de permissions
- ✅ Vérifiez que RLS est activé
- ✅ Vérifiez que les politiques sont en place

## 📞 Support

En cas de problème :

1. **Documentation Supabase** : https://supabase.com/docs
2. **Dashboard Supabase** : https://supabase.com/dashboard/
3. **SQL Editor** : https://supabase.com/dashboard/project/ydzstpjvqwawrbzeepry/sql
4. **Logs** : https://supabase.com/dashboard/project/ydzstpjvqwawrbzeepry/logs

---

Une fois la configuration terminée, votre plateforme "Tissés de Waraniéné" sera entièrement opérationnelle avec Supabase ! 🎉