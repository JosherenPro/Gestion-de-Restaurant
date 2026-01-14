import React, { useState } from 'react';
import { apiService } from '../services/api.service';
import { Button, Card } from './UI';
import { Mail, Lock, User, Phone, AlertCircle, Loader, X, LogIn, UserPlus, Sparkles } from 'lucide-react';

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, userData: any) => void;
}

export const ClientAuthModal: React.FC<ClientAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerData, setRegisterData] = useState({
    email: '',
    mot_de_passe: '',
    nom: '',
    prenom: '',
    telephone: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('?? Tentative de connexion avec:', loginEmail);
      const response = await apiService.login(loginEmail, loginPassword);
      console.log('? R�ponse login:', response);
      const token = response.access_token;

      // Get user info
      console.log('?? R�cup�ration des infos utilisateur...');
      const userData = await apiService.getCurrentUser(token);
      console.log('? Donn�es utilisateur:', userData);

      // Store token
      localStorage.setItem('client_token', token);

      onSuccess(token, userData);
      onClose();
    } catch (err: any) {
      console.error('? Erreur de connexion:', err);
      const errorMessage = err.message || 'Erreur de connexion';
      setError(errorMessage);

      // Show more details in console
      if (err.response) {
        console.error('Response data:', await err.response.json().catch(() => null));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('📝 Tentative d\'inscription avec:', registerData);

      // Prepare data for API (map fields to match backend schema)
      const apiData = {
        nom: registerData.nom,
        prenom: registerData.prenom,
        email: registerData.email,
        telephone: registerData.telephone,
        password: registerData.mot_de_passe,
        role: 'client'
      };

      console.log('📤 Données envoyées à l\'API:', apiData);

      // Register client
      let registerResponse;
      try {
        registerResponse = await apiService.registerClient(apiData);
        console.log('✅ Inscription réussie:', registerResponse);
      } catch (registerErr: any) {
        console.error('❌ Erreur d\'inscription:', registerErr);
        // Check for specific error messages
        const msg = registerErr.message || '';
        if (msg.includes('email') || msg.includes('Email')) {
          throw new Error('Cet email est déjà utilisé. Veuillez vous connecter.');
        }
        if (msg.includes('telephone') || msg.includes('Telephone')) {
          throw new Error('Ce numéro de téléphone est déjà utilisé.');
        }
        throw new Error(msg || 'Erreur lors de l\'inscription. Veuillez réessayer.');
      }

      // Auto-login after registration
      console.log('🔄 Auto-connexion après inscription...');
      const response = await apiService.login(registerData.email, registerData.mot_de_passe);
      console.log('✅ Réponse auto-login:', response);
      const token = response.access_token;

      // Get user info
      console.log('👤 Récupération des infos utilisateur...');
      const userData = await apiService.getCurrentUser(token);
      console.log('✅ Données utilisateur:', userData);

      // Store token
      localStorage.setItem('client_token', token);

      onSuccess(token, userData);
      onClose();
    } catch (err: any) {
      console.error('❌ Erreur d\'inscription:', err);
      const errorMessage = err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);

      // Show more details in console
      if (err.response) {
        console.error('Response data:', await err.response.json().catch(() => null));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in slide-in-from-bottom-4 duration-500">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#03081F]">
                {mode === 'login' ? 'Connexion' : 'Inscription'}
              </h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {mode === 'login' ? 'Accédez à votre compte' : 'Créez votre compte'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-[1.2rem]">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-[1rem] font-bold text-sm transition-all ${mode === 'login'
                ? 'bg-white text-[#FC8A06] shadow-md'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Connexion
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 rounded-[1rem] font-bold text-sm transition-all ${mode === 'register'
                ? 'bg-white text-[#FC8A06] shadow-md'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Inscription
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.2rem] font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="********"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.2rem] font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FC8A06] to-orange-600 text-white rounded-[1.5rem] p-5 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-1 active:scale-95 font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 inline mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 inline mr-2" />
                    Se connecter
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                    Pr�nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={registerData.prenom}
                      onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                      placeholder="Eren"
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border-2 border-gray-100 rounded-[1rem] text-sm font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={registerData.nom}
                      onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                      placeholder="Josh"
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border-2 border-gray-100 rounded-[1rem] text-sm font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.2rem] font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                  Telephone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={registerData.telephone}
                    onChange={(e) => setRegisterData({ ...registerData, telephone: e.target.value })}
                    placeholder="+228 99 99 99 99"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.2rem] font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={registerData.mot_de_passe}
                    onChange={(e) => setRegisterData({ ...registerData, mot_de_passe: e.target.value })}
                    placeholder="********"
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.2rem] font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Minimum 6 caractères</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[1.5rem] p-5 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-1 active:scale-95 font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 inline mr-2 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 inline mr-2" />
                    Créer mon compte
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              En continuant, vous acceptez nos{' '}
              <button className="text-[#FC8A06] font-bold hover:underline">
                Conditions d'utilisation
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
