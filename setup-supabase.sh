#!/bin/bash

# Script d'initialisation de la base de données Supabase
# Pour le projet Tissés de Waraniéné

echo "🚀 Initialisation de la base de données Supabase..."
echo "================================================="

# Vérifier si les variables d'environnement sont définies
if [ -z "$SUPABASE_PROJECT_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Erreur: Variables d'environnement manquantes"
    echo "Définissez SUPABASE_PROJECT_URL et SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Fonction pour exécuter du SQL
execute_sql() {
    local sql_file=$1
    local description=$2
    
    echo "📄 $description..."
    
    curl -X POST "$SUPABASE_PROJECT_URL/rest/v1/rpc/exec_sql" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d @"$sql_file"
        
    if [ $? -eq 0 ]; then
        echo "✅ $description - Terminé"
    else
        echo "❌ $description - Erreur"
        exit 1
    fi
}

# 1. Créer le schéma principal
echo "1️⃣ Création du schéma de base de données..."
# Note: Vous devrez exécuter le SQL manuellement dans l'interface Supabase
echo "📋 Veuillez exécuter le contenu de 'supabase-schema.sql' dans votre dashboard Supabase:"
echo "   - Allez sur https://supabase.com/dashboard/"
echo "   - Sélectionnez votre projet"
echo "   - Allez dans 'SQL Editor'"
echo "   - Copiez-collez le contenu de 'supabase-schema.sql'"
echo "   - Exécutez le script"
echo ""

# 2. Configurer le storage
echo "2️⃣ Configuration du Storage..."
echo "📋 Veuillez exécuter le contenu de 'supabase-storage.sql' dans votre dashboard Supabase"
echo ""

# 3. Insérer des données d'exemple
echo "3️⃣ Insertion des données d'exemple..."
echo "📋 Les données d'exemple seront insérées automatiquement par les scripts SQL"
echo ""

# 4. Vérifications
echo "4️⃣ Vérifications post-installation..."
echo "📋 À vérifier manuellement :"
echo "   ✓ Tables créées (users, artisans, produits, commandes, etc.)"
echo "   ✓ Buckets Storage créés (produits, artisans, avatars, documents)"
echo "   ✓ Politiques RLS activées"
echo "   ✓ Index créés pour les performances"
echo ""

echo "🎉 Configuration Supabase terminée!"
echo "================================================="
echo ""
echo "📝 Prochaines étapes :"
echo "1. Récupérez votre Service Role Key depuis Supabase Dashboard > Settings > API"
echo "2. Mettez à jour le fichier .env.local avec la vraie clé"
echo "3. Testez la connexion avec npm run dev"
echo ""
echo "🔗 Liens utiles :"
echo "   - Dashboard: https://supabase.com/dashboard/"
echo "   - Documentation: https://supabase.com/docs"
echo "   - SQL Editor: https://supabase.com/dashboard/project/[PROJECT_ID]/sql"
echo ""