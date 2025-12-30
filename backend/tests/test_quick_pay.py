import sys
import os
import uuid

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_waiter_quick_payment():
    print("\n--- Test du Paiement Rapide (Serveur) ---")
    uid = str(uuid.uuid4())[:8]
    
    # 1. Setup global
    print("1. Création client et table...")
    c_res = client.post("/clients/register", json={
        "nom": "Quick", "prenom": "Pay", "email": f"quick-{uid}@test.com", "telephone": f"01{uid}", "role": "client", "password": "pass"
    })
    client_id = c_res.json()["id"]
    
    t_res = client.post("/tables/", json={
        "numero_table": f"T-Q-{uid}", "capacite": 2, "qr_code": f"QR-Q-{uid}"
    })
    table_id = t_res.json()["id"]

    # 2. Création commande
    print("2. Création d'une commande...")
    cmd_res = client.post("/commandes/", json={
        "client_id": client_id,
        "table_id": table_id,
        "type_commande": "SUR_PLACE",
        "montant_total": 5000 # 50.00€
    })
    cmd_id = cmd_res.json()["id"]

    # 3. Marquer comme payée par le serveur
    print("3. Marquage comme payée par le serveur...")
    pay_res = client.post(f"/commandes/{cmd_id}/payee", params={"methode": "carte"})
    assert pay_res.status_code == 200
    assert pay_res.json()["status"] == "payee"

    # 4. Vérifier qu'un record de paiement a été créé
    print("4. Vérification du record de paiement...")
    p_check = client.get(f"/paiements/commande/{cmd_id}")
    assert p_check.status_code == 200
    assert p_check.json()["methode_paiement"] == "carte"
    assert p_check.json()["montant"] == 5000

    print("\n--- SUCCÈS : Le paiement rapide serveur fonctionne ! ---")

if __name__ == "__main__":
    try:
        test_waiter_quick_payment()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
