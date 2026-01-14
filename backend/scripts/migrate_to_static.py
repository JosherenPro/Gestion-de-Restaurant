#!/usr/bin/env python3
"""
Migre les images de PLATS/ vers app/static/uploads/plats/
et met à jour la base de données avec le format d'URL correct.
"""
import sys
import os
import shutil
from pathlib import Path

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, select
from app.core.database import engine
from app.models.plat import Plat

def migrate_images():
    source_dir = Path("/home/eren/Documents/projet_restaurant/backend/PLATS")
    dest_dir = Path("/home/eren/Documents/projet_restaurant/backend/app/static/uploads/plats")
    
    if not source_dir.exists():
        print(f"❌ Erreur: Le dossier source {source_dir} n'existe pas.")
        return

    # Créer le dossier de destination si nécessaire
    dest_dir.mkdir(parents=True, exist_ok=True)

    with Session(engine) as session:
        statement = select(Plat)
        plats = session.exec(statement).all()
        
        migrated_count = 0
        skipped_count = 0
        
        for plat in plats:
            if not plat.image_url:
                continue
                
            # On ignore les URLs absolues ou déjà migrées
            if plat.image_url.startswith(("/static/", "http")):
                skipped_count += 1
                continue
            
            # Le nom de fichier actuel (ex: 17.jpg)
            filename = plat.image_url
            source_file = source_dir / filename
            
            if source_file.exists():
                dest_file = dest_dir / filename
                
                try:
                    # Copie du fichier vers la destination statique
                    shutil.copy2(source_file, dest_file)
                    
                    # Mise à jour du lien en base (ex: /static/uploads/plats/17.jpg)
                    new_url = f"/static/uploads/plats/{filename}"
                    plat.image_url = new_url
                    session.add(plat)
                    
                    print(f"✅ Migré: {filename} -> {new_url} (Plat: {plat.nom})")
                    migrated_count += 1
                except Exception as e:
                    print(f"❌ Erreur lors de la migration de {filename}: {e}")
            else:
                print(f"⚠️  Fichier introuvable dans PLATS/: {filename} ({plat.nom})")
        
        session.commit()
        
        print(f"\n📊 Résumé de la migration:")
        print(f"   - Images déplacées et DB mise à jour: {migrated_count}")
        print(f"   - Déjà à jour/Ignorées: {skipped_count}")
        print(f"✅ Terminée!")

if __name__ == "__main__":
    migrate_images()
