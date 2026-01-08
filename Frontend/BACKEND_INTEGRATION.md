# Frontend - Backend Integration Guide

## ?? Vue d'ensemble

Le frontend React est maintenant connecté au backend FastAPI. Cette documentation explique comment utiliser l'API et les composants intégrés.

## ?? Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du dossier Frontend :

```env
VITE_API_URL=http://localhost:8000
```

### 2. Démarrage

```bash
# Terminal 1 - Démarrer le backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2 - Démarrer le frontend
cd Frontend
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000` et le backend sur `http://localhost:8000`.

## ??? Architecture

### Structure des fichiers

```
Frontend/
??? config/
?   ??? api.config.ts          # Configuration des endpoints API
??? services/
?   ??? api.service.ts         # Service pour les appels API
??? context/
?   ??? AuthContext.tsx        # Contexte d'authentification
??? hooks/
?   ??? useApi.ts              # Hooks personnalisés pour les données
??? components/
?   ??? ClientView.tsx         # Vue client (mock data - pour démo)
?   ??? ClientViewConnected.tsx # Vue client connectée au backend
?   ??? ServerView.tsx         # Vue serveur
?   ??? ChefView.tsx           # Vue cuisinier
?   ??? AdminView.tsx          # Vue gérant
??? types.ts                   # Types TypeScript correspondant au backend
```

## ?? Utilisation de l'API

### Service API

Le fichier `services/api.service.ts` contient toutes les méthodes pour interagir avec le backend :

```typescript
import { apiService } from './services/api.service';

// Récupérer les plats
const plats = await apiService.getPlats();

// Récupérer les catégories
const categories = await apiService.getCategories();

// Créer une commande
const commande = await apiService.createCommande({
  client_id: 1,
  table_id: 1,
  type_commande: 'SUR_PLACE',
  montant_total: 2500
});

// Ajouter des lignes à la commande
await apiService.addLigneCommande(commande.id, {
  commande_id: commande.id,
  plat_id: 1,
  quantite: 2,
  prix_unitaire: 1250
});
```

### Hooks personnalisés

Utilisez les hooks pour charger les données automatiquement :

```typescript
import { useMenu, useTables, useCommandes } from './hooks/useApi';

function MyComponent() {
  const { categories, plats, loading, error } = useMenu();
  const { tables, refreshTables } = useTables();
  const { commandes, refreshCommandes } = useCommandes();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {plats.map(plat => (
        <div key={plat.id}>{plat.nom}</div>
      ))}
    </div>
  );
}
```

### Authentification

Le contexte d'authentification gère les tokens JWT :

```typescript
import { useAuth } from './context/AuthContext';

function LoginComponent() {
  const { login, logout, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('email@example.com', 'password');
      // L'utilisateur est maintenant connecté
    } catch (error) {
      console.error('Échec de connexion:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bonjour {user?.nom}</p>
          <button onClick={logout}>Déconnexion</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Connexion</button>
      )}
    </div>
  );
}
```

## ?? Flux de données

### 1. Menu Client (ClientViewConnected)

```
Utilisateur ? Chargement du menu (useMenu)
           ? Ajout au panier (state local)
           ? Création commande (apiService.createCommande)
           ? Ajout des lignes (apiService.addLigneCommande)
           ? Suivi en temps réel
```

### 2. Gestion des Commandes (ServerView)

```
Serveur ? Récupération commandes (useCommandes)
        ? Validation (apiService.validerCommande)
        ? Mise à jour statut
        ? Rafraîchissement (refreshCommandes)
```

### 3. Préparation en Cuisine (ChefView)

```
Cuisinier ? Commandes à préparer (useCommandes)
          ? Préparation (apiService.preparerCommande)
          ? Commande prête (apiService.commandePrete)
          ? Actualisation automatique
```

### 4. Dashboard Gérant (AdminView)

```
Gérant ? Authentification requise (useAuth)
       ? Statistiques (apiService.getStatsGlobal)
       ? Top plats (apiService.getTopPlats)
       ? Gestion du personnel
```

## ?? Correspondance Backend ? Frontend

### Types de données

Les types TypeScript dans `types.ts` correspondent aux schémas Pydantic du backend :

| Backend (Python)        | Frontend (TypeScript)     |
|------------------------|---------------------------|
| `PlatRead`             | `MenuItem`                |
| `CommandeRead`         | `Order`                   |
| `LigneCommandeRead`    | `OrderItem`               |
| `TableRead`            | `Table`                   |
| `ReservationRead`      | `Reservation`             |
| `AvisRead`             | `Avis`                    |

### Statuts de commande

