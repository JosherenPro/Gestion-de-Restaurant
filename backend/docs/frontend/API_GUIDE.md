# Restaurant API - Guide pour l'Equipe Frontend

Bienvenue ! Ce document detaille comment interagir avec l'API du projet restaurant.

## Informations Generales
- **Documentation Interactive (Swagger)** : `http://localhost:8000/docs`
- **Base URL** : `http://localhost:8000`
- **Format** : Toutes les requetes et reponses utilisent le format **JSON**.

---

## Authentification & Roles
L'API utilise des tokens **JWT** porteurs (Bearer Tokens).

### 1. Obtenir un Token
- **POST** `/auth/token`
- **Corps (Form-data)** : `username` (email), `password`
- **Reponse** : `{"access_token": "...", "token_type": "bearer"}`

### 2. Verification de l'Email
Suite a l'inscription, un lien est envoye par mail.
- **GET** `/auth/verify?token=XYZ`
- **Expirabilite** : Le lien expire apres **24 heures**.
- **Note** : Le login est bloque (Erreur 403) tant que cette etape n'est pas effectuee.

### 3. Utilisation
Ajoutez le header suivant a toutes vos requetes protegees :
`Authorization: Bearer <votre_token>`

### 3. Hierarchie des Roles
- `gerant` : Acces total (Stats, Menu, Personnel).
- `serveur` : Gere les tables et valide les etapes de commande.
- `cuisinier` : Prepare les commandes.
- `client` : Passe des commandes et laisse des avis.

---

## Catalogue (Menu)
Elements accessibles pour l'affichage de la carte.

- **GET** `/categories/` : Liste des categories.
- **GET** `/plats/` : Liste de tous les plats.
- **POST** `/plats/` (Gerant uniquement) : Creer un plat.
- **POST** `/plats/{id}/image` : Uploader/Changer la photo d'un plat (Multipart/form-data).

---

## Systeme de Commande (Workflow)
C'est le coeur de l'application. Voici le flux nominal :

1. **Creation** : `POST /commandes/` (Donne un `commande_id`).
2. **Ajout de Plats** : `POST /commandes/{id}/lignes` (Repetez pour chaque plat).
3. **Validation Serveur** : `POST /commandes/{id}/valider?serveur_id=X`.
4. **Cuisine** : `POST /commandes/{id}/preparer` (Statut -> `EN_COURS`).
5. **Prete** : `POST /commandes/{id}/prete?cuisinier_id=Y` (Statut -> `PRETE`).
6. **Servie** : `POST /commandes/{id}/servir` (Statut -> `SERVIE`).
7. **Paiement** : `POST /commandes/{id}/payee?methode=especes`.

---

## Tables & QR Codes
- **GET** `/tables/qr/{qr_code}` : Recupere les infos d'une table a partir d'un scan.
- **Statuts** : `LIBRE`, `OCCUPEE`, `RESERVEE`.

---

## Reservations
- **POST** `/reservations/` : Creer une reservation.
  - *Validation* : Le systeme verifie automatiquement une fenetre de 2h pour la table.
- **GET** `/reservations/disponibilite/?table_id=1&date_reservation=...` : Utile pour le calendrier.

---

## Statistiques (Dashboard Gerant)
Endpoints proteges (Role `gerant` requis) :
- **GET** `/stats/global` : Revenus, NB commandes, Note moyenne.
- **GET** `/stats/top-plats` : Top 5 des plats les plus vendus.
- **GET** `/stats/dashboard` : Vue combinee pour le tableau de bord.

---

## Avis & Commentaires
- **POST** `/avis/` : Laisser un avis.
  - *Regle* : `commande_id` doit être payee (`PAYEE`) et un seul avis par commande.

---

## Conseils de Developpement
1. **Erreurs** : L'API renvoie des codes `400` (Erreur metier), `401` (Non authentifie), `403` (Action interdite). Lisez le champ `detail` pour le message d'erreur.
2. **Dates** : Utilisez le format ISO-8601 (ex: `2025-12-30T16:00:00Z`).
3. **Synchronisation** : Lorsqu'une commande est marquee `PAYEE`, l'API met a jour automatiquement toutes les lignes internes.
