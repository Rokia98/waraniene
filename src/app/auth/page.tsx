'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';
import AppService, { validationService, objectValidators, validationUtils, notify } from '@/services';
import { Button } from '@/components/ui/Button';

function AuthPageContent() {
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

  const inputClass = (field: string) =>
    `w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ── Panneau gauche – visuel culturel ─────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fond dégradé terracotta */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-terracotta-700" />
        {/* Pattern kente */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 2px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px'
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
                <path d="M3 6h18M3 12h18M3 18h18M6 3v18M12 3v18M18 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="7" y="7" width="4" height="4" fill="currentColor" opacity="0.7" rx="0.5"/>
                <rect x="13" y="13" width="4" height="4" fill="currentColor" opacity="0.7" rx="0.5"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold">Tissés de Waraniéné</span>
          </Link>

          {/* Texte central */}
          <div>
            <div className="text-6xl mb-6">🧵</div>
            <h2 className="font-display text-4xl font-bold leading-tight mb-4">
              L&apos;art ancestral<br />
              du tissage<br />
              <span className="text-primary-200">Sénoufo</span>
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              Rejoignez les artisans tisserands de Waraniéné et vendez vos créations au monde entier.
            </p>
          </div>

          {/* Témoignage */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <p className="text-white/90 italic text-sm leading-relaxed mb-3">
              &ldquo;Depuis que j&apos;ai rejoint la plateforme, mes créations atteignent des clients jusqu&apos;en France et au Canada.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-sm font-bold">K</div>
              <div>
                <p className="text-sm font-semibold">Koné Yacouba</p>
                <p className="text-xs text-white/60">Artisan tisserand, Waraniéné</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panneau droit – formulaire ─────────────────────── */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path d="M3 6h18M3 12h18M3 18h18M6 3v18M12 3v18M18 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="7" y="7" width="4" height="4" fill="currentColor" opacity="0.7" rx="0.5"/>
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-gray-900">Tissés de Waraniéné</span>
          </Link>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-1.5">
              {isLogin ? 'Bon retour 👋' : 'Créer un compte'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin
                ? 'Connectez-vous à votre espace artisan'
                : 'Rejoignez la communauté des artisans Waraniéné'}
            </p>
          </div>

          {/* Toggle connexion / inscription */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrors({}); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrors({}); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Inscription
            </button>
          </div>

          {/* Bannière info */}
          {message && (
            <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-2.5">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-blue-800 text-sm">{message}</p>
            </div>
          )}

          {!isLogin && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-amber-800 text-sm">
                🧵 Espace réservé aux <strong>artisans</strong>. Les acheteurs n'ont pas besoin de compte pour commander.
              </p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="nom" className="label">Nom complet *</label>
                <div className="relative">
                  <User className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3.5" />
                  <input id="nom" name="nom" type="text" required value={formData.nom} onChange={handleChange}
                    className={inputClass('nom')} placeholder="Votre nom complet" />
                </div>
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Adresse email *</label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3.5" />
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                  className={inputClass('email')} placeholder="votre@email.com" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="mot_de_passe" className="label">Mot de passe *</label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3.5" />
                <input id="mot_de_passe" name="mot_de_passe" type={showPassword ? 'text' : 'password'}
                  required value={formData.mot_de_passe} onChange={handleChange}
                  className={inputClass('mot_de_passe')} placeholder="Mot de passe (min. 8 caractères)" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe}</p>}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="confirmer_mot_de_passe" className="label">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <Lock className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3.5" />
                    <input id="confirmer_mot_de_passe" name="confirmer_mot_de_passe" type="password"
                      required value={formData.confirmer_mot_de_passe} onChange={handleChange}
                      className={inputClass('confirmer_mot_de_passe')} placeholder="Confirmez le mot de passe" />
                  </div>
                  {errors.confirmer_mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.confirmer_mot_de_passe}</p>}
                </div>

                <div>
                  <label htmlFor="telephone" className="label">Téléphone *</label>
                  <div className="relative">
                    <Phone className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3.5" />
                    <input id="telephone" name="telephone" type="tel" required value={formData.telephone} onChange={handleChange}
                      className={inputClass('telephone')} placeholder="+225 07 12 34 56 78" />
                  </div>
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>

                <div>
                  <label htmlFor="localisation" className="label">Localisation <span className="text-gray-400 font-normal">(optionnel)</span></label>
                  <div className="relative">
                    <MapPin className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3.5" />
                    <input id="localisation" name="localisation" type="text" value={formData.localisation} onChange={handleChange}
                      className="input" placeholder="Waraniéné, Côte d'Ivoire" />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="label">Biographie <span className="text-gray-400 font-normal">(optionnel)</span></label>
                  <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3}
                    className="input resize-none" placeholder="Présentez votre savoir-faire et votre expérience…" />
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-primary-600 rounded" />
                  <span className="text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Object.values(errors).some(e => e !== '')}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 transition-all duration-200 mt-2"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isLogin ? 'Connexion…' : 'Inscription…'}</span>
                : (isLogin ? 'Se connecter' : "Créer mon compte")
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{' '}
            <button type="button"
              onClick={() => { setIsLogin(!isLogin); setErrors({}); AppService.clearFormDraft('auth-form'); }}
              className="text-primary-600 hover:text-primary-700 font-semibold">
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>

          <p className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>}>
      <AuthPageContent />
    </Suspense>
  );
}