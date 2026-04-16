'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Minus, ShoppingBag, Truck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { SafeImage } from '@/components/ui/SafeImage';

export default function CartSlideOver() {
  const { state, removeItem, updateQuantity, closeCart, clearCart } = useCart();
  const { items, total, itemCount, isOpen } = state;
  
  const fraisLivraison = total > 50000 ? 0 : 3000;
  const totalAvecLivraison = total + fraisLivraison;
  const montantPourLivraisonGratuite = Math.max(0, 50000 - total);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Panier ({itemCount})
                          </div>
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={closeCart}
                          >
                            <span className="sr-only">Fermer le panier</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Livraison gratuite progress */}
                      {total > 0 && total < 50000 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <p className="text-sm text-blue-800">
                              Plus que {formatCurrency(montantPourLivraisonGratuite)} pour la livraison gratuite !
                            </p>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((total / 50000) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Cart Items */}
                      <div className="mt-8">
                        <div className="flow-root">
                          {items.length === 0 ? (
                            <div className="text-center py-12">
                              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 mb-4">Votre panier est vide</p>
                              <Button onClick={closeCart}>
                                Continuer mes achats
                              </Button>
                            </div>
                          ) : (
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {items.map((item) => (
                                <li key={item.id} className="flex py-6">
                                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <SafeImage
                                      src={item.image || ''}
                                      alt={item.nom_produit}
                                      width={80}
                                      height={80}
                                      className="h-full w-full object-cover object-center"
                                      fallbackTitle="IMG"
                                      fallbackSubtitle=""
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3 className="text-sm">{item.nom_produit}</h3>
                                        <p className="ml-4">{formatCurrency(item.prix)}</p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">Par {item.artisan}</p>
                                      {(item.couleur || item.taille) && (
                                        <p className="mt-1 text-xs text-gray-500">
                                          {item.couleur && `Couleur: ${item.couleur}`}
                                          {item.couleur && item.taille && ' • '}
                                          {item.taille && `Taille: ${item.taille}`}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      {/* Quantity Controls */}
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantite - 1)}
                                          className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                          disabled={item.quantite <= 1}
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">
                                          {item.quantite}
                                        </span>
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantite + 1)}
                                          className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                          disabled={item.quantite >= item.stock_disponible}
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          onClick={() => removeItem(item.id)}
                                          className="font-medium text-red-600 hover:text-red-500"
                                        >
                                          Retirer
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        {/* Clear Cart Button */}
                        <div className="mb-4">
                          <button
                            onClick={clearCart}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                          >
                            Vider le panier
                          </button>
                        </div>

                        {/* Pricing Summary */}
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-sm">
                            <p className="text-gray-600">Sous-total</p>
                            <p className="font-medium">{formatCurrency(total)}</p>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <p className="text-gray-600">Frais de livraison</p>
                            <p className="font-medium">
                              {fraisLivraison === 0 ? (
                                <span className="text-green-600">Gratuit</span>
                              ) : (
                                formatCurrency(fraisLivraison)
                              )}
                            </p>
                          </div>
                          
                          <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t border-gray-200">
                            <p>Total</p>
                            <p>{formatCurrency(totalAvecLivraison)}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Link href="/checkout" onClick={closeCart}>
                            <Button className="w-full">
                              Passer la commande
                            </Button>
                          </Link>
                          
                          <Link href="/panier" onClick={closeCart}>
                            <Button variant="outline" className="w-full">
                              Voir le panier complet
                            </Button>
                          </Link>
                        </div>

                        {/* Continue Shopping */}
                        <div className="mt-6 text-center">
                          <button
                            onClick={closeCart}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Continuer mes achats
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}