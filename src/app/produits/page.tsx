'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Grid3X3, List, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { useProduits } from '@/hooks/useProduits';
import { Header } from '@/components/Header';
import { ProductListItem } from '@/components/ProductListItem';

const categories = [
  { value: '', label: 'Toutes les catégories', icon: '🎨' },
  { value: 'pagne', label: 'Pagnes', icon: '👘' },
  { value: 'vetement', label: 'Vêtements', icon: '👔' },
  { value: 'accessoire', label: 'Accessoires', icon: '💍' },
];

const sortOptions = [
  { value: 'nom_produit-asc', label: 'Nom A-Z', icon: '🔤' },
  { value: 'nom_produit-desc', label: 'Nom Z-A', icon: '🔤' },
  { value: 'prix-asc', label: 'Prix croissant', icon: '💰' },
  { value: 'prix-desc', label: 'Prix décroissant', icon: '💰' },
  { value: 'created_at-desc', label: 'Plus récents', icon: '✨' },
  { value: 'created_at-asc', label: 'Plus anciens', icon: '📅' },
];

const priceRanges = [
  { label: 'Moins de 15 000 FCFA', min: 0, max: 15000 },
  { label: '15 000 - 30 000 FCFA', min: 15000, max: 30000 },
  { label: '30 000 - 50 000 FCFA', min: 30000, max: 50000 },
  { label: 'Plus de 50 000 FCFA', min: 50000, max: 1000000 },
];

export default function ProduitsPage() {
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
  const [sortBy, setSortBy] = useState('created_at-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [sortField, sortOrder] = sortBy.split('-') as [string, 'asc' | 'desc'];

  // Filtres avancés avec mémorisation
  const filters = useMemo(() => ({
    search: search.trim() || undefined,
    categorie: categorie || undefined,
    prix_min: priceRange?.min,
    prix_max: priceRange?.max,
    sortBy: sortField as any,
    limite: 12
  }), [search, categorie, priceRange, sortField]);

  const { 
    produits, 
    loading, 
    error, 
    hasMore, 
    total, 
    loadMore, 
    refresh 
  } = useProduits(filters);

  const handleFilterChange = (value: string, field: string) => {
    switch (field) {
      case 'search':
        setSearch(value);
        break;
      case 'categorie':
        setCategorie(value);
        break;
      default:
        break;
    }
  };

  const handlePriceRangeChange = (range: { min: number; max: number } | null) => {
    setPriceRange(range);
  };

  const clearFilters = () => {
    setSearch('');
    setCategorie('');
    setSortBy('created_at-desc');
    setPriceRange(null);
  };

  const hasActiveFilters = search || categorie || priceRange;

  if (loading && produits.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des produits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur lors du chargement des produits: {error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header avec style amélioré */}
      <div className="bg-gradient-to-r from-primary-50 to-orange-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">
              ✨ Nos Créations Authentiques
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez l&apos;authenticité du tissage sénoufo à travers nos créations uniques, 
              réalisées avec passion par les artisans talentueux de Waraniéné.
            </p>
            {total > 0 && (
              <div className="mt-6 inline-flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm border border-white/50">
                <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
                <span className="font-medium text-gray-700">
                  {total} création{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full flex items-center justify-center gap-2 ${
                  hasActiveFilters ? 'border-primary-300 bg-primary-50' : ''
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres {hasActiveFilters && '(actifs)'}
              </Button>
            </div>

            <div className={`space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
              {/* Recherche améliorée */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Rechercher
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom du produit, artisan, description..."
                    value={search}
                    onChange={(e) => handleFilterChange(e.target.value, 'search')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Catégories améliorées */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Catégorie
                </label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category.value} className="flex items-center">
                      <input
                        type="radio"
                        name="categorie"
                        value={category.value}
                        checked={categorie === category.value}
                        onChange={(e) => handleFilterChange(e.target.value, 'categorie')}
                        className="mr-3 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="flex items-center gap-2 text-sm">
                        <span>{category.icon}</span>
                        {category.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtres de prix */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Gamme de prix
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={!priceRange}
                      onChange={() => handlePriceRangeChange(null)}
                      className="mr-3 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">Tous les prix</span>
                  </label>
                  {priceRanges.map((range, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={priceRange?.min === range.min && priceRange?.max === range.max}
                        onChange={() => handlePriceRangeChange({ min: range.min, max: range.max })}
                        className="mr-3 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    ✕ Effacer les filtres
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {showAdvancedFilters ? 'Masquer' : 'Plus d\'options'}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar amélioré */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 font-medium">
                    {produits.length} produit(s) affiché(s)
                    {total && total > produits.length && (
                      <span className="text-gray-500"> sur {total}</span>
                    )}
                  </div>
                  
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span className="text-xs text-primary-600 font-medium">
                        Filtres actifs
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort amélioré */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Trier par:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode amélioré */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-primary-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Vue grille"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white text-primary-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Vue liste"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List amélioré */}
            {produits.length === 0 && !loading ? (
              <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-200">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Aucun produit ne correspond à vos critères de recherche actuels.
                  Essayez de modifier ou d&apos;effacer vos filtres.
                </p>
                <div className="space-y-3">
                  <Button onClick={clearFilters} className="mx-auto">
                    🔄 Effacer tous les filtres
                  </Button>
                  <p className="text-sm text-gray-500">
                    ou <Link href="/" className="text-primary-600 hover:underline">retourner à l&apos;accueil</Link>
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-6'
                }>
                  {produits.map((product) => (
                    viewMode === 'grid' ? (
                      <ProductCard
                        key={product.id}
                        produit={product}
                      />
                    ) : (
                      <ProductListItem
                        key={product.id}
                        produit={product}
                      />
                    )
                  ))}
                </div>

                {/* Animation de chargement */}
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="text-gray-600">Chargement...</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Bouton "Charger plus" amélioré */}
            {hasMore && !loading && (
              <div className="mt-12 text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <p className="text-gray-600 mb-4">
                    Vous avez vu {produits.length} produits sur {total}
                  </p>
                  <Button
                    onClick={loadMore}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Découvrir plus de créations
                  </Button>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(produits.length / total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}