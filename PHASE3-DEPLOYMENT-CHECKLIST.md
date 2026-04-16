# 📋 Phase 3 - Checklist de Déploiement

## 1. ✅ Migration Base de Données

- [ ] Ouvrir Supabase Dashboard
- [ ] Aller à SQL Editor
- [ ] Copier contenu `database/migration-phase3-final.sql`
- [ ] Coller dans l'éditeur
- [ ] Exécuter le script
- [ ] Vérifier que les 6 tables sont créées:
  - [ ] avis
  - [ ] codes_promo
  - [ ] utilisations_promo
  - [ ] notifications
  - [ ] wishlist
  - [ ] preferences_notifications
- [ ] Vérifier les 3 codes promo de test dans codes_promo:
  - [ ] BIENVENUE10
  - [ ] NOEL20
  - [ ] LIVRAISON

## 2. 🧪 Tests Automatiques

- [ ] Accéder à [http://localhost:3000/test-integration](http://localhost:3000/test-integration)
- [ ] Cliquer "Lancer les tests"
- [ ] Vérifier que tous les tests passent:
  - [ ] TEST 1: Créer commande de test ✓
  - [ ] TEST 2: Soumettre avis ✓
  - [ ] TEST 3: Lister avis ✓
  - [ ] TEST 4: Valider code promo BIENVENUE10 ✓
  - [ ] TEST 5: Envoyer notification ✓
  - [ ] TEST 6: Admin - Lister avis en attente ✓
  - [ ] TEST 7: Lister codes promo actifs ✓
- [ ] Copier les logs pour référence

## 3. 📄 Intégration ReviewsComponent

### Dans page produit

```tsx
// src/app/produits/[id]/page.tsx (ou similar)
import ReviewsComponent from '@/components/ReviewsComponent';

export default function ProductPage({ params }) {
  return (
    <div>
      {/* ... détails produit ... */}
      <ReviewsComponent produitId={params.id} />
    </div>
  );
}
```

- [ ] Identifier la page produit existante
- [ ] Importer ReviewsComponent
- [ ] Ajouter `<ReviewsComponent produitId={produitId} />` en bas de page
- [ ] Tester:
  - [ ] Affichage avis existants
  - [ ] Formulaire d'avis (visible avec bouton)
  - [ ] Soumission avis
  - [ ] Message de modération

## 4. 🎁 Intégration PromoCodeInput

### Dans page checkout/panier

```tsx
// Dans votre page de paiement
import PromoCodeInput from '@/components/PromoCodeInput';

export default function CheckoutPage() {
  const [discount, setDiscount] = useState(0);
  const [selectedCode, setSelectedCode] = useState('');

  const handlePromoApplied = (reduction, code) => {
    setDiscount(reduction);
    setSelectedCode(code);
  };

  const finalAmount = total - discount;

  return (
    <div>
      {/* ... items panier ... */}
      <PromoCodeInput
        montantTotal={total}
        onPromoApplied={handlePromoApplied}
      />
      {discount > 0 && (
        <div>
          <p>Réduction: -{discount} FCFA</p>
          <p>Total final: {finalAmount} FCFA</p>
        </div>
      )}
      {/* ... bouton paiement ... */}
    </div>
  );
}
```

- [ ] Identifier page checkout/panier
- [ ] Importer PromoCodeInput
- [ ] Ajouter état pour réduction et code sélectionné
- [ ] Ajouter component avec montant total
- [ ] Implémenter logique onPromoApplied
- [ ] Afficher réduction et montant final
- [ ] Passer code promo à API paiement (voir étape 5)
- [ ] Tester:
  - [ ] Input code promo
  - [ ] Validation BIENVENUE10, NOEL20, etc.
  - [ ] Affichage réduction correcte
  - [ ] Montant final mis à jour

## 5. 💰 Mettre à jour API Paiement

### Ajouter support codes promo

```typescript
// src/app/api/paiement/initier/route.ts (ou similar)

export async function POST(request: NextRequest) {
  const { 
    commande_id,
    montant,
    code_promo,  // ← NOUVEAU
    reduction    // ← NOUVEAU
  } = await request.json();

  // Vérifier le code promo s'il existe
  if (code_promo) {
    const { data: promo } = await supabase
      .from('codes_promo')
      .select('*')
      .eq('code', code_promo)
      .single();

    if (!promo || promo.utilisations_actuelles >= promo.utilisations_max) {
      return NextResponse.json(
        { error: 'Code promo invalide ou limité' },
        { status: 400 }
      );
    }

    // Enregistrer utilisation
    await supabase
      .from('utilisations_promo')
      .insert({
        commande_id,
        code_promo_id: promo.id,
        reduction_appliquee: reduction
      });

    // Incrémenter utilisation
    await supabase
      .from('codes_promo')
      .update({ utilisations_actuelles: promo.utilisations_actuelles + 1 })
      .eq('id', promo.id);
  }

  // Utiliser montant - reduction pour paiement
  const montantFinal = montant - (reduction || 0);

  // ... reste de la logique paiement ...
}
```

- [ ] Ouvrir route paiement
- [ ] Ajouter paramètres code_promo et reduction
- [ ] Ajouter validation code promo
- [ ] Enregistrer utilisation dans utilisations_promo
- [ ] Calculer montant final
- [ ] Tester intégration complète checkout

## 6. ❤️ Intégration WishlistButton

### Sur cartes produits

```tsx
// Dans component ProductCard
import WishlistButton from '@/components/WishlistButton';

export function ProductCard({ product }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <h3>{product.nom}</h3>
        <WishlistButton produitId={product.id} />
      </div>
      {/* ... autres détails ... */}
    </div>
  );
}
```

- [ ] Identifier tous components affichant produits
- [ ] Importer WishlistButton
- [ ] Ajouter au coin supérieur droit
- [ ] Tester:
  - [ ] Coeur vide → clique → coeur plein (rouge)
  - [ ] LocalStorage sync
  - [ ] Sync DB si utilisateur connecté

## 7. 🔔 Notifications Preferences

### Ajouter lien dans menu utilisateur

```tsx
// Dans HeaderV2 ou menu utilisateur
{isAuthenticated && (
  <Link href="/preferences-notifications">
    <Bell className="w-5 h-5" />
    Notifications
  </Link>
)}
```

- [ ] Ajouter lien dans menu utilisateur
- [ ] Ou ajouter dans page profil utilisateur
- [ ] Vérifier que page charge correctement
- [ ] Tester:
  - [ ] Accès à la page
  - [ ] Modification préférences
  - [ ] Sauvegarde

## 8. 👥 Admin - Panel Modération

- [ ] Vérifier accès [http://localhost:3000/admin/avis](http://localhost:3000/admin/avis)
- [ ] Tester filtres:
  - [ ] Avis en attente
  - [ ] Avis approuvés
  - [ ] Avis rejetés
- [ ] Tester modération:
  - [ ] Approuver un avis
  - [ ] Rejeter un avis
  - [ ] Vérifier changement de statut
- [ ] Tester pagination

## 9. 🧪 Tests Manuels

### Scénario 1: Avis Client
- [ ] Client non connecté soumet avis
- [ ] Avis apparaît avec statut "en_attente"
- [ ] Admin reçoit email de modération
- [ ] Admin approuve avis dans /admin/avis
- [ ] Avis devient visible pour tous

### Scénario 2: Code Promo
- [ ] Client va au checkout
- [ ] Entre code "BIENVENUE10"
- [ ] Réduction 10% s'applique
- [ ] Montant final correct
- [ ] Commande créée avec usage enregistré

### Scénario 3: Wishlist
- [ ] Client clique coeur produit
- [ ] Coeur devient rouge
- [ ] Item persiste dans localStorage
- [ ] Client connecté → sync avec DB
- [ ] Client voit favoris dans profil

### Scénario 4: Notifications
- [ ] Créer nouvelle commande
- [ ] Vérifier email reçu (Mailtrap)
- [ ] Client met à jour préférences
- [ ] Tester opt-out pour email promos
- [ ] Vérifier que prochaine promo n'est pas envoyée

## 10. 📊 Monitoring & Analytics

- [ ] Vérifier logs Supabase pour erreurs
- [ ] Checker les stats admin:
  - [ ] Nombre d'avis soumis
  - [ ] Codes promo utilisés
  - [ ] Notifications envoyées
- [ ] Mettre en place monitoring pour:
  - [ ] Erreurs API
  - [ ] Email bounces
  - [ ] Code promo abuse

## 11. 🚀 Déploiement Production

- [ ] Vérifier tous tests passent en production
- [ ] Variables d'environnement correctes:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] JWT_SECRET
  - [ ] MAILTRAP_EMAIL_CONFIG
  - [ ] (TWILIO_CONFIG si SMS actif)
- [ ] Exécuter migration SQL sur DB production
- [ ] Redéployer application
- [ ] Tester e2e en production

## 12. 📝 Documentation

- [ ] Lire [PHASE3-GUIDE.md](./PHASE3-GUIDE.md)
- [ ] Mettre en place runbook pour team
- [ ] Former équipe support sur:
  - [ ] Modération avis
  - [ ] Gestion codes promo
  - [ ] Suivi notifications

## Points de Vérification Finals

- [ ] ✅ Pas d'erreurs console (npm run dev)
- [ ] ✅ Tous tests /test-integration passent
- [ ] ✅ Migration SQL exécutée en Supabase
- [ ] ✅ RLS policies actives et correctes
- [ ] ✅ Notifications envoyées (Mailtrap)
- [ ] ✅ Admin panel accessible et fonctionnel
- [ ] ✅ Components intégrés dans pages
- [ ] ✅ Aucun warning de types TypeScript

## Problèmes Potentiels & Solutions

### Issue: "Code promo invalide"
**Solution**: Vérifier dans Supabase que:
1. Code existe dans codes_promo
2. Date actuelle dans range [date_debut, date_fin]
3. utilisations_actuelles < utilisations_max

### Issue: "Avis ne s'affiche pas"
**Solution**: Vérifier que:
1. Statut = 'approuve'
2. RLS policy permet SELECT pour statut='approuve'
3. Produit_id existe et match

### Issue: "Email de modération non reçu"
**Solution**: Vérifier:
1. MAILTRAP_EMAIL_CONFIG correctement configuré
2. Service email actif
3. Logs Mailtrap pour bounces

### Issue: "Notification SMS ne fonctionne pas"
**Solution**: SMS est placeholder Twilio - à implémenter avec vraies credentials

---

**Status**: Ready for Deployment  
**Estimated Time**: 2-3 hours complete  
**Risk Level**: Low (backward compatible)

