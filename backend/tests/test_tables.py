import sys
import os
import uuid

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_table_management():
    print("\n--- Test de la Gestion des Tables ---")
    unique_id = str(uuid.uuid4())[:8]
    qr_code = f"QR-{unique_id}"
    
    # 1. Création d'une table
    print("1. Création d'une table...")
    res = client.post("/tables/", json={
        "numero_table": f"Table-{unique_id}",
        "capacite": 4,
        "qr_code": qr_code
    })
    assert res.status_code == 200
    table_id = res.json()["id"]
    assert res.json()["statut"] == "libre"

    # 2. Lookup par QR Code
    print("2. Test du lookup par QR Code...")
    qr_res = client.get(f"/tables/qr/{qr_code}")
    assert qr_res.status_code == 200
    assert qr_res.json()["id"] == table_id

    # 3. Occuper la table
    print("3. Marquage de la table comme occupée...")
    occ_res = client.post(f"/tables/{table_id}/occuper")
    assert occ_res.status_code == 200
    assert occ_res.json()["statut"] == "occupee"

    # 4. Libérer la table
    print("4. Libération de la table...")
    lib_res = client.post(f"/tables/{table_id}/liberer")
    assert lib_res.status_code == 200
    assert lib_res.json()["statut"] == "libre"

    print("\n--- SUCCÈS : La gestion des tables est opérationnelle ! ---")

if __name__ == "__main__":
    try:
        test_table_management()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
