'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin, Users, Home, TreePine } from "lucide-react";
import { Header } from "@/components/Header";

export default function WaranieneVillagePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <Image
          src="/images/artisans/tissage1.jpg"
          alt="Le village de Waraniéné - Berceau du tissage sénoufo"
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
              Waraniéné
              <span className="block text-primary-400">Village d&apos;Artisans</span>
            </h1>
            <p className="text-lg text-gray-200">
              <MapPin className="w-5 h-5 inline mr-1" />
              Korhogo, Nord de la Côte d&apos;Ivoire
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Niché dans la région du Poro, au nord de la Côte d&apos;Ivoire, Waraniéné est un village 
            emblématique où le tissage n&apos;est pas simplement un métier, mais un mode de vie. 
            Situé à quelques kilomètres de Korhogo, la capitale du pays sénoufo, ce village est 
            réputé dans toute la sous-région pour la qualité exceptionnelle de ses textiles artisanaux.
          </p>
        </div>
      </section>

      {/* Le Village */}
      <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900">Un Village Unique</h2>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                À Waraniéné, le son des métiers à tisser rythme la vie quotidienne. Dans presque 
                chaque concession familiale, on trouve un ou plusieurs métiers à tisser traditionnels, 
                installés à l&apos;ombre des manguiers et des karités.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Le village compte plusieurs dizaines de tisserands actifs, hommes et femmes, qui 
                perpétuent un art transmis depuis des siècles. Les enfants grandissent bercés par 
                le cliquetis des navettes et apprennent très jeunes les gestes du tissage.
              </p>
            </div>
            <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Vue du village de Waraniéné"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage1.jpg"
                alt="La communauté de Waraniéné"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900">La Communauté</h2>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Waraniéné est bien plus qu&apos;un village artisanal : c&apos;est une communauté 
                soudée où la solidarité est une valeur fondamentale. Les tisserands partagent 
                leurs connaissances, s&apos;entraident dans les moments difficiles et célèbrent 
                ensemble les réussites.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Les femmes jouent un rôle essentiel dans la filature du coton et la teinture 
                des fils, tandis que les hommes se consacrent principalement au tissage. 
                Cette complémentarité est au cœur de l&apos;organisation sociale du village.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900">L&apos;Environnement</h2>
              </div>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Le village est entouré de savanes arborées typiques du nord ivoirien. Le coton 
                pousse naturellement dans cette région au climat tropical sec, offrant aux artisans 
                une matière première de qualité à portée de main.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Les teintures naturelles sont extraites de la végétation locale : les feuilles 
                d&apos;indigo pour le bleu profond, l&apos;écorce de néré pour le jaune, 
                la boue de la rivière pour les tons terreux du bogolan. Le village vit en 
                harmonie avec son environnement naturel.
              </p>
            </div>
            <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Environnement naturel de Waraniéné"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Waraniéné en Chiffres
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl">
              <p className="text-5xl font-bold text-primary-600 mb-2">50+</p>
              <p className="text-gray-700 font-medium">Artisans tisserands actifs</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <p className="text-5xl font-bold text-indigo-600 mb-2">100+</p>
              <p className="text-gray-700 font-medium">Années de tradition</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <p className="text-5xl font-bold text-green-600 mb-2">30+</p>
              <p className="text-gray-700 font-medium">Métiers à tisser actifs</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <p className="text-5xl font-bold text-purple-600 mb-2">500+</p>
              <p className="text-gray-700 font-medium">Pièces créées par an</p>
            </div>
          </div>
        </div>
      </section>

      {/* Localisation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">Comment Nous Trouver</h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Waraniéné se situe dans la région du Poro, à environ 5 km de la ville de Korhogo, 
            dans le nord de la Côte d&apos;Ivoire. Le village est accessible par la route nationale 
            et accueille régulièrement des visiteurs curieux de découvrir l&apos;art du tissage sénoufo.
          </p>
          <div className="bg-white rounded-2xl p-8 shadow-md inline-block">
            <p className="text-gray-900 font-semibold text-lg">📍 Waraniéné, Korhogo</p>
            <p className="text-gray-600">Région du Poro, Côte d&apos;Ivoire</p>
            <p className="text-primary-600 mt-2">Visites sur rendez-vous</p>
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
