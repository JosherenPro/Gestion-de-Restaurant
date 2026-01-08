# ?? Migration Guide : Mock Data ? Backend API

Ce guide explique les changements entre la version avec données mock et la version connectée au backend.

## ?? Vue d'ensemble des changements

### Avant (Mock Data)
```typescript
import { MENU_ITEMS } from '../mockData';

const ClientView = () => {
  const [items, setItems] = useState(MENU_ITEMS);
  // Les données sont statiques et locales
};
```

### Après (Backend API)
```typescript
import { useMenu } from '../hooks/useApi';
import { apiService } from '../services/api.service';

const ClientView = () => {
  const { categories, plats, loading } = useMenu();
  // Les données viennent du backend en temps réel
};
```

## ?? Changements Clés

### 1. Types de Données

#### Avant : Types Mock
```typescript
interface MenuItem {
  id: string;              // String
  name: string;
  price: number;           // En euros
  category: string;
  image: string;
}
```

#### Après : Types Backend
```typescript
interface MenuItem {
  id: number;              // Number
  nom: string;             // Nom français
  prix: number;            // En centimes !
  categorie_id: number;    // Référence à la catégorie
  image_url?: string;
}
```

### 2. Gestion du Panier

#### Avant : État Local Simple
```typescript
const [basket, setBasket] = useState<OrderItem[]>([]);

const addToBasket = (item: MenuItem) => {
  setBasket(prev => [...prev, { ...item, quantity: 1 }]);
};

const placeOrder = () => {
  // Ordre créé uniquement localement
  const newOrder = {
    id: Math.random().toString(36).substr(2, 9),
    items: basket,
    // ...
  };
};
```

#### Après : Synchronisation Backend
```typescript
const [basket, setBasket] = useState<OrderItem[]>([]);

const addToBasket = (item: MenuItem) => {
  setBasket(prev => [...prev, { 
    plat_id: item.id,
    quantite: 1,
    prix_unitaire: item.prix
  }]);
};

const placeOrder = async () => {
  // 1. Créer la commande dans le backend
  const order = await apiService.createCommande({
    client_id: CLIENT_ID,
    table_id: TABLE_ID,
    type_commande: 'SUR_PLACE',
    montant_total: totalInCentimes
  });
  
  // 2. Ajouter chaque ligne
  for (const item of basket) {
    await apiService.addLigneCommande(order.id, {
      plat_id: item.plat_id,
      quantite: item.quantite,
      prix_unitaire: item.prix_unitaire
    });
  }
};
```

### 3. Chargement des Données

#### Avant : Synchrone
```typescript
import { MENU_ITEMS, CATEGORIES } from '../mockData';

// Données disponibles immédiatement
const categories = ['Burgers', 'Pizzas', 'Drinks'];
const items = MENU_ITEMS;
```

#### Après : Asynchrone
```typescript
import { useMenu } from '../hooks/useApi';

const { categories, plats, loading, error } = useMenu();

if (loading) return <Loader />;
if (error) return <ErrorMessage error={error} />;

// Données chargées depuis le backend
```

### 4. Format des Prix

#### Avant : Euros Décimaux
```typescript
const price = 12.90; // €
const display = `€${price.toFixed(2)}`;
```

#### Après : Centimes (Backend)
```typescript
const priceInCentimes = 1290; // Backend stocke en centimes
const priceInEuros = priceInCentimes / 100;
const display = `€${formatPrice(priceInCentimes)}`;

// Helper function
export const formatPrice = (centimes: number): string => {
  return (centimes / 100).toFixed(2);
};
```

### 5. Catégories

#### Avant : Array de Strings
```typescript
const categories = ['Burgers', 'Fries', 'Drinks'];

const filteredItems = MENU_ITEMS.filter(item => 
  item.category === activeCategory
);
```

#### Après : Objets avec ID
```typescript
interface Categorie {
  id: number;
  nom: string;
  description?: string;
}

const { categories } = useMenu();

const filteredPlats = plats.filter(plat => 
  plat.categorie_id === activeCategoryId
);
```

### 6. Images

#### Avant : URLs Externes
```typescript
const image = 'https://images.unsplash.com/photo-1234...';
```

#### Après : URLs Backend + Fallback
```typescript
const getImageUrl = (imageUrl?: string) => {
  if (imageUrl) {
    return imageUrl.startsWith('http') 
      ? imageUrl 
      : `http://localhost:8000${imageUrl}`;
  }
  return 'https://images.unsplash.com/photo-default...';
};
```

### 7. Statuts de Commande

#### Avant : Statuts Simplifiés
```typescript
enum OrderStatus {
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  A_PREPARER = 'A_PREPARER',
  EN_PREPARATION = 'EN_PREPARATION',
  PRET_A_SERVIR = 'PRET_A_SERVIR',
  LIVRE = 'LIVRE'
}
```

#### Après : Statuts Backend Complets
```typescript
enum OrderStatus {
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  VALIDEE = 'VALIDEE',          // Nouveau
  EN_COURS = 'EN_COURS',
  PRETE = 'PRETE',
  SERVIE = 'SERVIE',            // Nouveau
  PAYEE = 'PAYEE',              // Nouveau
  ANNULEE = 'ANNULEE'           // Nouveau
}
```

## ?? Modifications de Code Nécessaires

### Fichiers à Modifier

#### 1. App.tsx
```typescript
// Ajouter le AuthProvider
import { AuthProvider } from './context/AuthContext';

