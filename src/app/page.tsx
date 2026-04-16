'use client';

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Star, ArrowRight, Heart, Shield, Truck, Award } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { useProduits } from "@/hooks/useProduits";

export default function HomePage() {
  // Charger les produits pour chaque catégorie principale
  const { produits: pagnes, loading: loadingPagnes } = useProduits({
    categorie: 'pagne',
    limite: 4
  });
  
  const { produits: boubous, loading: loadingBoubous } = useProduits({
    categorie: 'boubou',
    limite: 4
  });
  
  const { produits: foulards, loading: loadingFoulards } = useProduits({
    categorie: 'foulard',
    limite: 4
  });
  
  const { produits: robes, loading: loadingRobes } = useProduits({
    categorie: 'robe',
    limite: 4
  });

  const loading = loadingPagnes || loadingBoubous || loadingFoulards || loadingRobes;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section - Pleine largeur avec overlay */}
      <section className="relative h-[600px] lg:h-[700px] overflow-hidden">
        <Image
          src="/images/artisans/tissage1.jpg"
          alt="Artisan de Waraniéné au travail - Tissage traditionnel sénoufo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6">
              L&apos;Art du Tissage
              <span className="block text-primary-400">Sénoufo Authentique</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-200">
              Chaque pièce est une œuvre unique, tissée à la main par nos artisans de Waraniéné. 
              Découvrez l&apos;héritage culturel ivoirien sublimé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/produits" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Découvrir nos créations
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/artisans" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border-2 border-white/30 transition-all"
              >
                Nos artisans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">100% Authentique</h3>
              <p className="text-sm text-gray-600">Tissage artisanal traditionnel sénoufo</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fait Main</h3>
              <p className="text-sm text-gray-600">Chaque pièce unique créée avec passion</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Livraison Rapide</h3>
              <p className="text-sm text-gray-600">Partout en Côte d&apos;Ivoire</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Qualité Premium</h3>
              <p className="text-sm text-gray-600">Tissus de haute qualité garantis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Catégorie 1 - Pagnes Traditionnels */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Nos Pagnes Traditionnels
                <span className="block text-primary-600">Se Transforment à l&apos;Infini !</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Des motifs ancestraux sénoufo tissés à la main, parfaits pour vos tenues traditionnelles 
                ou vos créations modernes. Chaque pagne raconte une histoire unique de notre patrimoine.
              </p>
              <Link 
                href="/produits?categorie=pagnes" 
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all"
              >
                DÉCOUVREZ PLUS
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="order-1 lg:order-2 relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Collection de pagnes traditionnels sénoufo"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Catégorie 2 - Accessoires */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white z-10">
                  <p className="text-2xl font-semibold">Photos d&apos;accessoires à venir</p>
                  <p className="text-lg mt-2">Sacs, écharpes, et plus</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Accessoires Uniques
                <span className="block text-indigo-600">En Édition Limitée</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Sublimez vos tenues avec nos sacs, écharpes et accessoires tissés traditionnellement. 
                Des pièces modernes qui honorent l&apos;artisanat ancestral.
              </p>
              <Link 
                href="/produits?categorie=accessoires" 
                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
              >
                DÉCOUVREZ PLUS
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Par Catégorie */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Sublimez Vos Créations
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez nos créations artisanales les plus prisées, tissées avec passion par nos artisans
            </p>
          </div>
          
          {/* Catégorie: Pagnes */}
          {pagnes.length > 0 && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-3xl font-bold text-gray-900">Pagnes Traditionnels</h3>
                  <p className="text-gray-600 mt-2">Tissages authentiques sénoufo</p>
                </div>
                <Link 
                  href="/produits?categorie=pagne" 
                  className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 group"
                >
                  Voir tout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pagnes.map((product) => (
                  <ProductCard key={product.id} produit={product} />
                ))}
              </div>
            </div>
          )}

          {/* Catégorie: Boubous */}
          {boubous.length > 0 && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-3xl font-bold text-gray-900">Boubous Élégants</h3>
                  <p className="text-gray-600 mt-2">Raffinement et tradition</p>
                </div>
                <Link 
                  href="/produits?categorie=boubou" 
                  className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 group"
                >
                  Voir tout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {boubous.map((product) => (
                  <ProductCard key={product.id} produit={product} />
                ))}
              </div>
            </div>
          )}

          {/* Catégorie: Foulards */}
          {foulards.length > 0 && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-3xl font-bold text-gray-900">Foulards Artisanaux</h3>
                  <p className="text-gray-600 mt-2">Accessoires de caractère</p>
                </div>
                <Link 
                  href="/produits?categorie=foulard" 
                  className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 group"
                >
                  Voir tout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {foulards.map((product) => (
                  <ProductCard key={product.id} produit={product} />
                ))}
              </div>
            </div>
          )}

          {/* Catégorie: Robes */}
          {robes.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-3xl font-bold text-gray-900">Robes Traditionnelles</h3>
                  <p className="text-gray-600 mt-2">Élégance intemporelle</p>
                </div>
                <Link 
                  href="/produits?categorie=robe" 
                  className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 group"
                >
                  Voir tout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {robes.map((product) => (
                  <ProductCard key={product.id} produit={product} />
                ))}
              </div>
            </div>
          )}

          {/* Si aucun produit disponible */}
          {!loading && pagnes.length === 0 && boubous.length === 0 && foulards.length === 0 && robes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun produit disponible pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                L&apos;Héritage de Waraniéné
                <span className="block text-primary-600 mt-2">Village d&apos;Artisans</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Waraniéné est un village de tisserands où se perpétue depuis des générations 
                l&apos;art ancestral du tissage sénoufo. Nos artisans utilisent des techniques 
                traditionnelles transmises de père en fils pour créer des œuvres uniques.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Chaque fil tissé raconte une histoire, chaque motif porte en lui l&apos;âme 
                de notre communauté et préserve notre patrimoine culturel pour les générations futures.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/artisans" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all">
                  Découvrir nos artisans
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/blog" className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-all">
                  Notre Histoire
                </Link>
              </div>
            </div>
            <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Atelier de tissage traditionnel à Waraniéné - Côte d'Ivoire"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-white font-semibold text-lg">Atelier traditionnel de Waraniéné</p>
                <p className="text-white/90 text-sm">Korhogo, Côte d&apos;Ivoire</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Vos Avis, Notre Plus Belle Récompense
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez ce que nos clients pensent de nos créations artisanales
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                &ldquo;Un pagne magnifique qui attire tous les regards ! La qualité du tissage 
                est exceptionnelle. Je recommande vivement.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-700 font-bold text-lg">A</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Amina K.</p>
                  <p className="text-sm text-gray-600">Abidjan</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                &ldquo;Authentique et de grande qualité. J&apos;apprécie le soutien direct 
                aux artisans de Waraniéné. Livraison rapide en plus !&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-700 font-bold text-lg">K</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Kouadio M.</p>
                  <p className="text-sm text-gray-600">Bouaké</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                &ldquo;Des créations uniques qui valorisent notre culture sénoufo. 
                Parfait pour mes événements traditionnels.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-700 font-bold text-lg">F</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Fatoumata S.</p>
                  <p className="text-sm text-gray-600">Korhogo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6">
            Restez à la Une
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Recevez nos nouvelles collections, promotions exclusives et histoires d&apos;artisans
          </p>
          
          <form className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Votre adresse e-mail"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all whitespace-nowrap"
              >
                S&apos;INSCRIRE
              </button>
            </div>
            <p className="text-sm text-white/70 mt-4">
              En vous inscrivant, vous acceptez de recevoir nos communications. 
              <br className="hidden sm:block" />
              Vous pouvez vous désabonner à tout moment.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">TW</span>
                </div>
                <span className="font-display text-xl font-bold">Tissés de Waraniéné</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                L&apos;authenticité du tissage sénoufo directement de Waraniéné, Côte d&apos;Ivoire. 
                Chaque création soutient directement nos artisans locaux.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all">
                  <span className="text-sm font-semibold">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all">
                  <span className="text-sm font-semibold">📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all">
                  <span className="text-sm font-semibold">T</span>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Produits</h3>
              <ul className="space-y-3">
                <li><Link href="/produits?categorie=pagnes" className="text-gray-400 hover:text-primary-400 transition-colors">Pagnes Traditionnels</Link></li>
                <li><Link href="/produits?categorie=accessoires" className="text-gray-400 hover:text-primary-400 transition-colors">Accessoires</Link></li>
                <li><Link href="/produits?categorie=vetements" className="text-gray-400 hover:text-primary-400 transition-colors">Vêtements</Link></li>
                <li><Link href="/produits" className="text-gray-400 hover:text-primary-400 transition-colors">Tous les Produits</Link></li>
                <li><Link href="/produits?promo=true" className="text-primary-400 hover:text-primary-300 transition-colors">Promotions</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">À Propos</h3>
              <ul className="space-y-3">
                <li><Link href="/artisans" className="text-gray-400 hover:text-primary-400 transition-colors">Nos Artisans</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-primary-400 transition-colors">Notre Histoire</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-primary-400 transition-colors">Nous Contacter</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Livraison</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Notre Héritage</h3>
              <ul className="space-y-3">
                <li><Link href="/heritage/culture-senoufo" className="text-gray-400 hover:text-primary-400 transition-colors">Culture Sénoufo</Link></li>
                <li><Link href="/heritage/techniques-tissage" className="text-gray-400 hover:text-primary-400 transition-colors">Techniques de Tissage</Link></li>
                <li><Link href="/heritage/waraniene-village" className="text-gray-400 hover:text-primary-400 transition-colors">Waraniéné Village</Link></li>
                <li><Link href="/heritage/engagement-social" className="text-gray-400 hover:text-primary-400 transition-colors">Engagement Social</Link></li>
                <li><Link href="/heritage/authenticite" className="text-gray-400 hover:text-primary-400 transition-colors">Authenticité</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Tissés de Waraniéné. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Waraniéné, Korhogo, Côte d&apos;Ivoire</span>
              </div>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Conditions</a>
                <span className="text-gray-600">•</span>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Confidentialité</a>
                <span className="text-gray-600">•</span>
                <Link href="/test" className="text-yellow-400 hover:text-yellow-300 transition-colors">🧪 Test</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}