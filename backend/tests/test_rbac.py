import sys
import os
import uuid

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rbac_security():
    print("\n--- Test du Contrôle d'Accès (RBAC) ---")
    uid = str(uuid.uuid4())[:8]
    
    # 1. Créer un client (non gérant)
    print("1. Création d'un compte client...")
    client.post("/clients/register", json={
        "nom": "User", "prenom": "Client", "email": f"user-{uid}@test.com", "telephone": f"06{uid}", "role": "client", "password": "pass"
    })
    
    # Login
    login_res = client.post("/auth/token", data={"username": f"user-{uid}@test.com", "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Tenter d'accéder aux stats (Devrait être FORBIDDEN)
    print("2. Test accès aux stats par un client (Doit être bloqué)...")
    stats_res = client.get("/stats/global", headers=headers)
    assert stats_res.status_code == 403
    print("Succès: Accès refusé (403).")

    # 3. Tenter de créer un plat (Devrait être FORBIDDEN)
    print("3. Test création de plat par un client (Doit être bloqué)...")
    plat_res = client.post("/plats/", json={"nom": "Hack", "prix": 1}, headers=headers)
    assert plat_res.status_code == 403
    print("Succès: Accès refusé (403).")

    # 4. Tenter d'accéder au personnel (Devrait être FORBIDDEN)
    print("4. Test accès au personnel par un client (Doit être bloqué)...")
    pers_res = client.get("/personnel/", headers=headers)
    assert pers_res.status_code == 403
    print("Succès: Accès refusé (403).")

    # 5. Connecter en tant que Gérant (Simulé ou réel si on peut en créer un)
    # Pour le test, on va vérifier que SANS token c'est bloqué aussi
    print("5. Test accès sans token (Doit être bloqué 401)...")
    no_token_res = client.get("/stats/global")
    assert no_token_res.status_code == 401
    print("Succès: Accès refusé (401).")

    print("\n--- SUCCÈS : La sécurité RBAC est opérationnelle ! ---")

if __name__ == "__main__":
    try:
        test_rbac_security()
    except Exception as e:
        print(f"\nERREUR: {e}")
        sys.exit(1)
