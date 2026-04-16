# Services - Tissés de Waraniéné

Ce dossier contient l'architecture de services pour l'application e-commerce de textiles traditionnels Senoufo.

## Structure des Services

### 🔧 Services Principaux

#### 1. **apiService.ts** - Client API Centralisé
Service principal pour toutes les communications avec l'API backend.

**Fonctionnalités :**
- Authentification (login, register, logout, verify token)
- Gestion des produits (CRUD, recherche, filtres)
- Gestion des artisans (profils, recherche)
- Panier et commandes
- Upload de fichiers
- Paiements PayDunya
- Statistiques et analytics

**Utilisation :**
```typescript
import { apiService } from '@/services';

// Authentification
const result = await apiService.auth.login({ email, mot_de_passe });

// Produits
const produits = await apiService.produits.getAll({ page: 1, limite: 12 });
```

#### 2. **validationService.ts** - Validation des Données
Service de validation avec messages d'erreur en français.

**Fonctionnalités :**
- Validation des champs individuels
- Validation d'objets complets
- Nettoyage et formatage des données
- Messages d'erreur personnalisés en français

**Utilisation :**
```typescript
import { validationService, objectValidators } from '@/services';

// Validation d'un email
const emailValid = validationService.validateEmail('user@example.com');

// Validation d'un objet utilisateur
const userValidation = objectValidators.userRegistration(userData);
```

#### 3. **notificationService.ts** - Notifications Toast
Service de notifications utilisateur avec react-hot-toast.

**Fonctionnalités :**
- Notifications de base (success, error, warning, info)
- Notifications spécialisées e-commerce
- Styles personnalisés
- Gestion des duplicatas

**Utilisation :**
```typescript
import { notify, notifyEcommerce } from '@/services';

// Notifications basiques
notify.success('Opération réussie');
notify.error('Une erreur est survenue');

// Notifications e-commerce
notifyEcommerce.itemAdded('Boubou traditionnel', 2);
notifyEcommerce.orderConfirmed('CMD-123456');
```

#### 4. **storageService.ts** - Stockage Local
Service de gestion du localStorage et sessionStorage avec chiffrement.

**Fonctionnalités :**
- Stockage avec expiration automatique
- Chiffrement des données sensibles
- Espaces de noms spécialisés (auth, panier, préférences)
- Maintenance automatique
- Sauvegarde de brouillons de formulaires

**Utilisation :**
```typescript
import { authStorage, cartStorage, preferencesStorage } from '@/services';

// Authentification
authStorage.setToken(token, rememberMe);
const currentUser = authStorage.getUserData();

// Panier local (utilisateurs non connectés)
cartStorage.setItems(panierItems);

// Préférences utilisateur
preferencesStorage.updatePreference('theme', 'dark');
```

### 🛠 Configuration

#### **config.ts** - Configuration Centralisée
Fichier de configuration pour toute l'application.

**Sections :**
- API_CONFIG : URLs et timeouts
- SUPABASE_CONFIG : Configuration base de données
- PAYDUNYA_CONFIG : Configuration paiements
- STORAGE_CONFIG : Paramètres de stockage
- NOTIFICATION_CONFIG : Styles des notifications
- PRODUCT_CONFIG : Limites produits et images
- ORDER_CONFIG : Statuts et méthodes de paiement
- VALIDATION_CONFIG : Règles de validation
- APP_CONFIG : Informations générales de l'app
- DEV_CONFIG : Paramètres de développement

### 📦 Service Principal

#### **index.ts** - Point d'Entrée et AppService
Export centralisé de tous les services + service principal AppService.

**AppService - Fonctionnalités principales :**

##### Initialisation
```typescript
import AppService from '@/services';

// Initialiser l'application
const { isValid, config } = await AppService.initializeApp();
```

##### Authentification Complète
```typescript
// Connexion avec validation et stockage
const result = await AppService.login(credentials, rememberMe);

// Inscription avec validation
const result = await AppService.register(userData);

// Déconnexion propre
await AppService.logout();
```

