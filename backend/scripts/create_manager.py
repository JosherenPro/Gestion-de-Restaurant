import sys
import os
from sqlmodel import Session

# Ajout du dossier parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.utilisateur import Utilisateur
from app.models.personnel import Personnel
from app.models.gerant import Gerant
from app.core.database import engine
from app.security.hashing import hash_password

def create_first_manager(nom, prenom, email, telephone, password):
    with Session(engine) as session:
        # 1. Créer l'utilisateur
        hashed = hash_password(password)
        user = Utilisateur(
            nom=nom,
            prenom=prenom,
            email=email,
            telephone=telephone,
            role="gerant",
            hashed_password=hashed,
            active=True,
            is_verified=True
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        # 2. Créer le profil personnel
        personnel = Personnel(
            utilisateur_id=user.id
        )
        session.add(personnel)
        session.commit()
        session.refresh(personnel)

        # 3. Créer le profil gérant
        gerant = Gerant(
            personnel_id=personnel.id
        )
        session.add(gerant)
        session.commit()
        
        print(f"Gérant {email} créé avec succès.")

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("Usage: python3 scripts/create_manager.py <nom> <prenom> <email> <tel> <pass>")
    else:
        create_first_manager(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
