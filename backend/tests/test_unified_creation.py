import sys
import os
import uuid

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

# Initialisation du client
client = TestClient(app)

def test_unified_client_registration():
    print("\n--- Test de l'enregistrement unifié d'un client ---")
    unique_id = str(uuid.uuid4())[:8]
    email = f"client.{unique_id}@example.com"
    
    data = {
        "nom": "Client",
        "prenom": "Test",
        "email": email,
        "telephone": f"06{str(uuid.uuid4().int)[:8]}",
        "role": "client",
        "password": "Password123!"
    }
    
    response = client.post("/clients/register", json=data)
    assert response.status_code == 200
    res_data = response.json()
    assert "id" in res_data
    assert "utilisateur_id" in res_data
    print(f"-> Client enregistré avec succès: ID {res_data['id']}, User ID {res_data['utilisateur_id']}")

def test_unified_gerant_registration():
    print("\n--- Test de l'enregistrement unifié d'un gérant ---")
    unique_id = str(uuid.uuid4())[:8]
    email = f"gerant.{unique_id}@example.com"
    
    data = {
        "nom": "Gerant",
        "prenom": "Test",
        "email": email,
        "telephone": f"07{str(uuid.uuid4().int)[:8]}",
        "role": "gerant",
        "password": "Password123!"
    }
    
    response = client.post("/personnel/register/gerants", json=data)
    assert response.status_code == 200
    res_data = response.json()
    assert "id" in res_data
    assert "personnel_id" in res_data
    print(f"-> Gérant enregistré avec succès: ID {res_data['id']}, Personnel ID {res_data['personnel_id']}")

def test_unified_duplicate_prevention():
    print("\n--- Test de la prévention des doublons via /register ---")
    unique_id = str(uuid.uuid4())[:8]
    email = f"dup.{unique_id}@example.com"
    phone = f"08{str(uuid.uuid4().int)[:8]}"
    
    data = {
        "nom": "Dup",
        "prenom": "Test",
        "email": email,
        "telephone": phone,
        "role": "client",
        "password": "Password123!"
    }
    
    # Premier enregistrement
    client.post("/clients/register", json=data)
    
    # Deuxième enregistrement (même email)
    response = client.post("/clients/register", json=data)
    assert response.status_code == 400
    assert "email est déjà utilisé" in response.json()["detail"]
    print("-> Prévention des doublons confirmée via endpoint unifié.")

if __name__ == "__main__":
    try:
        test_unified_client_registration()
        test_unified_gerant_registration()
        test_unified_duplicate_prevention()
        print("\n--- TOUS LES TESTS UNIFIÉS ONT RÉUSSI ---")
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
