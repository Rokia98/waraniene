# 💰 Système de Portefeuilles et Gestion Financière
## Tissés de Waraniéné - Documentation Complète

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du système](#architecture-du-système)
3. [Tables de la base de données](#tables-de-la-base-de-données)
4. [Workflow de paiement](#workflow-de-paiement)
5. [API Artisan](#api-artisan)
6. [API Admin](#api-admin)
7. [Installation et Migration](#installation-et-migration)
8. [Exemples d'utilisation](#exemples-dutilisation)

---

## 🎯 Vue d'ensemble

### Fonctionnalités principales

✅ **Portefeuilles individuels** - Chaque artisan possède son propre portefeuille financier  
✅ **Commission automatique** - L'admin reçoit automatiquement 10% de chaque vente  
✅ **Revenus en attente** - L'argent est bloqué jusqu'à la livraison confirmée  
✅ **Demandes de retrait** - Les artisans peuvent retirer leur argent (Orange Money, MTN, Virement, Espèces)  
✅ **Approbation produits** - L'admin doit approuver chaque produit avant affichage  
✅ **Modération avis** - L'admin peut approuver/rejeter les avis clients (déjà implémenté)  
✅ **Historique transparent** - Toutes les transactions sont tracées  

### Distribution des revenus

```
Vente de 10 000 FCFA
├─ Artisan : 9 000 FCFA (90%)
└─ Admin   : 1 000 FCFA (10%)
```

---

## 🏗️ Architecture du système

### États d'un paiement

```
1. CLIENT PAIE
   └─> Paiement créé (statut: 'paye')
   
2. WEBHOOK CONFIRMÉ
   └─> Distribution automatique des revenus
       ├─> Portefeuille artisan : +9 000 FCFA (en attente)
       └─> Portefeuille admin   : +1 000 FCFA (en attente)
   
3. COMMANDE LIVRÉE
   └─> Confirmation des revenus
       ├─> Artisan : solde_en_attente → solde (disponible)
       └─> Admin   : solde_en_attente → solde (disponible)
   
4. ARTISAN DEMANDE RETRAIT
   └─> Admin approuve et traite
       └─> Débit du portefeuille artisan
```

### Cycle de vie d'un produit

```
1. ARTISAN CRÉE PRODUIT
   └─> statut_approbation: 'en_attente'
       └─> Produit NON VISIBLE sur la plateforme
   
2. ADMIN APPROUVE
   └─> statut_approbation: 'approuve'
       └─> Produit VISIBLE et achetable
   
3. ADMIN REJETTE
   └─> statut_approbation: 'rejete'
       └─> Produit INACTIF et NON VISIBLE
```

---

## 📊 Tables de la base de données

### Table `portefeuilles`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | CHAR(36) | ID unique du portefeuille |
| `artisan_id` | CHAR(36) | ID de l'artisan (NULL pour admin) |
| `type_portefeuille` | ENUM | 'artisan' ou 'admin' |
| `solde` | DECIMAL(10,2) | Solde disponible pour retrait |
| `solde_en_attente` | DECIMAL(10,2) | Revenus des commandes non livrées |
| `total_revenus` | DECIMAL(10,2) | Total historique des revenus |
| `total_retraits` | DECIMAL(10,2) | Total historique des retraits |
| `statut` | ENUM | 'actif', 'suspendu', 'bloque' |

### Table `transactions_financieres`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | CHAR(36) | ID unique de la transaction |
| `portefeuille_id` | CHAR(36) | Référence au portefeuille |
| `type_transaction` | ENUM | 'credit_vente', 'credit_commission', 'debit_retrait', etc. |
| `montant` | DECIMAL(10,2) | Montant (positif pour crédit, négatif pour débit) |
| `solde_avant` | DECIMAL(10,2) | Solde avant la transaction |
| `solde_apres` | DECIMAL(10,2) | Solde après la transaction |
| `commande_id` | CHAR(36) | Référence à la commande (si applicable) |
| `produit_id` | CHAR(36) | Référence au produit vendu |
| `description` | TEXT | Description de la transaction |
| `metadata` | JSON | Données supplémentaires (%, IDs, etc.) |

### Table `retraits`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | CHAR(36) | ID unique de la demande |
| `portefeuille_id` | CHAR(36) | Référence au portefeuille |
| `artisan_id` | CHAR(36) | ID de l'artisan demandeur |
| `montant` | DECIMAL(10,2) | Montant à retirer |
| `statut` | ENUM | 'en_attente', 'approuve', 'traite', 'rejete' |
| `methode_retrait` | ENUM | 'orange_money', 'mtn_money', 'virement', 'especes' |
| `numero_telephone` | VARCHAR(20) | Numéro pour Mobile Money |
| `notes_artisan` | TEXT | Notes de l'artisan |
| `notes_admin` | TEXT | Notes de l'admin |

### Modification table `produits`

**Nouveaux champs ajoutés :**

| Colonne | Type | Description |
|---------|------|-------------|
| `statut_approbation` | ENUM | 'en_attente', 'approuve', 'rejete' |
| `date_approbation` | TIMESTAMP | Date d'approbation/rejet |
| `approuve_par` | CHAR(36) | ID de l'admin qui a approuvé |
| `notes_approbation` | TEXT | Notes de l'admin |

---

## 🔄 Workflow de paiement

### 1. Client confirme commande

```http
POST /api/paiement/initier
{
  "commande_id": "xxx",
  "methode": "orange_money"
}
```

**Réponse :** URL de paiement KKiaPay/PayDunya

### 2. Webhook confirmation paiement

```http
POST /api/paiement/webhook
{
  "transaction_id": "xxx",
  "status": "success"
}
```

**Actions automatiques :**
- Mise à jour paiement → `statut: 'paye'`
- Appel automatique : `POST /api/paiement/distribuer-revenus`

### 3. Distribution automatique

```sql
CALL distribuer_revenus_paiement('paiement_id');
```

**Résultat :**
- Pour chaque produit de la commande :
  - Calcul 90/10 %
  - Crédit portefeuille artisan (`solde_en_attente`)
  - Crédit portefeuille admin (`solde_en_attente`)
  - Création transactions dans `transactions_financieres`
  - Marquage `paiements.revenus_distribues = TRUE`

### 4. Livraison confirmée

```http
PATCH /api/commandes/[id]
{
  "statut": "livree"
}
```

**Actions automatiques :**
- Appel : `POST /api/paiement/distribuer-revenus` (PATCH)
- Transfert `solde_en_attente` → `solde`
- L'argent devient disponible pour retrait

---

## 👨‍🎨 API Artisan

### 📱 Voir son portefeuille

```http
GET /api/artisan/portefeuille
Headers:
  x-artisan-id: {artisan_id}
```

**Réponse :**

```json
{
  "portefeuille": {
    "id": "xxx",
    "solde_disponible": 125000.00,
    "solde_en_attente": 45000.00,
    "total_revenus": 350000.00,
    "total_retraits": 180000.00,
    "statut": "actif"
  },
  "transactions": [
    {
      "id": "xxx",
      "type": "credit_vente",
      "montant": 9000.00,
      "description": "Vente produit - Commande #abc123",
      "date": "2026-03-26T10:30:00Z"
    }
  ],
  "statistiques": {
    "total_commandes": 38,
    "total_ventes": 350000.00,
    "total_transactions": 92
  }
}
```

### 💸 Demander un retrait

```http
POST /api/artisan/retraits
Headers:
  x-artisan-id: {artisan_id}
Body:
{
  "montant": 50000,
  "methode_retrait": "orange_money",
  "numero_telephone": "+225 07 12 34 56 78",
  "notes": "Retrait pour achat matériel"
}
```

**Réponse :**

```json
{
  "success": true,
  "retrait": {
    "id": "xxx",
    "montant": 50000.00,
    "statut": "en_attente",
    "methode_retrait": "orange_money",
    "created_at": "2026-03-26T14:20:00Z"
  }
}
```

**Erreurs possibles :**
- Solde insuffisant
- Demande déjà en attente
- Montant invalide

### 📜 Voir historique retraits

```http
GET /api/artisan/retraits
Headers:
  x-artisan-id: {artisan_id}
```

**Réponse :**

```json
{
  "retraits": [
    {
      "id": "xxx",
      "montant": 50000.00,
      "statut": "traite",
      "methode_retrait": "orange_money",
      "date_traitement": "2026-03-25T16:45:00Z",
      "notes_admin": "Retrait effectué avec succès"
    }
  ]
}
```

---

## 🔐 API Admin

### 💰 Voir tous les portefeuilles

```http
GET /api/admin/portefeuilles
Headers:
  x-is-admin: true
```

**Réponse :**

```json
{
  "portefeuilles": [
    {
      "id": "admin-wallet-001",
      "type": "admin",
      "artisan": null,
      "solde_disponible": 125000.00,
      "solde_en_attente": 35000.00,
      "total_revenus": 450000.00,
      "statut": "actif"
    },
    {
      "id": "xxx",
      "type": "artisan",
      "artisan": {
        "nom": "Mamadou Koné",
        "telephone": "+225 07 12 34 56 78"
      },
      "solde_disponible": 180000.00,
      "solde_en_attente": 20000.00,
      "total_revenus": 890000.00,
      "retraits_en_attente": 1
    }
  ],
  "statistiques": {
    "total_soldes": 1250000.00,
    "total_en_attente": 450000.00,
    "total_revenus_plateforme": 5400000.00,
    "commission_admin": {
      "solde_disponible": 125000.00,
      "total_commissions": 450000.00
    }
  }
}
```

### 📋 Voir demandes de retrait

```http
GET /api/admin/retraits?statut=en_attente
Headers:
  x-is-admin: true
```

**Réponse :**

```json
{
  "retraits": [
    {
      "id": "xxx",
      "artisan": {
        "id": "xxx",
        "nom": "Mamadou Koné",
        "telephone": "+225 07 12 34 56 78"
      },
      "montant": 50000.00,
      "statut": "en_attente",
      "methode_retrait": "orange_money",
      "numero_telephone": "+225 07 12 34 56 78",
      "solde_portefeuille": 125000.00,
      "created_at": "2026-03-26T14:20:00Z"
    }
  ]
}
```

### ✅ Approuver/Traiter/Rejeter un retrait

```http
PATCH /api/admin/retraits/{id}
Headers:
  x-is-admin: true
Body:
{
  "action": "approuver",  // ou "traiter" ou "rejeter"
  "notes_admin": "Retrait approuvé"
}
```

**Actions disponibles :**

| Action | État requis | Résultat |
|--------|------------|----------|
| `approuver` | en_attente | Passe à 'approuve', aucun débit |
| `traiter` | approuve | Débite le portefeuille, passe à 'traite' |
| `rejeter` | en_attente ou approuve | Passe à 'rejete', aucun débit |

**Réponse (traiter) :**

```json
{
  "success": true,
  "message": "Retrait traité avec succès",
  "nouveau_solde": 75000.00
}
```

### 📦 Voir produits en attente d'approbation

```http
GET /api/admin/produits/approbation?statut=en_attente
Headers:
  x-is-admin: true
```

**Réponse :**

```json
{
  "produits": [
    {
      "id": "xxx",
      "nom_produit": "Pagne Traditionnel Bleu",
      "description": "...",
      "categorie": "pagne",
      "prix": 25000.00,
      "statut": "actif",
      "statut_approbation": "en_attente",
      "artisan": {
        "id": "xxx",
        "nom": "Fatima Ouattara",
        "telephone": "+225 05 87 65 43 21"
      },
      "photos": ["url1.jpg", "url2.jpg"],
      "created_at": "2026-03-26T09:15:00Z"
    }
  ]
}
```

### ✅ Approuver/Rejeter un produit

```http
PATCH /api/admin/produits/approbation/{id}
Headers:
  x-is-admin: true
  x-admin-id: {admin_id}
Body:
{
  "action": "approuver",  // ou "rejeter"
  "notes": "Produit de qualité, approuvé"
}
```

**Réponse :**

```json
{
  "success": true,
  "message": "Produit approuvé avec succès",
  "produit": {
    "id": "xxx",
    "nom_produit": "Pagne Traditionnel Bleu",
    "statut_approbation": "approuve",
    "statut": "actif",
    "date_approbation": "2026-03-26T15:30:00Z"
  }
}
```

---

## 🚀 Installation et Migration

### 1. Exécuter la migration SQL

```bash
# Depuis Laragon ou MySQL Workbench
mysql -u root -p waraniene_db < database/migration-portefeuilles-et-approbations.sql
```

**OU via terminal PowerShell :**

```powershell
cd C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin
.\mysql.exe -u root -p waraniene_db -e "source C:/Users/HP/Documents/waraniene/database/migration-portefeuilles-et-approbations.sql"
```

### 2. Vérifier les tables créées

```sql
USE waraniene_db;
SHOW TABLES LIKE 'portefeuilles';
SHOW TABLES LIKE 'transactions_financieres';
SHOW TABLES LIKE 'retraits';
DESCRIBE produits; -- Vérifier les nouveaux champs
```

### 3. Vérifier le portefeuille admin créé

```sql
SELECT * FROM portefeuilles WHERE type_portefeuille = 'admin';
```

### 4. Vérifier les portefeuilles artisans créés

```sql
SELECT 
  p.id,
  p.type_portefeuille,
  a.nom as artisan_nom,
  p.solde,
  p.created_at
FROM portefeuilles p
LEFT JOIN artisans a ON p.artisan_id = a.id
ORDER BY p.created_at DESC;
```

### 5. Tester la distribution de revenus (optionnel)

```sql
-- Créer un paiement de test
INSERT INTO paiements (id, commande_id, montant, statut, revenus_distribues)
VALUES (UUID(), 'commande-test-id', 10000.00, 'paye', FALSE);

-- Distribuer les revenus
CALL distribuer_revenus_paiement('id-du-paiement-test');

-- Vérifier les transactions créées
SELECT * FROM transactions_financieres ORDER BY created_at DESC LIMIT 10;
```

---

## 📝 Exemples d'utilisation

### Scénario complet : De la vente au retrait

#### 1. Client achète un produit à 10 000 FCFA

```http
POST /api/checkout
{
  "panier_items": [...],
  "methode_paiement": "orange_money"
}
```

**Résultat :** Commande créée, paiement initié

#### 2. Webhook confirme paiement

```http
POST /api/paiement/webhook
{
  "transaction_id": "KK-TXN-123",
  "status": "success"
}
```

**Actions automatiques :**
- Paiement marqué `paye`
- Distribution revenus :
  - Artisan : +9 000 FCFA (solde_en_attente)
  - Admin   : +1 000 FCFA (solde_en_attente)

#### 3. Admin marque commande livrée

```http
PATCH /api/commandes/{id}
{ "statut": "livree" }
```

**Actions automatiques :**
- Transfert `solde_en_attente` → `solde`
- Artisan peut maintenant retirer 9 000 FCFA

#### 4. Artisan demande retrait

```http
POST /api/artisan/retraits
{
  "montant": 9000,
  "methode_retrait": "orange_money",
  "numero_telephone": "+225 07 12 34 56 78"
}
```

**Résultat :** Demande créée avec statut `en_attente`

#### 5. Admin approuve et traite

```http
# Approuver
PATCH /api/admin/retraits/{id}
{ "action": "approuver" }

# Traiter (effectuer le virement)
PATCH /api/admin/retraits/{id}
{ "action": "traiter", "notes_admin": "Retrait Orange Money effectué" }
```

**Résultat :** 
- Portefeuille artisan débité de 9 000 FCFA
- Transaction enregistrée
- Demande marquée `traite`

---

## 🎯 Points importants

### ⚠️ Sécurité

1. **Authentification obligatoire** - Toutes les API nécessitent authentification
2. **Headers requis :**
   - Artisan : `x-artisan-id`
   - Admin : `x-is-admin`, `x-admin-id`
3. **Validation des montants** - Empêche soldes négatifs
4. **Historique complet** - Toutes les transactions sont tracées

### 💡 Bonnes pratiques

1. **Solde en attente** - Protège contre les annulations/retours
2. **Approbation produits** - Contrôle qualité avant publication
3. **Workflow retrait** - Séparation approuver/traiter pour sécurité
4. **Notifications** - Informer artisans des approbations/retraits (à implémenter)

### 🔄 Prochaines étapes

1. [ ] Implémenter système d'authentification JWT
2. [ ] Ajouter notifications (email/SMS) pour retraits
3. [ ] Créer dashboard artisan (voir portefeuille, demander retrait)
4. [ ] Créer dashboard admin (gérer retraits, approuver produits)
5. [ ] Ajouter rapports financiers (exports PDF/Excel)
6. [ ] Implémenter système de remboursement
7. [ ] Ajouter limite minimale de retrait (ex: 5 000 FCFA)

---

## 📞 Support

Pour toute question sur ce système :
- Vérifier les logs MySQL : `SHOW ENGINE INNODB STATUS;`
- Vérifier les transactions : `SELECT * FROM transactions_financieres ORDER BY created_at DESC;`
- Vérifier les portefeuilles : `SELECT * FROM portefeuilles;`

---

**Développé pour Tissés de Waraniéné 🇨🇮**  
*Version 1.0 - Mars 2026*
