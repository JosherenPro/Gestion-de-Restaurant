<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# RestoManager Pro - Frontend

Application de gestion de restaurant complète avec interface React connectée à un backend FastAPI.

## ?? Démarrage Rapide

### Prérequis

- Node.js (v16 ou supérieur)
- Backend FastAPI en cours d'exécution (voir `../backend/README.md`)

### Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Configurer les variables d'environnement :
   ```bash
   cp .env.example .env
   ```
   
   Éditez `.env` et configurez l'URL du backend :
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. Démarrer l'application :
   ```bash
   npm run dev
   ```

L'application sera accessible sur `http://localhost:3000`

## ?? Fonctionnalités

### Vue Client ??
- Navigation dans le menu par catégories
- Recherche de plats
- Panier de commande
- Suivi de commande en temps réel
- Réservation de tables
- Système d'avis

### Vue Serveur ???
- Gestion des tables
- Validation des commandes
- Service des plats
- Gestion des réservations

### Vue Cuisinier ?????
- Affichage des commandes en attente
- Préparation des plats
- Marquage des commandes prêtes

### Vue Gérant ??
- Tableau de bord avec statistiques
- Gestion du menu et des plats
- Gestion du personnel
- Chiffre d'affaires et indicateurs
- Top des plats vendus

## ??? Structure du Projet

```
Frontend/
??? components/          # Composants React
?   ??? ClientView.tsx          # Vue client (mock)
?   ??? ClientViewConnected.tsx # Vue client connectée au backend
?   ??? ServerView.tsx          # Vue serveur
?   ??? ChefView.tsx            # Vue cuisinier
?   ??? AdminView.tsx           # Vue gérant
?   ??? UI.tsx                  # Composants UI réutilisables
??? config/              # Configuration
?   ??? api.config.ts           # Configuration des endpoints API
??? context/             # Contextes React
?   ??? AuthContext.tsx         # Gestion de l'authentification
??? hooks/               # Hooks personnalisés
?   ??? useApi.ts               # Hooks pour les appels API
??? services/            # Services
?   ??? api.service.ts          # Service API
??? App.tsx              # Composant principal
??? types.ts             # Types TypeScript
??? mockData.ts          # Données de démonstration
??? BACKEND_INTEGRATION.md # Guide d'intégration avec le backend
```

## ?? Intégration Backend

Le frontend est conçu pour se connecter au backend FastAPI. Consultez [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) pour :

- Configuration de l'API
- Utilisation des hooks et services
- Authentification et gestion des tokens
- Correspondance des types de données
- Exemples de code

### Endpoints API Principaux

- **Auth** : `/auth/token`, `/auth/verify`
- **Menu** : `/categories`, `/plats`
- **Commandes** : `/commandes`, `/commandes/{id}/lignes`
- **Tables** : `/tables`, `/tables/qr/{qr_code}`
- **Réservations** : `/reservations`
- **Stats** : `/stats/global`, `/stats/dashboard`

## ?? Technologies

- **React 19** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Lucide React** - Icônes
- **Recharts** - Graphiques (stats)
- **Tailwind CSS** - Styling (via classes utilitaires)

## ?? Authentification

L'application utilise JWT tokens pour l'authentification :

```typescript
import { useAuth } from './context/AuthContext';

const { login, logout, user, isAuthenticated } = useAuth();

// Connexion
await login('email@example.com', 'password');

// Vérifier l'état
if (isAuthenticated) {
  console.log('Utilisateur:', user);
}

// Déconnexion
logout();
```

## ?? Mode Démonstration

Pour tester l'application sans backend, utilisez les composants originaux qui utilisent des données mock :

- `ClientView.tsx` utilise `mockData.ts`
- Passez entre les différentes vues avec le sélecteur de rôle

Pour utiliser le backend réel :

- Remplacez l'import dans `App.tsx` :
  ```typescript
  // import { ClientView } from './components/ClientView';
  import { ClientView } from './components/ClientViewConnected';
  ```

## ?? Responsive Design

L'application est optimisée pour :
- ?? Mobile (vue client)
- ?? Desktop (vues serveur, cuisinier, gérant)
- ??? Tablette

## ??? Scripts Disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Prévisualisation du build
npm run preview
```

## ?? Débogage

### Problèmes de connexion au backend

1. Vérifiez que le backend est démarré :
   ```bash
   curl http://localhost:8000/categories/
   ```

2. Vérifiez la configuration CORS dans le backend

3. Consultez la console du navigateur pour les erreurs

### Erreurs communes

- **CORS Error** : Le backend doit autoriser `http://localhost:3000`
- **401 Unauthorized** : Token expiré, reconnectez-vous
- **404 Not Found** : Backend non démarré ou mauvaise URL dans `.env`

## ?? Documentation

- [Guide d'intégration Backend](./BACKEND_INTEGRATION.md)
- [Documentation API Backend](../backend/docs/frontend/API_GUIDE.md)
- [Formats de données](../backend/docs/frontend/DATA_FORMATS.md)

## ?? Contribution

1. Créez une branche pour votre fonctionnalité
2. Committez vos changements
3. Créez une Pull Request

## ?? Licence

Ce projet est open source.

## ?? Liens Utiles

- **API Documentation** : http://localhost:8000/docs
- **AI Studio** : https://ai.studio/apps/temp/1

