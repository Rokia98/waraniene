# 🔧 Configuration FusionPay - Guide étape par étape

## 📍 Étape 1 : Trouvez vos clés API

### Sur le dashboard FusionPay, cherchez :
1. Menu latéral → **"Paramètres"** ou **"Settings"**
2. Puis → **"API"** ou **"Intégration"** ou **"Développeurs"**
3. Vous devriez voir un bouton **"Générer les clés"** ou **"Créer API Key"**

### Clés à récupérer :
- ✅ **API Key** (Public Key) - Pour identifier votre compte
- ✅ **Secret Key** (Private Key) - Pour signer les requêtes
- ✅ **Merchant ID** (optionnel) - Votre identifiant marchand

---

## 📝 Étape 2 : Ajoutez les clés dans .env.local

Ouvrez le fichier `.env.local` à la racine du projet et remplacez :

```env
# Payment Configuration - FusionPay
FUSIONPAY_API_KEY=votre_api_key_ici
FUSIONPAY_SECRET_KEY=votre_secret_key_ici
FUSIONPAY_BASE_URL=https://api.fusionpay.io/v1
NEXT_PUBLIC_FUSIONPAY_MODE=test
```

Par vos vraies clés :

```env
# Payment Configuration - FusionPay
FUSIONPAY_API_KEY=fp_live_xxxxxxxxxxxxxxxxxx
FUSIONPAY_SECRET_KEY=fp_secret_xxxxxxxxxxxxxxxxxx
FUSIONPAY_BASE_URL=https://api.fusionpay.io/v1
NEXT_PUBLIC_FUSIONPAY_MODE=test
```

---

## 🗄️ Étape 3 : Créez la table paiements

### Ouvrez Supabase :
1. Allez sur https://supabase.com
2. Sélectionnez votre projet **waraniene**
3. Menu **SQL Editor** (à gauche)
4. Cliquez **"New Query"**

### Copiez-collez ce SQL :

```sql
-- Création de la table paiements
CREATE TABLE IF NOT EXISTS paiements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE NOT NULL,
  montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  methode_paiement VARCHAR(50),
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'paye', 'echec', 'rembourse', 'annule')),
  numero_transaction VARCHAR(255) UNIQUE,
  numero_reference VARCHAR(255),
  details_paiement JSONB,
  date_paiement TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_paiements_commande_id ON paiements(commande_id);
CREATE INDEX IF NOT EXISTS idx_paiements_statut ON paiements(statut);
CREATE INDEX IF NOT EXISTS idx_paiements_numero_transaction ON paiements(numero_transaction);

-- Trigger
CREATE TRIGGER update_paiements_updated_at 
  BEFORE UPDATE ON paiements 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access paiements" 
  ON paiements FOR ALL 
  USING (current_setting('role') = 'service_role');
```

### Exécutez la requête :
Cliquez sur **"Run"** ou appuyez sur **Ctrl+Enter**

---

## 🚀 Étape 4 : Testez le paiement

### Mode Test (recommandé pour commencer) :

1. **Redémarrez le serveur** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

2. **Testez le flux** :
   - Ajoutez un produit au panier
   - Allez au checkout
   - Remplissez le formulaire
   - Cliquez "Confirmer la commande"
   - Vous serez redirigé vers la page de paiement FusionPay

3. **Numéros de test FusionPay** (si en mode test) :
   - Orange Money : `07 00 00 00 01`
   - MTN Money : `05 00 00 00 01`
   - Carte bancaire : `4111 1111 1111 1111`

---

## ✅ Checklist avant de tester :

- [ ] Clés API ajoutées dans `.env.local`
- [ ] Table `paiements` créée dans Supabase
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Mode test activé (`NEXT_PUBLIC_FUSIONPAY_MODE=test`)

---

## 🆘 En cas de problème :

### "Transaction échouée" :
- Vérifiez que vos clés sont correctes
- Assurez-vous d'être en mode `test`
- Vérifiez les logs dans la console

### "Callback non reçu" :
- Normal en développement local
- FusionPay ne peut pas envoyer de callback vers `localhost`
- Utilisez la vérification manuelle du statut

### "Table paiements introuvable" :
- Exécutez la migration SQL dans Supabase
- Vérifiez que la table existe dans **Table Editor**

---

## 📞 Support FusionPay :

Si vous ne trouvez toujours pas les clés :
- 📧 Email : support@fusionpay.io
- 💬 Chat sur le dashboard
- 📖 Documentation : https://docs.fusionpay.io

---

**Quelle étape voulez-vous faire maintenant ?**
1. Trouver les clés API sur le dashboard
2. Créer la table paiements
3. Tester le paiement
