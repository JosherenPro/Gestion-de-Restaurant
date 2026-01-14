import sys
import os
import uuid

# Ajout du dossier parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from scripts.create_manager import create_first_manager

client = TestClient(app)

def test_admin_features():
    print("\n--- Test des Fonctionnalités d'Administration ---")
    uid = str(uuid.uuid4())[:8]
    manager_email = f"admin-{uid}@test.com"
    user_email = f"user-{uid}@test.com"
    
    # 1. Créer le Gérant
    create_first_manager("Admin", "Admin", manager_email, f"09{uid}", "pass")
    
    # Login Manager
    login_res = client.post("/auth/token", data={"username": manager_email, "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Créer un utilisateur standard (Client)
    client.post("/clients/register", json={
        "nom": "User", "prenom": "Test", "email": user_email, "telephone": f"06{uid}", "role": "client", "password": "pass"
    })
    
    # Vérifier que le client peut se connecter
    user_login = client.post("/auth/token", data={"username": user_email, "password": "pass"})
    assert user_login.status_code == 200
    user_id = user_login.json().get("user_id") # Si on l'avait ajouté, sinon on va le chercher
    
    # Récupérer l'ID de l'utilisateur
    from sqlmodel import Session, select
    from app.core.database import engine
    from app.models.utilisateur import Utilisateur
    with Session(engine) as session:
        user_db = session.exec(select(Utilisateur).where(Utilisateur.email == user_email)).one()
        target_id = user_db.id

    # 3. Désactiver l'utilisateur (Admin)
    print("3. Désactivation de l'utilisateur...")
    deact_res = client.patch(f"/admin/users/{target_id}/status", params={"active": False}, headers=headers)
    assert deact_res.status_code == 200
    assert deact_res.json()["active"] == False

    # 4. Tenter de se connecter avec le compte désactivé
    print("4. Test de connexion d'un compte désactivé (Doit échouer)...")
    retry_login = client.post("/auth/token", data={"username": user_email, "password": "pass"})
    assert retry_login.status_code == 401 # Ou 403 selon l'implémentation
    print("Succès: Connexion refusée.")

    # 5. Vérifier le résumé système
    print("5. Test du résumé système...")
    summary_res = client.get("/admin/summary", headers=headers)
    assert summary_res.status_code == 200
    data = summary_res.json()
    assert data["total_utilisateurs"] >= 2
    print(f"Résumé: {data}")

    # 6. Réactiver l'utilisateur
    print("6. Réactivation de l'utilisateur...")
    react_res = client.patch(f"/admin/users/{target_id}/status", params={"active": True}, headers=headers)
    assert react_res.status_code == 200
    assert react_res.json()["active"] == True

    # 7. Vérifier que la connexion refonctionne
    final_login = client.post("/auth/token", data={"username": user_email, "password": "pass"})
    assert final_login.status_code == 200
    print("Succès: Connexion rétablie.")

    print("\n--- SUCCÈS : Les fonctionnalités d'administration sont valides ! ---")

if __name__ == "__main__":
    test_admin_features()
