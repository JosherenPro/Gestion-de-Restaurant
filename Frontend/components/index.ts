/**
 * Export centralisé de tous les composants du système
 * Facilite les imports dans d'autres fichiers
 */

// Vues principales par rôle
export { ClientView } from './ClientViewConnected';
export { ServerViewConnected } from './ServerViewConnected';
export { CuisinierViewConnected } from './CuisinierViewConnected';
export { GerantViewConnected } from './GerantViewConnected';

// Vues spécialisées
export { ReservationManagerView } from './ReservationManagerView';
export { LoginView } from './LoginView';

// Router et utilitaires
export { RoleBasedRouter, ROLE_ROUTES, useCurrentRoute } from './RoleBasedRouter';

// Composants UI
export { Card, Button, Modal, Badge } from './UI';

/**
 * Guide d'utilisation rapide:
 * 
 * 1. Pour une application simple avec routing automatique:
 *    import { RoleBasedRouter } from './components';
 *    <RoleBasedRouter />
 * 
 * 2. Pour afficher une vue spécifique:
 *    import { GerantViewConnected } from './components';
 *    <GerantViewConnected />
 * 
 * 3. Pour créer une navigation personnalisée:
 *    import { ROLE_ROUTES } from './components';
 *    const routes = Object.values(ROLE_ROUTES);
 */
