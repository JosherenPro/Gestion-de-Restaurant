import sys
import os
import uuid
import random

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

# Initialisation du client
client = TestClient(app)

def test_duplicate_user_creation():
    print("\n--- Démarrage du test de duplication d'utilisateur ---")

    # Générer des données uniques pour le premier utilisateur
    unique_suffix = str(uuid.uuid4())[:8]
    email = f"test.{unique_suffix}@example.com"
    phone = "".join([str(random.randint(0, 9)) for _ in range(10)])

    user_data = {
        "nom": "Test",
        "prenom": "User",
        "email": email,
        "telephone": phone,
        "role": "client",
        "password": "SecurePassword123!"
    }

    # 1. Création du premier utilisateur
    print(f"1. Création du premier utilisateur avec email: {email} et tel: {phone}")
    response = client.post("/utilisateurs/", json=user_data)
    assert response.status_code == 200, f"Erreur creation 1: {response.text}"
    print("-> Premier utilisateur créé.")

    # 2. Tentative de création avec le même email
    print(f"2. Tentative de création avec le même email: {email}")
    user_data_duplicate_email = user_data.copy()
    user_data_duplicate_email["telephone"] = "".join([str(random.randint(0, 9)) for _ in range(10)]) 
    response = client.post("/utilisateurs/", json=user_data_duplicate_email)
    assert response.status_code == 400
    assert "email est déjà utilisé" in response.json()["detail"]
    print("-> Échec attendu pour l'email en double confirmé.")

    # 3. Tentative de création avec le même téléphone
    print(f"3. Tentative de création avec le même téléphone: {phone}")
    user_data_duplicate_phone = user_data.copy()
    user_data_duplicate_phone["email"] = f"other.{unique_suffix}@example.com"
    response = client.post("/utilisateurs/", json=user_data_duplicate_phone)
    assert response.status_code == 400
    assert "numéro de téléphone est déjà utilisé" in response.json()["detail"]
    print("-> Échec attendu pour le téléphone en double confirmé.")

    print("\n--- SUCCÈS : La prévention des doublons fonctionne ! ---")

if __name__ == "__main__":
    try:
        test_duplicate_user_creation()
    except Exception as e:
        print(f"\nERREUR: {e}")
        sys.exit(1)
