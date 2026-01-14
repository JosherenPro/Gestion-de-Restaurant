# ??? Système de Gestion de Restaurant - Guide des Interfaces

## ?? Vue d'ensemble

Ce système propose **4 interfaces distinctes** selon le rôle de l'utilisateur, chacune adaptée à ses besoins spécifiques.

---

## ?? Interfaces par Rôle

### 1. ????? **Interface Cuisinier**
**Fichier:** `CuisinierViewConnected.tsx`

#### Fonctionnalités:
- ? **Consulter les commandes en cours** (temps réel)
- ? **Prendre en charge une commande** (passer de "En attente" à "En cours")
- ? **Marquer comme prêt** (notifier le serveur)
- ? **Gestion du stock** - Déclarer des plats indisponibles/disponibles
- ? Rafraîchissement automatique toutes les 20 secondes

#### Onglets:
1. **Commandes** - Workflow cuisine (À préparer ? En cuisson)
2. **Gestion Stock** - Disponibilité des plats

---

### 2. ?? **Interface Serveur**
**Fichier:** `ServerViewConnected.tsx`

#### Fonctionnalités:
- ? **Consulter la liste des tables** avec statut (libre/occupée/réservée)
- ? **Affecter/Libérer/Modifier une table**
- ? **Prendre une commande** manuellement (pour clients sans app)
- ? **Transmettre la commande en cuisine**
- ? **Consulter le statut des commandes**
- ? **Valider les commandes** en attente
- ? **Marquer comme servi** les plats prêts

#### Interface:
- **Sidebar** - Plan de salle interactif
- **Main** - Liste des commandes actives
- **Modal** - Prise de commande avec panier

---

### 3. ?? **Interface Gérant**
**Fichier:** `GerantViewConnected.tsx`

#### Fonctionnalités principales:

##### ?? **Dashboard (Tableau de bord)**
- Chiffre d'affaires total
- Nombre de commandes
- Nombre de clients
- Note moyenne
- Top 5 des plats les plus vendus

##### ?? **Gestion du Menu**
- Ajouter/Modifier/Supprimer des plats
- Gérer les prix (en centimes)
- Upload d'images de plats
- Disponibilité des plats

##### ????? **Gestion du Personnel**
- Ajouter/Modifier/Supprimer du personnel
- Gérer les rôles (Gérant/Serveur/Cuisinier)
- Consulter les informations (email, téléphone)

##### ?? **Gestion des Tables**
- Ajouter/Modifier/Supprimer des tables
- Gérer la capacité
- Statut en temps réel (libre/occupée/réservée)
- Codes QR pour accès client

##### ?? **Gestion des Réservations**
- Interface complète `ReservationManagerView`
- Confirmer ou refuser les réservations
- Voir les détails (client, date, nombre de personnes, notes)
- Statistiques (en attente, confirmées, annulées)

##### ?? **Statistiques**
- Rapports de ventes
- Popularité des plats
- Analyses détaillées

#### Navigation par onglets:
```
Dashboard | Menu | Tables | Personnel | Réservations | Statistiques
```

---

### 4. ?? **Interface Client**
**Fichier:** `ClientViewConnected.tsx`

#### Fonctionnalités:
- ? Consulter le menu par catégories
- ? Commander des plats
- ? Suivre la commande en temps réel
- ? **Faire une réservation** (avec date, heure, nombre de personnes, notes)
- ? Laisser un avis

---

## ?? Système de Routage Automatique

Le fichier `RoleBasedRouter.tsx` gère automatiquement l'affichage de la bonne interface selon le rôle de l'utilisateur connecté.

### Utilisation dans App.tsx:
```typescript
import { RoleBasedRouter } from './components/RoleBasedRouter';
import { AuthProvider } from './context/AuthContext';

const App = () => (
  <AuthProvider>
    <RoleBasedRouter />
  </AuthProvider>
);
```

### Flux d'authentification:
```
Non connecté ? LoginView
     ?
 Connexion
     ?
CLIENT ? ClientView
SERVEUR ? ServerViewConnected
CUISINIER ? CuisinierViewConnected
GERANT ? GerantViewConnected
```

