'use client';

import { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Heart, Truck, ArrowLeft, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/Header';

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const items = state.items;
  const total = state.total;
  const itemCount = state.itemCount;
  const fraisLivraison = total > 50000 ? 0 : 3000;
  const totalAvecPromo = total - promoDiscount;
  const totalFinal = totalAvecPromo + fraisLivraison;
  const montantPourLivraisonGratuite = Math.max(0, 50000 - total);

  const handlePromoCode = () => {
    // Codes promo fictifs
    const validPromoCodes = {
      'WELCOME10': 0.1,
      'ARTISAN15': 0.15,
      'SENOUFO20': 0.2,
    };

    const discount = validPromoCodes[promoCode.toUpperCase() as keyof typeof validPromoCodes];
    
    if (discount) {
      setPromoDiscount(total * discount);
      setPromoApplied(true);
    } else {
      alert('Code promo invalide');
    }
  };

  const suggestedProducts = [
    {
      id: 'suggest-1',
      nom: 'Bracelet Traditionnel',
      prix: 8000,
      artisan: 'Fatima Ouattara',
      image: null
    },
    {
      id: 'suggest-2',
      nom: 'Collier Perles',
      prix: 12000,
      artisan: 'Aminata Traoré',
      image: null
    }
  ];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Découvrez notre collection de textiles traditionnels Sénoufo 
              tissés à la main par nos artisans talentueux.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/produits">
                <Button size="lg">
                  Découvrir nos produits
                </Button>
              </Link>
              <Link href="/artisans">
                <Button variant="outline" size="lg">
                  Rencontrer nos artisans
                </Button>
              </Link>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-8 text-center">
              Nos suggestions pour vous
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-sm text-primary-700 font-medium">IMG</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{product.nom}</h3>
                  <p className="text-sm text-gray-600 mb-2">Par {product.artisan}</p>
                  <p className="font-semibold text-primary-600 mb-4">{formatCurrency(product.prix)}</p>
                  <Button size="sm" className="w-full">
                    Ajouter au panier
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-600">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900">Panier</span>
        </div>

        {/* Back Button */}
        <Link href="/produits" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Continuer mes achats
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Mon panier ({itemCount} {itemCount > 1 ? 'articles' : 'article'})
          </h1>
          <p className="text-gray-600">
            Vérifiez vos articles avant de passer votre commande
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Livraison gratuite progress */}
            {total < 50000 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Livraison gratuite</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Plus que {formatCurrency(montantPourLivraisonGratuite)} pour bénéficier de la livraison gratuite !
                </p>
                <div className="w-full bg-blue-100 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((total / 50000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {Math.round((total / 50000) * 100)}% atteint
                </p>
              </div>
            )}

            {/* Cart Items List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Articles dans votre panier</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Vider le panier
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.nom_produit}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                            <span className="text-xs text-primary-700 font-medium">IMG</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">
                              {item.nom_produit}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                              Par {item.artisan}
                            </p>
                            <p className="text-xs text-gray-500">
                              Stock disponible: {item.stock_disponible}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 mb-2">
                              {formatCurrency(item.prix)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: {formatCurrency(item.prix * item.quantite)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantite - 1)}
                                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={item.quantite <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center text-sm font-medium">
                                {item.quantite}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantite + 1)}
                                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={item.quantite >= item.stock_disponible}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-6">Résumé de la commande</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code promo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Entrez votre code"
                    disabled={promoApplied}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                  {!promoApplied ? (
                    <Button onClick={handlePromoCode} size="sm" disabled={!promoCode}>
                      Appliquer
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setPromoApplied(false);
                        setPromoDiscount(0);
                        setPromoCode('');
                      }}
                    >
                      Retirer
                    </Button>
                  )}
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <Gift className="w-4 h-4" />
                    Code promo appliqué !
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total ({itemCount} articles)</span>
                  <span className="text-gray-900">{formatCurrency(total)}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction ({promoCode})</span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="text-gray-900">
                    {fraisLivraison === 0 ? (
                      <span className="text-green-600 font-medium">Gratuit</span>
                    ) : (
                      formatCurrency(fraisLivraison)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mb-6">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(totalFinal)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button className="w-full mb-4">
                  Passer la commande
                </Button>
              </Link>

              {/* Security Info */}
              <div className="text-center text-sm text-gray-500">
                <p>🔒 Paiement 100% sécurisé</p>
                <p className="mt-1">Orange Money • MTN Money • Cartes bancaires</p>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Livraison estimée
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  3-5 jours ouvrables à Abidjan
                </p>
                <p className="text-sm text-gray-600">
                  5-7 jours ouvrables en province
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
            Vous pourriez aussi aimer
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-sm text-primary-700 font-medium">IMG</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{product.nom}</h3>
                <p className="text-sm text-gray-600 mb-2">Par {product.artisan}</p>
                <p className="font-semibold text-primary-600 mb-4">{formatCurrency(product.prix)}</p>
                <Button size="sm" className="w-full">
                  Ajouter au panier
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}