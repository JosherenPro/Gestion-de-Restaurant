# ?? Guide de Démarrage Rapide - Frontend ? Backend

Ce guide vous aidera à connecter rapidement le frontend React au backend FastAPI.

## ? Démarrage en 5 minutes

### Étape 1 : Démarrer le Backend

```bash
# Dans un terminal
cd backend
python -m uvicorn app.main:app --reload
```

? Le backend sera accessible sur : `http://localhost:8000`  
?? Documentation API : `http://localhost:8000/docs`

### Étape 2 : Configurer le Frontend

```bash
# Dans un nouveau terminal
cd Frontend

# Créer le fichier .env
echo "VITE_API_URL=http://localhost:8000" > .env

# Installer les dépendances
npm install
```

### Étape 3 : Démarrer le Frontend

```bash
npm run dev
```

? Le frontend sera accessible sur : `http://localhost:3000`

## ?? Tester la Connexion

### Test 1 : Vérifier l'API Backend

Ouvrez votre navigateur et allez sur : `http://localhost:8000/docs`

Vous devriez voir la documentation Swagger de l'API.

### Test 2 : Tester un Endpoint

Dans la console du navigateur (F12) :

```javascript
fetch('http://localhost:8000/categories/')
  .then(res => res.json())
  .then(data => console.log('Catégories:', data))
```

### Test 3 : Utiliser l'Application

1. Ouvrez `http://localhost:3000`
2. Cliquez sur le sélecteur de rôle en bas à droite
3. Sélectionnez "Client (Mobile)"
4. Cliquez sur "Commander maintenant"
5. Vous devriez voir les plats du backend !

## ?? Utiliser la Version Connectée

Par défaut, l'application utilise des données mock. Pour utiliser le backend :

### Option 1 : Remplacer dans App.tsx

Éditez `Frontend/App.tsx` :

```typescript
// Ligne 3 : Remplacez
import { ClientView } from './components/ClientView';

// Par
import { ClientView } from './components/ClientViewConnected';
```

### Option 2 : Renommer les fichiers

```bash
cd Frontend/components

# Sauvegarder l'ancien
mv ClientView.tsx ClientViewMock.tsx

# Utiliser la version connectée
mv ClientViewConnected.tsx ClientView.tsx
```

## ?? Données de Test

### Créer des données de test

Le backend a des scripts pour créer des données :

```bash
cd backend

# Créer un gérant
python scripts/create_manager.py

# Ou via l'API (voir backend/tests/)
python tests/test_menu_mgmt.py
```

### Données minimales pour tester

Pour tester l'application, vous avez besoin de :

1. **Catégories** - Créées via `/categories/`
2. **Plats** - Créés via `/plats/`
3. **Tables** - Créées via `/tables/`
4. **Client** - Inscrit via `/clients/register`

### Script de test rapide

```bash
# Dans le dossier backend
python -c "
from app.core.database import engine
from sqlmodel import Session, select
from app.models.categorie import Categorie
from app.models.plat import Plat
from app.models.table import Table

with Session(engine) as session:
    # Créer une catégorie
    cat = Categorie(nom='Burgers', description='Nos burgers')
    session.add(cat)
    session.commit()
    session.refresh(cat)
    
    # Créer un plat
    plat = Plat(
        nom='Burger Classic',
        description='Un délicieux burger',
        prix=1200,  # 12.00€ en centimes
        categorie_id=cat.id,
        disponible=True
    )
    session.add(plat)
    
    # Créer une table
    table = Table(
        numero_table='T1',
        capacite=4,
        statut='LIBRE',
        qr_code='QR-T1'
    )
    session.add(table)
    session.commit()
    print('? Données de test créées !')
"
```

## ?? Résolution de Problèmes

### Problème 1 : CORS Error

**Symptôme** : Erreur dans la console : `Access to fetch has been blocked by CORS policy`

**Solution** : Le backend doit autoriser votre frontend. Vérifiez `backend/app/main.py` :

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problème 2 : Backend non accessible

