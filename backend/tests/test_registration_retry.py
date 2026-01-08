import sys
import os

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
import random
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.main import app
from app.core.database import engine
from app.models.utilisateur import Utilisateur

client = TestClient(app)

def test_registration_retry_flow():
    print("\n--- Démarrage du test du flux de re-tentative d'inscription ---")

    unique_suffix = str(uuid.uuid4())[:8]
    email = f"retry.{unique_suffix}@example.com"
    phone = "".join([str(random.randint(0, 9)) for _ in range(10)])

    user_data = {
        "nom": "Retry",
        "prenom": "User",
        "email": email,
        "telephone": phone,
        "role": "client",
        "password": "SecurePassword123!"
    }

    # 1. Première inscription (non vérifiée)
    print(f"1. Première inscription: {email}")
    response = client.post("/utilisateurs/", json=user_data)
    assert response.status_code == 200
    print("-> Inscription initiale réussie.")

    # 2. Deuxième inscription (retry) - Devrait réussir car non vérifié
    print("2. Re-tentative d'inscription (devrait réussir)")
    user_data["nom"] = "Updated Retry"
    response = client.post("/utilisateurs/", json=user_data)
    assert response.status_code == 200
    assert response.json()["nom"] == "Updated Retry"
    print("-> Re-tentative réussie (utilisateur mis à jour).")

    # 3. Marquer l'utilisateur comme vérifié manuellement dans la DB pour simuler la vérification
    print("3. Simulation de la vérification de l'utilisateur")
    with Session(engine) as session:
        statement = select(Utilisateur).where(Utilisateur.email == email)
        db_user = session.exec(statement).first()
        db_user.is_verified = True
        session.add(db_user)
        session.commit()
    print("-> Utilisateur marqué comme vérifié.")

    # 4. Troisième inscription (après vérification) - Devrait échouer
    print("4. Tentative d'inscription après vérification (devrait échouer)")
    response = client.post("/utilisateurs/", json=user_data)
    assert response.status_code == 400
    assert "email est déjà utilisé" in response.json()["detail"]
    print("-> Échec attendu après vérification confirmé.")

    print("\n--- SUCCÈS : Le flux de re-tentative d'inscription fonctionne ! ---")

if __name__ == "__main__":
    try:
        test_registration_retry_flow()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
