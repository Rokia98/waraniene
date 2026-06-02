'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Grid3X3, List, SlidersHorizontal, Sparkles, X, ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { useProduits } from '@/hooks/useProduits';
import { Header } from '@/components/Header';
import { ProductListItem } from '@/components/ProductListItem';

const CATEGORIES = [
  { value: '', label: 'Toutes les catégories', icon: '🎨' },
  { value: 'pagne', label: 'Pagnes', icon: '👘' },
  { value: 'boubou', label: 'Boubous', icon: '🥻' },
  { value: 'foulard', label: 'Foulards', icon: '🧣' },
  { value: 'chemise', label: 'Chemises', icon: '👔' },
  { value: 'robe', label: 'Robes', icon: '👗' },
  { value: 'accessoire', label: 'Accessoires', icon: '💍' },
  { value: 'decoration', label: 'Décoration', icon: '🏺' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Plus récents' },
  { value: 'prix_asc', label: 'Prix croissant' },
  { value: 'prix_desc', label: 'Prix décroissant' },
  { value: 'nom', label: 'Nom A–Z' },
  { value: 'popularite', label: 'Popularité' },
];

const PRICE_RANGES = [
  { label: 'Tous les prix', min: undefined, max: undefined },
  { label: '< 15 000 FCFA', min: 0, max: 15000 },
  { label: '15 000 – 30 000 FCFA', min: 15000, max: 30000 },
  { label: '30 000 – 50 000 FCFA', min: 30000, max: 50000 },
  { label: '> 50 000 FCFA', min: 50000, max: undefined },
];

function ProduitsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── États initialisés depuis l'URL ──────────────────────────
  const [search, setSearch]       = useState(() => searchParams.get('recherche') || '');
  const [categorie, setCategorie] = useState(() => searchParams.get('categorie') || '');
  const [artisanId, setArtisanId] = useState(() => searchParams.get('artisan') || '');
  const [artisanNom, setArtisanNom] = useState<string>('');
  const [sortBy, setSortBy]       = useState('created_at');
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number } | null>(null);

  // ── Récupérer le nom de l'artisan si filtré ─────────────────
  useEffect(() => {
    if (!artisanId) { setArtisanNom(''); return; }
    fetch(`/api/artisans/${artisanId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const artisan = data?.artisan || data?.data || data;
        setArtisanNom(artisan?.nom || '');
      })
      .catch(() => setArtisanNom(''));
  }, [artisanId]);

  // ── Synchroniser l'URL quand les filtres changent ──────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (search)    params.set('recherche', search);
    if (categorie) params.set('categorie', categorie);
    if (artisanId) params.set('artisan', artisanId);
    const qs = params.toString();
    router.replace(`/produits${qs ? '?' + qs : ''}`, { scroll: false });
  }, [search, categorie, artisanId]);

  // ── Filtres pour le hook ────────────────────────────────────
  const filters = useMemo(() => ({
    recherche:  search.trim() || undefined,
    categorie:  categorie || undefined,
    artisan_id: artisanId || undefined,
    prix_min:   priceRange?.min,
    prix_max:   priceRange?.max,
    sortBy:     sortBy as any,
    limite:     12,
  }), [search, categorie, artisanId, priceRange, sortBy]);

  const { produits, loading, error, hasMore, total, loadMore, refresh } = useProduits(filters);

  const clearFilters = () => {
    setSearch('');
    setCategorie('');
    setArtisanId('');
    setArtisanNom('');
    setSortBy('created_at');
    setPriceRange(null);
  };

  const hasActiveFilters = !!(search || categorie || artisanId || priceRange);

  // ── États de chargement / erreur ────────────────────────────
  if (loading && produits.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-500">Chargement des produits…</p>
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
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={refresh} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* ── Bannière artisan (si filtre actif) ── */}
      {artisanId && (
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/artisans" className="flex items-center gap-1.5 text-primary-200 hover:text-white text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Artisans
              </Link>
              <span className="text-primary-400">›</span>
              <span className="font-semibold">
                {artisanNom ? `Créations de ${artisanNom}` : 'Créations de l\'artisan'}
              </span>
            </div>
            <button
              onClick={() => { setArtisanId(''); setArtisanNom(''); }}
              className="flex items-center gap-1.5 text-sm text-primary-200 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Voir tous les produits
            </button>
          </div>
        </div>
      )}

      {/* ── En-tête page ── */}
      <div className="bg-gradient-to-r from-primary-50 to-orange-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
              {artisanNom ? `Créations de ${artisanNom}` : '✨ Nos Créations Authentiques'}
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {artisanNom
                ? `Découvrez toutes les créations artisanales de ${artisanNom}, tisserand de Waraniéné.`
                : 'Textiles traditionnels sénoufo tissés à la main par les artisans de Waraniéné.'}
            </p>
            {total > 0 && (
              <div className="mt-5 inline-flex items-center bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm border border-white/50">
                <Sparkles className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  {total} création{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar filtres ── */}
          <aside className="lg:w-60 shrink-0 space-y-4">
            {/* Toggle mobile */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                  hasActiveFilters ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres {hasActiveFilters && '(actifs)'}
              </button>
            </div>

            <div className={`space-y-4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
              {/* Recherche */}
              <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> Recherche
                </p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom, description…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Catégories */}
              <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Grid3X3 className="w-3.5 h-3.5" /> Catégorie
                </p>
                <div className="space-y-1.5">
                  {CATEGORIES.map(cat => (
                    <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="categorie" value={cat.value}
                        checked={categorie === cat.value}
                        onChange={e => setCategorie(e.target.value)}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-gray-700">{cat.icon} {cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Prix
                </p>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((range, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="prix"
                        checked={
                          i === 0
                            ? !priceRange
                            : priceRange?.min === range.min && priceRange?.max === range.max
                        }
                        onChange={() => setPriceRange(i === 0 ? null : { min: range.min, max: range.max })}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Effacer filtres */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" /> Effacer les filtres
                </button>
              )}
            </div>
          </aside>

          {/* ── Contenu principal ── */}
          <div className="flex-1 min-w-0">
            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{produits.length}</span>
                {total && total > produits.length ? ` sur ${total}` : ''} produit{produits.length > 1 ? 's' : ''}
                {hasActiveFilters && <span className="ml-1.5 text-primary-600 font-medium">• Filtres actifs</span>}
              </p>
              <div className="flex items-center gap-3">
                {/* Tri */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Vue grille/liste */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`} title="Grille">
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`} title="Liste">
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grille / liste */}
            {produits.length === 0 && !loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-9 h-9 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-400 text-sm mb-5">
                  {artisanNom
                    ? `${artisanNom} n'a pas encore de produits disponibles.`
                    : 'Essayez de modifier vos filtres.'}
                </p>
                <button onClick={clearFilters} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
                  : 'space-y-4'
                }>
                  {produits.map(product =>
                    viewMode === 'grid'
                      ? <ProductCard key={product.id} produit={product} />
                      : <ProductListItem key={product.id} produit={product} />
                  )}
                </div>

                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                  </div>
                )}
              </>
            )}

            {/* Charger plus */}
            {hasMore && !loading && (
              <div className="mt-10 text-center">
                <p className="text-sm text-gray-400 mb-3">{produits.length} sur {total} produits chargés</p>
                <div className="w-full max-w-xs mx-auto h-1.5 bg-gray-200 rounded-full mb-4">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${(produits.length / total) * 100}%` }}
                  />
                </div>
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm shadow-btn hover:shadow-btn-hover transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Charger plus
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProduitsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    }>
      <ProduitsPageContent />
    </Suspense>
  );
}
