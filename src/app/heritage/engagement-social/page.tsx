'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Heart, GraduationCap, Leaf, Users } from "lucide-react";
import { Header } from "@/components/Header";

export default function EngagementSocialPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <Image
          src="/images/artisans/tissage2.jpg"
          alt="Engagement social - Soutenir les artisans de Waraniéné"
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
              Notre Engagement
              <span className="block text-primary-400">Social</span>
            </h1>
            <p className="text-lg text-gray-200">
              Chaque achat soutient directement les artisans et leur communauté
            </p>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Tissés de Waraniéné n&apos;est pas une simple boutique en ligne. C&apos;est un projet 
            engagé qui place les artisans au cœur de sa mission. Nous croyons que le commerce 
            équitable et la valorisation de l&apos;artisanat traditionnel peuvent transformer 
            positivement la vie de toute une communauté.
          </p>
        </div>
      </section>

      {/* Piliers de l'engagement */}
      <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Nos 4 Piliers d&apos;Engagement
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des actions concrètes pour un impact durable sur la communauté
            </p>
          </div>

          {/* Pilier 1 - Commerce Équitable */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Commerce Équitable</h3>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Nous garantissons une rémunération juste et transparente pour chaque artisan. 
                Contrairement aux circuits traditionnels où les intermédiaires captent la majorité 
                de la valeur, notre plateforme permet aux artisans de fixer leurs propres prix 
                et de recevoir directement le fruit de leur travail.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold mt-1">✓</span>
                  <span>Rémunération directe des artisans sans intermédiaires abusifs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold mt-1">✓</span>
                  <span>Transparence totale sur la répartition des revenus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold mt-1">✓</span>
                  <span>Prix justes qui valorisent le temps et le savoir-faire</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage1.jpg"
                alt="Commerce équitable avec les artisans"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Pilier 2 - Éducation */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Formation et transmission du savoir"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Formation & Transmission</h3>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Nous soutenons la formation des jeunes apprentis tisserands pour assurer la pérennité 
                de cet art ancestral. Sans transmission active, ces techniques risquent de disparaître 
                face à l&apos;industrialisation.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Programme d&apos;apprentissage pour les jeunes du village</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Formation aux outils numériques pour les artisans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Documentation des techniques pour les générations futures</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pilier 3 - Environnement */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Respect de l&apos;Environnement</h3>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                L&apos;artisanat traditionnel sénoufo est par nature écologique. Nos artisans utilisent 
                des matières premières naturelles et des techniques de production qui ont un impact 
                minimal sur l&apos;environnement.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Coton cultivé localement sans pesticides</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Teintures 100% naturelles à base de plantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Zéro déchet : chaque chute de tissu est réutilisée</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage1.jpg"
                alt="Production écologique et durable"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Pilier 4 - Communauté */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Développement communautaire"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Développement Communautaire</h3>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Une partie des revenus générés est réinvestie dans le développement du village : 
                accès à l&apos;eau potable, amélioration des infrastructures et soutien aux 
                initiatives locales.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-1">✓</span>
                  <span>Contribution au fonds de développement du village</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-1">✓</span>
                  <span>Soutien à la scolarisation des enfants d&apos;artisans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-1">✓</span>
                  <span>Autonomisation économique des femmes du village</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Notre Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chaque commande contribue au bien-être de la communauté
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl">
              <p className="text-5xl font-bold text-primary-600 mb-2">80%</p>
              <p className="text-gray-700 font-medium">Du prix revient directement à l&apos;artisan</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <p className="text-5xl font-bold text-indigo-600 mb-2">50+</p>
              <p className="text-gray-700 font-medium">Familles soutenues par notre activité</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <p className="text-5xl font-bold text-green-600 mb-2">100%</p>
              <p className="text-gray-700 font-medium">Production artisanale et écologique</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Soutenez Nos Artisans
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            En achetant nos produits, vous participez directement au maintien de l&apos;artisanat 
            traditionnel et au développement de la communauté de Waraniéné.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/produits" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all">
              Découvrir nos produits
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/artisans" className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-all">
              Rencontrer nos artisans
            </Link>
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
