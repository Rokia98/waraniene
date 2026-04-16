/**
 * Service de validation des données pour l'application Tissés de Waraniéné
 * Contient toutes les règles de validation et fonctions utilitaires
 */

// Types pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Expressions régulières communes
const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, // Format ivoirien
  phoneLoose: /^(\+225)?\s?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8,10})$/, // Plus flexible
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, // Min 8 char, 1 maj, 1 min, 1 chiffre
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  price: /^\d+(\.\d{1,2})?$/ // Prix avec max 2 décimales
};

// Catégories de produits autorisées
export const PRODUCT_CATEGORIES = [
  'pagne',
  'vetement', 
  'accessoire',
  'decoration',
  'textile_maison'
] as const;

// Statuts de commande autorisés
export const ORDER_STATUSES = [
  'en_attente',
  'confirmee',
  'en_preparation',
  'prete',
  'en_livraison',
  'livree',
  'annulee'
] as const;

// Méthodes de paiement autorisées
export const PAYMENT_METHODS = [
  'orange_money',
  'mtn_money',
  'carte_bancaire'
] as const;

// Validation des champs de base
export const validators = {
  // Validation email
  email: (email: string): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!email?.trim()) {
      errors.push({ field: 'email', message: 'L\'email est requis' });
    } else if (!REGEX_PATTERNS.email.test(email.trim())) {
      errors.push({ field: 'email', message: 'Format d\'email invalide' });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation mot de passe
  password: (password: string): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!password) {
      errors.push({ field: 'password', message: 'Le mot de passe est requis' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'Le mot de passe doit contenir au moins 8 caractères' });
    } else if (!REGEX_PATTERNS.password.test(password)) {
      errors.push({ 
        field: 'password', 
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' 
      });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation téléphone
  phone: (phone: string, required: boolean = false): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!phone?.trim()) {
      if (required) {
        errors.push({ field: 'phone', message: 'Le numéro de téléphone est requis' });
      }
    } else if (!REGEX_PATTERNS.phoneLoose.test(phone.trim())) {
      errors.push({ 
        field: 'phone', 
        message: 'Format de téléphone invalide (ex: +225 07 12 34 56 78)' 
      });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation nom
  name: (name: string, fieldName: string = 'nom'): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!name?.trim()) {
      errors.push({ field: fieldName, message: `Le ${fieldName} est requis` });
    } else if (name.trim().length < 2) {
      errors.push({ field: fieldName, message: `Le ${fieldName} doit contenir au moins 2 caractères` });
    } else if (name.trim().length > 100) {
      errors.push({ field: fieldName, message: `Le ${fieldName} ne peut pas dépasser 100 caractères` });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation texte long (description, bio)
  longText: (text: string, fieldName: string, minLength: number = 10, maxLength: number = 1000): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!text?.trim()) {
      errors.push({ field: fieldName, message: `${fieldName} est requis` });
    } else if (text.trim().length < minLength) {
      errors.push({ 
        field: fieldName, 
        message: `${fieldName} doit contenir au moins ${minLength} caractères` 
      });
    } else if (text.trim().length > maxLength) {
      errors.push({ 
        field: fieldName, 
        message: `${fieldName} ne peut pas dépasser ${maxLength} caractères` 
      });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation prix
  price: (price: number | string): ValidationResult => {
    const errors: ValidationError[] = [];
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (price === '' || price === null || price === undefined) {
      errors.push({ field: 'prix', message: 'Le prix est requis' });
    } else if (isNaN(numPrice)) {
      errors.push({ field: 'prix', message: 'Le prix doit être un nombre valide' });
    } else if (numPrice <= 0) {
      errors.push({ field: 'prix', message: 'Le prix doit être supérieur à 0' });
    } else if (numPrice > 10000000) { // 10 millions max
      errors.push({ field: 'prix', message: 'Le prix ne peut pas dépasser 10 000 000 FCFA' });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation stock/quantité
  quantity: (quantity: number | string, fieldName: string = 'quantité'): ValidationResult => {
    const errors: ValidationError[] = [];
    const numQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;
    
    if (quantity === '' || quantity === null || quantity === undefined) {
      errors.push({ field: fieldName, message: `La ${fieldName} est requise` });
    } else if (isNaN(numQuantity) || !Number.isInteger(numQuantity)) {
      errors.push({ field: fieldName, message: `La ${fieldName} doit être un nombre entier` });
    } else if (numQuantity < 0) {
      errors.push({ field: fieldName, message: `La ${fieldName} ne peut pas être négative` });
    } else if (numQuantity > 10000) { // Max 10k stock
      errors.push({ field: fieldName, message: `La ${fieldName} ne peut pas dépasser 10 000` });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation catégorie produit
  productCategory: (category: string): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!category?.trim()) {
      errors.push({ field: 'categorie', message: 'La catégorie est requise' });
    } else if (!PRODUCT_CATEGORIES.includes(category as any)) {
      errors.push({ 
        field: 'categorie', 
        message: `Catégorie invalide. Valeurs autorisées: ${PRODUCT_CATEGORIES.join(', ')}` 
      });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation statut commande
  orderStatus: (status: string): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!status?.trim()) {
      errors.push({ field: 'statut', message: 'Le statut est requis' });
    } else if (!ORDER_STATUSES.includes(status as any)) {
      errors.push({ 
        field: 'statut', 
        message: `Statut invalide. Valeurs autorisées: ${ORDER_STATUSES.join(', ')}` 
      });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation méthode de paiement
  paymentMethod: (method: string): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!method?.trim()) {
      errors.push({ field: 'methode_paiement', message: 'La méthode de paiement est requise' });
    } else if (!PAYMENT_METHODS.includes(method as any)) {
      errors.push({ 
        field: 'methode_paiement', 
        message: `Méthode de paiement invalide. Valeurs autorisées: ${PAYMENT_METHODS.join(', ')}` 
      });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation adresse
  address: (address: string): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!address?.trim()) {
      errors.push({ field: 'adresse', message: 'L\'adresse est requise' });
    } else if (address.trim().length < 5) {
      errors.push({ field: 'adresse', message: 'L\'adresse doit contenir au moins 5 caractères' });
    } else if (address.trim().length > 255) {
      errors.push({ field: 'adresse', message: 'L\'adresse ne peut pas dépasser 255 caractères' });
    }
    
    return { isValid: errors.length === 0, errors };
  },

  // Validation URL
  url: (url: string, required: boolean = false): ValidationResult => {
    const errors: ValidationError[] = [];
    
    if (!url?.trim()) {
      if (required) {
        errors.push({ field: 'url', message: 'L\'URL est requise' });
      }
    } else if (!REGEX_PATTERNS.url.test(url.trim())) {
      errors.push({ field: 'url', message: 'Format d\'URL invalide' });
    }
    
    return { isValid: errors.length === 0, errors };
  }
};

// Validation des objets complets
export const objectValidators = {
  // Validation données inscription
  userRegistration: (data: {
    nom: string;
    email: string;
    mot_de_passe: string;
    telephone?: string;
    adresse?: string;
  }): ValidationResult => {
    const allErrors: ValidationError[] = [];
    
    // Validation nom
    const nameValidation = validators.name(data.nom, 'nom');
    allErrors.push(...nameValidation.errors);
    
    // Validation email
    const emailValidation = validators.email(data.email);
    allErrors.push(...emailValidation.errors);
    
    // Validation mot de passe
    const passwordValidation = validators.password(data.mot_de_passe);
    allErrors.push(...passwordValidation.errors);
    
    // Validation téléphone (optionnel)
    if (data.telephone) {
      const phoneValidation = validators.phone(data.telephone, false);
      allErrors.push(...phoneValidation.errors);
    }
    
    // Validation adresse (optionnel)
    if (data.adresse) {
      const addressValidation = validators.address(data.adresse);
      allErrors.push(...addressValidation.errors);
    }
    
    return { isValid: allErrors.length === 0, errors: allErrors };
  },

  // Validation données connexion
  userLogin: (data: { email: string; mot_de_passe: string }): ValidationResult => {
    const allErrors: ValidationError[] = [];
    
    // Validation email
    const emailValidation = validators.email(data.email);
    allErrors.push(...emailValidation.errors);
    
    // Validation mot de passe (juste vérifier qu'il existe)
    if (!data.mot_de_passe?.trim()) {
      allErrors.push({ field: 'mot_de_passe', message: 'Le mot de passe est requis' });
    }
    
    return { isValid: allErrors.length === 0, errors: allErrors };
  },

  // Validation données produit
  product: (data: {
    nom_produit: string;
    description: string;
    prix: number | string;
    categorie: string;
    stock: number | string;
    artisan_id: string;
  }): ValidationResult => {
    const allErrors: ValidationError[] = [];
    
    // Validation nom produit
    const nameValidation = validators.name(data.nom_produit, 'nom_produit');
    allErrors.push(...nameValidation.errors);
    
    // Validation description
    const descValidation = validators.longText(data.description, 'description', 10, 2000);
    allErrors.push(...descValidation.errors);
    
    // Validation prix
    const priceValidation = validators.price(data.prix);
    allErrors.push(...priceValidation.errors);
    
    // Validation catégorie
    const categoryValidation = validators.productCategory(data.categorie);
    allErrors.push(...categoryValidation.errors);
    
    // Validation stock
    const stockValidation = validators.quantity(data.stock, 'stock');
    allErrors.push(...stockValidation.errors);
    
    // Validation artisan_id
    if (!data.artisan_id?.trim()) {
      allErrors.push({ field: 'artisan_id', message: 'L\'artisan est requis' });
    }
    
    return { isValid: allErrors.length === 0, errors: allErrors };
  },

  // Validation données artisan
  artisan: (data: {
    nom: string;
    bio: string;
    localisation: string;
    telephone?: string;
    langue: string;
  }): ValidationResult => {
    const allErrors: ValidationError[] = [];
    
    // Validation nom
    const nameValidation = validators.name(data.nom, 'nom');
    allErrors.push(...nameValidation.errors);
    
    // Validation bio
    const bioValidation = validators.longText(data.bio, 'bio', 20, 1000);
    allErrors.push(...bioValidation.errors);
    
    // Validation localisation
    const locationValidation = validators.name(data.localisation, 'localisation');
    allErrors.push(...locationValidation.errors);
    
    // Validation téléphone (optionnel)
    if (data.telephone) {
      const phoneValidation = validators.phone(data.telephone, false);
      allErrors.push(...phoneValidation.errors);
    }
    
    // Validation langue
    if (!data.langue?.trim()) {
      allErrors.push({ field: 'langue', message: 'La langue est requise' });
    } else if (!['fr', 'senufo', 'dioula'].includes(data.langue)) {
      allErrors.push({ 
        field: 'langue', 
        message: 'Langue invalide. Valeurs autorisées: fr, senufo, dioula' 
      });
    }
    
    return { isValid: allErrors.length === 0, errors: allErrors };
  },

  // Validation données commande
  order: (data: {
    adresse_livraison: string;
    telephone_livraison: string;
    methode_paiement: string;
    numero_paiement?: string;
  }): ValidationResult => {
    const allErrors: ValidationError[] = [];
    
    // Validation adresse livraison
    const addressValidation = validators.address(data.adresse_livraison);
    allErrors.push(...addressValidation.errors);
    
    // Validation téléphone livraison
    const phoneValidation = validators.phone(data.telephone_livraison, true);
    allErrors.push(...phoneValidation.errors);
    
    // Validation méthode paiement
    const paymentValidation = validators.paymentMethod(data.methode_paiement);
    allErrors.push(...paymentValidation.errors);
    
    // Validation numéro paiement (requis pour mobile money)
    if (['orange_money', 'mtn_money'].includes(data.methode_paiement)) {
      if (!data.numero_paiement?.trim()) {
        allErrors.push({ 
          field: 'numero_paiement', 
          message: 'Le numéro de paiement est requis pour le mobile money' 
        });
      } else {
        const numValidation = validators.phone(data.numero_paiement, true);
        allErrors.push(...numValidation.errors.map(err => ({
          ...err,
          field: 'numero_paiement'
        })));
      }
    }
    
    return { isValid: allErrors.length === 0, errors: allErrors };
  }
};

// Utilitaires de validation
export const validationUtils = {
  // Combiner plusieurs résultats de validation
  combineValidations: (...validations: ValidationResult[]): ValidationResult => {
    const allErrors = validations.flatMap(v => v.errors);
    return { isValid: allErrors.length === 0, errors: allErrors };
  },

  // Formatter les erreurs pour l'affichage
  formatErrors: (errors: ValidationError[]): string[] => {
    return errors.map(err => err.message);
  },

  // Obtenir la première erreur pour un champ
  getFieldError: (errors: ValidationError[], fieldName: string): string | null => {
    const fieldError = errors.find(err => err.field === fieldName);
    return fieldError ? fieldError.message : null;
  },

  // Nettoyer/formater les données
  sanitizeData: {
    // Nettoyer une chaîne
    cleanString: (str: string): string => {
      return str?.trim() || '';
    },

    // Formater un téléphone
    formatPhone: (phone: string): string => {
      const cleaned = phone.replace(/\s+/g, '');
      if (cleaned.startsWith('+225')) {
        return cleaned;
      }
      if (cleaned.startsWith('225')) {
        return `+${cleaned}`;
      }
      if (cleaned.length === 10 && cleaned.startsWith('0')) {
        return `+225${cleaned.slice(1)}`;
      }
      if (cleaned.length === 8) {
        return `+225${cleaned}`;
      }
      return cleaned;
    },

    // Formater un prix
    formatPrice: (price: string | number): number => {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      return Math.round(numPrice * 100) / 100; // Arrondi à 2 décimales
    },

    // Nettoyer un email
    cleanEmail: (email: string): string => {
      return email?.trim().toLowerCase() || '';
    }
  }
};

export default {
  validators,
  objectValidators,
  validationUtils,
  PRODUCT_CATEGORIES,
  ORDER_STATUSES,
  PAYMENT_METHODS
};