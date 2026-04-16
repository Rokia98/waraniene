'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Scissors, Layers, Droplets, Timer } from "lucide-react";
import { Header } from "@/components/Header";

export default function TechniquesTissagePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <Image
          src="/images/artisans/tissage2.jpg"
          alt="Techniques ancestrales de tissage sénoufo"
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
              Techniques de
              <span className="block text-primary-400">Tissage</span>
            </h1>
            <p className="text-lg text-gray-200">
              Un savoir-faire ancestral transmis de génération en génération
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Le tissage sénoufo est un art qui se pratique exclusivement sur des métiers à tisser 
            traditionnels en bois. Chaque étape, de la préparation du coton au tissage final, 
            est réalisée à la main avec une précision et une patience remarquables. Nos artisans 
            de Waraniéné perpétuent ces techniques séculaires tout en les adaptant aux goûts contemporains.
          </p>
        </div>
      </section>

      {/* Les étapes du tissage */}
      <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Les Étapes du Tissage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              De la fibre brute au textile fini, chaque étape requiert expertise et patience
            </p>
          </div>

          {/* Étape 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Préparation du Coton</h3>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Tout commence par la récolte du coton cultivé localement. Les fibres sont ensuite 
                nettoyées, cardées et filées à la main sur un fuseau traditionnel appelé <strong>« fuseau sénoufo »</strong>. 
                Ce processus délicat transforme les fibres brutes en fils solides et réguliers.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Le filage est traditionnellement effectué par les femmes du village, qui maîtrisent 
                l&apos;art de produire un fil d&apos;une finesse et d&apos;une régularité remarquables.
              </p>
            </div>
            <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage1.jpg"
                alt="Préparation du coton"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Étape 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 relative h-[300px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Teinture naturelle des fils"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Teinture Naturelle</h3>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Les fils sont teints avec des pigments naturels extraits de plantes, d&apos;écorces 
                et de terres de la région. Le <strong>bogolan</strong> (teinture à base de boue fermentée) 
                est l&apos;une des techniques les plus emblématiques.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Les couleurs obtenues sont uniques : l&apos;indigo profond des feuilles de gara, 
                le brun chaud du karité, le jaune doré du néré. Chaque bain de teinture produit 
                des nuances impossibles à reproduire exactement, rendant chaque pièce unique.
              </p>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Le Tissage sur Métier</h3>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Le tisserand installe les fils de chaîne sur le <strong>métier à tisser traditionnel</strong>, 
                une structure en bois construite localement. Assis sur un siège bas, il actionne les pédales 
                avec ses pieds pour séparer les fils de chaîne tout en passant la navette chargée de fil de trame.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Les bandes tissées font généralement entre 10 et 20 centimètres de large. C&apos;est un 
                travail minutieux qui peut prendre plusieurs jours pour une seule bande, selon la 
                complexité des motifs.
              </p>
            </div>
            <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage1.jpg"
                alt="Tissage sur métier traditionnel"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Étape 4 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative h-[300px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Assemblage et finitions"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  4
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Assemblage & Finitions</h3>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Les bandes tissées sont ensuite assemblées côte à côte par une couture fine et 
                invisible pour former le pagne complet. Cette étape demande une grande précision 
                pour aligner parfaitement les motifs.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Les finitions comprennent le lavage, le repassage et parfois l&apos;ajout de broderies 
                ou de franges décoratives. Le résultat est un textile d&apos;une beauté et d&apos;une 
                solidité exceptionnelles, fait pour durer des années.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Les types de tissage */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Nos Types de Tissage
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
              <Layers className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Tissage Uni</h3>
              <p className="text-gray-600 leading-relaxed">
                Le tissage le plus simple mais fondamental. Un entrecroisement régulier de fils 
                produisant un tissu solide et uniforme, idéal comme base pour la teinture.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <Scissors className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Tissage à Motifs</h3>
              <p className="text-gray-600 leading-relaxed">
                Le plus prisé et le plus complexe. Des motifs géométriques sont créés directement 
                sur le métier en alternant les fils de couleurs différentes selon un schéma précis.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
              <Droplets className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Tissage Bogolan</h3>
              <p className="text-gray-600 leading-relaxed">
                Combinaison du tissage et de la teinture à la boue. Le tissu est d&apos;abord tissé, 
                puis décoré avec de la boue fermentée pour créer des motifs symboliques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Temps de fabrication */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
              Le Temps de l&apos;Artisanat
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chaque pièce nécessite un investissement considérable en temps et en savoir-faire
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <Timer className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900 mb-1">2-3</p>
              <p className="text-sm text-gray-600">jours pour filer le coton</p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <Timer className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900 mb-1">1-2</p>
              <p className="text-sm text-gray-600">jours pour la teinture</p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <Timer className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900 mb-1">3-7</p>
              <p className="text-sm text-gray-600">jours de tissage</p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <Timer className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900 mb-1">1</p>
              <p className="text-sm text-gray-600">jour pour les finitions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation vers autres pages héritage */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Explorez Notre Héritage</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/heritage/culture-senoufo" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all group">
              <h3 className="font-semibold text-lg mb-2">Culture Sénoufo</h3>
              <p className="text-white/80 text-sm">L&apos;histoire d&apos;un peuple millénaire</p>
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
