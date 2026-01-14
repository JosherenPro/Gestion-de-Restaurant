import sys
import os
import uuid
from fastapi.testclient import TestClient

# Ajout du dossier parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from sqlmodel import Session, select
from app.core.database import engine
from app.models.utilisateur import Utilisateur

client = TestClient(app)

def test_email_verification_flow():
    print("\n--- Test du Flux de Confirmation par Email ---")
    uid = str(uuid.uuid4())[:8]
    email = f"user-{uid}@test.com"
    password = "pass"
    
    # 1. Inscription du client
    print("1. Inscription d'un nouveau client...")
    reg_res = client.post("/clients/register", json={
        "nom": "Verify", "prenom": "Me", "email": email, "telephone": f"07{uid}", "role": "client", "password": password
    })
    assert reg_res.status_code == 200
    print("Succès: Inscription réussie. Un mail (simulé) a dû être envoyé.")

    # 2. Tenter de se connecter SANS vérification
    print("2. Tentative de login avant vérification (Doit échouer)...")
    login_res = client.post("/auth/token", data={"username": email, "password": password})
    assert login_res.status_code == 401 # Ou 403 selon l'implémentation
    print("Succès: Connexion refusée (Compte non vérifié).")

    # 3. Récupérer le token en base (Simule l'ouverture du mail)
    print("3. Récupération du jeton en base de données...")
    with Session(engine) as session:
        user_db = session.exec(select(Utilisateur).where(Utilisateur.email == email)).one()
        token = user_db.verification_token
        assert token is not None
        print(f"Jeton trouvé : {token}")

    # 4. Vérifier l'email via l'endpoint
    print("4. Appel de l'endpoint de vérification...")
    verify_res = client.get(f"/auth/verify?token={token}")
    assert verify_res.status_code == 200
    assert "succès" in verify_res.json()["message"]
    print("Succès: Email vérifié.")

    # 5. Tentative de login APRÈS vérification
    print("5. Tentative de login après vérification (Doit réussir)...")
    final_login = client.post("/auth/token", data={"username": email, "password": password})
    assert final_login.status_code == 200
    assert "access_token" in final_login.json()
    print("Succès: Connexion réussie !")

    print("\n--- SUCCÈS : Le flux de confirmation par email est validé ! ---")

if __name__ == "__main__":
    test_email_verification_flow()
