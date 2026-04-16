'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { useFavoris } from '@/contexts/FavorisContext';
import { useCart } from '@/contexts/CartContext';

export default function FavorisPage() {
  const { favoris, removeFavori, clearFavoris } = useFavoris();
  const { addItem } = useCart();

  const handleAddToCart = (item: typeof favoris[0]) => {
    addItem({
      id: item.id,
      nom_produit: item.nom_produit,
      prix: item.prix,
      stock_disponible: 99,
      artisan: item.artisan,
      image: item.image,
    });
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/produits" className="text-primary-600 hover:text-primary-700 text-sm flex items-center mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Continuer mes achats
            </Link>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Mes Favoris
            </h1>
            <p className="text-gray-500 mt-1">
              {favoris.length === 0
                ? "Vous n'avez aucun favori pour le moment"
                : `${favoris.length} produit${favoris.length > 1 ? 's' : ''} en favoris`}
            </p>
          </div>
          {favoris.length > 0 && (
            <button
              onClick={clearFavoris}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Tout supprimer
            </button>
          )}
        </div>

        {favoris.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">
              Aucun favori
            </h2>
            <p className="text-gray-400 mb-6">
              Parcourez nos produits et ajoutez vos coups de cœur ici
            </p>
            <Link
              href="/produits"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoris.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
              >
                <Link href={`/produits/${item.id}`} className="block relative aspect-square">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.nom_produit}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <Link href={`/produits/${item.id}`}>
                    <h3 className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                      {item.nom_produit}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{item.artisan}</p>
                  <p className="text-lg font-bold text-primary-600 mt-2">
                    {item.prix.toLocaleString('fr-FR')} FCFA
                  </p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ajouter au panier
                    </button>
                    <button
                      onClick={() => removeFavori(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Retirer des favoris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
