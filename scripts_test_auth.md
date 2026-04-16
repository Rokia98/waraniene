# 🧪 Scripts de Test Authentification

## ✅ **Inscription avec email unique**
```powershell
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$body = @{
    nom = "Test User $timestamp"
    email = "test$timestamp@example.com"
    mot_de_passe = "password123"
    telephone = "+22507123456"
    adresse = "Abidjan, Côte d'Ivoire"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

## 🔐 **Connexion avec compte existant**
```powershell
$loginBody = @{
    email = "test@example.com"
    mot_de_passe = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
```

## 👥 **Voir tous les utilisateurs**
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/acheteurs" -Method GET
```

## 🗑️ **Supprimer un utilisateur (si nécessaire)**
```powershell
# Remplacez USER_ID par l'ID de l'utilisateur
$userId = "USER_ID_HERE"
Invoke-RestMethod -Uri "http://localhost:3002/api/acheteurs/$userId" -Method DELETE
```

---

## 📋 **Codes de réponse**

| Code | Signification | Solution |
|------|---------------|----------|
| 200/201 | ✅ Succès | Tout fonctionne |
| 400 | ❌ Données invalides | Vérifier les champs obligatoires |
| 401 | ❌ Non autorisé | Email/mot de passe incorrect |
| 409 | ⚠️ Conflit | Email déjà utilisé - utiliser un autre email |
| 500 | 💥 Erreur serveur | Vérifier les logs serveur |

---

## 🔄 **Test complet automatique**
```powershell
# Script pour tester inscription + connexion
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$email = "test$timestamp@example.com"
$password = "password123"

# 1. Inscription
Write-Host "🧪 Test inscription..." -ForegroundColor Yellow
$registerBody = @{
    nom = "Auto Test $timestamp"
    email = $email
    mot_de_passe = $password
    telephone = "+22507123456"
} | ConvertTo-Json

try {
    $registerResult = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Inscription réussie !" -ForegroundColor Green
    Write-Host "Token: $($registerResult.token.Substring(0,50))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur inscription: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Connexion
Write-Host "🔐 Test connexion..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    mot_de_passe = $password
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Connexion réussie !" -ForegroundColor Green
    Write-Host "Utilisateur: $($loginResult.acheteur.nom) ($($loginResult.acheteur.email))" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur connexion: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Tests terminés !" -ForegroundColor Magenta
```

## 🚀 **Utilisation**

1. **Copier/coller** les scripts dans PowerShell
2. **Exécuter** pour tester rapidement
3. **Vérifier** les résultats dans la console
4. **Utiliser** `/debug-auth` pour interface graphique