##### Gestion du Panier Local
```typescript
// Pour utilisateurs non connectés
AppService.addToLocalCart(produit, quantite);
AppService.updateLocalCartQuantity(productId, newQuantity);
AppService.removeFromLocalCart(productId);

// Synchroniser avec le serveur après connexion
await AppService.syncLocalCartToServer();
```

##### Navigation et Historique
```typescript
// Sauvegarder les recherches
AppService.addToRecentSearches(query);

// Historique des produits vus
AppService.addToViewedProducts(productId);

// Brouillons de formulaires
AppService.saveFormDraft('checkout', formData);
const draft = AppService.getFormDraft('checkout');
```

##### Gestion d'Erreurs
```typescript
// Gestion automatique des erreurs réseau
AppService.handleNetworkError(error);
```

##### Utilitaires de Données
```typescript
// Préparer les données pour l'API
const cleanProductData = AppService.prepareProductData(rawData);
const cleanOrderData = AppService.prepareOrderData(rawData);
```

##### Debug et Monitoring
```typescript
// Statut de l'application
const status = AppService.getAppStatus();

// Export des données utilisateur
const userData = AppService.exportUserData();
```

## 📋 Types TypeScript

Le fichier `src/types/index.ts` contient tous les types TypeScript utilisés par les services :

- **BaseEntity** : Interface de base avec id, created_at, updated_at
- **User, Artisan, Produit** : Entités principales
- **Commande, Paiement** : Système de commandes
- **ApiResponse, ValidationResult** : Types de réponses
- **StorageItem, UserPreferences** : Types de stockage
- Et bien d'autres...

## 🚀 Utilisation Recommandée

### 1. Import Principal
```typescript
// Import du service principal
import AppService from '@/services';

// Ou import sélectif
import { apiService, validationService, notify } from '@/services';
```

### 2. Initialisation dans _app.tsx
```typescript
useEffect(() => {
  AppService.initializeApp();
}, []);
```

### 3. Gestion d'État avec les Services
```typescript
// Dans un composant React
const handleLogin = async (formData) => {
  const result = await AppService.login(formData, rememberMe);
  
  if (result.success) {
    // Redirection après succès
    router.push('/dashboard');
    
    // Synchroniser le panier local si nécessaire
    await AppService.syncLocalCartToServer();
  }
};
```

### 4. Validation de Formulaires
```typescript
// Validation en temps réel
const [errors, setErrors] = useState({});

const validateField = (name: string, value: any) => {
  const result = validators[name]?.(value);
  setErrors(prev => ({
    ...prev,
    [name]: result?.isValid ? undefined : result?.errors[name]
  }));
};
```

### 5. Gestion du Panier
```typescript
// Ajouter un produit (gère automatiquement auth/local)
const addToCart = async (produit: Produit, quantite: number) => {
  const user = authStorage.getUserData();
  
  if (user) {
    // Utilisateur connecté - API
    const result = await apiService.panier.addToCart(produit.id, quantite);
    if (result.success) {
      notifyEcommerce.itemAdded(produit.nom_produit, quantite);
    }
  } else {
    // Utilisateur non connecté - stockage local
    AppService.addToLocalCart(produit, quantite);
  }
};
```

## 🔒 Sécurité

- **Chiffrement** : Données sensibles chiffrées dans le localStorage
- **Expiration** : Tokens et données avec expiration automatique
- **Validation** : Toutes les entrées utilisateur validées
- **Sanitisation** : Nettoyage des données avant envoi API
- **HTTPS** : Communications sécurisées avec l'API

## 🧪 Tests

Pour tester les services :

```typescript
// Test des validations
console.log(validationService.validateEmail('test@example.com'));

// Test des notifications
notify.success('Test notification');

// Test du stockage
storageUtils.performMaintenance();
```

## 📚 Ressources

- [React Hot Toast](https://react-hot-toast.com/) - Notifications
- [Supabase](https://supabase.io/) - Base de données
- [PayDunya](https://paydunya.com/) - Paiements
- [TypeScript](https://www.typescriptlang.org/) - Types statiques

---

Cette architecture de services fournit une base solide et maintenable pour l'application e-commerce Tissés de Waraniéné, avec une séparation claire des responsabilités et une gestion complète des données utilisateur.