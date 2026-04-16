'use client';
import { useState, useEffect } from 'react';
import { Loader, CheckCircle, XCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Avis {
  id: string;
  produit_id: string;
  produit_nom?: string;
  nom_acheteur: string;
  note: number;
  titre: string;
  commentaire: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  created_at: string;
}

export default function AdminReviewsPage() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'en_attente' | 'approuve' | 'rejete'>('en_attente');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadAvis();
  }, [filter]);

  const loadAvis = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/avis?statut=${filter}`);
      const data = await res.json();
      setAvis(data.avis || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (avisId: string, action: 'approuve' | 'rejete') => {
    setProcessing(avisId);
    try {
      const res = await fetch(`/api/admin/avis/${avisId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: action })
      });

      if (res.ok) {
        toast.success(`Avis ${action}`);
        loadAvis();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur serveur');
    } finally {
      setProcessing(null);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'approuve':
        return 'bg-green-100 text-green-800';
      case 'rejete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">⭐ Modération des Avis</h1>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {(['en_attente', 'approuve', 'rejete'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status === 'en_attente' && '⏳ En attente'}
            {status === 'approuve' && '✓ Approuvés'}
            {status === 'rejete' && '✗ Rejetés'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto" />
        </div>
      ) : avis.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun avis à {filter === 'en_attente' ? 'modérer' : 'afficher'}
        </div>
      ) : (
        <div className="space-y-4">
          {avis.map((review) => (
            <div key={review.id} className="border rounded-lg p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{review.titre}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatutColor(review.statut)}`}>
                      {review.statut}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Produit:</strong> {review.produit_nom || 'N/A'}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= review.note ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.commentaire}</p>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <p><strong>Par:</strong> {review.nom_acheteur}</p>
                  <p><strong>Date:</strong> {new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                </div>

                {filter === 'en_attente' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(review.id, 'approuve')}
                      disabled={processing === review.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {processing === review.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReview(review.id, 'rejete')}
                      disabled={processing === review.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {processing === review.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
