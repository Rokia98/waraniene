'use client';

import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
  currentStatus: string;
  orderNumber: string;
}

export function OrderStatusModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  orderId, 
  currentStatus,
  orderNumber 
}: OrderStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = [
    { value: 'en_preparation', label: 'En préparation', color: 'text-yellow-600' },
    { value: 'expedie', label: 'Expédié', color: 'text-blue-600' },
    { value: 'en_livraison', label: 'En livraison', color: 'text-indigo-600' },
    { value: 'livre', label: 'Livré', color: 'text-green-600' },
    { value: 'annule', label: 'Annulé', color: 'text-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatus === currentStatus) {
      toast.error('Veuillez sélectionner un nouveau statut');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/artisan/commandes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commande_id: orderId,
          statut_livraison: selectedStatus
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      toast.success('Statut mis à jour avec succès');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Modifier le statut
                </h3>
                <p className="text-sm text-gray-500">Commande #{orderNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nouveau statut de livraison
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedStatus === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selectedStatus === option.value}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={`ml-3 font-medium ${option.color}`}>
                      {option.label}
                    </span>
                    {option.value === currentStatus && (
                      <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Actuel
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || selectedStatus === currentStatus}
                className="flex-1"
              >
                {loading ? 'Mise à jour...' : 'Confirmer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
