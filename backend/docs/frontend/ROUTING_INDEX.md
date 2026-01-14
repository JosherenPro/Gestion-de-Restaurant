# Index des Routes API (Restaurant)

Ce document liste l'ensemble des points d'accès (endpoints) de l'application et leurs fonctions.

## Authentification (`/auth`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| POST | `/auth/token` | Connexion utilisateur (Recupere un token JWT). |
| GET | `/auth/verify` | Confirmer l'inscription (Token expire apres 24h). |

## Utilisateurs & Profils (`/utilisateurs`, `/clients`, `/personnel`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| POST | `/clients/register` | Inscription publique pour les clients. |
| GET | `/clients/` | Liste tous les clients (Staff seul). |
| DELETE | `/clients/{id}` | Supprime un client ET son compte utilisateur. |
| POST | `/personnel/register/gerants` | Creer un gerant (Manager seul). |
| POST | `/personnel/register/serveurs` | Creer un serveur (Manager seul). |
| POST | `/personnel/register/cuisiniers` | Creer un cuisinier (Manager seul). |
| GET | `/personnel/` | Liste tout le personnel (Manager seul). |

## Gestion des Tables (`/tables`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| GET | `/tables/` | Liste toutes les tables. |
| POST | `/tables/` | Creer une nouvelle table (Manager). |
| GET | `/tables/qr/{qr_code}` | Scanner une table via son code QR. |
| POST | `/tables/{id}/occuper` | Marquer une table comme occupee. |
| POST | `/tables/{id}/liberer` | Marquer une table comme libre. |

## Menu & Catalogue (`/plats`, `/categories`, `/menus`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| GET | `/plats/` | Liste tous les plats. |
| POST | `/plats/` | Ajouter un plat (Manager). |
| POST | `/plats/{id}/image` | Uploader l'image d'un plat (Manager). |
| GET | `/categories/` | Liste les categories (Entrées, Plats, Desserts). |
| POST | `/categories/` | Ajouter une categorie (Manager). |
| GET | `/menus/` | Liste les menus/formules. |

## Commandes & Workflow (`/commandes`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| POST | `/commandes/` | Creer une commande (Statut: `en_attente`). |
| POST | `/commandes/{id}/lignes` | Ajouter un plat a la commande. |
| POST | `/commandes/{id}/valider` | Validation par le serveur (Statut: `approuvee`). |
| POST | `/commandes/{id}/preparer` | Envoi en cuisine (Statut: `en_cours`). |
| POST | `/commandes/{id}/prete` | Marque pret par la cuisine (Statut: `prete`). |
| POST | `/commandes/{id}/servir` | Livre a la table (Statut: `servie`). |
| POST | `/commandes/{id}/payee` | Reglement par le client (Statut: `payee`). |

## Reservations (`/reservations`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| POST | `/reservations/` | Creer une reservation (Verification 2h auto). |
| GET | `/reservations/disponibilite/` | Verifier si une table est libre a une date donnee. |
| POST | `/reservations/{id}/confirmer` | Confirmer une reservation par le staff. |
| POST | `/reservations/{id}/annuler` | Annuler une reservation. |

## Paiement (`/paiements`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| GET | `/paiements/addition/{id}` | Calculer le total a payer pour une commande. |
| POST | `/paiements/process` | Traiter un paiement complexe (Transactions). |

## Avis & Feedback (`/avis`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| POST | `/avis/` | Laisser une note et un commentaire (Condition: Commande payee). |
| GET | `/avis/` | Voir tous les avis publics. |

## Statistiques & Dashboard (`/stats`)
| Methode | Route | Description |
| :--- | :--- | :--- |
| GET | `/stats/global` | Chiffre d'affaires, NB Commandes, Note moyenne. |
| GET | `/stats/top-plats` | Les 5 plats les plus vendus. |
| GET | `/stats/dashboard` | Vue complete pour l'interface Manager. |
