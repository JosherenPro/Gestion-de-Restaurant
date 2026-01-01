# Specifications Techniques des Schemas (Data Formats)

L'API utilise une structure standard pour tous les modeles afin de faciliter le travail du Frontend. Voici les objets principaux et leurs types de donnees.

## Patron de Structure (Pattern)
Chaque entite suit generalement ce triptyque :
- **SchemaCreate** : Ce que vous envoyez pour creer (POST).
- **SchemaRead** : Ce que vous recevez (contient l'ID et les dates).
- **SchemaUpdate** : Ce que vous envoyez pour modifier (PUT/PATCH, tous les champs sont optionnels).

---

## Utilisateurs & Auth
### Objet `Utilisateur` (JWT)
**POST /auth/token**
- **In** : `username` (string), `password` (string).
- **Out** : `{"access_token": "string", "token_type": "bearer"}`

---

## Menu & Catalogue
### Objet `Plat`
**POST /plats/** (Input)
```json
{
  "nom": "string",
  "description": "string (optional)",
  "prix": "integer (en centimes, ex: 1500 pour 15.00€)",
  "categorie_id": "integer",
  "disponible": "boolean (default: true)",
  "temps_preparation": "integer (minutes, optional)"
}
```
**GET /plats/1** (Output)
```json
{
  "id": 1,
  "nom": "string",
  "prix": 1500,
  "categorie_id": 2,
  "disponible": true,
  "image_url": "string (ex: /static/uploads/plats/abc.jpg) | null"
}
```

**UPLOAD IMAGE : POST /plats/{id}/image**
- **Content-Type** : `multipart/form-data`
- **Body** : champ `file` (Binary Image)
- **Action** : L'API renomme le fichier, le stocke, supprime l'ancienne photo et met à jour l'URL en BD automatically.

---

## Commandes
### Objet `Commande`
**POST /commandes/** (Input)
```json
{
  "client_id": 1,
  "table_id": 1,
  "type_commande": "SUR_PLACE | A_EMPORTER",
  "montant_total": 0,
  "notes": "string (optional)"
}
```

### Objet `LigneCommande` (Les articles de la commande)
**POST /commandes/{id}/lignes** (Input)
```json
{
  "commande_id": 1,
  "plat_id": 2,
  "quantite": 1,
  "prix_unitaire": 1500,
  "notes_speciales": "string (optional)"
}
```

---

## Tables & Reservations
### Objet `Reservation`
**POST /reservations/** (Input)
```json
{
  "client_id": 1,
  "table_id": 2,
  "date_reservation": "2025-12-30T19:00:00Z",
  "nb_personnes": 4,
  "commentaire": "string (optional)"
}
```

---

## Resume des 82 Routes
Chaque module (Clients, Personnel, Plats, Categories, Menus, Tables, Commandes, Lignes, Paiements, Reservations, Avis, Utilisateurs) possede :
1. **GET /** : Lister (pagination possible).
2. **GET /{id}** : Detail d'un element.
3. **POST /** : Creation.
4. **PUT /{id}** : Modification complete.
5. **DELETE /{id}** : Suppression.

*Note : Les routes specifiques (ex: /confirm, /payee, /stats) s'ajoutent a ce socle CRUD.*
