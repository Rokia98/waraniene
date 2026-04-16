/**
 * Configuration et initialisation des services
 * Fichier de configuration centralisé pour l'application
 */

// Configuration API
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Configuration Supabase
const SUPABASE_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Configuration PayDunya
const PAYDUNYA_CONFIG = {
  PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYDUNYA_PUBLIC_KEY || '',
  PRIVATE_KEY: process.env.PAYDUNYA_PRIVATE_KEY || '',
  MASTER_KEY: process.env.PAYDUNYA_MASTER_KEY || '',
  TOKEN: process.env.PAYDUNYA_TOKEN || '',
  MODE: process.env.NODE_ENV === 'production' ? 'live' : 'test',
  CALLBACK_URL: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback` : '/api/payment/callback',
};

// Configuration de stockage
const STORAGE_CONFIG = {
  PREFIX: 'waraniene_',
  ENCRYPTION_KEY: 'waraniene_secret_key_2024',
  DEFAULT_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 heures
  REMEMBER_ME_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 jours
};

// Configuration des notifications
const NOTIFICATION_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-right' as const,
  MAX_TOASTS: 3,
  STYLE: {
    borderRadius: '8px',
    background: '#363636',
    color: '#fff',
  },
  SUCCESS_STYLE: {
    background: '#10B981',
  },
  ERROR_STYLE: {
    background: '#EF4444',
  },
  WARNING_STYLE: {
    background: '#F59E0B',
  },
  INFO_STYLE: {
    background: '#3B82F6',
  },
};

// Configuration des produits
const PRODUCT_CONFIG = {
  IMAGES: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_COUNT: 5,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 100,
  },
  SEARCH: {
    MIN_QUERY_LENGTH: 3,
    DEBOUNCE_DELAY: 300,
  },
};

// Configuration des commandes
const ORDER_CONFIG = {
  STATUSES: {
    EN_ATTENTE: 'en_attente',
    CONFIRMEE: 'confirmee',
    EN_PREPARATION: 'en_preparation',
    EXPEDIEE: 'expediee',
    LIVREE: 'livree',
    ANNULEE: 'annulee',
  },
  PAYMENT_METHODS: {
    ORANGE_MONEY: 'orange_money',
    MTN_MONEY: 'mtn_money',
    CARTE_BANCAIRE: 'carte_bancaire',
  },
  AUTO_CANCEL_DELAY: 24 * 60 * 60 * 1000, // 24 heures
};

// Configuration de validation
const VALIDATION_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
  PHONE: {
    PATTERNS: {
      CI: /^(07|05|01)\d{8}$/, // Côte d'Ivoire
      INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,
    },
  },
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  PRICE: {
    MIN: 0,
    MAX: 10000000, // 10 millions FCFA
    CURRENCY: 'FCFA',
  },
};

// Configuration de l'application
const APP_CONFIG = {
  NAME: 'Tissés de Waraniéné',
  VERSION: '1.0.0',
  DESCRIPTION: 'Plateforme e-commerce pour textiles traditionnels Senoufo',
  LOCALE: 'fr-CI',
  TIMEZONE: 'Africa/Abidjan',
  CURRENCY: 'XOF', // Franc CFA
  SOCIAL_LINKS: {
    FACEBOOK: 'https://facebook.com/waraniene',
    INSTAGRAM: 'https://instagram.com/waraniene',
    WHATSAPP: 'https://wa.me/2250123456789',
  },
  CONTACT: {
    EMAIL: 'contact@waraniene.ci',
    PHONE: '+225 01 23 45 67 89',
    ADDRESS: 'Waraniéné, Korhogo, Côte d\'Ivoire',
  },
};

// Configuration de développement
const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  MOCK_PAYMENT: process.env.NODE_ENV === 'development',
  BYPASS_AUTH: process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true',
  DEBUG_STORAGE: process.env.NODE_ENV === 'development',
};

// Fonction d'initialisation de l'application
export function initializeAppConfig() {
  // Vérifier les variables d'environnement requises
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Variables d\'environnement manquantes:', missingVars);
    if (typeof window === 'undefined') { // Côté serveur
      throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    }
  }

  // Valider la configuration PayDunya en production
  if (process.env.NODE_ENV === 'production') {
    const paydunyaVars = [
      'NEXT_PUBLIC_PAYDUNYA_PUBLIC_KEY',
      'PAYDUNYA_PRIVATE_KEY',
      'PAYDUNYA_MASTER_KEY',
      'PAYDUNYA_TOKEN',
    ];
    
    const missingPaydunyaVars = paydunyaVars.filter(varName => !process.env[varName]);
    
    if (missingPaydunyaVars.length > 0) {
      console.warn('Variables PayDunya manquantes en production:', missingPaydunyaVars);
    }
  }

  // Log de configuration en développement
  if (DEV_CONFIG.ENABLE_LOGGING) {
    console.log('Configuration de l\'application:', {
      name: APP_CONFIG.NAME,
      version: APP_CONFIG.VERSION,
      environment: process.env.NODE_ENV,
      apiUrl: API_CONFIG.BASE_URL,
      paydunya: {
        mode: PAYDUNYA_CONFIG.MODE,
        configured: !!PAYDUNYA_CONFIG.PUBLIC_KEY,
      },
    });
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    config: {
      API_CONFIG,
      SUPABASE_CONFIG,
      PAYDUNYA_CONFIG,
      STORAGE_CONFIG,
      NOTIFICATION_CONFIG,
      PRODUCT_CONFIG,
      ORDER_CONFIG,
      VALIDATION_CONFIG,
      APP_CONFIG,
      DEV_CONFIG,
    },
  };
}

// Export de toutes les configurations
export {
  API_CONFIG,
  SUPABASE_CONFIG,
  PAYDUNYA_CONFIG,
  STORAGE_CONFIG,
  NOTIFICATION_CONFIG,
  PRODUCT_CONFIG,
  ORDER_CONFIG,
  VALIDATION_CONFIG,
  APP_CONFIG,
  DEV_CONFIG,
};

export default {
  API_CONFIG,
  SUPABASE_CONFIG,
  PAYDUNYA_CONFIG,
  STORAGE_CONFIG,
  NOTIFICATION_CONFIG,
  PRODUCT_CONFIG,
  ORDER_CONFIG,
  VALIDATION_CONFIG,
  APP_CONFIG,
  DEV_CONFIG,
  initialize: initializeAppConfig,
};