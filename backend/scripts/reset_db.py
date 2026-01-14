import sys
import os

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import SQLModel
from app.core.database import engine
import app.models # S'assurer que tous les modèles sont chargés

from sqlalchemy import text
from app.core.database import engine
import app.models

def reset_db():
    print("Suppression de toutes les tables avec CASCADE...")
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()
    
    print("Création de toutes les tables...")
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    print("Base de données réinitialisée avec succès.")

if __name__ == "__main__":
    reset_db()