return (
  <AuthProvider>
    {/* Votre app */}
  </AuthProvider>
);
```

#### 2. ClientView.tsx ? ClientViewConnected.tsx
```typescript
// Remplacer les imports
import { useMenu } from '../hooks/useApi';
import { apiService } from '../services/api.service';

// Utiliser les hooks
const { categories, plats, loading } = useMenu();

// Adapter les fonctions
const placeOrder = async () => {
  // Appels API au lieu de setState
};
```

#### 3. ServerView.tsx
```typescript
import { useCommandes, useTables } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const ServerView = () => {
  const { token } = useAuth();
  const { commandes, refreshCommandes } = useCommandes();
  const { tables } = useTables();
  
  const validerCommande = async (commandeId: number) => {
    await apiService.validerCommande(commandeId, SERVEUR_ID, token);
    await refreshCommandes();
  };
};
```

#### 4. ChefView.tsx
```typescript
import { useCommandes } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const ChefView = () => {
  const { token } = useAuth();
  const { commandes } = useCommandes();
  
  // Filtrer les commandes pour la cuisine
  const commandesEnCours = commandes.filter(c => 
    c.statut === OrderStatus.VALIDEE || 
    c.statut === OrderStatus.EN_COURS
  );
  
  const preparerCommande = async (id: number) => {
    await apiService.preparerCommande(id, token);
  };
  
  const marquerPrete = async (id: number) => {
    await apiService.commandePrete(id, CUISINIER_ID, token);
  };
};
```

#### 5. AdminView.tsx
```typescript
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api.service';

const AdminView = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [topPlats, setTopPlats] = useState([]);
  
  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);
  
  const loadStats = async () => {
    const [statsData, topPlatsData] = await Promise.all([
      apiService.getStatsGlobal(token),
      apiService.getTopPlats(token)
    ]);
    setStats(statsData);
    setTopPlats(topPlatsData);
  };
};
```

## ?? Checklist de Migration

### Phase 1 : Configuration
- [ ] Créer `.env` avec `VITE_API_URL`
- [ ] Vérifier que le backend est accessible
- [ ] Tester les endpoints avec curl ou Postman

### Phase 2 : Intégration de Base
- [ ] Créer `config/api.config.ts`
- [ ] Créer `services/api.service.ts`
- [ ] Créer `context/AuthContext.tsx`
- [ ] Créer `hooks/useApi.ts`
- [ ] Mettre à jour `types.ts`

### Phase 3 : Migration des Composants
- [ ] Adapter `ClientView` ? `ClientViewConnected`
- [ ] Mettre à jour `ServerView`
- [ ] Mettre à jour `ChefView`
- [ ] Mettre à jour `AdminView`

### Phase 4 : Tests
- [ ] Tester le chargement du menu
- [ ] Tester la création de commande
- [ ] Tester la validation de commande
- [ ] Tester les statistiques

### Phase 5 : Améliorations
- [ ] Ajouter la gestion d'erreurs
- [ ] Ajouter les loading states
- [ ] Implémenter l'authentification complète
- [ ] Ajouter les notifications

## ?? Erreurs Courantes et Solutions

### Erreur 1 : "Cannot read property 'nom' of undefined"
**Cause** : Tentative d'accès à `item.name` au lieu de `item.nom`  
**Solution** : Utiliser les noms de propriétés du backend (`nom` au lieu de `name`)

### Erreur 2 : Prix affichés incorrectement
**Cause** : Prix en centimes non convertis  
**Solution** : Utiliser `formatPrice(prix)` ou `prix / 100`

### Erreur 3 : "TypeError: id.toString is not a function"
**Cause** : Les IDs sont maintenant des `number` et non des `string`  
**Solution** : Retirer les appels à `.toString()` sur les IDs

### Erreur 4 : "401 Unauthorized"
**Cause** : Endpoint protégé sans token  
**Solution** : Ajouter le token : `await apiService.xxx(data, token)`

### Erreur 5 : "Network Error"
**Cause** : Backend non démarré ou CORS  
**Solution** : Vérifier que le backend est démarré et que CORS est configuré

## ?? Avantages de la Migration

### Avant (Mock Data)
- ? Données perdues au rafraîchissement
- ? Pas de persistance
- ? Pas de synchronisation multi-utilisateurs
- ? Pas de validation côté serveur
- ? Simple et rapide pour le prototypage

### Après (Backend API)
- ? Données persistantes en base
- ? Synchronisation temps réel
- ? Multi-utilisateurs
- ? Validation et sécurité
- ? Statistiques réelles
- ? Gestion des rôles
- ? Scalable et maintenable

## ?? Ressources

- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Guide complet d'intégration
- [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
- [API_GUIDE.md](../backend/docs/frontend/API_GUIDE.md) - Documentation API backend

---

**Bon courage pour la migration ! ??**
