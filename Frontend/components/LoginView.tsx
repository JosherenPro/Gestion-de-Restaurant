import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from './UI';
import { LogIn, Mail, Lock, AlertCircle, Loader, Smartphone, User, Phone, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/api.service';

interface LoginViewProps {
    onGuestAccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onGuestAccess }) => {
    const { login, loginAsGuest } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register State
    const [regNom, setRegNom] = useState('');
    const [regPrenom, setRegPrenom] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleGuest = () => {
        loginAsGuest();
        onGuestAccess?.();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await apiService.registerClient({
                nom: regNom,
                prenom: regPrenom,
                email: regEmail,
                telephone: regPhone,
                password: regPassword,
                role: 'CLIENT'
            });

            setSuccessMessage("Compte créé avec succès ! Connectez-vous maintenant.");
            setIsRegistering(false);
            // Pre-fill login email
            setEmail(regEmail);
            setPassword('');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'inscription.');
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

                {/* Guest Access Button - Hidden during registration to avoid clutter */}
                {!isRegistering && onGuestAccess && (
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

                {/* Main Card */}
                <Card className="p-8 bg-white/95 backdrop-blur-sm border-none shadow-2xl rounded-3xl">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-[#03081F]">
                            {isRegistering ? 'Créer un compte' : 'Connexion Staff'}
                        </h2>
                        {isRegistering && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsRegistering(false)}
                                className="text-gray-500 hover:text-[#03081F]"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Retour
                            </Button>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                        {isRegistering
                            ? 'Rejoignez-nous pour commander plus facilement'
                            : 'Réservé au personnel et clients inscrits'}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                            <div className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" >✓</div>
                            <p className="text-sm text-green-600 font-medium">{successMessage}</p>
                        </div>
                    )}

                    {isRegistering ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Nom</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={regNom}
                                            onChange={(e) => setRegNom(e.target.value)}
                                            placeholder="Doe"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Prénom</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={regPrenom}
                                            onChange={(e) => setRegPrenom(e.target.value)}
                                            placeholder="John"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        placeholder="john.doe@example.com"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={regPhone}
                                        onChange={(e) => setRegPhone(e.target.value)}
                                        placeholder="0123456789"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium outline-none focus:border-[#FC8A06] focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <Button
                                fullWidth
                                variant="primary"
                                className="h-14 mt-6 text-base shadow-xl shadow-[#FC8A06]/20"
                                disabled={loading}
                            >
                                {loading ? 'Création en cours...' : 'Créer mon compte'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5">
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

                            <div className="pt-4 text-center border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Pas encore de compte ?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsRegistering(true)}
                                        className="font-bold text-[#FC8A06] hover:text-[#e07b05] transition-colors"
                                    >
                                        Créer un compte
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}


                </Card>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    © 2024 RestoManager Pro. Tous droits réservés.
                </p>
            </div>
        </div>
    );
};