```typescript
// Frontend
export enum OrderStatus {
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  VALIDEE = 'VALIDEE',
  EN_COURS = 'EN_COURS',
  PRETE = 'PRETE',
  SERVIE = 'SERVIE',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE'
}

// Backend (Python)
class StatutCommande(str, Enum):
    EN_ATTENTE_VALIDATION = "EN_ATTENTE_VALIDATION"
    VALIDEE = "VALIDEE"
    EN_COURS = "EN_COURS"
    PRETE = "PRETE"
    SERVIE = "SERVIE"
    PAYEE = "PAYEE"
    ANNULEE = "ANNULEE"
```

### Prix

?? **Important** : Le backend stocke les prix en **centimes** (ex: 1250 = 12,50€)

```typescript
// Conversion centimes ? euros
const priceInEuros = priceInCentimes / 100;

// Affichage formaté
export const formatPrice = (priceInCentimes: number): string => {
  return (priceInCentimes / 100).toFixed(2);
};
```

## ?? Sécurité et Authentification

### Flux d'authentification

1. **Login** : `POST /auth/token` avec email et mot de passe
2. **Réception du token JWT** : Stocké dans `localStorage`
3. **Utilisation** : Ajouté automatiquement aux en-têtes des requêtes
4. **Vérification** : Le backend valide le token à chaque requête

```typescript
// Le service API ajoute automatiquement le token
headers['Authorization'] = `Bearer ${token}`;
```

### Rôles et permissions

```typescript
export enum UserRole {
  CLIENT = 'CLIENT',
  SERVEUR = 'SERVEUR',
  CUISINIER = 'CUISINIER',
  GERANT = 'GERANT'
}
```

- **CLIENT** : Commande, réservation, avis
- **SERVEUR** : Gestion des tables et validation des commandes
- **CUISINIER** : Préparation des plats
- **GERANT** : Accès complet (stats, personnel, menu)

## ?? Débogage

### Vérifier la connexion au backend

```javascript
// Dans la console du navigateur
fetch('http://localhost:8000/categories/')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Activer les logs

```typescript
// Dans api.service.ts, ajoutez des logs
console.log('API Request:', endpoint, data);
console.log('API Response:', response);
```

### Erreurs courantes

1. **CORS Error** : Vérifiez que le backend autorise `http://localhost:3000`
2. **401 Unauthorized** : Token expiré ou invalide, reconnectez-vous
3. **404 Not Found** : Vérifiez que le backend est démarré
4. **400 Bad Request** : Vérifiez le format des données envoyées

## ?? Prochaines étapes

Pour connecter complètement tous les composants :

1. ? ClientView ? Utiliser `ClientViewConnected.tsx`
2. ? ServerView ? Intégrer `useCommandes` et `useTables`
3. ? ChefView ? Intégrer `useCommandes` et filtrer par statut
4. ? AdminView ? Intégrer `apiService.getStatsGlobal()` et `usePersonnel()`

## ?? Ressources

- **Documentation API** : http://localhost:8000/docs
- **Backend Docs** : `backend/docs/frontend/API_GUIDE.md`
- **Data Formats** : `backend/docs/frontend/DATA_FORMATS.md`

## ?? Exemples d'utilisation

### Créer un client et passer une commande

```typescript
// 1. Enregistrer un nouveau client
const client = await apiService.registerClient({
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com',
  telephone: '0612345678',
  role: 'client',
  password: 'SecurePassword123!'
});

// 2. Se connecter
await login('jean.dupont@example.com', 'SecurePassword123!');

// 3. Créer une commande
const commande = await apiService.createCommande({
  client_id: client.id,
  table_id: 1,
  type_commande: 'SUR_PLACE',
  montant_total: 2500
});

// 4. Ajouter des plats
await apiService.addLigneCommande(commande.id, {
  commande_id: commande.id,
  plat_id: 1,
  quantite: 2,
  prix_unitaire: 1250
});
```

### Workflow serveur

```typescript
const { token } = useAuth();
const { commandes, refreshCommandes } = useCommandes();

// Valider une commande
await apiService.validerCommande(commandeId, serveurId, token);
await refreshCommandes();

// Servir une commande
await apiService.servirCommande(commandeId, token);
await refreshCommandes();
```

### Workflow cuisinier

```typescript
const { token } = useAuth();

// Commencer la préparation
await apiService.preparerCommande(commandeId, token);

// Marquer comme prête
await apiService.commandePrete(commandeId, cuisinierId, token);
```

---

**Note** : Cette intégration est un point de départ. Vous pouvez l'étendre en ajoutant :
- Gestion des erreurs plus robuste
- Notifications en temps réel (WebSockets)
- Mise en cache des données
- Mode hors ligne
- Tests unitaires et d'intégration
