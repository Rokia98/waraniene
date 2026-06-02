'use client';

import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Produit } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { SafeImage } from "@/components/ui/SafeImage";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  produit: Produit;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

const categorieColors: Record<string, string> = {
  pagne:       'bg-amber-100 text-amber-800',
  boubou:      'bg-orange-100 text-orange-800',
  foulard:     'bg-rose-100 text-rose-800',
  chemise:     'bg-sky-100 text-sky-800',
  robe:        'bg-pink-100 text-pink-800',
  accessoire:  'bg-violet-100 text-violet-800',
  decoration:  'bg-teal-100 text-teal-800',
};

export function ProductCard({ produit }: ProductCardProps) {
  const { addItem, isItemInCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (produit.stock <= 0) return;
    addItem({
      id: produit.id,
      nom_produit: produit.nom_produit,
      prix: produit.prix,
      stock_disponible: produit.stock,
      artisan: produit.artisan?.nom || 'Artisan inconnu',
      image: produit.photos?.[0],
    });
  };

  const inCart       = isItemInCart(produit.id);
  const isOutOfStock = produit.stock === 0;
  const isLowStock   = !isOutOfStock && produit.stock <= 3;
  const badgeColor   = categorieColors[produit.categorie] || 'bg-gray-100 text-gray-700';

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-400 hover:-translate-y-1.5">
      <Link href={`/produits/${produit.id}`} className="block">

        {/* ── Image ── */}
        <div className="relative aspect-product bg-stone-100 overflow-hidden">
          <SafeImage
            src={produit.photos?.[0] || ''}
            alt={produit.nom_produit}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            fallbackTitle={produit.nom_produit}
          />

          {/* Dégradé hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge catégorie */}
          <div className="absolute top-3 left-3">
            <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-sm shadow-sm ${badgeColor}`}>
              {produit.categorie}
            </span>
          </div>

          {/* Wishlist */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
              <WishlistButton
                produitId={produit.id}
                nom={produit.nom_produit}
                prix={produit.prix}
                artisan={produit.artisan?.nom || 'Artisan inconnu'}
                image={produit.photos?.[0]}
                size="sm"
              />
            </div>
          </div>

          {/* Épuisé overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white text-gray-900 font-bold px-5 py-2 rounded-full text-sm shadow-lg">
                Épuisé
              </span>
            </div>
          )}

          {/* Bouton ajout rapide */}
          {!isOutOfStock && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0">
              <button
                onClick={handleAddToCart}
                className={`w-full py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                  inCart
                    ? 'bg-green-500 text-white'
                    : 'bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-primary-600 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {inCart ? 'Ajouté ✓' : 'Ajouter au panier'}
              </button>
            </div>
          )}
        </div>

        {/* ── Infos ── */}
        <div className="p-4">
          {/* Artisan */}
          {produit.artisan?.nom && (
            <p className="text-xs text-gray-400 font-medium mb-1 truncate">
              par {produit.artisan.nom}
            </p>
          )}

          {/* Nom */}
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-3 group-hover:text-primary-600 transition-colors duration-200">
            {produit.nom_produit}
          </h3>

          {/* Prix + stock */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary-600">
              {formatCurrency(produit.prix)}
            </span>
            {isLowStock && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {produit.stock} restant{produit.stock > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
