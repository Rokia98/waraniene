import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Produit } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { SafeImage } from "@/components/ui/SafeImage";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  produit: Produit;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({ 
  produit, 
  onToggleFavorite, 
  isFavorite = false 
}: ProductCardProps) {
  const { addItem, getItemQuantity, isItemInCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (produit.stock <= 0) {
      return;
    }
    
    const cartItem = {
      id: produit.id,
      nom_produit: produit.nom_produit,
      prix: produit.prix,
      stock_disponible: produit.stock,
      artisan: produit.artisan?.nom || 'Artisan inconnu',
      image: produit.photos?.[0],
    };
    
    addItem(cartItem);
  };

  const inCart = isItemInCart(produit.id);
  const isOutOfStock = produit.stock === 0;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <Link href={`/produits/${produit.id}`} className="block">
        {/* Image - Grande et belle */}
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
          <SafeImage
            src={produit.photos?.[0] || ''}
            alt={produit.nom_produit}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            fallbackTitle={produit.nom_produit}
          />
          
          {/* Gradient overlay léger pour meilleure lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Wishlist button - coin supérieur droit */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <WishlistButton 
              produitId={produit.id} 
              nom={produit.nom_produit}
              prix={produit.prix}
              artisan={produit.artisan?.nom || 'Artisan inconnu'}
              image={produit.photos?.[0]}
              size="sm" 
            />
          </div>
          
          {/* Badge catégorie - coin supérieur gauche */}
          <div className="absolute top-3 left-3">
            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-medium rounded-full shadow-lg">
              {produit.categorie}
            </span>
          </div>
          
          {/* Badge stock épuisé */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-white/95 text-gray-900 font-semibold px-4 py-2 rounded-full">
                Épuisé
              </span>
            </div>
          )}
          
          {/* Quick add button - apparaît au hover */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="w-full bg-white/95 backdrop-blur-sm hover:bg-primary-600 text-gray-900 hover:text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{inCart ? 'Ajouté ✓' : 'Ajouter au panier'}</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Informations produit - Minimalistes */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {produit.nom_produit}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl text-primary-600">
              {formatCurrency(produit.prix)}
            </span>
            
            {!isOutOfStock && produit.stock <= 3 && (
              <span className="text-xs text-orange-600 font-medium">
                {produit.stock} restant{produit.stock > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}