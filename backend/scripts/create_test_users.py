import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, select
from app.core.database import engine
from app.models.utilisateur import Utilisateur
from app.models.client import Client
from app.models.personnel import Personnel
from app.models.gerant import Gerant
from app.models.serveur import Serveur
from app.models.cuisinier import Cuisinier
from app.security.hashing import hash_password
from datetime import datetime, timezone


def create_test_users():
    """
    Crée des utilisateurs de test pour chaque rôle dans le système.
    """
    with Session(engine) as session:
        users_data = [
            # Client test
            {
                "nom": "Dupont",
                "prenom": "Jean",
                "email": "client@test.com",
                "telephone": "0601020304",
                "password": "client123",
                "role": "client"
            },
            # Gérant test
            {
                "nom": "Martin",
                "prenom": "Sophie",
                "email": "gerant@test.com",
                "telephone": "0601020305",
                "password": "gerant123",
                "role": "gerant"
            },
            # Serveur test
            {
                "nom": "Bernard",
                "prenom": "Luc",
                "email": "serveur@test.com",
                "telephone": "0601020306",
                "password": "serveur123",
                "role": "serveur"
            },
            # Cuisinier test
            {
                "nom": "Roux",
                "prenom": "Marie",
                "email": "cuisinier@test.com",
                "telephone": "0601020307",
                "password": "cuisinier123",
                "role": "cuisinier"
            },
            # Clients supplémentaires pour tester
            {
                "nom": "Leroy",
                "prenom": "Pierre",
                "email": "client2@test.com",
                "telephone": "0601020308",
                "password": "client123",
                "role": "client"
            },
        ]

        for user_data in users_data:
            # Vérifier si l'utilisateur existe déjà
            statement = select(Utilisateur).where(Utilisateur.email == user_data["email"])
            existing_user = session.exec(statement).first()
            
            if existing_user:
                print(f"⚠️  L'utilisateur {user_data['email']} existe déjà, ignoré.")
                continue

            # Créer l'utilisateur
            user = Utilisateur(
                nom=user_data["nom"],
                prenom=user_data["prenom"],
                email=user_data["email"],
                telephone=user_data["telephone"],
                role=user_data["role"],
                hashed_password=hash_password(user_data["password"]),
                active=True,
                is_verified=True,  # Utilisateurs de test déjà vérifiés
                date_creation=datetime.now(timezone.utc)
            )
            
            session.add(user)
            session.commit()
            session.refresh(user)
            
            # Créer les entrées spécifiques selon le rôle
            if user_data["role"] == "client":
                client = Client(utilisateur_id=user.id)
                session.add(client)
                print(f"✅ Client créé: {user.email} (mot de passe: {user_data['password']})")
            
            elif user_data["role"] == "gerant":
                personnel = Personnel(utilisateur_id=user.id)
                session.add(personnel)
                session.commit()
                session.refresh(personnel)
                
                gerant = Gerant(personnel_id=personnel.id)
                session.add(gerant)
                print(f"✅ Gérant créé: {user.email} (mot de passe: {user_data['password']})")
            
            elif user_data["role"] == "serveur":
                personnel = Personnel(utilisateur_id=user.id)
                session.add(personnel)
                session.commit()
                session.refresh(personnel)
                
                serveur = Serveur(personnel_id=personnel.id)
                session.add(serveur)
                print(f"✅ Serveur créé: {user.email} (mot de passe: {user_data['password']})")
            
            elif user_data["role"] == "cuisinier":
                personnel = Personnel(utilisateur_id=user.id)
                session.add(personnel)
                session.commit()
                session.refresh(personnel)
                
                cuisinier = Cuisinier(personnel_id=personnel.id)
                session.add(cuisinier)
                print(f"✅ Cuisinier créé: {user.email} (mot de passe: {user_data['password']})")
            
            session.commit()

        print("\n" + "="*60)
        print("🎉 Utilisateurs de test créés avec succès!")
        print("="*60)
        print("\n📋 RÉCAPITULATIF DES COMPTES DE TEST:\n")
        print("┌─────────────┬─────────────────────┬──────────────────┐")
        print("│    RÔLE     │       EMAIL         │   MOT DE PASSE   │")
        print("├─────────────┼─────────────────────┼──────────────────┤")
        print("│ Client      │ client@test.com     │ client123        │")
        print("│ Client 2    │ client2@test.com    │ client123        │")
        print("│ Gérant      │ gerant@test.com     │ gerant123        │")
        print("│ Serveur     │ serveur@test.com    │ serveur123       │")
        print("│ Cuisinier   │ cuisinier@test.com  │ cuisinier123     │")
        print("└─────────────┴─────────────────────┴──────────────────┘")
        print("\n💡 Tous les comptes sont activés et vérifiés.")
        print("   Vous pouvez vous connecter immédiatement!")


if __name__ == "__main__":
    create_test_users()
