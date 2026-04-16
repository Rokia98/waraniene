'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';
import AppService, { validationService, objectValidators, validationUtils, notify } from '@/services';
import { Button } from '@/components/ui/Button';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState<'artisan'>('artisan');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    confirmer_mot_de_passe: '',
    telephone: '',
    adresse: '',
    bio: '',
    localisation: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const urlMessage = searchParams.get('message');
    
    if (urlMessage) {
      setMessage(urlMessage);
    }

    const draft = AppService.getFormDraft('auth-form');
    if (draft) {
      setFormData(prev => ({ ...prev, ...draft }));
    }
  }, [searchParams]);

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!validationService.validators.email(value).isValid) {
          error = 'Email invalide';
        }
        break;
      case 'mot_de_passe':
        if (!validationService.validators.password(value).isValid) {
          error = 'Mot de passe invalide (min 8 caractères)';
        }
        break;
      case 'confirmer_mot_de_passe':
        if (value !== formData.mot_de_passe) {
          error = 'Les mots de passe ne correspondent pas';
        }
        break;
      case 'telephone':
        // Téléphone obligatoire pour inscription
        if (!isLogin && !value) {
          error = 'Le téléphone est obligatoire';
        } else if (value && !validationService.validators.phone(value).isValid) {
          error = 'Numéro de téléphone invalide';
        }
        break;
      case 'nom':
        if (!isLogin && !validationService.validators.name(value).isValid) {
          error = 'Nom requis (min 2 caractères)';
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    AppService.saveFormDraft('auth-form', { ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const validation = objectValidators.userLogin({
          email: formData.email,
          mot_de_passe: formData.mot_de_passe
        });

        if (!validation.isValid) {
          const errorMessages = validationUtils.formatErrors(validation.errors);
          notify.error(errorMessages[0]);
          setLoading(false);
          return;
        }

        const result = await AppService.login(
          { email: formData.email, mot_de_passe: formData.mot_de_passe, type_utilisateur: userType },
          rememberMe
        );

        console.log('📥 Résultat login:', result);
        console.log('📥 Success?', result.success);

        if (result.success) {
          const loginData = result.data || result;
          const token = (loginData as any).token;
          
          console.log('🔍 Token extrait:', token);
          
          if (!token) {
            console.error('❌ Pas de token dans la réponse !');
            notify.error('Erreur: token manquant');
            setLoading(false);
            return;
          }
          
          // Définir le cookie manuellement ET via fetch pour être absolument sûr
          console.log('🍪 Définition du cookie auth-token');
          const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
          
          // Méthode 1: Via document.cookie
          document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          
          // Méthode 2: Via localStorage aussi (fallback)
          localStorage.setItem('auth_user_data', JSON.stringify((loginData as any).user));
          
          console.log('✅ Cookie et localStorage définis');
          
          AppService.clearFormDraft('auth-form');
          notify.success('Connexion réussie ! Redirection...');
          
          // Attendre un peu
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
          const targetUrl = returnUrl || (userType === 'artisan' ? '/artisan/dashboard' : '/profil');
          
          console.log('🚀 Redirection vers:', targetUrl);
          
          // Forcer le rechargement complet de la page
          window.location.href = targetUrl;
        } else {
          console.log('❌ result.success est false:', result);
          notify.error(String((result as any).error) || 'Erreur de connexion');
        }
      } else {
        // Inscription
        const registrationData = userType === 'artisan' ? {
          nom: formData.nom,
          email: formData.email,
          mot_de_passe: formData.mot_de_passe,
          telephone: formData.telephone,
          bio: formData.bio || undefined,
          localisation: formData.localisation || undefined,
          type_utilisateur: 'artisan' as const
        } : {
          nom: formData.nom,
          prenom: formData.prenom || formData.nom.split(' ')[0],
          email: formData.email,
          mot_de_passe: formData.mot_de_passe,
          telephone: formData.telephone,
          adresse: formData.adresse || undefined,
          type_utilisateur: 'acheteur' as const
        };

        const validation = objectValidators.userRegistration(registrationData);

        if (!validation.isValid) {
          const errorMessages = validationUtils.formatErrors(validation.errors);
          const errorMap: Record<string, string> = {};
          validation.errors.forEach(err => {
            errorMap[err.field] = err.message;
          });
          setErrors(errorMap);
          notify.error(errorMessages[0]);
          setLoading(false);
          return;
        }

        const result = await AppService.register(registrationData);

        if (result.success) {
          AppService.clearFormDraft('auth-form');
          console.log(`📝 Inscription ${userType} réussie`);
          
          // Connexion automatique et redirection vers le bon dashboard
          notify.success('Inscription réussie ! Redirection...');
          console.log(`🎨 Connexion automatique de ${userType}...`);
          
          // Connexion automatique
          const loginResult = await AppService.login(
            { email: formData.email, mot_de_passe: formData.mot_de_passe, type_utilisateur: userType },
            false
          );
          
          if (loginResult.success) {
            console.log('✅ Connexion auto réussie, redirection dashboard');
            notify.success('Inscription réussie ! Bienvenue.');
            
            // Définir le cookie manuellement
            const token = loginResult.data?.token || (loginResult as any).token;
            if (token) {
              console.log('🍪 Définition du cookie auth-token après inscription');
              document.cookie = `auth-token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
            }
            
            // Attendre que le cookie soit écrit
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Redirection selon le type d'utilisateur
            const dashboardUrl = userType === 'artisan' ? '/artisan/dashboard' : '/profil';
            window.location.replace(dashboardUrl);
            return;
          } else {
            console.log('❌ Échec connexion auto');
            notify.success('Inscription réussie ! Veuillez vous connecter.');
            setIsLogin(true);
          }
          
          // Réinitialiser le formulaire
          setFormData({
            nom: '',
            prenom: '',
            email: formData.email,
            mot_de_passe: '',
            confirmer_mot_de_passe: '',
            telephone: '',
            adresse: '',
            bio: '',
            localisation: ''
          });
        }
      }
    } catch (error: any) {
      notify.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Connexion Artisan' : 'Inscription Artisan'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? 'Accédez à votre espace artisan'
                : 'Rejoignez la communauté des artisans Waraniéné'
              }
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-blue-800 text-sm">{message}</p>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              🧵 Cet espace est réservé aux <strong>artisans</strong>. Si vous êtes acheteur, votre compte sera créé automatiquement lors de votre première commande.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                      errors.nom ? 'border-red-500' : ''
                    }`}
                    placeholder="Votre nom complet"
                  />
                </div>
                {errors.nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  id="mot_de_passe"
                  name="mot_de_passe"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.mot_de_passe ? 'border-red-500' : ''
                  }`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.mot_de_passe && (
                <p className="text-red-500 text-sm mt-1">{errors.mot_de_passe}</p>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="confirmer_mot_de_passe" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="confirmer_mot_de_passe"
                      name="confirmer_mot_de_passe"
                      type="password"
                      required={!isLogin}
                      value={formData.confirmer_mot_de_passe}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                        errors.confirmer_mot_de_passe ? 'border-red-500' : ''
                      }`}
                      placeholder="Confirmez votre mot de passe"
                    />
                  </div>
                  {errors.confirmer_mot_de_passe && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmer_mot_de_passe}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone (obligatoire)
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      required
                      value={formData.telephone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                        errors.telephone ? 'border-red-500' : ''
                      }`}
                      placeholder="+225 07 12 34 56 78"
                    />
                  </div>
                  {errors.telephone && (
                    <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="localisation" className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation (optionnel)
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="localisation"
                      name="localisation"
                      type="text"
                      value={formData.localisation}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Waraniéné, Côte d'Ivoire"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Biographie (optionnel)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder="Présentez votre savoir-faire et votre expérience en tissage..."
                  />
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || Object.values(errors).some(error => error !== '')}
              className="w-full py-3 text-lg"
            >
              {loading 
                ? (isLogin ? 'Connexion...' : 'Inscription...') 
                : (isLogin ? 'Se connecter' : "S'inscrire")
              }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  AppService.clearFormDraft('auth-form');
                }}
                className="ml-1 text-primary-600 hover:text-primary-700 font-medium"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-700"
            >
               Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
