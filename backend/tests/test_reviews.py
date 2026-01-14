import sys
import os
import uuid

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_review_system():
    print("\n--- Test du Système d'Avis ---")
    uid = str(uuid.uuid4())[:8]
    
    # 1. Setup global (Client, Table, Commande)
    print("1. Préparation d'une commande payée...")
    c_res = client.post("/clients/register", json={
        "nom": "Reviewer", "prenom": "User", "email": f"rev-{uid}@test.com", "telephone": f"04{uid}", "role": "client", "password": "pass"
    })
    client_id = c_res.json()["id"]
    
    t_res = client.post("/tables/", json={
        "numero_table": f"T-RV-{uid}", "capacite": 4, "qr_code": f"QR-RV-{uid}"
    })
    table_id = t_res.json()["id"]

    cmd_res = client.post("/commandes/", json={
        "client_id": client_id,
        "table_id": table_id,
        "type_commande": "SUR_PLACE",
        "montant_total": 3000
    })
    cmd_id = cmd_res.json()["id"]

    # 2. Tenter de laisser un avis avant paiement (Doit échouer)
    print("2. Test avis avant paiement (Doit être bloqué)...")
    rev1 = client.post("/avis/", json={
        "client_id": client_id,
        "commande_id": cmd_id,
        "note": 5,
        "commentaire": "Excellent !"
    })
    assert rev1.status_code == 400
    print("Succès: Avis bloqué car non payé.")

    # 3. Payer la commande
    print("3. Paiement de la commande...")
    client.post(f"/commandes/{cmd_id}/payee", params={"methode": "especes"})

    # 4. Laisser l'avis après paiement (Doit réussir)
    print("4. Test avis après paiement...")
    rev2 = client.post("/avis/", json={
        "client_id": client_id,
        "commande_id": cmd_id,
        "note": 5,
        "commentaire": "Super service !"
    })
    assert rev2.status_code == 200
    avis_id = rev2.json()["id"]
    print("Succès: Avis enregistré.")

    # 5. Tenter de laisser un DEUXIÈME avis (Doit échouer)
    print("5. Test doublon d'avis (Doit être bloqué)...")
    rev3 = client.post("/avis/", json={
        "client_id": client_id,
        "commande_id": cmd_id,
        "note": 1,
        "commentaire": "Je change d'avis"
    })
    assert rev3.status_code == 400
    print("Succès: Doublon d'avis bloqué.")

    # 6. Lister les avis
    print("6. Vérification de la liste des avis...")
    list_res = client.get("/avis/")
    assert any(a["id"] == avis_id for a in list_res.json())

    print("\n--- SUCCÈS : Le système d'avis est opérationnel ! ---")

if __name__ == "__main__":
    try:
        test_review_system()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
