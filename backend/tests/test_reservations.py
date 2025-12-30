import sys
import os
import uuid
from datetime import datetime, timezone, timedelta

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_reservation_flow():
    print("\n--- Test du Système de Réservation ---")
    uid = str(uuid.uuid4())[:8]
    
    # 1. Setup global
    print("1. Préparation (Client et Table)...")
    c_res = client.post("/clients/register", json={
        "nom": "Reser", "prenom": "User", "email": f"res-{uid}@test.com", "telephone": f"03{uid}", "role": "client", "password": "pass"
    })
    client_id = c_res.json()["id"]
    
    t_res = client.post("/tables/", json={
        "numero_table": f"T-R-{uid}", "capacite": 4, "qr_code": f"QR-R-{uid}"
    })
    table_id = t_res.json()["id"]

    # Dates de test
    base_date = datetime(2025, 12, 31, 12, 0, 0, tzinfo=timezone.utc)
    overlap_date = base_date + timedelta(hours=1)
    safe_date = base_date + timedelta(hours=3)

    # 2. Première réservation (12:00)
    print("2. Création première réservation (12:00)...")
    res1 = client.post("/reservations/", json={
        "client_id": client_id,
        "table_id": table_id,
        "date_reservation": base_date.isoformat(),
        "nombre_personnes": 2
    })
    assert res1.status_code == 200, res1.text
    res1_id = res1.json()["id"]
    assert res1.json()["status"] == "en_attente"

    # 3. Tentative de chevauchement (13:00)
    print("3. Test du chevauchement (13:00 - Doit échouer)...")
    res2 = client.post("/reservations/", json={
        "client_id": client_id,
        "table_id": table_id,
        "date_reservation": overlap_date.isoformat(),
        "nombre_personnes": 2
    })
    assert res2.status_code == 400
    print("Succès: Le chevauchement a été bloqué.")

    # 4. Réservation safe (15:00)
    print("4. Création réservation safe (15:00)...")
    res3 = client.post("/reservations/", json={
        "client_id": client_id,
        "table_id": table_id,
        "date_reservation": safe_date.isoformat(),
        "nombre_personnes": 2
    })
    assert res3.status_code == 200
    res3_id = res3.json()["id"]

    # 5. Confirmation
    print("5. Confirmation de la réservation 1...")
    conf_res = client.post(f"/reservations/{res1_id}/confirmer")
    assert conf_res.status_code == 200
    assert conf_res.json()["status"] == "confirmee"

    # 6. Annulation
    print("6. Annulation de la réservation 3...")
    ann_res = client.post(f"/reservations/{res3_id}/annuler")
    assert ann_res.status_code == 200
    assert ann_res.json()["status"] == "annulee"

    print("\n--- SUCCÈS : Le système de réservation est opérationnel ! ---")

if __name__ == "__main__":
    try:
        test_reservation_flow()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
