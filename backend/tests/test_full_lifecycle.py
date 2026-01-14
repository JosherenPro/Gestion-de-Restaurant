import sys
import os
import uuid

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

# Initialisation du client
client = TestClient(app)

def test_full_order_lifecycle():
    print("\n--- Test du Cycle de Vie Complet de la Commande ---")
    unique_id = str(uuid.uuid4())[:8]
    
    # 1. Création des acteurs
    print("1. Création des acteurs (Client, Serveur, Cuisinier)...")
    c_res = client.post("/clients/register", json={
        "nom": "Client", "prenom": "User", "email": f"c.{unique_id}@life.com",
        "telephone": f"11{unique_id}", "role": "client", "password": "pass"
    })
    client_id = c_res.json()["id"]

    s_res = client.post("/personnel/register/serveurs", json={
        "nom": "Serveur", "prenom": "Work", "email": f"s.{unique_id}@life.com",
        "telephone": f"22{unique_id}", "role": "serveur", "password": "pass"
    })
    serveur_id = s_res.json()["id"]

    cuis_res = client.post("/personnel/register/cuisiniers", json={
        "nom": "Chef", "prenom": "Cook", "email": f"k.{unique_id}@life.com",
        "telephone": f"33{unique_id}", "role": "cuisinier", "password": "pass"
    })
    cuisinier_id = cuis_res.json()["id"]

    # 2. Création Table
    table_res = client.post("/tables/", json={"numero_table": f"L-{unique_id}", "capacite": 2})
    table_id = table_res.json()["id"]

    # 3. Flux de la commande
    print("2. Passage de la commande (Client)...")
    order_res = client.post("/commandes/", json={
        "client_id": client_id, "table_id": table_id, "montant_total": 100,
        "type_commande": "sur_place"
    })
    order_id = order_res.json()["id"]
    assert order_res.json()["status"] == "en_attente"

    print("3. Validation par le serveur...")
    val_res = client.post(f"/commandes/{order_id}/valider?serveur_id={serveur_id}")
    assert val_res.json()["status"] == "approuvee"

    print("4. Envoi en cuisine par le serveur...")
    prep_res = client.post(f"/commandes/{order_id}/preparer")
    assert prep_res.json()["status"] == "en_cours"

    print("5. Marquage prête par le cuisinier...")
    ready_res = client.post(f"/commandes/{order_id}/prete?cuisinier_id={cuisinier_id}")
    assert ready_res.json()["status"] == "prete"
    assert ready_res.json()["cuisinier_id"] == cuisinier_id

    print("6. Marquage servie par le serveur...")
    served_res = client.post(f"/commandes/{order_id}/servir")
    assert served_res.json()["status"] == "servie"

    print("7. Validation réception par le client...")
    final_res = client.post(f"/commandes/{order_id}/receptionner")
    assert final_res.json()["status"] == "receptionnee"

    print("\n--- SUCCÈS : Le cycle de vie complet est validé ! ---")

if __name__ == "__main__":
    try:
        test_full_order_lifecycle()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
