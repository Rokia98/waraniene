'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Product, ProductFormData } from '@/types/product';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    nom_produit: '',
    description: '',
    categorie: 'pagne',
    prix: 0,
    stock: 0,
    photos: []
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        nom_produit: '',
        description: '',
        categorie: 'pagne',
        prix: 0,
        stock: 0,
        photos: []
      });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'prix' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nom_produit || !formData.description || formData.prix <= 0) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const url = '/api/artisan/produits';
      const method = product ? 'PUT' : 'POST';
      
      const dataToSend = product ? { ...formData, id: product.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success(data.message || 'Produit sauvegardé avec succès');
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde du produit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Pagne traditionnel Sénoufo"
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
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Décrivez votre produit en détail..."
            />
          </div>

          {/* Catégorie et Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="pagne">Pagne</option>
                <option value="vetement">Vêtement</option>
                <option value="accessoire">Accessoire</option>
              </select>
            </div>

            <div>
              <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-2">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                id="prix"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                required
                min="0"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="25000"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
              Quantité en stock *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="10"
            />
          </div>

          {/* Photos - Placeholder pour future implémentation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Bientôt disponible)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                L'upload de photos sera disponible prochainement
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : (product ? 'Mettre à jour' : 'Créer le produit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
