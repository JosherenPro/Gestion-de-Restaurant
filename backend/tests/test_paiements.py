import sys
import os

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_payment_flow():
    print("\n--- Test du Système de Paiement ---")
    
    # 1. Préparation: Créer un client et une commande
    print("1. Création d'un client...")
    import uuid
    uid = str(uuid.uuid4())[:8]
    client_res = client.post("/clients/register", json={
        "nom": "Pay", "prenom": "User", "email": f"pay-{uid}@test.com", "telephone": f"06{uid}", "role": "client", "password": "pass"
    })
    assert client_res.status_code == 200, client_res.text
    client_id = client_res.json()["id"]

    # 2. Création d'une table (requis pour Commande)
    print("2. Création d'une table...")
    table_res = client.post("/tables/", json={
        "numero_table": "T-PAY",
        "capacite": 4,
        "qr_code": "QR-PAY"
    })
    assert table_res.status_code == 200, table_res.text
    table_id = table_res.json()["id"]

    print("3. Création d'une commande...")
    cmd_res = client.post("/commandes/", json={
        "client_id": client_id,
        "table_id": table_id,
        "type_commande": "SUR_PLACE",
        "montant_total": 0 # Sera mis à jour plus tard ou juste pour le test
    })
    assert cmd_res.status_code == 200, cmd_res.text
    cmd_id = cmd_res.json()["id"]

    # 4. Récupérer l'addition
    print("4. Calcul de l'addition...")
    add_res = client.get(f"/paiements/addition/{cmd_id}")
    assert add_res.status_code == 200
    print(f"Total à payer: {add_res.json()['total']}€")

    # 4. Effectuer le paiement
    print("4. Traitement du paiement (Mobile)...")
    pay_res = client.post("/paiements/", json={
        "commande_id": cmd_id,
        "montant": 4500, # 45.00€
        "methode_paiement": "mobile",
        "statut": "en_attente"
    })
    assert pay_res.status_code == 200
    assert pay_res.json()["statut"] == "reussi"
    assert pay_res.json()["reference_transaction"].startswith("MOB-")

    # 5. Vérifier le statut de la commande
    print("5. Vérification du statut de la commande...")
    cmd_check = client.get(f"/commandes/{cmd_id}")
    assert cmd_check.json()["status"] == "PAYEE"

    print("\n--- SUCCÈS : Le système de paiement est opérationnel ! ---")

if __name__ == "__main__":
    try:
        test_payment_flow()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
