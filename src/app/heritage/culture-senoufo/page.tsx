'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin, BookOpen, Music, Palette } from "lucide-react";
import { Header } from "@/components/Header";

export default function CultureSenoufoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <Image
          src="/images/artisans/tissage1.jpg"
          alt="La culture Sénoufo - Traditions ancestrales de Côte d'Ivoire"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white">
            <Link href="/" className="inline-flex items-center text-primary-300 hover:text-primary-200 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l&apos;accueil
            </Link>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              La Culture
              <span className="block text-primary-400">Sénoufo</span>
            </h1>
            <p className="text-lg text-gray-200">
              Un peuple riche d&apos;histoire, de traditions et d&apos;un savoir-faire millénaire
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Le peuple Sénoufo est l&apos;un des groupes ethniques les plus importants d&apos;Afrique de l&apos;Ouest. 
              Présents principalement en Côte d&apos;Ivoire, au Mali et au Burkina Faso, les Sénoufos sont 
              reconnus pour leur organisation sociale unique, leur spiritualité profonde et leur artisanat exceptionnel.
            </p>
          </div>
        </div>
      </section>

      {/* Sections détaillées */}
      <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900">Organisation Sociale</h2>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                La société sénoufo est organisée autour du <strong>Poro</strong>, une institution initiatique 
                fondamentale qui structure toute la vie communautaire. Hommes et femmes passent par différentes 
                phases d&apos;initiation qui durent plusieurs années, transmettant les valeurs, l&apos;histoire 
                et les connaissances du peuple.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Cette organisation garantit la cohésion sociale, le respect des aînés et la transmission 
                des savoirs ancestraux de génération en génération. Le village est dirigé par un chef 
                coutumier, assisté d&apos;un conseil des anciens.
              </p>
            </div>
            <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Organisation sociale sénoufo"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage1.jpg"
                alt="Art et artisanat sénoufo"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Palette className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900">Art & Artisanat</h2>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                L&apos;art sénoufo est mondialement reconnu pour sa richesse et sa diversité. 
                Les masques, les sculptures sur bois, la forge et surtout le <strong>tissage</strong> 
                sont les expressions artistiques les plus emblématiques de cette culture.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Chaque motif tissé a une signification symbolique profonde : les losanges représentent 
                la protection, les zigzags évoquent le chemin de la vie, et les cercles symbolisent 
                l&apos;unité de la communauté. Ces motifs sont un véritable langage visuel.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900">Musique & Spiritualité</h2>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                La musique occupe une place centrale dans la culture sénoufo. Le <strong>balafon</strong>, 
                instrument emblématique, accompagne toutes les cérémonies importantes : mariages, funérailles, 
                fêtes de récolte et rituels initiatiques.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                La spiritualité sénoufo est animiste, basée sur le respect de la nature et des ancêtres. 
                Les masques sacrés, portés lors de cérémonies rituelles, sont considérés comme des 
                intermédiaires entre le monde visible et invisible.
              </p>
            </div>
            <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Musique et spiritualité sénoufo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs fondamentales */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Les Valeurs du Peuple Sénoufo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des principes qui guident la vie quotidienne depuis des millénaires
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Solidarité</h3>
              <p className="text-gray-600">L&apos;entraide communautaire est au cœur de la vie sénoufo</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Travail</h3>
              <p className="text-gray-600">Le travail de la terre et de l&apos;artisanat est sacré</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Transmission</h3>
              <p className="text-gray-600">Le savoir se transmet de génération en génération</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Respect</h3>
              <p className="text-gray-600">Respect de la nature, des aînés et des traditions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation vers autres pages héritage */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Explorez Notre Héritage</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/heritage/techniques-tissage" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all group">
              <h3 className="font-semibold text-lg mb-2">Techniques de Tissage</h3>
              <p className="text-white/80 text-sm">Découvrez nos méthodes ancestrales</p>
              <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/heritage/waraniene-village" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all group">
              <h3 className="font-semibold text-lg mb-2">Waraniéné Village</h3>
              <p className="text-white/80 text-sm">Le berceau de notre artisanat</p>
              <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/heritage/engagement-social" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all group">
              <h3 className="font-semibold text-lg mb-2">Engagement Social</h3>
              <p className="text-white/80 text-sm">Notre impact sur la communauté</p>
              <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/heritage/authenticite" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all group">
              <h3 className="font-semibold text-lg mb-2">Authenticité</h3>
              <p className="text-white/80 text-sm">Notre garantie de qualité</p>
              <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
