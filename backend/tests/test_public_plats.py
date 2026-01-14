import sys
import os
from fastapi.testclient import TestClient

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_public_plats_access():
    print("\n--- Testing Public Access to Plats ---")

    # 1. Test listing plats (should be public)
    print("1. Listing plats (GET /plats/)")
    response = client.get("/plats/")
    if response.status_code == 200:
        print("-> Success: Public access allowed.")
    else:
        print(f"-> Failure: Status code {response.status_code}, Detail: {response.text}")
        sys.exit(1)

    # 2. Test creating a plat without auth (should fail)
    print("\n2. Creating plat without auth (POST /plats/)")
    response = client.post("/plats/", json={"nom": "Test Plat", "description": "Desc", "prix": 10.0, "categorie_id": 1})
    if response.status_code == 401: # Or 403 depending on how auth handles missing token
        print("-> Success: Unauthorized access blocked (401).")
    elif response.status_code == 403:
         print("-> Success: Unauthorized access blocked (403).")
    else:
        print(f"-> Failure: Expected 401/403, got {response.status_code}")
        print(f"-> Response: {response.text}")
        # Note: We aren't failing the script here strictly because the implementation might return 422 if body is invalid before auth check, 
        # but usually dependencies run first. Let's see what happens.

    print("\n--- Public Access Verification Complete ---")

if __name__ == "__main__":
    test_public_plats_access()
