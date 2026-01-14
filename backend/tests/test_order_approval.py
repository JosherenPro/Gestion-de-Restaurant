import sys
import os
import uuid

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

# Initialisation du client
client = TestClient(app)

def test_order_approval_flow():
    print("\n--- Test du flux d'approbation des commandes ---")
    unique_id = str(uuid.uuid4())[:8]
    
    # 1. Créer un client
    print("1. Création d'un client...")
    client_res = client.post("/clients/register", json={
        "nom": "Client", "prenom": "Order", "email": f"c.{unique_id}@ex.com",
        "telephone": f"01{unique_id}", "role": "client", "password": "pass"
    })
    assert client_res.status_code == 200
    client_id = client_res.json()["id"]

    # 2. Créer un serveur
    print("2. Création d'un serveur...")
    serveur_res = client.post("/personnel/register/serveurs", json={
        "nom": "Serveur", "prenom": "Validate", "email": f"s.{unique_id}@ex.com",
        "telephone": f"02{unique_id}", "role": "serveur", "password": "pass"
    })
    assert serveur_res.status_code == 200
    serveur_id = serveur_res.json()["id"]

    # 3. Créer une table
    print("3. Création d'une table...")
    table_res = client.post("/tables/", json={
        "numero_table": f"T-{unique_id}", "capacite": 4
    })
    assert table_res.status_code == 200
    table_id = table_res.json()["id"]

    # 4. Passer une commande
    print("4. Le client passe une commande...")
    commande_data = {
        "client_id": client_id,
        "table_id": table_id,
        "montant_total": 50,
        "type_commande": "sur_place",
        "notes": "Test approval"
    }
    order_res = client.post("/commandes/", json=commande_data)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["status"] == "en_attente"
    order_id = order_data["id"]
    print(f"-> Commande {order_id} créée avec le statut: {order_data['status']}")

    # 5. Le serveur valide la commande
    print(f"5. Le serveur {serveur_id} valide la commande {order_id}...")
    validate_res = client.post(f"/commandes/{order_id}/valider?serveur_id={serveur_id}")
    assert validate_res.status_code == 200
    final_data = validate_res.json()
    assert final_data["status"] == "approuvee"
    assert final_data["serveur_id"] == serveur_id
    print(f"-> Commande {order_id} approuvée avec succès!")

    print("\n--- SUCCÈS : Le flux d'approbation est opérationnel ! ---")

if __name__ == "__main__":
    try:
        test_order_approval_flow()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
