'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowRight, Search, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Header } from '@/components/Header';

interface BlogArtisan {
  id: string;
  nom: string;
  photo?: string;
  bio?: string;
}

interface BlogPost {
  id: string;
  titre: string;
  extrait: string;
  contenu: string;
  image?: string;
  auteur: string;
  artisan?: BlogArtisan | null;
  date_publication: string;
  temps_lecture: number;
  categorie: string;
  tags: string[];
}

const categories = [
  'Toutes',
  'Histoire',
  'Culture',
  'Technique',
  'Portrait',
  'Économie',
  'Réflexion'
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les articles au montage du composant
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/blog');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des articles');
        }

        const data = await response.json();
        
        if (data.success && data.articles) {
          setPosts(data.articles);
          setFilteredPosts(data.articles);
        } else {
          setError('Aucun article trouvé');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filterPosts = (category: string, search: string) => {
    let filtered = [...posts];

    if (category !== 'Toutes') {
      filtered = filtered.filter(post => post.categorie === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(post =>
        post.titre.toLowerCase().includes(searchLower) ||
        post.extrait.toLowerCase().includes(searchLower) ||
        post.auteur.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredPosts(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterPosts(category, searchTerm);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    filterPosts(selectedCategory, search);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement des articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Blog & Actualités
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez l&apos;univers fascinant du tissage sénoufo, l&apos;histoire de nos artisans 
              et les coulisses de notre communauté créative à Waraniéné.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} trouvé{filteredPosts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun article trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier votre recherche ou votre filtre
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Toutes');
              setFilteredPosts(posts);
            }}>
              Voir tous les articles
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Article */}
            {featuredPost && (
              <article className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    {featuredPost.image ? (
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.titre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <div className="text-6xl mb-4">📖</div>
                        <p className="text-primary-700 font-medium">Article en vedette</p>
                      </div>
                    )}
                  </div>
                  <div className="p-8 lg:p-12">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                        {featuredPost.categorie}
                      </span>
                      <span className="text-sm text-gray-500">Article en vedette</span>
                    </div>
                    
                    <h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 mb-4 line-clamp-2">
                      {featuredPost.titre}
                    </h2>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3 text-lg">
                      {featuredPost.extrait}
                    </p>
                    
                    {featuredPost.artisan && (
                      <Link 
                        href={`/artisans/${featuredPost.artisan.id}`}
                        className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-sm">
                          {featuredPost.artisan.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-900">Par {featuredPost.artisan.nom}</p>
                          <p className="text-xs text-amber-700">Artisan tisserand</p>
                        </div>
                      </Link>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {!featuredPost.artisan && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {featuredPost.auteur}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredPost.date_publication)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.temps_lecture} min
                        </span>
                      </div>
                      
                      <Link href={`/blog/${featuredPost.id}`}>
                        <Button className="flex items-center gap-2">
                          Lire l&apos;article
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Other Articles Grid */}
            {otherPosts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-6">
                          <div className="text-4xl mb-2">📝</div>
                          <p className="text-primary-700 font-medium text-sm">Article</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                          {post.categorie}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.temps_lecture} min
                        </span>
                      </div>
                      
                      <h3 className="font-display text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {post.titre}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.extrait}
                      </p>
                      
                      {post.artisan && (
                        <Link 
                          href={`/artisans/${post.artisan.id}`}
                          className="flex items-center gap-2 mb-3 p-2 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-xs">
                            {post.artisan.nom.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-amber-900">{post.artisan.nom}</p>
                            <p className="text-xs text-amber-700">Artisan</p>
                          </div>
                        </Link>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {!post.artisan && (
                            <div className="flex items-center gap-1 mb-1">
                              <User className="w-3 h-3" />
                              {post.auteur}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.date_publication)}
                          </div>
                        </div>
                        
                        <Link href={`/blog/${post.id}`}>
                          <Button variant="outline" size="sm">
                            Lire plus
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="bg-primary-600 rounded-2xl p-8 mt-16 text-center text-white">
          <h2 className="font-display text-2xl font-bold mb-4">
            Restez informé de nos actualités
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Abonnez-vous à notre newsletter pour recevoir les derniers articles sur 
            l&apos;art du tissage sénoufo et l&apos;actualité de nos artisans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-300 focus:outline-none"
            />
            <Button variant="secondary" className="whitespace-nowrap">
              S&apos;abonner
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}