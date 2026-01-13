export const API_CONFIG = {
BASE_URL: import.meta.env.VITE_API_URL || 'https://gestion-de-restaurant.onrender.com',
ENDPOINTS: {
    // Auth
    AUTH: {
      TOKEN: '/auth/token',
      VERIFY: '/auth/verify',
      ME: '/utilisateurs/email',
    },
    // Utilisateurs
    UTILISATEURS: {
      BASE: '/utilisateurs',
      BY_ID: (id: number) => `/utilisateurs/${id}`,
      BY_EMAIL: (email: string) => `/utilisateurs/email/${encodeURIComponent(email)}`,
    },
    // Clients
    CLIENTS: {
      BASE: '/clients',
      REGISTER: '/clients/register',
      BY_ID: (id: number) => `/clients/${id}`,
    },
    // Categories
    CATEGORIES: {
      BASE: '/categories',
      BY_ID: (id: number) => `/categories/${id}`,
    },
    // Plats
    PLATS: {
      BASE: '/plats',
      BY_ID: (id: number) => `/plats/${id}`,
      IMAGE: (id: number) => `/plats/${id}/image`,
    },
    // Commandes
    COMMANDES: {
      BASE: '/commandes',
      BY_ID: (id: number) => `/commandes/${id}`,
      LIGNES: (id: number) => `/commandes/${id}/lignes`,
      VALIDER: (id: number) => `/commandes/${id}/valider`,
      PREPARER: (id: number) => `/commandes/${id}/preparer`,
      PRETE: (id: number) => `/commandes/${id}/prete`,
      SERVIR: (id: number) => `/commandes/${id}/servir`,
      PAYEE: (id: number) => `/commandes/${id}/payee`,
    },
    // Tables
    TABLES: {
      BASE: '/tables',
      BY_ID: (id: number) => `/tables/${id}`,
      BY_QR: (qrCode: string) => `/tables/qr/${qrCode}`,
    },
    // Reservations
    RESERVATIONS: {
      BASE: '/reservations',
      BY_ID: (id: number) => `/reservations/${id}`,
      DISPONIBILITE: '/reservations/disponibilite',
      CONFIRMER: (id: number) => `/reservations/${id}/confirmer`,
      ANNULER: (id: number) => `/reservations/${id}/annuler`,
    },
    // Avis
    AVIS: {
      BASE: '/avis',
      BY_ID: (id: number) => `/avis/${id}`,
    },
    // Paiements
    PAIEMENTS: {
      BASE: '/paiements',
      ADDITION: (commandeId: number) => `/paiements/addition/${commandeId}`,
      BY_COMMANDE: (commandeId: number) => `/paiements/commande/${commandeId}`,
    },
    // Stats
    STATS: {
      GLOBAL: '/stats/global',
      TOP_PLATS: '/stats/top-plats',
      DASHBOARD: '/stats/dashboard',
    },
    // Personnel
    PERSONNEL: {
      BASE: '/personnel',
      BY_ID: (id: number) => `/personnel/${id}`,
      REGISTER: '/personnel/register',
      GERANTS: '/personnel/register/gerants',
      SERVEURS: '/personnel/register/serveurs',
      CUISINIERS: '/personnel/register/cuisiniers',
    },
    // Menus
    MENUS: {
      BASE: '/menus',
      BY_ID: (id: number) => `/menus/${id}`,
      ADD_PLAT: (menuId: number, platId: number) => `/menus/${menuId}/plats/${platId}`,
      REMOVE_PLAT: (menuId: number, platId: number) => `/menus/${menuId}/plats/${platId}`,
    },
  },
};
