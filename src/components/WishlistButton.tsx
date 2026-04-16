'use client';
import { Heart } from 'lucide-react';
import { useFavoris } from '@/contexts/FavorisContext';

interface WishlistButtonProps {
  produitId: string;
  nom?: string;
  prix?: number;
  artisan?: string;
  image?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function WishlistButton({ 
  produitId, 
  nom = '', 
  prix = 0, 
  artisan = '', 
  image, 
  size = 'md',
  className = '' 
}: WishlistButtonProps) {
  const { isFavori, toggleFavori } = useFavoris();
  const isInWishlist = isFavori(produitId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavori({
      id: produitId,
      nom_produit: nom,
      prix,
      artisan,
      image,
    });
  };

  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <button
      onClick={handleToggle}
      className={`transition ${className} ${
        isInWishlist 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-400'
      }`}
    >
      <Heart 
        className={iconSize}
        fill={isInWishlist ? 'currentColor' : 'none'}
      />
    </button>
  );
}
