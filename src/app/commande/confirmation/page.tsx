'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Phone, Mail, Download, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Header } from '@/components/Header';

interface OrderItem {
  id: string;
  nom_produit: string;
  prix: number;
  quantite: number;
  artisan: string;
  photos?: string[];
}

interface Order {
  id: string;
  numero_commande: string;
  date_commande: string;
  statut: 'en_attente' | 'confirmee' | 'preparee' | 'expediee' | 'livree' | 'annulee';
  items: OrderItem[];
  sous_total: number;
  frais_livraison: number;
  total: number;
  mode_paiement: string;
  adresse_livraison: string;
  client: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const commandeId = searchParams.get('id');
    
    if (!commandeId) {
      setError('ID de commande manquant');
      setLoading(false);
      return;
    }

    // Charger les détails de la commande
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/commandes/${commandeId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la commande');
        }

        const data = await response.json();
        
        if (data.success && data.commande) {
          const cmd = data.commande;
          
          // Transformer les données de l'API au format attendu par la page
          const transformedOrder: Order = {
            id: cmd.id,
            numero_commande: cmd.numero_commande,
            date_commande: cmd.date_commande,
            statut: cmd.statut,
            items: (cmd.detail_commandes || []).map((detail: any) => ({
              id: detail.id,
              nom_produit: detail.produit?.nom_produit || 'Produit inconnu',
              prix: detail.prix_unitaire,
              quantite: detail.quantite,
              artisan: detail.produit?.artisan?.nom || 'Artisan inconnu',
              photos: detail.produit?.photos || []
            })),
            sous_total: cmd.montant_total - (cmd.frais_livraison || 0),
            frais_livraison: cmd.frais_livraison || 0,
            total: cmd.montant_total,
            mode_paiement: cmd.mode_paiement || 'Non spécifié',
            adresse_livraison: cmd.adresse_livraison || 'Non spécifiée',
            client: {
              nom: cmd.acheteur?.nom || '',
              prenom: cmd.acheteur?.prenom || '',
              email: cmd.acheteur?.email || '',
              telephone: cmd.acheteur?.telephone || ''
            }
          };

          setOrder(transformedOrder);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          setError('Commande introuvable');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de votre commande...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Erreur
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/profil">
              <Button>Retour au profil</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusInfo = (statut: Order['statut']) => {
    switch (statut) {
      case 'en_attente':
        return {
          text: 'En attente',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          description: 'Votre commande est en attente de confirmation'
        };
      case 'confirmee':
        return {
          text: 'Commande confirmée',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Votre commande a été reçue et confirmée'
        };
      case 'preparee':
        return {
          text: 'En préparation',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Nos artisans préparent votre commande'
        };
      case 'expediee':
        return {
          text: 'Expédiée',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          description: 'Votre commande est en route'
        };
      case 'livree':
        return {
          text: 'Livrée',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Commande livrée avec succès'
        };
      case 'annulee':
        return {
          text: 'Annulée',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: 'Commande annulée'
        };
      default:
        return {
          text: statut,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: ''
        };
    }
  };

  const statusInfo = getStatusInfo(order.statut);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Commande ${order.numero_commande}`,
        text: `Ma commande Tissés de Waraniéné a été confirmée !`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              >
                🎉
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Commande confirmée !
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Merci {order.client.prenom} pour votre confiance
          </p>
          
          <p className="text-gray-600">
            Votre commande <span className="font-semibold text-primary-600">{order.numero_commande}</span> a été reçue et confirmée.
          </p>
        </div>

        {/* Orde['confirmee', 'preparee', 'expediee', 'livree'].includes(order.statut) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Confirmée</h3>
              <p className="text-xs text-gray-600 mt-1">Commande reçue</p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                ['preparee
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                order.statut === 'confirmee' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Confirmée</h3>
              <p className="text-xs text-gray-600 mt-1">Commande reçue</p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                ['en_preparation', 'expediee', 'livree'].includes(order.statut) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">En préparation</h3>
              <p className="text-xs text-gray-600 mt-1">Tissage en cours</p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                ['expediee', 'livree'].includes(order.statut) ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Expédiée</h3>
              <p className="text-xs text-gray-600 mt-1">En transit</p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                order.statut === 'livree' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">Livrée</h3>
              <p className="text-xs text-gray-600 mt-1">Réception</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Articles commandés</h3>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary-700 font-medium">IMG</span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{item.nom_produit}</h4>
                    <p className="text-sm text-gray-600 mb-2">Par {item.artisan}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantité: {item.quantite}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(item.prix * item.quantite)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900">{formatCurrency(order.sous_total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frais de livraison</span>
                <span className="text-gray-900">{formatCurrency(order.frais_livraison)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-primary-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informations de commande</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Numéro de commande</label>
                <p className="font-medium text-gray-900">{order.numero_commande}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Date de commande</label>
                <p className="font-medium text-gray-900">{formatDate(order.date_commande)}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Mode de paiement</label>
                <p className="font-medium text-gray-900">{order.mode_paiement}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Adresse de livraison</label>
                <p className="font-medium text-gray-900">{order.adresse_livraison}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Email de confirmation</label>
                <p className="font-medium text-gray-900">{order.client.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Confirmation par email</p>
                <p className="text-sm text-gray-600">
                  Vous recevrez un email de confirmation avec tous les détails de votre commande.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Préparation</p>
                <p className="text-sm text-gray-600">
                  Nos artisans vont commencer la préparation de votre commande. Délai estimé: 2-3 jours.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Expédition</p>
                <p className="text-sm text-gray-600">
                  Vous serez notifié par SMS dès l&apos;expédition avec le numéro de suivi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="sm:min-w-[200px]">
            <Download className="w-4 h-4 mr-2" />
            Télécharger la facture
          </Button>
          
          <Button variant="outline" size="lg" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          
          <Link href="/produits">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Continuer mes achats
            </Button>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12 p-6 bg-white rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Besoin d&apos;aide ?</h3>
          <p className="text-gray-600 mb-4">
            Notre équipe est disponible pour répondre à toutes vos questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              +225 XX XX XX XX XX
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              support@tisseswaraniene.ci
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}