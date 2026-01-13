import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from './UI';
import { LogIn, Mail, Lock, AlertCircle, Loader, Smartphone } from 'lucide-react';

interface LoginViewProps {
  onGuestAccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onGuestAccess }) => {
const { login, loginAsGuest } = useAuth();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleGuest = () => {
  loginAsGuest();
  onGuestAccess?.();
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03081F] via-[#0a1129] to-[#03081F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FC8A06] rounded-3xl shadow-2xl shadow-[#FC8A06]/20 mb-4">
            <span className="text-white text-3xl font-black">R</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">RestoManager Pro</h1>
          <p className="text-gray-400 text-sm mt-2">Système de gestion de restaurant</p>
        </div>

        {/* Guest Access Button */}
        {onGuestAccess && (
          <Button
            fullWidth
            variant="outline"
            className="mb-6 h-14 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            onClick={handleGuest}
          >
            <Smartphone className="w-5 h-5" />
            Accéder au menu (Client)
          </Button>
        )}

        {/* Login Card */}
        <Card className="p-8 bg-white/95 backdrop-blur-sm border-none shadow-2xl rounded-3xl">
          <h2 className="text-2xl font-black text-[#03081F] mb-2">Connexion Staff</h2>
          <p className="text-sm text-gray-500 mb-6">Réservé au personnel du restaurant</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              fullWidth
              variant="primary"
              className="h-14 mt-6 text-base shadow-xl shadow-[#FC8A06]/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center font-bold uppercase tracking-widest mb-3">
              Comptes de démo
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="font-bold text-[#FC8A06]">?? Gérant</p>
                <p className="mt-1">Email: <span className="font-mono">gerant@resto.com</span></p>
                <p>Mot de passe: <span className="font-mono">password123</span></p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="font-bold text-blue-600">?? Serveur</p>
                <p className="mt-1">Email: <span className="font-mono">serveur@resto.com</span></p>
                <p>Mot de passe: <span className="font-mono">password123</span></p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="font-bold text-orange-600">????? Cuisinier</p>
                <p className="mt-1">Email: <span className="font-mono">cuisinier@resto.com</span></p>
                <p>Mot de passe: <span className="font-mono">password123</span></p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2024 RestoManager Pro. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};
