'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Smartphone, Lock, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PromoCodeInput from '@/components/PromoCodeInput';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/Header';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useCreateCommande } from '@/hooks/useCommandes';
import { authStorage } from '@/services/storageService';
import toast from 'react-hot-toast';

interface CheckoutForm {
  // Informations acheteur (anonyme - pas de compte)
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  
  // Adresse de livraison
  adresse: string;
  ville: string;
  commune: string;
  pays: string;
  code_postal?: string;
  
  // Mode de paiement
  mode_paiement: 'orange_money' | 'mtn_money' | 'carte_bancaire';
  
  // Pour Mobile Money
  numero_mobile?: string;
  
  // Pour carte bancaire
  numero_carte?: string;
  nom_carte?: string;
  date_expiration?: string;
  cvv?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state, clearCart } = useCart();
  const { items: cartItems, total: cartTotal } = state;
  const { createCommande, loading: isSubmitting } = useCreateCommande();
  const [currentStep, setCurrentStep] = useState(1);
  const [promoReduction, setPromoReduction] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [formData, setFormData] = useState<CheckoutForm>({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    commune: '',
    pays: "Côte d'Ivoire",
    mode_paiement: 'orange_money',
    numero_mobile: ''
  });

  // Pré-remplir le formulaire si l'utilisateur est connecté
  useEffect(() => {
    const userData = authStorage.getUserData();
    if (userData) {
      setFormData(prev => ({
        ...prev,
        prenom: userData.prenom || prev.prenom,
        nom: userData.nom || prev.nom,
        email: userData.email || prev.email,
        telephone: userData.telephone || prev.telephone,
        adresse: userData.adresse || prev.adresse,
      }));
    }
  }, []);

  // Redirection si le panier est vide
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      router.push('/produits');
    }
  }, [cartItems, router]);

  // Affichage de chargement si panier vide
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Panier vide
          </h1>
          <p className="text-gray-600 mb-8">
            Ajoutez des produits à votre panier pour procéder au checkout.
          </p>
          <Link href="/produits">
            <Button>
              Découvrir nos produits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculs - en utilisant les données du panier context
  const sousTotal = cartTotal;
  const fraisLivraison = sousTotal > 50000 ? 0 : 3000; // Livraison gratuite au-dessus de 50 000 FCFA
  const totalAvantPromo = sousTotal + fraisLivraison;
  const total = Math.max(0, totalAvantPromo - promoReduction);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        // Validation infos acheteur
        return !!(formData.prenom && formData.nom && formData.email && formData.telephone);
      case 2:
        // Validation adresse
        return !!(formData.adresse && formData.ville && formData.pays);
      case 3:
        // Validation paiement
        if (formData.mode_paiement === 'orange_money' || formData.mode_paiement === 'mtn_money') {
          return !!formData.numero_mobile;
        }
        if (formData.mode_paiement === 'carte_bancaire') {
          return !!(formData.numero_carte && formData.nom_carte && formData.date_expiration && formData.cvv);
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmitOrder = async () => {
    try {
      if (!formData.prenom || !formData.nom || !formData.email || !formData.telephone) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (cartItems.length === 0) {
        toast.error('Votre panier est vide');
        return;
      }

      // Préparer les items pour l'API
      const items = cartItems.map((item: CartItem) => ({
        produit_id: item.id,
        quantite: item.quantite,
        prix_unitaire: item.prix
      }));

      // Préparer l'adresse de livraison complète
      const adresse_complete = `${formData.adresse}, ${formData.commune ? formData.commune + ', ' : ''}${formData.ville}, ${formData.pays}`;

      // Créer la commande anonyme directement (sans compte acheteur)
      const commandeData = {
        // Infos acheteur anonyme
        nom_acheteur: `${formData.prenom} ${formData.nom}`,
        email_acheteur: formData.email,
        telephone_acheteur: formData.telephone,
        
        // Détails commande
        items,
        montant_total: total,
        mode_paiement: formData.mode_paiement,
        adresse_livraison: adresse_complete,
        
        // Info paiement mobile money
        numero_mobile: formData.numero_mobile
      };

      console.log('📦 Création commande anonyme:', commandeData);

      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commandeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la commande');
      }

      const data = await response.json();
      console.log('✅ Commande créée:', data);

      const commandeId = data.commande.id;

      // Auto-login si un compte a été créé automatiquement
      if (data.account_created && data.token && data.acheteur) {
        // Sauvegarder le token et les données utilisateur via authStorage
        authStorage.setToken(data.token, true);
        authStorage.setUserData({
          ...data.acheteur,
          type_utilisateur: 'acheteur'
        }, true);
        toast.success('Votre compte a été créé automatiquement avec vos informations !', { duration: 5000 });
        console.log('👤 Compte créé automatiquement pour:', data.acheteur?.email);
      }

      // Initier le paiement avec FusionPay
      console.log('💳 Initiation du paiement FusionPay...');

      const paiementResponse = await fetch('/api/paiement/initier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commande_id: commandeId,
          montant: total,
          customer: {
            name: `${formData.prenom} ${formData.nom}`,
            email: formData.email,
            phone: formData.telephone,
          },
          metadata: {
            mode_paiement: formData.mode_paiement,
            numero_mobile: formData.numero_mobile,
          },
        }),
      });

      if (!paiementResponse.ok) {
        const errorData = await paiementResponse.json();
        throw new Error(errorData.error || 'Erreur lors de l\'initiation du paiement');
      }

      const paiementData = await paiementResponse.json();
      console.log('✅ Paiement initié:', paiementData);

      toast.success('Redirection vers la page de paiement...');
      
      // Vider le panier
      clearCart();
      
      // Rediriger vers la page de paiement PayDunya
      if (paiementData.invoice_url) {
        window.location.href = paiementData.invoice_url;
      } else {
        // Fallback: rediriger vers la page de confirmation
        router.push(`/commande/${commandeId}/confirmation`);
      }

    } catch (error: any) {
      console.error('❌ Erreur commande:', error);
      toast.error(error.message || 'Erreur lors de la création de la commande');
    }
  };

  const steps = [
    { number: 1, title: 'Informations personnelles' },
    { number: 2, title: 'Adresse de livraison' },
    { number: 3, title: 'Mode de paiement' },
    { number: 4, title: 'Confirmation' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600">Accueil</Link>
          <span>/</span>
          <Link href="/panier" className="hover:text-primary-600">Panier</Link>
          <span>/</span>
          <span className="text-gray-900">Commande</span>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                    Informations personnelles
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        required
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Votre prénom"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        required
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      required
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+225 XX XX XX XX XX"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Delivery Address */}
              {currentStep === 2 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                    Adresse de livraison
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse complète *
                      </label>
                      <input
                        type="text"
                        name="adresse"
                        required
                        value={formData.adresse}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Rue, quartier, numéro..."
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ville *
                        </label>
                        <input
                          type="text"
                          name="ville"
                          required
                          value={formData.ville}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Abidjan, Korhogo..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commune
                        </label>
                        <input
                          type="text"
                          name="commune"
                          value={formData.commune}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Cocody, Plateau..."
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pays *
                        </label>
                        <select
                          name="pays"
                          required
                          value={formData.pays}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                          <option value="Mali">Mali</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                          <option value="Ghana">Ghana</option>
                          <option value="France">France</option>
                          <option value="Canada">Canada</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Code postal
                        </label>
                        <input
                          type="text"
                          name="code_postal"
                          value={formData.code_postal}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Code postal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                    Mode de paiement
                  </h2>
                  
                  {/* Payment Method Selection */}
                  <div className="grid gap-4 mb-6">
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, mode_paiement: 'orange_money' }))}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.mode_paiement === 'orange_money' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-orange-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Orange Money</h3>
                          <p className="text-sm text-gray-600">Paiement mobile sécurisé</p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, mode_paiement: 'mtn_money' }))}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.mode_paiement === 'mtn_money' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-yellow-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">MTN Mobile Money</h3>
                          <p className="text-sm text-gray-600">Paiement mobile MTN</p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, mode_paiement: 'carte_bancaire' }))}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.mode_paiement === 'carte_bancaire' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Carte bancaire</h3>
                          <p className="text-sm text-gray-600">Visa, Mastercard</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Details */}
                  {(formData.mode_paiement === 'orange_money' || formData.mode_paiement === 'mtn_money') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de téléphone *
                      </label>
                      <input
                        type="tel"
                        name="numero_mobile"
                        required
                        value={formData.numero_mobile}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+225 XX XX XX XX XX"
                      />
                    </div>
                  )}
                  
                  {formData.mode_paiement === 'carte_bancaire' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro de carte *
                        </label>
                        <input
                          type="text"
                          name="numero_carte"
                          required
                          value={formData.numero_carte}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom sur la carte *
                        </label>
                        <input
                          type="text"
                          name="nom_carte"
                          required
                          value={formData.nom_carte}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Nom tel qu'il apparaît sur la carte"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date d&apos;expiration *
                          </label>
                          <input
                            type="text"
                            name="date_expiration"
                            required
                            value={formData.date_expiration}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="MM/YY"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            required
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                    Confirmation de commande
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Client:</span>
                          <span>{formData.prenom} {formData.nom}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span>{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Téléphone:</span>
                          <span>{formData.telephone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Livraison:</span>
                          <span>{formData.adresse}, {formData.ville}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paiement:</span>
                          <span>{
                            formData.mode_paiement === 'orange_money' ? 'Orange Money' :
                            formData.mode_paiement === 'mtn_money' ? 'MTN Mobile Money' :
                            'Carte bancaire'
                          }</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        Vos informations de paiement sont sécurisées et cryptées.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Précédent
                  </Button>
                )}
                
                <div className="ml-auto">
                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={!validateCurrentStep()}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Traitement...
                        </>
                      ) : (
                        'Confirmer la commande'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Résumé de commande</h3>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-600">IMG</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.nom_produit}
                      </h4>
                      <p className="text-xs text-gray-600">Par {item.artisan}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">Qté: {item.quantite}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.prix * item.quantite)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <PromoCodeInput 
                  montantTotal={totalAvantPromo}
                  onPromoApplied={(reduction, code) => {
                    setPromoReduction(reduction);
                    setPromoCode(code);
                  }}
                />
              </div>
              
              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">{formatCurrency(sousTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="text-gray-900">
                    {fraisLivraison === 0 ? 'Gratuite' : formatCurrency(fraisLivraison)}
                  </span>
                </div>
                {promoReduction > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Code promo: {promoCode}</span>
                    <span>-{formatCurrency(promoReduction)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>
              
              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">Livraison</span>
                </div>
                <p className="text-xs text-gray-600">
                  Livraison gratuite pour les commandes de plus de 50 000 FCFA
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Délai: 2-5 jours ouvrables
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}