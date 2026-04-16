import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Palette } from "lucide-react";
import { Artisan } from "@/types";
import { Button } from "@/components/ui/Button";

interface ArtisanCardProps {
  artisan: Artisan;
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 bg-gradient-to-br from-secondary-100 to-primary-100 overflow-hidden">
        {artisan.photo ? (
          <Image
            src={artisan.photo}
            alt={artisan.nom}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-primary-200 rounded-full flex items-center justify-center">
                <Palette className="w-10 h-10 text-primary-600" />
              </div>
              <p className="text-primary-700 font-medium text-lg">
                {artisan.nom}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
          {artisan.nom}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {artisan.bio}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-primary-500" />
            {artisan.localisation}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-primary-500" />
            {artisan.telephone}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/artisans/${artisan.id}`} className="flex-1">
            <Button variant="primary" size="md" className="w-full">
              Voir le profil
            </Button>
          </Link>
          
          <Link href={`/produits?artisan=${artisan.id}`} className="flex-1">
            <Button variant="outline" size="md" className="w-full">
              Ses créations
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}