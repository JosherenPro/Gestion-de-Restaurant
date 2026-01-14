# ?? Guide de Test Complet - Frontend ? Backend

## ?? Étape 1 : Démarrer le Backend

**Terminal 1 (PowerShell) :**
```powershell
cd backend
python -m uvicorn app.main:app --reload
```

**? Vérification :**
- Ouvrir http://localhost:8000/docs
- Vous devriez voir la documentation Swagger

---

## ?? Étape 2 : Démarrer le Frontend

**Terminal 2 (PowerShell) :**
```powershell
cd Frontend
npm install
npm run dev
```

**? Vérification :**
- Ouvrir http://localhost:3000
- L'application s'affiche

---

## ?? Étape 3 : Activer la Vue Connectée

**Modifier `Frontend/App.tsx` ligne 3 :**
```typescript
// AVANT
import { ClientView } from './components/ClientView';

// APRÈS
import { ClientView } from './components/ClientViewConnected';
```

**Sauvegarder et recharger la page (F5)**

---

## ?? Étape 4 : Créer des Données de Test

**Aller sur http://localhost:8000/docs**

### 1. Créer une Catégorie
- Trouver `POST /categories/`
- Cliquer **"Try it out"**
- Copier-coller :
```json
{
  "nom": "Burgers",
  "description": "Nos délicieux burgers"
}
```
- Cliquer **"Execute"**
- ? Vous devriez avoir un code **200** avec `"id": 1`

### 2. Créer un Plat
- Trouver `POST /plats/`
- Cliquer **"Try it out"**
- Copier-coller :
```json
{
  "nom": "Burger Classic",
  "description": "Un délicieux burger avec salade, tomate, cornichons",
  "prix": 1200,
  "categorie_id": 1,
  "disponible": true,
  "temps_preparation": 15
}
```
- Cliquer **"Execute"**
- ? Code **200** avec `"id": 1`

### 3. Créer une Deuxième Catégorie
```json
{
  "nom": "Pizzas",
  "description": "Nos pizzas maison"
}
```

### 4. Créer un Deuxième Plat
```json
{
  "nom": "Pizza Margherita",
  "description": "Sauce tomate, mozzarella, basilic",
  "prix": 1100,
  "categorie_id": 2,
  "disponible": true,
  "temps_preparation": 20
}
```

### 5. Créer une Table
- Trouver `POST /tables/`
- Cliquer **"Try it out"**
- Copier-coller :
```json
{
  "numero_table": "T1",
  "capacite": 4,
  "statut": "LIBRE",
  "qr_code": "QR-T1"
}
```
- Cliquer **"Execute"**

---

## ?? Étape 5 : Tester l'Application

### Test 1 : Voir le Menu
1. Aller sur http://localhost:3000
2. Cliquer sur **"Commander maintenant"**
3. ? Vous devriez voir vos 2 plats
4. ? Vous devriez voir les 2 catégories (Burgers, Pizzas)

### Test 2 : Passer une Commande
1. Cliquer sur le **+** à côté d'un plat
2. L'icône panier en haut affiche **1**
3. Cliquer sur l'**icône panier**
4. Voir le plat dans le panier
5. Cliquer sur **"Commander maintenant"**
6. ? Vous voyez "Commande en cours" avec le statut

### Test 3 : Vérifier dans la Base
1. Retourner sur http://localhost:8000/docs
2. Trouver `GET /commandes/`
3. Cliquer **"Try it out"** puis **"Execute"**
4. ? Vous devriez voir votre commande dans la réponse

---

## ?? Tests dans la Console du Navigateur

**Ouvrir la console (F12) et taper :**

### Test API directe
```javascript
fetch('http://localhost:8000/categories/')
  .then(res => res.json())
  .then(data => console.log('? Catégories:', data))
```

### Test des Plats
```javascript
fetch('http://localhost:8000/plats/')
  .then(res => res.json())
  .then(data => console.log('? Plats:', data))
```

---

## ?? Checklist Finale

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Swagger accessible (http://localhost:8000/docs)
- [ ] Au moins 1 catégorie créée
- [ ] Au moins 1 plat créé
- [ ] Au moins 1 table créée
- [ ] Le menu s'affiche dans l'interface
- [ ] Peut ajouter un plat au panier
- [ ] Peut créer une commande
- [ ] La commande apparaît dans `GET /commandes/`

---

## ?? Résolution de Problèmes

### ? CORS Error
**Solution :** Vérifier `backend/app/main.py` contient :
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### ? Failed to Fetch
**Solution :** Vérifier `Frontend/.env` :
```
VITE_API_URL=http://localhost:8000
```
Puis redémarrer le frontend.

### ? "Aucun plat trouvé"
**Solution :** Créer des données via l'Étape 4.

### ? 500 Internal Server Error
**Solution :** Regarder les logs du backend dans le terminal.

---

## ?? Script Rapide (Optionnel)

**Pour créer toutes les données en une fois :**

Dans le terminal du backend :
```python
python -c "
from app.core.database import engine
from sqlmodel import Session
from app.models.categorie import Categorie
from app.models.plat import Plat
from app.models.table import Table

with Session(engine) as session:
    # Catégories
    cat1 = Categorie(nom='Burgers', description='Nos burgers')
    cat2 = Categorie(nom='Pizzas', description='Nos pizzas')
    session.add_all([cat1, cat2])
    session.commit()
    session.refresh(cat1)
    session.refresh(cat2)
    
    # Plats
    plat1 = Plat(nom='Burger Classic', description='Délicieux', prix=1200, categorie_id=cat1.id, disponible=True)
    plat2 = Plat(nom='Pizza Margherita', description='Tomate, mozzarella', prix=1100, categorie_id=cat2.id, disponible=True)
    session.add_all([plat1, plat2])
    
    # Table
    table = Table(numero_table='T1', capacite=4, statut='LIBRE', qr_code='QR-T1')
    session.add(table)
    
    session.commit()
    print('? Données créées !')
"
```

---

## ?? Résultats Attendus

### Dans le Backend (Terminal 1)
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
INFO:     127.0.0.1:xxxxx - "GET /plats/ HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "POST /commandes/ HTTP/1.1" 200 OK
```

### Dans le Frontend (Terminal 2)
```
VITE v6.2.0  ready in 500 ms
?  Local:   http://localhost:3000/
```

### Dans l'Interface
- Menu avec catégories "Burgers" et "Pizzas"
- Plats affichés avec prix et description
- Panier fonctionnel
- Commande créée avec succès

---

**? Si tous les tests passent, votre intégration fonctionne parfaitement ! ??**
