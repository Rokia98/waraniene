# 🚀 Guide d'exécution de la migration Supabase

## Étape 1 : Accéder à Supabase SQL Editor

1. Connectez-vous à [https://supabase.com/](https://supabase.com/)
2. Sélectionnez votre projet **Waraniéné**
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**

## Étape 2 : Créer une nouvelle requête

1. Cliquez sur **"+ New query"**
2. Nommez la requête : `migration-artisan-auth`

## Étape 3 : Copier le script SQL

1. Ouvrez le fichier `database/migration-artisan-auth.sql`
2. Copiez **TOUT** le contenu du fichier
3. Collez-le dans l'éditeur SQL de Supabase

## Étape 4 : Exécuter la migration

1. Vérifiez que tout le SQL est bien collé
2. Cliquez sur le bouton **"Run"** (ou `Ctrl+Enter` / `Cmd+Enter`)
3. Attendez que l'exécution se termine

## Étape 5 : Vérifier le résultat

Vous devriez voir en bas de l'écran :

### ✅ Résultats attendus :

**Première requête de vérification** (colonnes artisans) :
```
| column_name    | data_type          | is_nullable |
|----------------|-------------------|-------------|
| email          | character varying | YES         |
| mot_de_passe   | character varying | YES         |
```

**Deuxième requête de vérification** (colonnes commandes) :
```
| column_name         | data_type          | is_nullable |
|---------------------|-------------------|-------------|
| nom_acheteur        | character varying | YES         |
| email_acheteur      | character varying | YES         |
| telephone_acheteur  | character varying | YES         |
```

### ✅ Succès confirmé si :
- Pas d'erreurs affichées en rouge
- Les 2 tableaux de vérification s'affichent
- Message "Success" ou nombre de lignes affectées

### ❌ En cas d'erreur :

**Erreur "column already exists"** :
- ✅ C'est normal ! Les colonnes existent déjà
- La migration utilise `IF NOT EXISTS`, donc c'est sans danger

**Erreur "permission denied"** :
- Vérifiez que vous êtes bien propriétaire du projet
- Essayez de vous reconnecter à Supabase

**Autre erreur** :
- Copiez l'erreur complète
- Envoyez-la moi pour diagnostic

## Étape 6 : Tester la migration

### Option A : Via SQL Editor

Exécutez cette requête pour voir la structure mise à jour :

```sql
-- Voir les colonnes de la table artisans
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'artisans' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Option B : Via Table Editor

1. Allez dans **"Table Editor"**
2. Cliquez sur la table **"artisans"**
3. Vérifiez que les colonnes `email` et `mot_de_passe` apparaissent

## Étape 7 : Créer un artisan de test (Optionnel)

Si vous voulez tester immédiatement :

```sql
-- Mot de passe : "password123" (hashé avec bcrypt)
INSERT INTO public.artisans (
  nom, 
  email, 
  mot_de_passe, 
  bio, 
  localisation, 
  telephone, 
  langue, 
  statut
) VALUES (
  'Test Artisan',
  'test@artisan.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lZNfC5YbHPuG',
  'Artisan tisserand spécialisé dans les textiles traditionnels sénoufo.',
  'Waraniéné, Côte d''Ivoire',
  '+225 07 11 22 33 44',
  'fr',
  'actif'
);
```

Ensuite testez la connexion sur votre app :
- **Email** : `test@artisan.com`
- **Mot de passe** : `password123`

## ✅ Migration complétée !

Une fois la migration réussie :

1. ✅ Les artisans peuvent s'inscrire avec email/password
2. ✅ Les artisans peuvent se connecter
3. ✅ Les commandes peuvent être passées sans compte acheteur
4. ✅ Le système artisan-only est opérationnel

## 🧪 Tests à effectuer ensuite

1. **Test inscription** : http://localhost:3000/auth
   - Mode "Inscription"
   - Remplir tous les champs
   - Vérifier la création du compte

2. **Test connexion** : http://localhost:3000/auth
   - Mode "Connexion"
   - Email et mot de passe de l'artisan créé
   - Vérifier redirection vers `/artisan/dashboard`

3. **Test middleware** :
   - Une fois connecté comme artisan
   - Essayer d'aller sur `/` ou `/produits`
   - Devrait rediriger vers `/artisan/dashboard`

## 📞 Support

En cas de problème, partagez :
- Le message d'erreur exact
- La capture d'écran de Supabase SQL Editor
- La version de Supabase que vous utilisez
