# Credentials de Test - Restaurant Management System

⚠️ **ATTENTION : Ne jamais commiter ce fichier avec de vraies credentials !**

## Utilisateurs de Test

Pour le développement local, créez ces utilisateurs avec les scripts fournis:

### Gérant
- Email: `gerant@resto.com`
- Mot de passe: `[À CONFIGURER LOCALEMENT]`
- Rôle: gerant

### Serveur
- Email: `serveur@resto.com`
- Mot de passe: `[À CONFIGURER LOCALEMENT]`
- Rôle: serveur

### Cuisinier
- Email: `cuisinier@resto.com`
- Mot de passe: `[À CONFIGURER LOCALEMENT]`
- Rôle: cuisinier

### Clients
- Email: `client@resto.com` ou `client2@resto.com`
- Mot de passe: `[À CONFIGURER LOCALEMENT]`
- Rôle: client

## Comment créer les utilisateurs de test

1. Modifiez le fichier `backend/scripts/create_test_users.py` localement (NON COMMITÉ)
2. Définissez vos propres mots de passe de test
3. Exécutez: `python backend/scripts/create_test_users.py`

**Note**: Les mots de passe sont hashés dans la base de données, jamais stockés en clair.

## Variables d'environnement

Copiez `.env.example` vers `.env` et configurez:
```
SECRET_KEY=votre_clé_secrète_locale
DATABASE_URL=sqlite:///./restaurant.db
```
