from fastapi.testclient import TestClient
from app.main import app
import sys

try:
    print("Tentative d'initialisation du client de test...")
    client = TestClient(app)
    print("Application initialisée avec succès.")

    response = client.get("/utilisateurs/")
    print(f"Statut de la réponse /utilisateurs/ : {response.status_code}")
    
    # On s'attend à une 200 OK (liste vide ou remplie) ou potentiellement une 401/403 si auth requise (mais pas configurée ici)
    # Dans ce projet, list_utilisateurs semble ouvert ou juste dependant de session.
    
    if response.status_code == 200:
        print("Test réussi : Endpoint accessible.")
    else:
        print(f"Attention : Code inattendu {response.status_code}")
        print(response.json())

except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"ERREUR FATALE LORS DU DEMARRAGE : {e}")
    sys.exit(1)