**Symptôme** : `Failed to fetch` ou `ERR_CONNECTION_REFUSED`

**Solutions** :
1. Vérifiez que le backend est démarré
2. Vérifiez l'URL dans `.env` : `VITE_API_URL=http://localhost:8000`
3. Testez directement : `curl http://localhost:8000/categories/`

### Problème 3 : Aucun plat affiché

**Solutions** :
1. Vérifiez que des plats existent dans la base de données
2. Consultez la console du navigateur (F12) pour les erreurs
3. Vérifiez les requêtes dans l'onglet Network

### Problème 4 : 401 Unauthorized

**Symptôme** : Certaines actions retournent une erreur 401

**Solution** : Certains endpoints nécessitent une authentification. Vous devez :
1. Créer un compte
2. Vous connecter
3. Le token sera automatiquement ajouté aux requêtes

## ?? Flux Utilisateur Complet

### Scénario 1 : Client passe une commande

```
1. Ouvrir l'application
2. Vue "HOME" ? Cliquer "Commander maintenant"
3. Vue "MENU" ? Parcourir les catégories
4. Ajouter des plats au panier
5. Cliquer sur le panier ? Voir le panier
6. "Commander maintenant" ? Crée la commande dans le backend
7. Vue "TRACKING" ? Voir le statut en temps réel
```

### Scénario 2 : Gérant consulte les stats

```
1. Se connecter en tant que gérant
2. Sélectionner le rôle "Dashboard Gérant"
3. Voir les statistiques chargées depuis le backend :
   - Chiffre d'affaires
   - Nombre de commandes
   - Note moyenne
   - Top des plats
```

## ?? Personnalisation

### Changer l'URL du Backend

```env
# .env
VITE_API_URL=http://votre-api.com
```

### Ajouter un nouveau Endpoint

1. Ajouter l'endpoint dans `config/api.config.ts`
2. Ajouter la méthode dans `services/api.service.ts`
3. Créer un hook si nécessaire dans `hooks/useApi.ts`

Exemple :

```typescript
// config/api.config.ts
MENUSDU_JOUR: '/menus-du-jour'

// services/api.service.ts
async getMenusDuJour(token?: string): Promise<any[]> {
  return this.get(API_CONFIG.ENDPOINTS.MENUSDU_JOUR, { token });
}

// hooks/useApi.ts
export const useMenusDuJour = () => {
  const [menus, setMenus] = useState([]);
  // ... logique de chargement
  return { menus };
}
```

## ?? Ressources Supplémentaires

- **Guide complet** : [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
- **API Backend** : [backend/docs/frontend/API_GUIDE.md](../backend/docs/frontend/API_GUIDE.md)
- **Types de données** : [backend/docs/frontend/DATA_FORMATS.md](../backend/docs/frontend/DATA_FORMATS.md)

## ? Checklist de Vérification

Avant de continuer le développement, assurez-vous que :

- [ ] Le backend démarre sans erreur
- [ ] Le frontend démarre sans erreur
- [ ] L'API répond aux requêtes (testez `/categories/`)
- [ ] La vue client affiche les plats du backend
- [ ] Vous pouvez créer une commande
- [ ] Les données sont enregistrées dans la base de données

## ?? Prochaines Étapes

1. **Connecter les autres vues** :
   - ServerView ? Gérer les commandes réelles
   - ChefView ? Voir les commandes en préparation
   - AdminView ? Afficher les vraies statistiques

2. **Ajouter l'authentification complète** :
   - Page de login
   - Inscription
   - Gestion des tokens
   - Redirection selon le rôle

3. **Améliorer l'UX** :
   - Notifications en temps réel
   - Rafraîchissement automatique
   - Gestion des erreurs
   - Loading states

4. **Tests** :
   - Tests unitaires des composants
   - Tests d'intégration avec le backend
   - Tests end-to-end

---

**Besoin d'aide ?** Consultez la documentation ou créez une issue sur GitHub !
