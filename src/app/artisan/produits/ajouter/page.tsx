'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CATEGORIES = [
  { value: 'pagne', label: 'Pagne' },
  { value: 'boubou', label: 'Boubou' },
  { value: 'foulard', label: 'Foulard' },
  { value: 'nappe', label: 'Nappe' },
  { value: 'coussin', label: 'Coussin' },
  { value: 'sac', label: 'Sac' },
  { value: 'autre', label: 'Autre' }
];

export default function AjouterProduitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); // URLs Supabase
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  
  const [formData, setFormData] = useState({
    nom_produit: '',
    description: '',
    categorie: 'pagne',
    prix: '',
    stock: '',
    largeur: '',
    hauteur: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 5) {
      setError('Maximum 5 photos par produit');
      return;
    }

    setUploadingPhoto(true);
    setError('');

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Valider le type de fichier
        if (!file.type.startsWith('image/')) {
          setError('Seulement les images sont acceptées');
          continue;
        }
        // Valider la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('La taille maximum est 5MB par image');
          continue;
        }
        // Upload vers Supabase Storage via API
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/produits/upload-image', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          newUrls.push(data.url);
        } else {
          setError("Erreur lors de l'upload d'une image");
        }
      }
      setPhotos(prev => [...prev, ...newUrls]);
    } catch (err) {
      console.error('Erreur upload photo:', err);
      setError('Erreur lors du chargement des photos');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newArr = prev.filter((_, i) => i !== index);
      // Si on supprime la photo sélectionnée, on revient à la première
      if (selectedPhotoIdx >= newArr.length) setSelectedPhotoIdx(0);
      return newArr;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.nom_produit.trim()) {
        throw new Error('Le nom du produit est requis');
      }
      if (!formData.description.trim()) {
        throw new Error('La description est requise');
      }
      if (!formData.prix || parseFloat(formData.prix) <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        throw new Error('Le stock ne peut pas être négatif');
      }

      // Les photos sont déjà des URLs Supabase
      const response = await fetch('/api/artisan/produits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nom_produit: formData.nom_produit.trim(),
          description: formData.description.trim(),
          categorie: formData.categorie,
          prix: parseFloat(formData.prix),
          stock: parseInt(formData.stock),
          photos: photos,
          dimensions: formData.largeur && formData.hauteur 
            ? `${formData.largeur}x${formData.hauteur}` 
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout du produit');
      }

      // Rediriger vers le dashboard avec message de succès
      router.push('/artisan/dashboard?tab=produits&success=produit_ajoute');
    } catch (err: any) {
      console.error('Erreur ajout produit:', err);
      setError(err.message || 'Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Ajouter un produit</h1>
        <p className="mt-2 text-gray-600">Remplissez les informations de votre nouveau produit</p>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom du produit */}
          <div>
            <label htmlFor="nom_produit" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              id="nom_produit"
              name="nom_produit"
              value={formData.nom_produit}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Pagne Baoulé traditionnel"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Décrivez votre produit, ses motifs, son histoire..."
              />
            </div>

            {/* Catégorie */}
            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix et Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  id="prix"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="25000"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock disponible *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="largeur" className="block text-sm font-medium text-gray-700 mb-2">
                  Largeur (cm)
                </label>
                <input
                  type="number"
                  id="largeur"
                  name="largeur"
                  value={formData.largeur}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>

              <div>
                <label htmlFor="hauteur" className="block text-sm font-medium text-gray-700 mb-2">
                  Hauteur (cm)
                </label>
                <input
                  type="number"
                  id="hauteur"
                  name="hauteur"
                  value={formData.hauteur}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="200"
                />
              </div>
            </div>


            {/* Photos UX galerie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos du produit (max 5)
              </label>
              {/* Affichage principal */}
              {photos.length > 0 && (
                <div className="mb-4 flex flex-col items-center">
                  <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-gray-200 mb-2">
                    <Image
                      src={photos[selectedPhotoIdx]}
                      alt={`Photo principale`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(selectedPhotoIdx)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      title="Supprimer cette image"
                    >
                      ×
                    </button>
                  </div>
                  {/* Miniatures */}
                  {photos.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {photos.map((photo, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setSelectedPhotoIdx(idx)}
                          className={`relative w-16 h-16 rounded border-2 ${selectedPhotoIdx === idx ? 'border-orange-500' : 'border-gray-200'} overflow-hidden focus:outline-none`}
                          tabIndex={0}
                        >
                          <Image
                            src={photo}
                            alt={`Miniature ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Bouton d'ajout */}
              {photos.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 cursor-pointer flex items-center justify-center bg-gray-50 hover:bg-orange-50 transition-colors w-32 h-32">
                  <div className="text-center">
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-500">Ajouter</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Formats acceptés: JPG, PNG, WebP. Taille max: 5MB par image.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
