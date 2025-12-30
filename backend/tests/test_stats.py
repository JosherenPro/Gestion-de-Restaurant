import sys
import os
import uuid
from datetime import datetime, timezone

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from scripts.create_manager import create_first_manager

client = TestClient(app)

def test_stats_aggregation():
    print("\n--- Test du Système de Statistiques (avec RBAC) ---")
    uid = str(uuid.uuid4())[:8]
    
    # 1. Créer le Gérant (via un appel direct ou si on unprotect register temporairement)
    # Pour le test, on va utiliser le fait que /clients/register est public pour PRENDRE le compte,
    # mais gérant register est protégé. On va donc simuler un gérant existant.
    print("1. Création et Login du Gérant...")
    # On utilise une astuce: on register un client et on change son rôle en DB ou on assume qu'on peut register le 1er.
    # Ici, je vais juste register un gérant en espérant que le test puisse le faire (si j'ai pas encore reload le serveur)
    # OU je vais unprotect temporairement le register gérant.
    
    # En fait, je vais créer un gérant "test" via le script ou manuellement.
    # Dans le test local, je peux register un client et il a le droit d'être client.
    # Mais pour les stats, il faut être Gérant.
    
    # JE VAIS CREER UN GERANT VIA LE SCRIPT
    create_first_manager("Admin", "Admin", f"admin-{uid}@test.com", f"09{uid}", "pass")
    
    # Login
    login_res = client.post("/auth/token", data={"username": f"admin-{uid}@test.com", "password": "pass"})
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.status_code} - {login_res.text}")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Préparation des données (Client, Tables, Plats)
    print("2. Préparation des données (Client, Tables, Plats)...")
    c_res = client.post("/clients/register", json={
        "nom": "Manager", "prenom": "Tester", "email": f"stat-{uid}@test.com", "telephone": f"05{uid}", "role": "client", "password": "pass"
    })
    client_id = c_res.json()["id"]
    
    t_res = client.post("/tables/", json={
        "numero_table": f"T-S-{uid}", "capacite": 4, "qr_code": f"QR-S-{uid}"
    })
    table_id = t_res.json()["id"]

    # Création d'une catégorie (Nécessite Gérant)
    cat_res = client.post("/categories/", json={"nom": f"Cat-S-{uid}", "description": "Stats cat"}, headers=headers)
    assert cat_res.status_code == 200, cat_res.text
    cat_id = cat_res.json()["id"]

    # Création de 2 plats (Nécessite Gérant)
    p1_res = client.post("/plats/", json={"nom": f"Plat-A-{uid}", "prix": 1000, "categorie_id": cat_id, "actif": True}, headers=headers)
    p2_res = client.post("/plats/", json={"nom": f"Plat-B-{uid}", "prix": 2000, "categorie_id": cat_id, "actif": True}, headers=headers)
    p1_id = p1_res.json()["id"]
    p2_id = p2_res.json()["id"]

    # 3. Création de commandes et paiements
    print("3. Création de commandes et paiements...")
    
    cmd1 = client.post("/commandes/", json={
        "client_id": client_id, "table_id": table_id, "type_commande": "SUR_PLACE", "montant_total": 4000
    }).json()
    cmd1_id = cmd1["id"]
    
    # Ajout des lignes
    l1 = client.post(f"/commandes/{cmd1_id}/lignes", json={"commande_id": cmd1_id, "plat_id": p1_id, "quantite": 2, "prix_unitaire": 1000, "notes_speciales": ""})
    print(f"DEBUG: Add Line 1: {l1.status_code} - {l1.text}")
    l2 = client.post(f"/commandes/{cmd1_id}/lignes", json={"commande_id": cmd1_id, "plat_id": p2_id, "quantite": 1, "prix_unitaire": 2000, "notes_speciales": ""})
    print(f"DEBUG: Add Line 2: {l2.status_code} - {l2.text}")
    
    # Marquer comme payée
    client.post(f"/commandes/{cmd1_id}/payee", params={"methode": "especes"})
    
    # Commande 2
    cmd2 = client.post("/commandes/", json={
        "client_id": client_id, "table_id": table_id, "type_commande": "A_EMPORTER", "montant_total": 4000
    }).json()
    cmd2_id = cmd2["id"]
    client.post(f"/commandes/{cmd2_id}/lignes", json={"commande_id": cmd2_id, "plat_id": p2_id, "quantite": 2, "prix_unitaire": 2000, "notes_speciales": ""})
    client.post(f"/commandes/{cmd2_id}/payee", params={"methode": "carte"})

    # 4. Ajouter un avis
    print("4. Ajout d'un avis...")
    client.post("/avis/", json={"client_id": client_id, "commande_id": cmd1_id, "note": 4, "commentaire": "Bien"})

    # 5. Vérifier les statistiques (Nécessite Gérant)
    print("5. Vérification des indicateurs (KPIs)...")
    stats_res = client.get("/stats/global", headers=headers).json()
    assert stats_res["chiffre_affaires_total"] == 8000
    assert stats_res["nombre_commandes"] == 2
    assert stats_res["note_moyenne"] == 4.0

    print("6. Vérification du Top Plats...")
    top_res = client.get("/stats/top-plats", headers=headers).json()
    assert top_res[0]["plat_id"] == p2_id
    assert top_res[0]["quantite_vendue"] == 3

    print("\n--- SUCCÈS : Le système de statistiques est opérationnel ! ---")

if __name__ == "__main__":
    try:
        test_stats_aggregation()
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
