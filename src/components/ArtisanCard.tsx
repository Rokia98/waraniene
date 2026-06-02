import Link from "next/link";
import { MapPin, Star, Palette, CheckCircle } from "lucide-react";
import { Artisan } from "@/types";
import { SafeImage } from "@/components/ui/SafeImage";

interface ArtisanCardProps {
  artisan: Artisan;
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-400 hover:-translate-y-1 border border-gray-100/80">

      {/* ── Photo ── */}
      <div className="relative h-52 bg-gradient-to-br from-secondary-100 to-primary-100 overflow-hidden">
        {artisan.photo ? (
          <SafeImage
            src={artisan.photo}
            alt={artisan.nom}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            fallbackTitle={artisan.nom}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-200 to-primary-400 rounded-full flex items-center justify-center shadow-lg">
              <Palette className="w-10 h-10 text-white" />
            </div>
            <p className="font-display text-primary-700 font-semibold text-base px-4 text-center">
              {artisan.nom}
            </p>
          </div>
        )}

        {/* Overlay dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge localisation */}
        {artisan.localisation && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <MapPin className="w-3 h-3 text-primary-600" />
            <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">{artisan.localisation}</span>
          </div>
        )}
      </div>

      {/* ── Contenu ── */}
      <div className="p-5">
        {/* Nom + badge vérifié */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-xl font-bold text-gray-900 leading-tight">
            {artisan.nom}
          </h3>
          {(artisan as any).est_verifie && (
            <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              Vérifié
            </span>
          )}
        </div>

        {/* Spécialités */}
        {artisan.specialites && artisan.specialites.length > 0 && (
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
            {artisan.specialites.slice(0, 2).join(' · ')}
          </p>
        )}

        {/* Bio */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {artisan.bio || 'Artisan tisserand traditionnel de Waraniéné, Côte d\'Ivoire.'}
        </p>

        {/* Métadonnées */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs truncate max-w-[120px]">
              {artisan.localisation || 'Waraniéné, CI'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold text-gray-700">4.8</span>
            <span className="text-xs text-gray-400">(12)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/artisans/${artisan.id}`}
            className="flex-1 text-center py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-btn hover:shadow-btn-hover transition-all hover:-translate-y-0.5"
          >
            Voir le profil
          </Link>
          <Link
            href={`/produits?artisan=${artisan.id}`}
            className="flex-1 text-center py-2.5 border-2 border-primary-200 text-primary-700 hover:border-primary-400 hover:bg-primary-50 text-sm font-semibold rounded-xl transition-all"
          >
            Ses créations
          </Link>
        </div>
      </div>
    </div>
  );
}
