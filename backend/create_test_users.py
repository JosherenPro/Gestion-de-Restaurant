from sqlmodel import Session
from app.core.database import engine
from app.services.personnel_service import create_gerant_full, create_serveur_full, create_cuisinier_full
from app.schemas.personnel_full import GerantCreateFull, ServeurCreateFull, CuisinierCreateFull
from fastapi import BackgroundTasks

def create_test_users():
    with Session(engine) as session:
        print("Creating test users...")
        bg = BackgroundTasks()

        # Create Gerant
        try:
            gerant_in = GerantCreateFull(
                nom="Admin",
                prenom="Gerant",
                email="gerant@test.com",
                telephone="+22890000001",
                password="gerant",  # Will use same password as email prefix for simplicity
                role="GERANT"
            )
            create_gerant_full(session, gerant_in, bg)
            print("Created Gerant: gerant@test.com / gerant")
        except Exception as e:
            print(f"Gerant creation skipped (might exist): {e}")

        # Create Serveur
        try:
            serveur_in = ServeurCreateFull(
                nom="Staff",
                prenom="Serveur",
                email="serveur@test.com",
                telephone="+22890000002",
                password="serveur",
                role="SERVEUR"
            )
            create_serveur_full(session, serveur_in, bg)
            print("Created Serveur: serveur@test.com / serveur")
        except Exception as e:
            print(f"Serveur creation skipped (might exist): {e}")

        # Create Cuisinier
        try:
            cuisinier_in = CuisinierCreateFull(
                nom="Chef",
                prenom="Cuisinier",
                email="cuisinier@test.com",
                telephone="+22890000003",
                password="cuisinier",
                role="CUISINIER"
            )
            create_cuisinier_full(session, cuisinier_in, bg)
            print("Created Cuisinier: cuisinier@test.com / cuisinier")
        except Exception as e:
            print(f"Cuisinier creation skipped (might exist): {e}")

if __name__ == "__main__":
    create_test_users()