---

## ?? Comptes de test

```typescript
// Gérant
Email: gerant@resto.com
Mot de passe: password123

// Serveur
Email: serveur@resto.com
Mot de passe: password123

// Cuisinier
Email: cuisinier@resto.com
Mot de passe: password123
```

---

## ?? Intégration avec l'API

Toutes les interfaces sont **entièrement connectées** à l'API backend via `apiService`:

### Exemples d'appels:
```typescript
// Commandes
await apiService.getCommandes();
await apiService.validerCommande(id, serveurId, token);
await apiService.preparerCommande(id, token);
await apiService.commandePrete(id, cuisinierId, token);

// Réservations
await apiService.getReservations();
await apiService.confirmerReservation(id, token);
await apiService.annulerReservation(id, token);

// Stats (Gérant uniquement)
await apiService.getStatsGlobal(token);
await apiService.getTopPlats(token);
```

---

## ?? Design System

### Couleurs principales:
- **Primary Orange:** `#FC8A06`
- **Dark Blue:** `#03081F`
- **Success Green:** `#10B981`
- **Warning Orange:** `#F59E0B`

### Composants UI réutilisables:
- `Card` - Cartes avec ombres et bordures arrondies
- `Button` - Variantes (primary, secondary, outline, success)
- `Modal` - Fenêtres modales responsives
- `Badge` - Badges de statut colorés

---

## ?? Lancement

### Développement:
```bash
cd Frontend
npm install
npm run dev
```

### Production:
```bash
npm run build
npm run preview
```

---

## ?? Structure des fichiers

```
Frontend/
??? components/
?   ??? ClientViewConnected.tsx        # Interface client
?   ??? ServerViewConnected.tsx        # Interface serveur
?   ??? CuisinierViewConnected.tsx     # Interface cuisinier
?   ??? GerantViewConnected.tsx        # Interface gérant
?   ??? ReservationManagerView.tsx     # Gestion réservations
?   ??? LoginView.tsx                  # Authentification
?   ??? RoleBasedRouter.tsx            # Routage automatique
?   ??? UI.tsx                         # Composants UI
?   ??? index.ts                       # Export centralisé
??? services/
?   ??? api.service.ts                 # Appels API
??? context/
?   ??? AuthContext.tsx                # Gestion auth
??? types.ts                           # Types TypeScript
??? App.tsx                            # Point d'entrée

```

---

## ? Checklist des fonctionnalités

### Serveur ?
- [x] Consulter la liste des tables
- [x] Affecter/Libérer/Modifier une table
- [x] Prendre une commande (enregistrer sans app)
- [x] Transmettre la commande en cuisine
- [x] Consulter le statut des commandes

### Cuisinier ?
- [x] Consulter les commandes en cours
- [x] Prendre en charge et préparer
- [x] Marquer comme prêt

### Gérant ?
- [x] Gérer le menu (ajouter/modifier/supprimer plats)
- [x] Gérer les prix
- [x] Gérer le personnel (ajouter/modifier/supprimer)
- [x] Gérer les tables
- [x] Consulter les statistiques
- [x] Générer des rapports (ventes, popularité)
- [x] Gérer les stocks (via cuisinier)
- [x] **Gérer les réservations** (confirmer/refuser)

### Client ?
- [x] Consulter le menu
- [x] Commander
- [x] Suivre la commande
- [x] Faire une réservation
- [x] Laisser un avis

---

## ?? Personnalisation

Pour adapter le système à vos besoins:

1. **Modifier les couleurs** ? `tailwind.config.js`
2. **Ajouter des statistiques** ? `GerantViewConnected.tsx`
3. **Personnaliser le workflow** ? Modifier les états dans `types.ts`
4. **Ajouter des fonctionnalités** ? Étendre `api.service.ts`

---

## ?? Support

Pour toute question ou amélioration, consultez la documentation du backend ou créez une issue sur GitHub.

---

**Développé avec ?? pour une expérience restaurant moderne et complète**
