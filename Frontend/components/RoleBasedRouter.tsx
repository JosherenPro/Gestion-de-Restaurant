import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginView } from './LoginView';
import { ClientView } from './ClientViewConnected';
import { ServerViewConnected } from './ServerViewConnected';
import { CuisinierViewConnected } from './CuisinierViewConnected';
import { GerantViewConnected } from './GerantViewConnected';
import { UserRole } from '../types';
import { Loader } from 'lucide-react';

/**
 * Composant de routage intelligent qui affiche la bonne interface
 * en fonction du rôle de l'utilisateur connecté
 */
export const RoleBasedRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#FC8A06] mx-auto" />
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Pas connecté -> Login
  if (!user) {
    return <LoginView onGuestAccess={() => {
      // Option: permettre un accès invité au menu client
      window.location.href = '/client';
    }} />;
  }

  // Redirection selon le rôle
  switch (user.role) {
    case UserRole.CLIENT:
      return <ClientView />;
    
    case UserRole.SERVEUR:
      return <ServerViewConnected />;
    
    case UserRole.CUISINIER:
      return <CuisinierViewConnected />;
    
    case UserRole.GERANT:
      return <GerantViewConnected />;
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">?</span>
            </div>
            <h2 className="text-2xl font-black text-[#03081F] mb-2">Rôle non reconnu</h2>
            <p className="text-gray-500 mb-6">Le rôle "{user.role}" n'est pas valide</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FC8A06] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all"
            >
              Recharger
            </button>
          </div>
        </div>
      );
  }
};

/**
 * Configuration des routes par rôle
 * Utile pour la navigation et les permissions
 */
export const ROLE_ROUTES = {
  [UserRole.CLIENT]: {
    path: '/client',
    component: ClientView,
    title: 'Menu Client',
    description: 'Commander et suivre vos plats'
  },
  [UserRole.SERVEUR]: {
    path: '/serveur',
    component: ServerViewConnected,
    title: 'Interface Serveur',
    description: 'Gestion des tables et commandes'
  },
  [UserRole.CUISINIER]: {
    path: '/cuisinier',
    component: CuisinierViewConnected,
    title: 'Interface Cuisinier',
    description: 'Gestion de la cuisine et du stock'
  },
  [UserRole.GERANT]: {
    path: '/gerant',
    component: GerantViewConnected,
    title: 'Dashboard Gérant',
    description: 'Gestion complète du restaurant'
  }
};

/**
 * Hook personnalisé pour obtenir les informations de la route actuelle
 */
export const useCurrentRoute = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return ROLE_ROUTES[user.role] || null;
};
