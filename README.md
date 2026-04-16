# Tissés de Waraniéné 🧵

Site e-commerce pour les textiles traditionnels sénoufo de Waraniéné, Côte d'Ivoire.

## 📋 Description

Platefor1me numérique permettant aux artisans tisserands de Waraniéné de vendre leurs créations traditionnelles. Le site met en valeur l'art ancestral du tissage sénoufo et connecte les artisans locaux avec des clients du monde entier.

## 🚀 Technologies Utilisées

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth avec OTP SMS
- **Stockage**: Supabase Storage pour les images
- **Paiements**: PayDunya (Orange Money, MTN Money, Cartes bancaires)
- **Déploiement**: Vercel (recommandé)

## 📁 Structure du Projet

```
waraniene/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Page d'accueil
│   │   └── globals.css        # Styles globaux
│   ├── components/            # Composants réutilisables
│   │   ├── ui/               # Composants UI de base
│   │   ├── Header.tsx        # En-tête avec navigation et panier
│   │   ├── ProductCard.tsx   # Carte produit
│   │   └── ArtisanCard.tsx   # Carte artisan
│   ├── lib/                  # Utilities et configurations
│   │   ├── supabase.ts       # Configuration Supabase
│   │   └── utils.ts          # Fonctions utilitaires
│   └── types/                # Types TypeScript
│       └── index.ts          # Définitions des types
├── database/
│   └── schema.sql            # Schéma de base de données
├── public/                   # Assets statiques
└── README.md
```

## 🗄️ Modèle de Données

### Tables Principales

- **artisans**: Profils des tisserands
- **produits**: Catalogue des créations
- **acheteurs**: Comptes clients
- **commandes**: Système de commandes
- **details_commande**: Détails des commandes
- **paniers**: Paniers d'achat
- **admins**: Comptes administrateurs

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- Compte PayDunya (pour les paiements)

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd waraniene
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   
   Copier le fichier d'exemple :
   ```bash
   cp .env.example .env.local
   ```
   
   Remplir les variables d'environnement dans `.env.local` :
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # PayDunya (Paiements)
   PAYDUNYA_MASTER_KEY=your_paydunya_master_key
   PAYDUNYA_PRIVATE_KEY=your_paydunya_private_key
   PAYDUNYA_PUBLIC_KEY=your_paydunya_public_key
   PAYDUNYA_TOKEN=your_paydunya_token
   ```

4. **Configuration de la base de données**
   
   Exécuter le script SQL dans votre projet Supabase :
   ```sql
   -- Copier et exécuter le contenu de database/schema.sql
   ```

5. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

   Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📋 Fonctionnalités

### ✅ Implémentées

- [x] Page d'accueil avec design moderne
- [x] Structure du projet Next.js + TypeScript
- [x] Configuration Tailwind CSS
- [x] Composants UI de base (Button, ProductCard, ArtisanCard)
- [x] Header avec navigation et panier
- [x] Types TypeScript pour la base de données
- [x] Schéma de base de données Supabase

### 🚧 En cours de développement

- [ ] Pages produits avec filtres
- [ ] Profils des artisans
- [ ] Système d'authentification
- [ ] Panier et processus de commande
- [ ] Intégration des paiements
- [ ] Dashboard administrateur
- [ ] Blog et gestion de contenu

### 📋 À développer

- [ ] Application mobile Android
- [ ] Système de notifications
- [ ] Programme de formation pour artisans
- [ ] Génération de codes QR
- [ ] Système de reviews/évaluations

## 🎨 Guide de Style

### Couleurs

- **Primaire**: Orange (#ed751b) - Couleur terre, évoque les textiles
- **Secondaire**: Beige/Marron (#9e865d) - Couleurs naturelles
- **Texte**: Gris foncé (#1f2937)
- **Fond**: Gris clair (#f9fafb)

### Typographie

- **Titre**: Playfair Display (serif, élégant)
- **Corps**: Inter (sans-serif, moderne et lisible)

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter le repository GitHub à Vercel
2. Ajouter les variables d'environnement dans les paramètres Vercel
3. Déployer automatiquement à chaque push

### Variables d'environnement de production

Assurer-vous de configurer toutes les variables d'environnement en production :
- Variables Supabase
- Clés PayDunya de production
- JWT_SECRET sécurisé
- NEXT_PUBLIC_SITE_URL avec l'URL de production

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou support :
- Email: contact@tisseswaraniene.ci
- WhatsApp: +225 XX XX XX XX XX

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

---

**Tissés de Waraniéné** - Préserver et promouvoir l'art traditionnel du tissage sénoufo 🇨🇮