import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye, Star, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { Produit } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { useFavoris } from "@/contexts/FavorisContext";
import { SafeImage } from "@/components/ui/SafeImage";

interface ProductListItemProps {
  produit: Produit;
}

export function ProductListItem({ produit }: ProductListItemProps) {
  const { addItem, getItemQuantity, isItemInCart } = useCart();
  const { isFavori, toggleFavori } = useFavoris();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (produit.stock <= 0) {
      return;
    }
    
    // Adapter les données du produit au format du panier
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavori({
      id: produit.id,
      nom_produit: produit.nom_produit,
      prix: produit.prix,
      artisan: produit.artisan?.nom || 'Artisan inconnu',
      image: produit.photos?.[0],
    });
  };

  const isFavorite = isFavori(produit.id);

  const cartQuantity = getItemQuantity(produit.id);
  const inCart = isItemInCart(produit.id);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 group overflow-hidden">
      <div className="flex">
        {/* Image */}
        <div className="relative w-48 h-48 bg-gray-100 overflow-hidden flex-shrink-0">
          <Link href={`/produits/${produit.id}`}>
            <SafeImage
              src={produit.photos?.[0] || ''}
              alt={produit.nom_produit}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              fallbackTitle={produit.nom_produit}
            />
          </Link>
          
          {/* Badges */}
          <div className="absolute top-3 left-3">
            <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              {produit.categorie}
            </span>
          </div>
          
          {produit.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white font-medium px-3 py-1 rounded-full text-sm">
                Épuisé
              </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <Link href={`/produits/${produit.id}`}>
                <h3 className="font-semibold text-xl text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-1">
                  {produit.nom_produit}
                </h3>
              </Link>
              
              {produit.artisan && (
                <Link 
                  href={`/artisans/${produit.artisan_id}`}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors mb-3"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  Par {produit.artisan.nom}
                </Link>
              )}
            </div>
            
            <div className="text-right">
              <span className="font-bold text-2xl text-primary-600">
                {formatCurrency(produit.prix)}
              </span>
              <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                produit.stock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {produit.stock > 0 ? `${produit.stock} en stock` : 'Rupture'}
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {produit.description}
          </p>
          
          {/* Features/Tags */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              Fait main
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Sparkles className="w-4 h-4 text-blue-400 mr-1" />
              Authentique
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              Populaire
            </div>
          </div>
          
          {produit.stock <= 5 && produit.stock > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-700 font-medium">
                ⚡ Plus que {produit.stock} en stock - Commandez rapidement !
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/produits/${produit.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Voir les détails
              </Button>
            </Link>
            
            <Button
              onClick={handleAddToCart}
              disabled={produit.stock === 0}
              className={`flex-1 ${
                inCart 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-primary-600 hover:bg-primary-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {inCart ? `Dans panier (${cartQuantity})` : 'Ajouter au panier'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}