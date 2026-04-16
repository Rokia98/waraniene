'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Shield, CheckCircle, Eye, Award, Fingerprint } from "lucide-react";
import { Header } from "@/components/Header";

export default function AuthenticitePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <Image
          src="/images/artisans/tissage1.jpg"
          alt="Authenticité - Textiles 100% artisanaux de Waraniéné"
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
              Notre Garantie
              <span className="block text-primary-400">d&apos;Authenticité</span>
            </h1>
            <p className="text-lg text-gray-200">
              100% fait main, 100% traditionnel, 100% authentique
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Dans un monde où l&apos;industrialisation tend à homogénéiser les produits, nous nous 
            engageons à vous offrir des textiles authentiquement artisanaux. Chaque pièce vendue 
            sur Tissés de Waraniéné est le fruit du travail patient et passionné d&apos;un artisan 
            identifié, utilisant des techniques ancestrales et des matériaux naturels.
          </p>
        </div>
      </section>

      {/* Notre processus de garantie */}
      <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Comment Nous Garantissons l&apos;Authenticité
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un processus rigoureux à chaque étape de la création
            </p>
          </div>

          {/* Étapes de garantie */}
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-md flex gap-6 items-start">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Artisan Identifié</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chaque produit est associé à un artisan spécifique dont le profil est visible 
                  sur notre site. Vous savez exactement qui a créé votre pièce, son histoire, 
                  son parcours et sa spécialité. Cette traçabilité complète est notre première 
                  garantie d&apos;authenticité.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md flex gap-6 items-start">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Vérification sur Place</h3>
                <p className="text-gray-600 leading-relaxed">
                  Notre équipe se rend régulièrement à Waraniéné pour vérifier les conditions 
                  de production. Nous nous assurons que chaque pièce est bien réalisée selon les 
                  méthodes traditionnelles, sur des métiers à tisser manuels, avec des matériaux 
                  naturels et sans recours à des machines industrielles.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md flex gap-6 items-start">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Contrôle Qualité</h3>
                <p className="text-gray-600 leading-relaxed">
                  Avant expédition, chaque produit fait l&apos;objet d&apos;un contrôle qualité 
                  minutieux. Nous vérifions la régularité du tissage, la solidité des coutures, 
                  la tenue des teintures et la conformité des motifs. Seules les pièces répondant 
                  à nos standards sont mises en vente.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md flex gap-6 items-start">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Certificat d&apos;Authenticité</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chaque pièce est accompagnée d&apos;une fiche détaillant le nom de l&apos;artisan, 
                  la technique utilisée, les matériaux employés et l&apos;histoire du motif. 
                  Ce document atteste de l&apos;origine et de l&apos;authenticité du produit que 
                  vous recevez.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ce qui rend nos produits uniques */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Ce Qui Rend Nos Produits Uniques
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/artisans/tissage2.jpg"
                alt="Détails d'un textile authentique de Waraniéné"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Pièce Unique</h3>
                    <p className="text-gray-600">
                      Aucune pièce n&apos;est identique. Les variations naturelles de teinture et 
                      les subtilités du tissage à la main font de chaque textile une œuvre unique.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Matériaux Naturels</h3>
                    <p className="text-gray-600">
                      Coton local, teintures végétales et minérales. Aucun produit chimique 
                      n&apos;entre dans la fabrication de nos textiles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Savoir-Faire Ancestral</h3>
                    <p className="text-gray-600">
                      Des techniques transmises depuis des générations, perfectionnées au fil 
                      du temps mais fidèles à la tradition sénoufo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Durabilité</h3>
                    <p className="text-gray-600">
                      Un textile tissé à la main est conçu pour durer. La solidité du coton 
                      naturel et la qualité du tissage garantissent une longévité remarquable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparaison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
              Artisanal vs Industriel
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 border-2 border-primary-200">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-primary-600" />
                <h3 className="font-display text-xl font-bold text-primary-700">Nos Textiles Artisanaux</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Tissé 100% à la main</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Teintures naturelles végétales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Chaque pièce est unique</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Soutient l&apos;artisan directement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Durée de vie exceptionnelle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>Impact environnemental minimal</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400 text-xl">⚙️</span>
                <h3 className="font-display text-xl font-bold text-gray-500">Textile Industriel</h3>
              </div>
              <ul className="space-y-3 text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Production mécanique en série</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Teintures chimiques synthétiques</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Produit standardisé et reproductible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Revenus captés par l&apos;industrie</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Usure rapide, qualité variable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Pollution et gaspillage important</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 text-primary-600 mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Faites le Choix de l&apos;Authentique
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Chaque textile que vous achetez est une œuvre d&apos;art unique, créée avec passion 
            par un artisan de Waraniéné. Offrez-vous l&apos;excellence de l&apos;artisanat sénoufo.
          </p>
          <Link href="/produits" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all text-lg">
            Découvrir nos créations authentiques
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
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
            <Link href="/heritage/engagement-social" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl p-6 transition-all group">
              <h3 className="font-semibold text-lg mb-2">Engagement Social</h3>
              <p className="text-white/80 text-sm">Notre impact sur la communauté</p>
              <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
