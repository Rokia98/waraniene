# Configuration Supabase pour Tissés de Waraniéné

## ✅ Configuration terminée avec votre structure existante !

### Structure des tables détectées dans votre base :

1. **acheteurs** - Clients de la plateforme
2. **admins** - Administrateurs du système  
3. **artisans** - Profils des artisans
4. **commandes** - Commandes des clients
5. **detail_commandes** - Détails des articles commandés
6. **panier** - Paniers d'achat
7. **produits** - Catalogue des produits
8. **qr_codes** - Codes QR pour les produits

### API adaptées à votre structure :

✅ **GET /api/produits** - Liste des produits avec informations artisan  
✅ **POST /api/produits** - Créer un nouveau produit  
✅ **GET /api/artisans** - Liste des artisans avec nombre de produits  
✅ **POST /api/artisans** - Créer un nouvel artisan  
✅ **GET /api/test** - Test de connexion Supabase  

### Paramètres API disponibles :

#### Produits (/api/produits) :
- `categorie` : pagne, vetement, accessoire
- `artisan_id` : ID de l'artisan
- `prix_min` / `prix_max` : Filtrage par prix
- `search` : Recherche dans nom et description
- `limite` : Nombre de résultats (défaut: 20)
- `offset` : Pagination (défaut: 0)
- `sortBy` : date_desc, prix_asc, prix_desc
- `sortOrder` : asc, desc

#### Artisans (/api/artisans) :
- `localisation` : Filtrage par localisation
- `statut` : actif, inactif, suspendu (défaut: actif)
- `search` : Recherche dans nom, bio, localisation
- `limite` : Nombre de résultats (défaut: 20)
- `offset` : Pagination (défaut: 0)

### Structure des réponses :

```json
// GET /api/produits
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nom_produit": "string",
      "description": "string",
      "categorie": "pagne|vetement|accessoire",
      "prix": "number",
      "stock": "number",
      "statut": "actif|inactif|rupture",
      "photos": ["url1", "url2"],
      "artisan": {
        "id": "uuid",
        "nom": "string",
        "photo": "url",
        "localisation": "string",
        "telephone": "string",
        "statut": "actif|inactif|suspendu"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limite": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

## 🧪 Tests disponibles :

### Test de connexion :
```
GET http://localhost:3001/api/test
```

### Test des produits :
```
GET http://localhost:3001/api/produits
GET http://localhost:3001/api/produits?categorie=pagne
GET http://localhost:3001/api/produits?search=traditionnel
```

### Test des artisans :
```
GET http://localhost:3001/api/artisans
GET http://localhost:3001/api/artisans?localisation=Korhogo
```

## 🚀 Serveur en cours d'exécution :

- **URL locale** : http://localhost:3001
- **Statut** : ✅ Démarré sans erreur
- **Configuration** : ✅ Variables d'environnement OK

## 📝 Données d'exemple pour tests :

### Créer un artisan :
```bash
curl -X POST http://localhost:3001/api/artisans \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Aminata Koné",
    "bio": "Artisane passionnée spécialisée dans les boubous traditionnels",
    "localisation": "Korhogo",
    "telephone": "+22507123456",
    "langue": "fr"
  }'
```

### Créer un produit :
```bash
curl -X POST http://localhost:3001/api/produits \
  -H "Content-Type: application/json" \
  -d '{
    "nom_produit": "Boubou Traditionnel Rouge",
    "description": "Magnifique boubou tissé à la main",
    "categorie": "vetement",
    "prix": 75000,
    "stock": 5,
    "artisan_id": "ID_ARTISAN",
    "photos": ["url1", "url2"]
  }'
```

## ✅ Prochaines étapes :

1. **Tester les API** avec les endpoints ci-dessus
2. **Ajouter des données** via les API POST
3. **Développer l'interface** utilisateur
4. **Configurer l'authentification** si nécessaire
5. **Optimiser les performances** avec des index

Votre backend Supabase est maintenant pleinement opérationnel ! 🎉