'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/Header';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ici vous ajouteriez l'appel API pour envoyer le message
      console.log('Envoi du message:', formData);
      
      // Simulation d'un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Téléphone',
      details: '+225 XX XX XX XX XX',
      description: 'Lun - Sam: 8h00 - 18h00',
      action: () => window.open('tel:+225XXXXXXXXXX', '_self')
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: '+225 XX XX XX XX XX',
      description: 'Réponse rapide garantie',
      action: () => window.open('https://wa.me/225XXXXXXXXXX', '_blank')
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'contact@tisseswaraniene.ci',
      description: 'Réponse sous 24h',
      action: () => window.open('mailto:contact@tisseswaraniene.ci', '_self')
    },
    {
      icon: MapPin,
      title: 'Adresse',
      details: 'Waraniéné, Korhogo',
      description: 'Côte d\'Ivoire',
      action: () => window.open('https://maps.google.com/?q=Waraniene,Korhogo,Cote+d\'Ivoire', '_blank')
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une question sur nos produits ? Besoin d&apos;informations sur nos artisans ? 
              Notre équipe est là pour vous accompagner dans votre découverte des textiles 
              traditionnels sénoufo.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
              Envoyez-nous un message
            </h2>

            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">
                  Merci ! Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium">
                  Une erreur s&apos;est produite lors de l&apos;envoi. Veuillez réessayer ou nous contacter directement.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <select
                  id="sujet"
                  name="sujet"
                  required
                  value={formData.sujet}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="produit">Question sur un produit</option>
                  <option value="commande">Suivi de commande</option>
                  <option value="artisan">Devenir artisan partenaire</option>
                  <option value="livraison">Livraison et expédition</option>
                  <option value="paiement">Modes de paiement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                Autres moyens de contact
              </h2>
              <div className="grid gap-4">
                {contactMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <div
                      key={index}
                      onClick={method.action}
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                          <IconComponent className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {method.title}
                          </h3>
                          <p className="text-primary-600 font-medium mb-1">
                            {method.details}
                          </p>
                          <p className="text-sm text-gray-600">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Horaires d&apos;ouverture</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lundi - Vendredi</span>
                  <span className="font-medium text-gray-900">8h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Samedi</span>
                  <span className="font-medium text-gray-900">9h00 - 16h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimanche</span>
                  <span className="font-medium text-red-600">Fermé</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Suivez-nous</h3>
              <p className="text-gray-600 mb-6">
                Restez connectés pour découvrir nos dernières créations et l&apos;actualité de nos artisans.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary-100 hover:text-primary-600 transition-colors"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Questions fréquentes</h3>
              <p className="text-gray-600 mb-4">
                Consultez notre FAQ pour obtenir des réponses rapides aux questions les plus courantes.
              </p>
              <Button variant="outline" className="border-primary-300 text-primary-700 hover:bg-primary-100">
                Voir la FAQ
              </Button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Nous localiser
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visitez notre atelier principal à Waraniéné pour découvrir notre savoir-faire 
              et rencontrer nos artisans en action.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-primary-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Waraniéné, Korhogo</h3>
              <p className="text-gray-600 mb-4">Côte d&apos;Ivoire</p>
              <Button
                onClick={() => window.open('https://maps.google.com/?q=Waraniene,Korhogo,Cote+d\'Ivoire', '_blank')}
              >
                Ouvrir dans Google Maps
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}