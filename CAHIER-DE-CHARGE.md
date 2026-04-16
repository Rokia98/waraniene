# CAHIER DE CHARGE
## Tissés de Waraniéné — Plateforme E-commerce de Textiles Traditionnels Sénoufo

---

**Version :** 1.0  
**Date :** 02 Avril 2026  
**Projet :** Tissés de Waraniéné  
**Localisation :** Waraniéné, Côte d'Ivoire  

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Contexte et objectifs](#2-contexte-et-objectifs)
3. [Périmètre fonctionnel](#3-périmètre-fonctionnel)
4. [Acteurs et rôles](#4-acteurs-et-rôles)
5. [Spécifications fonctionnelles détaillées](#5-spécifications-fonctionnelles-détaillées)
6. [Architecture technique](#6-architecture-technique)
7. [Modèle de données](#7-modèle-de-données)
8. [Exigences non fonctionnelles](#8-exigences-non-fonctionnelles)
9. [Moyens de paiement](#9-moyens-de-paiement)
10. [Déploiement et hébergement](#10-déploiement-et-hébergement)
11. [Contraintes et prérequis](#11-contraintes-et-prérequis)

---

## 1. Présentation du projet

### 1.1 Intitulé
**Tissés de Waraniéné** — Plateforme numérique e-commerce pour la vente de textiles traditionnels sénoufo.

### 1.2 Description générale
Plateforme web permettant aux artisans tisserands du village de Waraniéné (Côte d'Ivoire) de vendre leurs créations textiles traditionnelles sénoufo à une clientèle locale et internationale. Le projet vise à digitaliser la chaîne de vente artisanale, à valoriser le patrimoine culturel ivoirien et à améliorer les revenus des artisans en leur donnant un accès direct au marché sans intermédiaires.

### 1.3 Langue principale
Français (interface utilisateur, contenus, communications).

---

## 2. Contexte et objectifs

### 2.1 Contexte
Le tissage sénoufo est un art ancestral transmis de génération en génération dans le village de Waraniéné. Les artisans vendent traditionnellement leurs produits sur les marchés régionaux avec des revenus limités et irréguliers. La plateforme répond au besoin de moderniser cette activité tout en préservant l'authenticité du savoir-faire.

### 2.2 Objectifs principaux
| # | Objectif | Description |
|---|----------|-------------|
| O1 | Visibilité | Donner une vitrine numérique aux artisans et à leurs créations |
| O2 | Vente en ligne | Permettre l'achat direct de textiles avec paiement sécurisé |
| O3 | Revenus artisans | Améliorer les revenus des artisans en éliminant les intermédiaires |
| O4 | Préservation culturelle | Valoriser le patrimoine culturel du tissage sénoufo |
| O5 | Gestion autonome | Permettre aux artisans de gérer leurs produits et commandes de manière autonome |
| O6 | Traçabilité | Assurer le suivi des commandes de bout en bout |

### 2.3 Public cible
- **Clients locaux** (Côte d'Ivoire) intéressés par les textiles traditionnels
- **Diaspora ivoirienne** et africaine à l'étranger
- **Clients internationaux** amateurs d'artisanat authentique africain
- **Acheteurs en gros** (revendeurs, boutiques de mode éthique)

---

## 3. Périmètre fonctionnel

### 3.1 Modules de l'application

| Module | Description |
|--------|-------------|
| **Vitrine / Catalogue** | Affichage des produits par catégorie, recherche, filtrage |
| **Fiche artisan** | Profils des artisans avec biographie et galerie |
| **Panier & Checkout** | Panier d'achat, saisie d'adresse, choix paiement |
| **Paiement** | Intégration PayDunya (Orange Money, MTN Money, Carte bancaire) |
| **Commandes** | Création, suivi, historique des commandes |
| **Authentification** | Inscription / Connexion client (email + mot de passe, JWT) |
| **Espace artisan** | Dashboard, gestion produits, gestion commandes, statistiques, portefeuille |
| **Administration** | Gestion des commandes, artisans, produits, statistiques globales |
| **Blog** | Articles sur la culture, les techniques, les artisans |
| **Favoris** | Liste de souhaits (wishlist) côté client |
| **Contact** | Formulaire de contact |
| **Notifications** | Notifications toast en temps réel dans l'application |
| **Codes promo** | Gestion et application de codes promotionnels |
| **Portefeuille & Finances** | Portefeuilles artisans, commission admin (10 %), demandes de retrait |
| **Approbation produits** | Workflow de validation des produits par l'administrateur |

---

## 4. Acteurs et rôles

### 4.1 Visiteur (non authentifié)
- Consulter le catalogue de produits
- Visualiser les fiches artisans
- Lire le blog
- Utiliser le formulaire de contact
- Ajouter des produits au panier (stockage local)
- Accéder au checkout en tant qu'invité (achat sans compte)

### 4.2 Acheteur (client authentifié)
- Toutes les fonctionnalités visiteur
- Créer un compte / Se connecter
- Gérer son profil
- Passer des commandes avec suivi
- Gérer ses favoris
- Consulter l'historique de commandes
- Laisser des avis sur les produits
- Réinitialiser son mot de passe

### 4.3 Artisan
- Se connecter à son espace dédié
- Ajouter / modifier / supprimer ses produits
- Consulter et gérer ses commandes
- Voir ses statistiques de ventes (chiffre d'affaires, nombre de ventes, etc.)
- Gérer son profil artisan (bio, spécialités, photo)
- Consulter son portefeuille financier
- Effectuer des demandes de retrait

### 4.4 Administrateur
- Accéder au tableau de bord d'administration
- Gérer toutes les commandes (consulter, mettre à jour le statut)
- Gérer les artisans et les produits
- Approuver ou rejeter les produits soumis par les artisans
- Consulter les statistiques globales
- Exporter les données (CSV)
- Gérer les portefeuilles et traiter les demandes de retrait
- Gérer les codes promotionnels

---

## 5. Spécifications fonctionnelles détaillées

### 5.1 Module Vitrine / Catalogue

**Page d'accueil**
- Hero section avec image immersive et appel à l'action
- Section « Pourquoi nous choisir » (authenticité, fait main, livraison, qualité)
- Affichage des produits par catégorie principale (pagnes, boubous, foulards, robes)
- Liens vers les artisans et le catalogue

**Page catalogue (`/produits`)**
- Liste des produits avec mise en page responsive (grille)
- Filtrage par :
  - Catégorie (boubou, pagne, foulard, chemise, robe, accessoire, décoration)
  - Fourchette de prix (prix min / prix max)
  - Couleurs
  - Matériaux
  - Personnalisable ou non
  - En stock uniquement
- Tri par : nom, prix croissant/décroissant, date, popularité, note
- Pagination
- Barre de recherche textuelle
- Composant `ProductCard` avec image, nom, prix, artisan, bouton ajout panier

**Page produit (`/produits/[id]`)**
- Galerie d'images du produit
- Informations détaillées : nom, description, prix, catégorie, matériaux, couleurs
- Dimensions et poids
- Temps de fabrication estimé
- Instructions d'entretien
- Stock disponible
- Note moyenne et nombre d'avis
- Lien vers le profil de l'artisan
- Bouton d'ajout au panier
- Bouton d'ajout aux favoris
- Section avis clients

### 5.2 Module Artisans

**Page liste des artisans (`/artisans`)**
- Grille de cartes artisans (`ArtisanCard`)
- Photo, nom, bio, localisation, spécialités
- Note moyenne et nombre d'avis
- Badge « Vérifié » si applicable

**Page profil artisan (`/artisans/[id]`)**
- Biographie complète
- Galerie photos
- Techniques maîtrisées
- Années d'expérience
- Certifications
- Liste des produits de l'artisan
- Avis des clients

### 5.3 Module Panier & Checkout

**Panier (slide-over `CartSlideOver`)**
- Ajout / suppression d'articles
- Modification des quantités
- Calcul du sous-total en temps réel
- Persistance locale (localStorage via `CartContext`)
- Accès au checkout

**Page Checkout (`/checkout`)**
- Processus en étapes :
  1. **Informations acheteur** : prénom, nom, email, téléphone
  2. **Adresse de livraison** : adresse, ville, commune, pays, code postal
  3. **Mode de paiement** : Orange Money, MTN Money, Carte bancaire
  4. **Récapitulatif** et confirmation
- Application de code promotionnel
- Calcul des frais de livraison
- Possibilité d'achat en tant qu'invité (sans inscription)

### 5.4 Module Paiement

**Prestataire principal : PayDunya**
- Modes de paiement supportés :
  - **Orange Money** (mobile money)
  - **MTN Money** (mobile money)
  - **Carte bancaire** (Visa, Mastercard)
- Flux de paiement :
  1. Initiation du paiement via l'API PayDunya (`/api/paiement/initier`)
  2. Redirection vers la page de paiement PayDunya
  3. Callback de confirmation (`/api/paiement/callback`)
  4. Vérification du statut (`/api/paiement/statut`)
- Distribution automatique des revenus :
  - 90 % au portefeuille de l'artisan
  - 10 % de commission au portefeuille administrateur
- Gestion des statuts : `en_attente`, `paye`, `echec`, `rembourse`

### 5.5 Module Commandes

**Création de commande**
- Génération automatique d'un numéro de commande unique
- Association acheteur (authentifié ou invité)
- Enregistrement des détails (produits, quantités, prix unitaires)
- Calcul du total avec frais de livraison et réductions

**Suivi de commande**
- Statuts : `en_attente` → `confirmee` → `en_preparation` → `expediee` → `livree`
- Possibilité d'annulation (`annulee`)
- Numéro de suivi
- Date de livraison prévue / réelle
- Notes internes (administration)

**Historique (`/commande`, `/artisan/commandes`)**
- Liste des commandes passées
- Détail de chaque commande
- Filtrage par statut

### 5.6 Module Authentification

**Inscription (`/auth` — onglet inscription)**
- Champs : nom, prénom, email, mot de passe, téléphone (optionnel), adresse (optionnel)
- Hachage du mot de passe (bcryptjs)
- Génération d'un token JWT

**Connexion (`/auth` — onglet connexion)**
- Authentification par email + mot de passe
- Vérification bcrypt
- Émission d'un JWT stocké en localStorage
- Vérification automatique de la session au chargement (`/api/auth/me`)

**Réinitialisation de mot de passe**
- Demande via email (`/auth/forgot-password`)
- Lien de réinitialisation (`/auth/reset-password`)

**Déconnexion (`/api/auth/logout`)**
- Suppression du token côté client

**Middleware de protection des routes**
- Routes artisan (`/artisan/*`) : authentification artisan requise
- Routes profil/commandes : authentification acheteur requise
- Routes publiques uniquement (`/auth`) : redirection si déjà connecté

### 5.7 Module Espace Artisan

**Dashboard (`/artisan/dashboard`)**
- Statistiques clés :
  - Total produits / produits actifs
  - Produits vendus / ventes du mois
  - Revenu total / revenu du mois
  - Commandes en cours
- Liste des commandes récentes
- Accès rapide à la gestion des produits

**Gestion des produits (`/artisan/produits`)**
- Ajouter un nouveau produit
- Modifier un produit existant
- Supprimer un produit
- Upload d'images
- Statut d'approbation (en attente / approuvé / rejeté par l'admin)

**Gestion des commandes (`/artisan/commandes`)**
- Liste des commandes impliquant les produits de l'artisan
- Mise à jour du statut de livraison
- Détail : acheteur, produits, montants, statut paiement

**Portefeuille (`/artisan/portefeuille`)**
- Solde disponible
- Solde en attente (commandes non livrées)
- Total des revenus historiques
- Total des retraits effectués
- Historique des transactions

**Demandes de retrait (`/artisan/retraits`)**
- Créer une demande de retrait
- Méthodes : Orange Money, MTN Money, Virement, Espèces
- Suivi du statut de la demande (en attente / approuvé / traité / rejeté)

**Statistiques (`/artisan/statistiques`)**
- Graphiques de ventes (via Recharts)
- Performances par produit
- Tendances sur différentes périodes

### 5.8 Module Administration

**Dashboard admin (`/admin`)**
- Vue globale : nombre de commandes, revenu total, nombre de produits, nombre d'artisans
- Commandes en attente
- Statistiques mensuelles

**Gestion des commandes (`/admin/commandes`)**
- Liste complète des commandes avec filtrage et recherche
- Mise à jour des statuts
- Export CSV des commandes

**Gestion des avis (`/admin/avis`)**
- Modération des avis clients

**Approbation des produits**
- Workflow de validation avant publication
- Statuts : `en_attente`, `approuve`, `rejete`

### 5.9 Module Blog

**Page blog (`/blog`)**
- Liste des articles publiés
- Catégories : Histoire, Culture, Technique, Portrait, Économie, Réflexion

**Article de blog (`/blog/[id]`)**
- Contenu complet de l'article
- Auteur, date de publication, temps de lecture
- Tags associés
- Statuts : brouillon / publié / archivé

### 5.10 Module Favoris (Wishlist)

**Page favoris (`/favoris`)**
- Liste des produits marqués en favoris (stockage côté client via `FavorisContext`)
- Ajout rapide au panier depuis la page favoris
- Suppression individuelle ou totale

### 5.11 Module Contact

**Page contact (`/contact`)**
- Formulaire : nom, email, téléphone, sujet, message
- Coordonnées de l'entreprise (téléphone, email, adresse)
- Horaires d'ouverture
- Liens réseaux sociaux (Facebook, Instagram, Twitter)

### 5.12 Module Notifications

- Notifications toast (succès, erreur, warning, info, chargement)
- Gestion via `react-hot-toast` avec styles personnalisés
- Préférences de notifications utilisateur (`/preferences-notifications`)

### 5.13 Module Codes Promotionnels

- Création et gestion de codes promo par l'administration
- Application lors du checkout avec vérification en temps réel
- Réduction en pourcentage ou montant fixe

---

## 6. Architecture technique

### 6.1 Stack technologique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Framework** | Next.js (App Router) | 14.2.14 |
| **Langage** | TypeScript | 5.x |
| **UI / Styling** | Tailwind CSS | 3.3.x |
| **Composants UI** | Headless UI, Heroicons, Lucide React | — |
| **Base de données** | Supabase (PostgreSQL) + MySQL (mode hybride) | — |
| **ORM / Client DB** | Supabase JS Client, mysql2 | — |
| **Authentification** | JWT custom (jsonwebtoken, jose, bcryptjs) | — |
| **Paiement** | PayDunya SDK | 1.0.12 |
| **Stockage fichiers** | Supabase Storage | — |
| **Graphiques** | Recharts | 3.5.x |
| **Notifications** | react-hot-toast | 2.6.x |
| **Email** | Nodemailer | 7.x |
| **Polices** | Google Fonts (Inter, Playfair Display) | — |

### 6.2 Architecture applicative

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│  Next.js App Router — React SSR/CSR — Tailwind CSS  │
│  Contexts: Auth, Cart, Favoris                       │
│  Hooks: useProduits, useCommandes, useArtisans...    │
├─────────────────────────────────────────────────────┤
│                 API ROUTES (Next.js)                 │
│  /api/auth/*       — Authentification               │
│  /api/produits/*   — CRUD Produits                  │
│  /api/artisans/*   — Profils artisans               │
│  /api/artisan/*    — Espace artisan privé           │
│  /api/commandes/*  — Gestion commandes              │
│  /api/paiement/*   — Initiation/Callback paiement   │
│  /api/panier/*     — Gestion panier                 │
│  /api/admin/*      — Administration                 │
│  /api/blog/*       — Articles de blog               │
│  /api/upload/*     — Upload d'images                │
│  /api/statistiques — Stats globales                 │
│  /api/codes-promo  — Codes promotionnels            │
│  /api/wishlist     — Liste de souhaits              │
│  /api/notifications— Préférences notifications      │
│  /api/email/*      — Envoi d'emails                 │
├─────────────────────────────────────────────────────┤
│                SERVICES / LOGIQUE MÉTIER             │
│  apiService, storageService, validationService      │
│  notificationService, productService                │
├─────────────────────────────────────────────────────┤
│               BASE DE DONNÉES                        │
│  Supabase (PostgreSQL) — Principal                   │
│  MySQL — Mode hybride (optionnel)                    │
│  Supabase Storage — Images produits & artisans       │
├─────────────────────────────────────────────────────┤
│             SERVICES EXTERNES                        │
│  PayDunya — Paiement mobile money & CB              │
│  Nodemailer — Envoi d'emails transactionnels        │
└─────────────────────────────────────────────────────┘
```

### 6.3 Structure des dossiers

```
src/
├── app/                        # Pages et routes (App Router Next.js)
│   ├── layout.tsx              # Layout principal (providers, polices, toaster)
│   ├── page.tsx                # Page d'accueil
│   ├── globals.css             # Styles globaux Tailwind
│   ├── api/                    # API Routes (backend)
│   │   ├── auth/               # Authentification (login, register, logout, me, reset)
│   │   ├── produits/           # CRUD produits
│   │   ├── artisans/           # Profils artisans
│   │   ├── artisan/            # API privée artisan (produits, commandes, stats, portefeuille, retraits)
│   │   ├── commandes/          # Gestion commandes
│   │   ├── paiement/           # Paiement PayDunya (initier, callback, statut, distribuer-revenus)
│   │   ├── panier/             # Panier serveur
│   │   ├── admin/              # Administration
│   │   ├── blog/               # Blog
│   │   ├── upload/             # Upload fichiers
│   │   ├── statistiques/       # Stats globales
│   │   ├── codes-promo/        # Codes promo
│   │   ├── wishlist/           # Wishlist
│   │   ├── notifications/      # Notifications
│   │   ├── email/              # Envoi email
│   │   ├── acheteurs/          # Gestion acheteurs
│   │   └── categories/         # Catégories produits
│   ├── produits/               # Pages catalogue et détail produit
│   ├── artisans/               # Pages profils artisans
│   ├── artisan/                # Espace artisan (dashboard, produits, commandes)
│   ├── admin/                  # Espace administration
│   ├── auth/                   # Pages d'authentification
│   ├── checkout/               # Page checkout
│   ├── commande/               # Suivi de commande
│   ├── panier/                 # Page panier
│   ├── blog/                   # Pages blog
│   ├── contact/                # Page contact
│   ├── favoris/                # Page favoris
│   ├── profil/                 # Profil utilisateur
│   ├── paiement/               # Pages paiement
│   └── dashboard/              # Dashboard général
├── components/                 # Composants réutilisables
│   ├── ui/                     # Composants UI de base (Button, Card, Input, etc.)
│   ├── Header.tsx              # Barre de navigation principale
│   ├── ProductCard.tsx         # Carte produit
│   ├── ArtisanCard.tsx         # Carte artisan
│   ├── CartSlideOver.tsx       # Panneau latéral panier
│   ├── ProductModal.tsx        # Modale produit (ajout/édition artisan)
│   ├── OrderStatusModal.tsx    # Modale mise à jour statut commande
│   ├── PromoCodeInput.tsx      # Champ code promo
│   ├── ReviewsComponent.tsx    # Section avis
│   ├── ImageUpload.tsx         # Upload d'images
│   ├── ImageGallery.tsx        # Galerie d'images
│   ├── WishlistButton.tsx      # Bouton favoris
│   └── OptimizedImage.tsx      # Image optimisée
├── contexts/                   # Contextes React (state management)
│   ├── AuthContext.tsx         # Authentification utilisateur
│   ├── CartContext.tsx         # Panier d'achat
│   ├── FavorisContext.tsx      # Gestion des favoris
│   └── PanierContext.tsx       # Panier alternatif
├── hooks/                      # Hooks personnalisés
│   ├── useAuth.ts              # Hook authentification
│   ├── useProduits.ts          # Hook chargement produits
│   ├── useCommandes.ts         # Hook gestion commandes
│   ├── useArtisans.ts          # Hook chargement artisans
│   ├── useStatistiques.ts      # Hook statistiques
│   └── useImageUpload.ts       # Hook upload images
├── lib/                        # Utilitaires et configurations
│   ├── supabase.ts             # Client Supabase
│   ├── mysql.ts                # Client MySQL
│   ├── auth.ts                 # Utilitaires auth (JWT)
│   ├── paydunya.ts             # Service PayDunya
│   ├── api.ts                  # Client API
│   ├── db.ts                   # Abstraction base de données
│   ├── utils.ts                # Fonctions utilitaires
│   └── imageUtils.ts           # Utilitaires images
├── services/                   # Services métier
│   ├── apiService.ts           # Service API centralisé
│   ├── storageService.ts       # Stockage local (tokens, préférences)
│   ├── validationService.ts    # Validation des données
│   ├── notificationService.ts  # Service notifications toast
│   ├── productService.hybrid.ts# Service produit (mode hybride)
│   └── productService.mysql.ts # Service produit (MySQL)
├── types/                      # Définitions TypeScript
│   ├── index.ts                # Types principaux
│   ├── product.ts              # Types produit
│   └── paydunya.d.ts           # Déclarations PayDunya
└── styles/                     # Fichiers de style additionnels
```

---

## 7. Modèle de données

### 7.1 Schéma des entités principales

#### Table `artisans`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| nom | VARCHAR(255) | Nom complet |
| photo | TEXT | URL de la photo de profil |
| bio | TEXT | Biographie |
| localisation | VARCHAR(255) | Lieu (village) |
| telephone | VARCHAR(20) | Numéro de téléphone (unique) |
| langue | VARCHAR(10) | Langue parlée (défaut : fr) |
| statut | ENUM | actif / inactif / suspendu |
| email | VARCHAR(255) | Email de connexion |
| mot_de_passe | VARCHAR(255) | Mot de passe hashé |
| specialite | VARCHAR(255) | Spécialité principale |
| date_inscription | DATE | Date d'inscription |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

#### Table `produits`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| nom_produit | VARCHAR(255) | Nom du produit |
| description | TEXT | Description détaillée |
| categorie | ENUM | pagne / boubou / foulard / chemise / robe / accessoire / decoration |
| prix | DECIMAL(10,2) | Prix en FCFA |
| stock | INTEGER | Quantité disponible |
| statut | ENUM | actif / inactif / rupture |
| statut_approbation | ENUM | en_attente / approuve / rejete |
| artisan_id | UUID (FK) | Référence vers l'artisan créateur |
| photos | TEXT[] | URLs des images |
| materiaux | TEXT[] | Liste des matériaux |
| couleurs | TEXT[] | Couleurs disponibles |
| dimensions | JSON | Longueur, largeur, hauteur, poids |
| temps_fabrication | INTEGER | Temps en jours |
| instructions_entretien | TEXT | Conseils d'entretien |
| est_personnalisable | BOOLEAN | Produit personnalisable |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

#### Table `acheteurs`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| nom | VARCHAR(255) | Nom |
| prenom | VARCHAR(255) | Prénom |
| email | VARCHAR(255) | Email (unique) |
| telephone | VARCHAR(20) | Téléphone |
| mot_de_passe | VARCHAR(255) | Mot de passe hashé (bcrypt) |
| adresse | TEXT | Adresse |
| date_creation | TIMESTAMP | Date de création |

#### Table `commandes`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| acheteur_id | UUID (FK) | Référence vers l'acheteur |
| date_commande | TIMESTAMP | Date de la commande |
| statut | ENUM | en_attente / confirmee / preparee / expediee / livree / annulee |
| montant_total | DECIMAL(10,2) | Montant total de la commande |
| mode_paiement | ENUM | orange_money / mtn_money / carte_bancaire |
| adresse_livraison | TEXT | Adresse de livraison |
| notes_admin | TEXT | Notes de l'administrateur |

#### Table `detail_commandes`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| commande_id | UUID (FK) | Référence vers la commande |
| produit_id | UUID (FK) | Référence vers le produit |
| quantite | INTEGER | Quantité commandée |
| prix_unitaire | DECIMAL(10,2) | Prix unitaire au moment de l'achat |

#### Table `panier`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| acheteur_id | UUID (FK) | Référence vers l'acheteur |
| produit_id | UUID (FK) | Référence vers le produit |
| quantite | INTEGER | Quantité |
| Contrainte : UNIQUE(acheteur_id, produit_id) |

#### Table `portefeuilles`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| artisan_id | UUID (FK) | Référence artisan (NULL = portefeuille admin) |
| type_portefeuille | ENUM | artisan / admin |
| solde | DECIMAL(10,2) | Solde disponible |
| solde_en_attente | DECIMAL(10,2) | Argent des commandes non livrées |
| total_revenus | DECIMAL(10,2) | Total historique des revenus |
| total_retraits | DECIMAL(10,2) | Total historique des retraits |
| statut | ENUM | actif / suspendu / bloque |

#### Table `transactions_financieres`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| portefeuille_id | UUID (FK) | Référence portefeuille |
| type_transaction | ENUM | credit_vente / credit_remboursement / debit_retrait / credit_commission |
| montant | DECIMAL(10,2) | Montant de la transaction |
| solde_avant | DECIMAL(10,2) | Solde avant transaction |
| solde_apres | DECIMAL(10,2) | Solde après transaction |
| commande_id | UUID (FK) | Commande associée |
| description | TEXT | Description |
| metadata | JSON | Données supplémentaires |

#### Table `retraits`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| portefeuille_id | UUID (FK) | Référence portefeuille |
| artisan_id | UUID (FK) | Référence artisan |
| montant | DECIMAL(10,2) | Montant demandé |
| statut | ENUM | en_attente / approuve / traite / rejete |
| methode_retrait | ENUM | orange_money / mtn_money / virement / especes |
| numero_telephone | VARCHAR(20) | Numéro pour mobile money |

#### Table `articles_blog`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INT (PK) | Identifiant |
| titre | VARCHAR(255) | Titre de l'article |
| extrait | TEXT | Résumé court |
| contenu | TEXT | Contenu complet |
| image | VARCHAR(500) | Image d'illustration |
| auteur | VARCHAR(100) | Nom de l'auteur |
| date_publication | DATE | Date de publication |
| temps_lecture | INT | Durée de lecture en minutes |
| categorie | VARCHAR(50) | Catégorie |
| tags | JSON | Mots-clés |
| statut | ENUM | brouillon / publie / archive |

#### Table `admins`
| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Identifiant unique |
| nom | VARCHAR(255) | Nom |
| email | VARCHAR(255) | Email (unique) |
| mot_de_passe | VARCHAR(255) | Mot de passe hashé |
| role | ENUM | admin / moderateur |

### 7.2 Relations entre entités
```
artisans ──1:N──> produits
artisans ──1:1──> portefeuilles
acheteurs ──1:N──> commandes
commandes ──1:N──> detail_commandes
produits ──1:N──> detail_commandes
acheteurs ──N:M──> produits (via panier)
portefeuilles ──1:N──> transactions_financieres
portefeuilles ──1:N──> retraits
produits ──1:N──> qr_codes
```

---

## 8. Exigences non fonctionnelles

### 8.1 Performance
- Temps de chargement de la page d'accueil < 3 secondes
- Rendu SSR (Server-Side Rendering) pour le SEO
- Optimisation des images (Next.js Image component)
- Pagination côté serveur pour les listes de produits et commandes

### 8.2 Sécurité
- Hachage des mots de passe avec bcryptjs
- Authentification par JWT avec expiration
- Middleware de protection des routes sensibles
- Row Level Security (RLS) activée sur Supabase
- Validation des entrées côté serveur
- Protection CSRF via les API routes Next.js
- Variables d'environnement pour les clés sensibles (jamais exposées côté client)

### 8.3 Responsive Design
- Interface adaptative pour mobile, tablette, desktop
- Breakpoints Tailwind CSS : `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Navigation mobile adaptée (menu hamburger)

### 8.4 SEO
- Métadonnées (title, description, keywords)
- HTML sémantique
- Attributs alt sur les images
- Langue déclarée (`lang="fr"`)
- Polices Google Fonts optimisées

### 8.5 Accessibilité
- Contrastes de couleurs suffisants
- Navigation au clavier
- Labels de formulaires
- Composants Headless UI pour l'accessibilité native

### 8.6 Disponibilité
- Hébergement sur Vercel (CDN mondial, déploiement continu)
- Base de données Supabase (infra managée, backups automatiques)

---

## 9. Moyens de paiement

### 9.1 Prestataire
**PayDunya** — Prestataire de paiement ouest-africain

### 9.2 Méthodes supportées

| Méthode | Type | Région |
|---------|------|--------|
| Orange Money | Mobile Money | Côte d'Ivoire |
| MTN Money | Mobile Money | Côte d'Ivoire |
| Carte bancaire | Visa, Mastercard | International |

### 9.3 Modèle financier
- **Commission plateforme** : 10 % sur chaque vente
- **90 %** crédité au portefeuille de l'artisan
- **10 %** crédité au portefeuille administrateur
- Les artisans peuvent demander un retrait vers leur compte mobile money ou bancaire

### 9.4 Devise
- **FCFA (Franc CFA)** — Devise principale
- Formatage : `xx xxx FCFA` (séparateur de milliers espace)

---

## 10. Déploiement et hébergement

### 10.1 Environnement de production
| Service | Fournisseur |
|---------|-------------|
| Application web | Vercel (recommandé) |
| Base de données | Supabase (PostgreSQL managé) |
| Stockage fichiers | Supabase Storage |
| Paiements | PayDunya |
| DNS / Domaine | À définir |
| Email | Nodemailer (serveur SMTP à configurer) |

### 10.2 Variables d'environnement requises
```
NEXT_PUBLIC_SUPABASE_URL        # URL du projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Clé anonyme Supabase
SUPABASE_SERVICE_ROLE_KEY       # Clé service role (backend)
PAYDUNYA_MASTER_KEY             # Clé maître PayDunya
PAYDUNYA_PRIVATE_KEY            # Clé privée PayDunya
PAYDUNYA_PUBLIC_KEY             # Clé publique PayDunya
PAYDUNYA_TOKEN                  # Token PayDunya
JWT_SECRET                      # Secret pour la signature JWT
DATABASE_URL                    # URL de connexion MySQL (mode hybride)
```

### 10.3 Scripts de déploiement
```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Démarrage en production
npm run lint     # Vérification du code
```

---

## 11. Contraintes et prérequis

### 11.1 Contraintes techniques
- Node.js 18+ requis
- Compte Supabase actif avec projet configuré
- Compte PayDunya avec clés API (mode test et production)
- Serveur SMTP pour l'envoi d'emails transactionnels

### 11.2 Contraintes fonctionnelles
- La plateforme doit fonctionner en français comme langue principale
- Les prix sont exclusivement en FCFA
- Les paiements doivent supporter le mobile money (principal mode de paiement en Côte d'Ivoire)
- Le checkout doit être accessible sans inscription obligatoire (achat invité)
- Les produits nécessitent une approbation admin avant d'être visibles

### 11.3 Contraintes de marché
- Cible principale : utilisateurs en Côte d'Ivoire (connexion internet variable)
- Design optimisé mobile en priorité (mobile-first)
- Prise en compte des temps de chargement et de la consommation de data

---

*Document généré le 02/04/2026 — Tissés de Waraniéné*
