'use client';

import { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, LogOut, Edit2, MapPin, Phone, Mail, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Header } from '@/components/Header';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AppService, { notify } from '@/services';

interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_naissance?: string;
  adresse?: string;
  date_inscription?: string;
  date_creation?: string;
  avatar?: string;
}

interface Order {
  id: string;
  numero_commande: string;
  date_commande: string;
  statut: 'confirmee' | 'en_preparation' | 'expediee' | 'livree';
  total: number;
  items_count: number;
}

interface FavoriteProduct {
  id: string;
  nom_produit: string;
  prix: number;
  artisan: string;
  disponible: boolean;
}

type TabType = 'profile' | 'orders' | 'favorites' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders] = useState<Order[]>([]);
  const [favorites] = useState<FavoriteProduct[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: ''
  });

  // Charger les données du profil au montage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/acheteurs/profil', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          notify.error('Session expirée, veuillez vous reconnecter');
          router.push('/auth?returnUrl=/profil');
          return;
        }
        throw new Error('Erreur lors du chargement du profil');
      }

      const data = await response.json();
      
      if (data.success && data.acheteur) {
        setUser(data.acheteur);
        setEditForm({
          nom: data.acheteur.nom || '',
          prenom: data.acheteur.prenom || '',
          telephone: data.acheteur.telephone || '',
          adresse: data.acheteur.adresse || ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      notify.error('Impossible de charger votre profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/acheteurs/profil', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      const data = await response.json();
      
      if (data.success && data.acheteur) {
        setUser(data.acheteur);
        setIsEditing(false);
        notify.success('Profil mis à jour avec succès');
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde profil:', error);
      notify.error(error.message || 'Impossible de sauvegarder les modifications');
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        telephone: user.telephone || '',
        adresse: user.adresse || ''
      });
    }
    setIsEditing(false);
  };

  const getStatusColor = (statut: Order['statut']) => {
    switch (statut) {
      case 'confirmee':
        return 'bg-blue-100 text-blue-800';
      case 'en_preparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'expediee':
        return 'bg-purple-100 text-purple-800';
      case 'livree':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (statut: Order['statut']) => {
    switch (statut) {
      case 'confirmee':
        return 'Confirmée';
      case 'en_preparation':
        return 'En préparation';
      case 'expediee':
        return 'Expédiée';
      case 'livree':
        return 'Livrée';
      default:
        return statut;
    }
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'orders' as TabType, label: 'Mes commandes', icon: Package },
    { id: 'favorites' as TabType, label: 'Favoris', icon: Heart },
    { id: 'settings' as TabType, label: 'Paramètres', icon: Settings },
  ];

  // Afficher le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de votre profil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur chargé
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Impossible de charger votre profil</p>
            <Button onClick={() => router.push('/auth')}>
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const memberSince = user.date_inscription || user.date_creation || new Date().toISOString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <Image src={user.avatar} alt={`${user.prenom} ${user.nom}`} width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary-600" />
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {user.prenom} {user.nom}
              </h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Membre depuis</p>
                  <p className="font-medium">{formatDate(memberSince)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commandes</p>
                  <p className="font-medium">{orders.length} commandes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Favoris</p>
                  <p className="font-medium">{favorites.length} produits</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{user.telephone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-bold">Informations personnelles</h2>
              <Button
                variant="outline"
                onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Informations de base</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.prenom : user.prenom}
                    onChange={(e) => handleEditChange('prenom', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.nom : user.nom}
                    onChange={(e) => handleEditChange('nom', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    title="L'email ne peut pas être modifié"
                  />
                  <p className="text-xs text-gray-500 mt-1">L&apos;email ne peut pas être modifié</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={isEditing ? editForm.telephone : (user.telephone || '')}
                    onChange={(e) => handleEditChange('telephone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                    placeholder="+225 07 12 34 56 78"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Adresse de livraison</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
                  <textarea
                    value={isEditing ? editForm.adresse : (user.adresse || '')}
                    onChange={(e) => handleEditChange('adresse', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 resize-none"
                    placeholder="Rue, Ville, Région, Pays"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cette adresse sera utilisée pour la livraison de vos commandes
                  </p>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  Annuler
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-display text-xl font-bold mb-6">Mes commandes</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                <p className="text-gray-600">Vous n&apos;avez pas encore passé de commande.</p>
                <Button className="mt-4">
                  Découvrir nos produits
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          Commande {order.numero_commande}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(order.date_commande)} • {order.items_count} article{order.items_count > 1 ? 's' : ''}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.statut)}`}>
                          {getStatusText(order.statut)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-display text-xl font-bold mb-6">Mes favoris</h2>
            
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori</h3>
                <p className="text-gray-600">Ajoutez des produits à vos favoris pour les retrouver facilement.</p>
                <Button className="mt-4">
                  Parcourir les produits
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-md mb-4 flex items-center justify-center">
                      <span className="text-sm text-primary-700 font-medium">IMG</span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2">{product.nom_produit}</h3>
                    <p className="text-sm text-gray-600 mb-2">Par {product.artisan}</p>
                    <p className="font-semibold text-primary-600 mb-4">{formatCurrency(product.prix)}</p>
                    
                    <div className="flex gap-2">
                      <Button size="sm" disabled={!product.disponible}>
                        {product.disponible ? 'Ajouter au panier' : 'Indisponible'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-display text-xl font-bold mb-6">Paramètres</h2>
            
            <div className="space-y-6">
              {/* Notifications */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Notifications par email</span>
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Notifications SMS</span>
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Newsletter</span>
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                  </label>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Confidentialité</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Profil public</span>
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Partage des données d&apos;analyse</span>
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </label>
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Sécurité</h3>
                <div className="space-y-3">
                  <Button variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Activer l&apos;authentification à deux facteurs
                  </Button>
                </div>
              </div>

              {/* Account */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Compte</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:border-red-300">
                    Supprimer mon compte
                  </Button>
                  <Button variant="outline">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}