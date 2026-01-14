import sys
import os

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_menu_management():
    print("\n--- Test de la Gestion du Menu ---")

    # 1. Création d'une catégorie
    print("1. Création d'une catégorie...")
    cat_res = client.post("/categories/", json={
        "nom": "Entrées",
        "description": "Nos délicieuses entrées"
    })
    assert cat_res.status_code == 200, cat_res.text
    cat_id = cat_res.json()["id"]

    # 2. Création d'un plat lié
    print("2. Création d'un plat...")
    plat_res = client.post("/plats/", json={
        "nom": "Salade César",
        "description": "Poulet, croûtons, parmesan",
        "prix": 1200,
        "categorie_id": cat_id,
        "temps_preparation": 10
    })
    assert plat_res.status_code == 200, plat_res.text
    plat_id = plat_res.json()["id"]

    # 3. Mise à jour du plat
    print("3. Mise à jour du prix du plat...")
    up_res = client.put(f"/plats/{plat_id}", json={
        "prix": 1300
    })
    assert up_res.status_code == 200
    assert up_res.json()["prix"] == 1300

    # 4. Lecture des plats
    print("4. Liste des plats...")
    list_res = client.get("/plats/")
    assert list_res.status_code == 200
    assert any(p["id"] == plat_id for p in list_res.json())

    # 5. Suppression
    print("5. Suppression du plat...")
    del_res = client.delete(f"/plats/{plat_id}")
    assert del_res.status_code == 200

    print("\n--- SUCCÈS : La gestion du menu est opérationnelle ! ---")

if __name__ == "__main__":
    try:
        test_menu_management()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
