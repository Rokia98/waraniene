'use client';
import { useState, useEffect } from 'react';
import { Star, Send, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Avis {
  id: string;
  nom_acheteur: string;
  note: number;
  titre: string;
  commentaire: string;
  created_at: string;
  verified: boolean;
}

interface ReviewsProps {
  produitId: string;
}

export default function ReviewsComponent({ produitId }: ReviewsProps) {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [noteMoyenne, setNoteMoyenne] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nom_acheteur: '',
    email_acheteur: '',
    note: 5,
    titre: '',
    commentaire: '',
    achete_chez_nous: true
  });

  useEffect(() => {
    loadAvis();
  }, [produitId]);

  const loadAvis = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/produits/${produitId}/avis?limite=5`);
      const data = await res.json();
      setAvis(data.avis || []);
      setNoteMoyenne(data.note_moyenne || 0);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom_acheteur || !formData.email_acheteur || !formData.titre || !formData.commentaire) {
      toast.error('Tous les champs sont requis');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/produits/${produitId}/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Avis soumis! Il sera publié après modération.');
        setFormData({
          nom_acheteur: '',
          email_acheteur: '',
          note: 5,
          titre: '',
          commentaire: '',
          achete_chez_nous: true
        });
        setShowForm(false);
        loadAvis();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur lors de la soumission');
      }
    } catch (error) {
      toast.error('Erreur serveur');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, interactive = false, onChange }: any) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          className={`transition ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
        >
          <Star
            size={interactive ? 24 : 20}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">⭐ Avis Clients</h2>

      {/* Résumé des notes */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{noteMoyenne}</div>
            <div className="text-sm text-gray-600">sur 5</div>
          </div>
          <div>
            <StarRating rating={Math.round(noteMoyenne)} />
            <p className="text-sm text-gray-600 mt-2">{avis.length} avis vérifiés</p>
          </div>
        </div>
      </div>

      {/* Bouton ajouter avis */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {showForm ? 'Annuler' : '✍️ Écrire un avis'}
      </button>

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Votre nom"
                value={formData.nom_acheteur}
                onChange={(e) => setFormData({ ...formData, nom_acheteur: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Votre email"
                value={formData.email_acheteur}
                onChange={(e) => setFormData({ ...formData, email_acheteur: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Note</label>
              <StarRating
                rating={formData.note}
                interactive={true}
                onChange={(rating: number) => setFormData({ ...formData, note: rating })}
              />
            </div>

            <input
              type="text"
              placeholder="Titre de votre avis"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <textarea
              placeholder="Votre commentaire..."
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.achete_chez_nous}
                onChange={(e) => setFormData({ ...formData, achete_chez_nous: e.target.checked })}
              />
              <span className="text-sm">J'ai acheté ce produit chez Tissés de Waraniéné</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Soumettre mon avis
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Liste des avis */}
      {loading ? (
        <div className="text-center py-8">
          <Loader className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : avis.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aucun avis pour le moment. Soyez le premier!
        </div>
      ) : (
        <div className="space-y-4">
          {avis.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{review.titre}</div>
                  <StarRating rating={review.note} />
                </div>
                {review.verified && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✓ Vérifié
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{review.commentaire}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{review.nom_acheteur}</span>
                <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
