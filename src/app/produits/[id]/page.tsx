'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import ReviewsComponent from '@/components/ReviewsComponent';
import { Produit } from '@/types';
import { Header } from '@/components/Header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useProduit, useProduits } from '@/hooks/useProduits';
import { useCart } from '@/contexts/CartContext';
import { useFavoris } from '@/contexts/FavorisContext';
import { SafeImage } from '@/components/ui/SafeImage';

// Composant pour les produits similaires par catégorie
function SimilarProductsByCategory({ currentProduct, currentProductId }: { currentProduct: Produit, currentProductId: string }) {
  const { produits: similarProducts } = useProduits({
    categorie: currentProduct.categorie,
    limite: 5
  });

  const filteredProducts = similarProducts.filter(p => p.id !== currentProductId).slice(0, 4);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
        Produits similaires · {currentProduct.categorie}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            produit={product}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const { produit: product, loading, error, refresh } = useProduit(productId);
  const { produits: relatedProducts } = useProduits({
    artisan_id: product?.artisan_id,
    limite: 4
  });
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  
  const { addItem, getItemQuantity, isItemInCart } = useCart();
  const { isFavori, toggleFavori } = useFavoris();
  const isFavorite = product ? isFavori(product.id) : false;

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      const cartItem = {
        id: product.id,
        nom_produit: product.nom_produit,
        prix: product.prix,
        stock_disponible: product.stock,
        artisan: product.artisan?.nom || 'Artisan inconnu',
        image: product.photos?.[0],
      };
      
      for (let i = 0; i < quantity; i++) {
        addItem(cartItem);
      }
      
      console.log(`✅ Ajouté ${quantity} x ${product.nom_produit} au panier`);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.nom_produit,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p className="text-gray-600">Chargement du produit...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={refresh}>Réessayer</Button>
              <Link href="/produits">
                <Button variant="outline">Retour aux produits</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
            <p className="text-gray-600 mb-6">Ce produit n'existe pas ou a été supprimé.</p>
            <Link href="/produits">
              <Button>Retour aux produits</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = product.prix * quantity;
  const cartQuantity = getItemQuantity(product.id);
  const inCart = isItemInCart(product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb amélioré */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/produits" className="hover:text-primary-600 transition-colors">Produits</Link>
          <span>/</span>
          <Link href={`/artisans/${product.artisan_id}`} className="hover:text-primary-600 transition-colors">
            {product.artisan?.nom || 'Artisan'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.nom_produit}</span>
        </nav>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-3 hover:bg-primary-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images améliorées */}
          <div>
            <div className="aspect-square bg-white rounded-2xl mb-4 overflow-hidden border border-gray-200 w-full flex items-center justify-center relative">
              {product.photos && product.photos.length > 0 ? (
                <>
                  {/* Flèche gauche */}
                  {product.photos.length > 1 && (
                    <button
                      onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + product.photos.length) % product.photos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-2 shadow border border-gray-200"
                      aria-label="Image précédente"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  )}
                  {/* Image principale avec zoom */}
                  <img
                    src={product.photos[selectedImageIndex]}
                    alt={product.nom_produit}
                    className={`object-contain w-full h-full max-w-full max-h-full cursor-zoom-in transition-transform duration-300 ${zoomed ? 'scale-150 z-40' : ''}`}
                    style={{ background: 'white' }}
                    onClick={() => setZoomed(!zoomed)}
                    title={zoomed ? 'Dézoomer' : 'Zoomer'}
                  />
                  {/* Flèche droite */}
                  {product.photos.length > 1 && (
                    <button
                      onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % product.photos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-2 shadow border border-gray-200"
                      aria-label="Image suivante"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2"/></svg>
                    </div>
                    <p className="text-orange-700 font-semibold text-lg mb-1">{product.nom_produit}</p>
                    <p className="text-orange-500 text-sm">Image à venir</p>
                  </div>
                </div>
              )}
              
              {/* Badge de catégorie sur l'image */}
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-white/90 backdrop-blur-sm text-primary-800 text-sm font-medium px-3 py-1.5 rounded-full border border-primary-200">
                  {product.categorie}
                </span>
              </div>
              
              {/* Badge stock faible */}
              {product.stock <= 3 && product.stock > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-500 text-white text-sm font-medium px-3 py-1.5 rounded-full animate-pulse">
                    ⚡ Plus que {product.stock}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.photos && product.photos.length > 1 && (
              <div className="flex gap-3 mt-4 justify-center">
                {product.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => { setSelectedImageIndex(index); setZoomed(false); }}
                    className={`w-14 h-14 aspect-square rounded-lg overflow-hidden border-2 flex items-center justify-center bg-white transition-all duration-200 ${
                      selectedImageIndex === index ? 'border-orange-500 ring-2 ring-orange-200' : 'border-primary-100'
                    }`}
                    tabIndex={0}
                  >
                    <img
                      src={photo}
                      alt={`${product.nom_produit} ${index + 1}`}
                      className="object-contain w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full mb-4 inline-block">
                  {product.categorie}
                </span>
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  {product.nom_produit}
                </h1>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => product && toggleFavori({
                    id: product.id,
                    nom_produit: product.nom_produit,
                    prix: product.prix,
                    artisan: product.artisan?.nom || 'Artisan inconnu',
                    image: product.photos?.[0],
                  })}
                  className={isFavorite ? 'text-red-500' : 'text-gray-600'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-primary-600">
                {formatCurrency(product.prix)}
              </span>
            </div>

            {/* Artisan Info amélioré */}
            {product.artisan && (
              <div className="bg-gradient-to-r from-white to-primary-50 rounded-lg p-5 mb-6 border border-primary-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">👨‍🎨</span>
                  Créé par
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {product.artisan.nom.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <Link href={`/artisans/${product.artisan.id}`} className="font-semibold text-lg text-gray-900 hover:text-primary-600 transition-colors">
                      {product.artisan.nom}
                    </Link>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.artisan.bio}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.artisan.localisation}
                      </span>
                      {product.artisan.telephone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {product.artisan.telephone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/artisans/${product.artisan.id}`}>
                    <Button variant="outline" size="sm">
                      Voir profil
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">
                    En stock ({product.stock} disponible{product.stock > 1 ? 's' : ''})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700 font-medium">Rupture de stock</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Total: {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className={`w-full sm:w-auto min-w-[200px] transition-all duration-200 ${
                    inCart 
                      ? 'bg-green-600 hover:bg-green-700 transform scale-105 shadow-lg' 
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {inCart ? `✓ Ajouté (${cartQuantity} dans le panier)` : 'Ajouter au panier'}
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Livraison</div>
                  <div className="text-xs text-gray-600">Partout en CI</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Authenticité</div>
                  <div className="text-xs text-gray-600">100% artisanal</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Retours</div>
                  <div className="text-xs text-gray-600">7 jours</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products - Produits du même artisan */}
        {relatedProducts && relatedProducts.filter(p => p.id !== product.id).length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                Autres créations de {product.artisan?.nom}
              </h2>
              <Link href={`/artisans/${product.artisan_id}`}>
                <Button variant="outline">
                  Voir toutes ses créations
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter(p => p.id !== product.id)
                .slice(0, 4)
                .map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    produit={relatedProduct}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Si pas de produits du même artisan, montrer des produits similaires par catégorie */}
        {(!relatedProducts || relatedProducts.filter(p => p.id !== product.id).length === 0) && (
          <SimilarProductsByCategory 
            currentProduct={product} 
            currentProductId={product.id} 
          />
        )}

        {/* Reviews Section */}
        <div className="mt-20 pt-16 border-t border-gray-200">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
            Avis clients
          </h2>
          <ReviewsComponent produitId={product.id} />
        </div>
      </div>
    </div>
  );
}