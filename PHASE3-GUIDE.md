# 🚀 Phase 3 - Engagement & Optimization

## Vue d'ensemble

Phase 3 ajoute des fonctionnalités essentielles pour maximiser l'engagement client et augmenter les conversions:

- ⭐ **Système d'Avis** - Clients laissent des avis, admin modère
- 🎁 **Codes Promo** - Réductions flexibles et traçables
- 🔔 **Notifications** - Email & SMS pour commandes et promos
- ❤️ **Wishlist** - Clients gardent une liste de favoris

## Installation & Activation

### 1. Exécuter la Migration SQL

Copier le contenu de `database/migration-phase3-final.sql` dans l'éditeur SQL Supabase:

```
1. Aller à Supabase Dashboard → SQL Editor
2. Copier tout le contenu du fichier migration-phase3-final.sql
3. Coller dans l'éditeur
4. Cliquer "Execute"
5. Vérifier les tables créées ✓
```

### 2. Tester les Endpoints

Accéder à [http://localhost:3000/test-integration](http://localhost:3000/test-integration)

Cette page teste automatiquement:
- ✅ POST /api/produits/[id]/avis
- ✅ GET /api/produits/[id]/avis
- ✅ POST /api/codes-promo
- ✅ POST /api/notifications
- ✅ GET /api/admin/avis

## Architecture

### Tables Supabase

```sql
-- Avis (Reviews)
avis(id, produit_id, nom_acheteur, note, titre, commentaire, statut)

-- Codes Promo
codes_promo(id, code, type_reduction, valeur_reduction, montant_min, date_fin)

-- Notifications
notifications(id, acheteur_id, email, type, data, created_at)

-- Wishlist
wishlist(id, acheteur_id, produit_id)

-- Préférences Notifications
preferences_notifications(acheteur_id, email_commande, sms_promo, ...)
```

### API Routes

```
POST   /api/produits/[id]/avis         - Soumettre avis
GET    /api/produits/[id]/avis         - Lister avis approuvés
POST   /api/codes-promo                - Valider code
GET    /api/codes-promo                - Lister codes actifs
POST   /api/notifications              - Envoyer notification
GET    /api/admin/avis                 - Lister avis (admin)
PUT    /api/admin/avis/[id]            - Approuver/Rejeter (admin)
POST   /api/wishlist                   - Ajouter favori
DELETE /api/wishlist                   - Retirer favori
POST   /api/preferences-notifications  - Enregistrer préférences
```

### React Components

```tsx
// Pages
/admin/avis                    - Dashboard modération
/preferences-notifications     - Paramètres notifications
/test-phase3                  - Tests endpoints
/test-integration             - Tests complets

// Components
ReviewsComponent              - Affichage + formulaire avis
PromoCodeInput                - Input validation codes
WishlistButton                - Bouton favoris
```

## Codes Promo de Test

Après exécution du SQL:

| Code | Type | Réduction | Min | Durée |
|------|------|-----------|-----|-------|
| BIENVENUE10 | % | 10% | 20k FCFA | 60j |
| NOEL20 | % | 20% | 50k FCFA | 30j |
| LIVRAISON | Montant | 5k FCFA | 100k FCFA | 90j |

## Intégration dans Pages Existantes

### Product Page - Ajouter Avis

```tsx
import ReviewsComponent from '@/components/ReviewsComponent';

export default function ProductPage({ params }) {
  return (
    <>
      {/* ... détails produit ... */}
      <ReviewsComponent produitId={params.id} />
    </>
  );
}
```

### Checkout - Ajouter Code Promo

```tsx
import PromoCodeInput from '@/components/PromoCodeInput';

export default function CheckoutPage() {
  const [discount, setDiscount] = useState(0);

  return (
    <>
      {/* ... items panier ... */}
      <PromoCodeInput
        montantTotal={total}
        onPromoApplied={(reduction, code) => setDiscount(reduction)}
      />
      <p>Total: {total - discount} FCFA</p>
    </>
  );
}
```

### Product Card - Ajouter Wishlist

```tsx
import WishlistButton from '@/components/WishlistButton';

export default function ProductCard({ product }) {
  return (
    <div>
      <WishlistButton produitId={product.id} />
      {/* ... autres détails ... */}
    </div>
  );
}
```

## Features Détaillées

### ⭐ Avis

- Clients donnent note 1-5 + commentaire
- Admin reçoit email pour modération
- Avis approuvés visibles publiquement
- Note moyenne calculée en temps réel
- Badge "Acheté chez nous" pour vérification

```typescript
// Soumettre avis
POST /api/produits/1/avis
{
  nom_acheteur: "Marie",
  email_acheteur: "marie@example.com",
  note: 5,
  titre: "Excellent produit!",
  commentaire: "Très satisfaite...",
  achete_chez_nous: true
}
```

### 🎁 Codes Promo

- Support réductions en % ou montant fixe
- Montant minimum configurable
- Limites d'utilisation par code
- Dates de validité automatiques
- Tracking usage par commande

```typescript
// Valider code
POST /api/codes-promo
{
  code: "BIENVENUE10",
  montant: 50000
}
→ { type_reduction: "pourcentage", valeur_reduction: 10, ... }
```

### 🔔 Notifications

- Email confirmations, promos, demandes avis
- SMS alerts (Twilio ready)
- Préférences par utilisateur
- Audit log complet
- Template personnalisables

```typescript
// Envoyer notification
POST /api/notifications
{
  type: "commande_confirmee",
  email: "client@example.com",
  data: { numero_commande: "CMD-001", ... }
}
```

### ❤️ Wishlist

- Stockage localStorage (instant)
- Sync avec DB si connecté
- Accès depuis profil utilisateur
- Notifications quand prix baisse (optionnel)

## Admin Panel

Accéder à [http://localhost:3000/admin/avis](http://localhost:3000/admin/avis)

- ⏳ Voir avis en attente
- ✅ Approuver avis
- ❌ Rejeter avis
- 📊 Statistiques note moyenne

## Préférences Utilisateur

Accéder à [http://localhost:3000/preferences-notifications](http://localhost:3000/preferences-notifications)

Clients peuvent désactiver:
- Email commandes
- Email promotions
- Email avis
- SMS (toutes catégories)

## Testing

### Page de Test Automatique

```
/test-phase3           - Tests rapides endpoints
/test-integration      - Test complet avec logs détaillés
```

### Commandes cURL

```bash
# Soumettre avis
curl -X POST http://localhost:3000/api/produits/1/avis \
  -H "Content-Type: application/json" \
  -d '{"nom_acheteur":"Test","email_acheteur":"test@ex.com","note":5,"titre":"Bon","commentaire":"OK","achete_chez_nous":true}'

# Valider promo
curl -X POST http://localhost:3000/api/codes-promo \
  -H "Content-Type: application/json" \
  -d '{"code":"BIENVENUE10","montant":50000}'

# Lister codes actifs
curl http://localhost:3000/api/codes-promo
```

## Roadmap (Phase 4+)

- [ ] Système de notation par catégorie (qualité, livraison, etc.)
- [ ] Upload photos pour avis
- [ ] Avis par email post-livraison
- [ ] Analytics avis vs conversions
- [ ] A/B testing codes promo
- [ ] Wishlist partageables
- [ ] Notifications push web
- [ ] SMS gateway intégration complète

## Troubleshooting

**Erreur: "Code invalide"**
- Vérifier que le code existe dans la DB
- Vérifier date de validité (CURRENT_DATE BETWEEN date_debut AND date_fin)
- Vérifier montant minimum

**Erreur: "Avis non trouvé"**
- Vérifier que le produit_id existe
- Vérifier que le statut est 'approuve' pour affichage public

**SMS ne s'envoie pas**
- Configuration Twilio manquante
- Code SMS est actuellement un placeholder
- À implémenter avec vraies credentials

## Dépendances

```json
{
  "next": "^14.2.14",
  "react": "^18",
  "react-hot-toast": "^2.x",
  "@supabase/supabase-js": "^2.x",
  "jose": "^4.x"
}
```

## Support

Pour questions sur Phase 3:
1. Vérifier `/test-integration` pour diagnostiquer
2. Consulter les logs Supabase
3. Vérifier RLS policies si données non visibles

---

**Status**: ✅ Implémentation complète  
**Dernière mise à jour**: December 2025  
**Next Phase**: Analytics & Optimisations
