# Guide de Déploiement Complet - RestoManager Pro

Ce guide détaille toutes les étapes pour déployer l'application complète (Base de données + Backend + Frontend) sur **Render**.

---

## ??? Architecture du Déploiement

1.  **Base de Données** : PostgreSQL (Hébergé sur Render)
2.  **Backend** : API Python FastAPI (Hébergé sur Render Web Service)
3.  **Frontend** : Application React Vite (Hébergé sur Render Static Site)

---

## Etape 1 : Préparation du code

Assurez-vous que votre code est poussé sur votre dépôt GitHub (`main` branch).

---

## Etape 2 : Créer la Base de Données

1.  Connectez-vous à votre tableau de bord [Render](https://dashboard.render.com/).
2.  Cliquez sur **New +** -> **PostgreSQL**.
3.  Remplissez les informations :
    *   **Name** : `restomanager-db`
    *   **Region** : Choisissez la plus proche de vous (ex: Frankfurt).
    *   **PostgreSQL Version** : 15 ou 16.
    *   **Plan** : Free (pour tester) ou Starter.
4.  Cliquez sur **Create Database**.
5.  Une fois créée, notez l'url **Internal Database URL** (pour la liaison interne) et **External Database URL** (si vous voulez vous y connecter depuis votre PC).

---

## Etape 3 : Déployer le Backend

### Méthode Recommandée : Utiliser le fichier `render.yaml` (Blueprints)
Votre projet contient déjà un fichier `render.yaml` qui automatise la configuration.

1.  Sur Render, allez dans **Blueprints**.
2.  Cliquez sur **New Blueprint Instance**.
3.  Connectez votre dépôt GitHub.
4.  Render va détecter le fichier `render.yaml`.
5.  Il vous demandera peut-être de valider les variables d'environnement.
    *   **DATABASE_URL** : Collez l'**Internal Database URL** de l'étape 2.
6.  Cliquez sur **Apply**. Render va construire et déployer l'API.

### Méthode Manuelle (Web Service)
Si la méthode Blueprint ne fonctionne pas comme vous voulez :

1.  **New +** -> **Web Service**.
2.  Connectez votre dépôt GitHub.
3.  **Name** : `restaurant-api`
4.  **Root Directory** : `.` (laisser vide ou mettre `.`)
5.  **Environment** : `Python 3`
6.  **Build Command** : `pip install -r backend/requirements.txt`
7.  **Start Command** : `cd backend && alembic upgrade head && gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`
8.  **Environment Variables** (Ajoutez les clés suivantes) :
    *   `DATABASE_URL` : (L'URL interne de votre DB créée à l'étape 2)
    *   `SECRET_KEY` : (Générez une chaîne aléatoire complexe)
    *   `ALGORITHM` : `HS256`
    *   `ACCESS_TOKEN_EXPIRE_MINUTES` : `60`
    *   `FRONTEND_URL` : (Vous mettrez l'URL du frontend une fois déployé, ex: `https://mon-resto.onrender.com`)
    *   *(Optionnel)* Configuration Email (`MAIL_USERNAME`, `MAIL_PASSWORD`, etc.)

Attendez que le déploiement soit "Live". L'URL de votre backend ressemblera à `https://restaurant-api-xxxx.onrender.com`.

---

## Etape 4 : Déployer le Frontend

1.  Sur Render, cliquez sur **New +** -> **Static Site**.
2.  Connectez votre dépôt GitHub.
3.  **Name** : `restomanager-front`
4.  **Root Directory** : `Frontend` (Important ! C'est le dossier où se trouve votre React)
5.  **Build Command** : `npm install && npm run build`
6.  **Publish Directory** : `dist` (C'est le dossier créé par Vite)
7.  **Environment Variables** :
    *   `VITE_API_URL` : Copiez l'URL de votre Backend déployé à l'étape 3 (ex: `https://restaurant-api-xxxx.onrender.com`).
    *   *(Important)* Ne mettez pas de slash `/` à la fin de l'URL.
8.  Cliquez sur **Create Static Site**.

---

## Etape 5 : Finalisation et Liaison

1.  Une fois le Frontend déployé, copiez son URL (ex: `https://restomanager-front.onrender.com`).
2.  Retournez dans la configuration de votre **Backend** (Environment Variables).
3.  Modifiez ou ajoutez la variable `FRONTEND_URL` avec l'URL de votre Frontend.
4.  Sauvegardez. Le backend va redémarrer.

---

## Etape 6 : Création du Premier Compte Gérant

Puisque la base de données est vide en ligne, vous devez créer votre utilisateur admin.

1.  Ouvrez le **Shell** de votre service Backend sur Render (onglet "Shell" dans le dashboard du service API).
2.  Exécutez la commande suivante :
    ```bash
    cd backend
    python scripts/create_manager.py "Admin" "System" "admin@restaurant.com" "0123456789" "SuperPassword123!"
    ```
    *(Remplacez l'email et le mot de passe par vos identifiants souhaités)*

3.  Connectez-vous sur votre Frontend en ligne avec ces identifiants !

## ? Terminé !
Votre application est maintenant 100% opérationnelle en ligne.
