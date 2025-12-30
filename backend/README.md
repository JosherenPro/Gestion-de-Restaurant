# Restaurant Management System API

Une API robuste et performante pour la gestion complète d'un restaurant, construite avec **FastAPI**, **SQLModel** et **PostgreSQL**.

## Fonctionnalités Clés

- **Gestion du Cycle de Vie des Commandes** : Du scan QR Code initial au paiement final, avec suivi en temps réel (Cuisine, Service).
- **Contrôle d'Accès Basé sur les Rôles (RBAC)** : Sécurité granulaire pour les Gérants (Admins), Serveurs, Cuisiniers et Clients.
- **Tableau de Bord & Statistiques** : Calcul automatique du CA, suivi des plats les plus populaires et indicateurs de performance.
- **Réservations Intelligentes** : Système de vérification de disponibilité automatique (fenêtre de 2h).
- **Système d'Avis Vérifiés** : Seuls les clients ayant payé une commande peuvent laisser un feedback.
- **Administration Système** : Gestion des comptes utilisateurs (activation/blocage) et vue d'ensemble du système.

## Stack Technique

- **Framework** : [FastAPI](https://fastapi.tiangolo.com/)
- **ORM** : [SQLModel](https://sqlmodel.tiangolo.com/) (Pydantic + SQLAlchemy)
- **Base de Données** : PostgreSQL
- **Authentification** : JWT (JSON Web Tokens) avec Argon2 pour le hachage des mots de passe.
- **Validation** : Pydantic v2

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone <repository-url>
   cd projet_restaurant/backend
   ```

2. **Configurer l'environnement**
   Créez un fichier `.env` à la racine du dossier `backend` :
   ```env
   SECRET_KEY=votre_cle_secrete_tres_longue
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   DATABASE_URL=postgresql://user:password@localhost/dbname
   DEBUG=True
   ```

3. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialiser la base de données**
   ```bash
   python scripts/reset_db.py
   python scripts/create_manager.py "Admin" "System" "admin@restaurant.com" "0123456789" "password123"
   ```

### Configuration de l'Email (SMTP)
Pour activer l'envoi réel des emails de confirmation, configurez les variables suivantes dans le fichier `.env` :
- `MAIL_USERNAME` : Votre email.
- `MAIL_PASSWORD` : Votre mot de passe d'application.
- `MAIL_SERVER` : Hôte SMTP (ex: `smtp.gmail.com`).
- `MAIL_PORT` : Port (ex: `587`).

> [!NOTE]
> Si non configuré, l'API affichera les liens de validation dans la console pour faciliter le développement.

### Lancer le serveur
Puis lancez le serveur :
de développement :
```bash
fastapi dev app/main.py
```

Accédez à la documentation interactive :
- **Swagger UI** : [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redoc** : [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Documentation pour le Frontend

Des guides détaillés sont disponibles dans le dossier `docs/frontend/` :
- [Guide d'Architecture & Workflow](docs/frontend/API_GUIDE.md)
- [Index des 82 Routes](docs/frontend/ROUTING_INDEX.md)
- [Spécifications des Formats de Données](docs/frontend/DATA_FORMATS.md)

## Tests

Exécutez la suite de tests avec pytest :
```bash
pytest
```
Ou lancez les tests d'intégration spécifiques :
```bash
python tests/test_full_lifecycle.py
python tests/test_rbac.py
```

## Sécurité

L'accès aux ressources est protégé par des dépendances FastAPI injectées à chaque route.
- Les endpoints sensibles (`/stats`, `/admin`, `/personnel`) requièrent le rôle `gerant`.
- Les actions de service (`/preparer`, `/servir`) requièrent les rôles correspondants.
