import sys
import os

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

# Initialisation du client
client = TestClient(app)

def test_auth_flow():
    print("--- Démarrage du test de flux d'authentification ---")

    # 1. Création d'un utilisateur de test
    email = "test.auth@example.com"
    password = "SecurePassword123!"
    user_data = {
        "nom": "Test",
        "prenom": "User",
        "email": email,
        "telephone": "0102030405",
        "role": "client",
        "password": password
    }

    print(f"1. Tentative de création de l'utilisateur {email}...")
    response = client.post("/utilisateurs/", json=user_data)
    
    if response.status_code not in [200, 201]:
        print(f"ERREUR: Création échouée. Code: {response.status_code}")
        print(response.json())
        # Si l'utilisateur existe déjà, on continue pour tester le login
        if response.status_code != 400: 
            sys.exit(1)
        print("(L'utilisateur existe probablement déjà, tentative de connexion directe)")
    else:
        print("-> Utilisateur créé avec succès.")

    # 2. Login pour obtenir le token
    print("\n2. Tentative de connexion (récupération du token)...")
    login_data = {
        "username": email,
        "password": password
    }
    # OAuth2PasswordRequestForm attend du form-data, pas du JSON
    response = client.post("/auth/token", data=login_data)

    if response.status_code != 200:
        print(f"ERREUR: Connexion échouée. Code: {response.status_code}")
        print(response.json())
        sys.exit(1)
    
    token_data = response.json()
    access_token = token_data.get("access_token")
    if not access_token:
        print("ERREUR: Pas de 'access_token' dans la réponse.")
        print(token_data)
        sys.exit(1)
    
    print("-> Token récupéré avec succès.")
    print(f"   Token: {access_token[:20]}...")

    # 3. (Optionnel) Ici on pourrait tester une route protégée si elle existait.
    # Pour l'instant, le fait d'avoir le token prouve que authentificate_user marche.
    
    print("\n--- SUCCÈS : Le flux d'authentification fonctionne correctement ! ---")

if __name__ == "__main__":
    try:
        test_auth_flow()
    except Exception as e:
        print(f"\nERREUR FATALE: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
