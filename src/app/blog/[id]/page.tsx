'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User, Share2, Heart, Tag, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Header } from '@/components/Header';

interface BlogPost {
  id: string;
  titre: string;
  extrait: string;
  contenu: string;
  image?: string;
  auteur: string;
  artisan?: {
    id: string;
    nom: string;
    photo?: string;
    bio?: string;
  } | null;
  date_publication: string;
  temps_lecture: number;
  categorie: string;
  tags: string[];
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const articleId = params.id;
        const response = await fetch(`/api/blog/${articleId}`);
        
        if (!response.ok) {
          throw new Error('Article introuvable');
        }

        const data = await response.json();
        
        if (data.success && data.article) {
          setPost(data.article);
        } else {
          setError('Article introuvable');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement de l\'article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.titre,
        text: post?.extrait,
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de l'article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Article non trouvé'}</h1>
            <Link href="/blog">
              <Button>Retour au blog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary-600">Accueil</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{post.titre}</span>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
              {post.categorie}
            </span>
          </div>

          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.titre}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.auteur}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date_publication)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.temps_lecture} min de lecture
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-red-600' : 'text-gray-600'}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Aimé' : 'Aimer'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-1" />
                Partager
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl mb-8 flex items-center justify-center">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.titre}
              fill
              className="object-cover rounded-2xl"
            />
          ) : (
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🧵</div>
              <p className="text-primary-700 font-medium text-xl">
                {post.titre}
              </p>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div className="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
            {post.extrait}
          </div>
          
          <div className="text-gray-800 leading-relaxed space-y-6">
            {post.contenu.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h2 key={index} className="font-display text-2xl font-bold text-gray-900 mt-8 mb-4">
                    {paragraph.replace('# ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={index} className="font-display text-xl font-semibold text-gray-900 mt-6 mb-3">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={index} className="font-semibold text-lg text-gray-900 mt-4 mb-2">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').map(item => item.replace('- ', ''));
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 ml-4">
                    {items.map((item, i) => (
                      <li key={i} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                return (
                  <p key={index} className="italic text-gray-600 text-center py-4 border-l-4 border-primary-200 pl-4">
                    {paragraph.replace(/\*/g, '')}
                  </p>
                );
              }
              return (
                <p key={index} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-200">
          <Tag className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/blog?tag=${tag}`}
                className="bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 text-sm px-3 py-1 rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Author / Artisan Bio */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-12">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-semibold text-amber-700 text-lg">
                {(post.artisan?.nom || post.auteur).charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                {post.artisan?.nom || post.auteur}
              </h3>
              <p className="text-gray-600 mb-3">
                {post.artisan?.bio || 
                  'Maître tisserand et gardien des traditions sénoufo à Waraniéné. Passionné par la transmission du savoir ancestral aux jeunes générations.'}
              </p>
              {post.artisan && (
                <Link href={`/artisans/${post.artisan.id}`}>
                  <Button variant="outline" size="sm">
                    Voir le profil de l&apos;artisan
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mb-12 text-center">
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voir tous les articles
            </Button>
          </Link>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Commentaires</h3>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Soyez le premier à commenter cet article !
            </p>
            <Button>Laisser un commentaire</Button>
          </div>
        </div>
      </article>
    </div>
  );
}