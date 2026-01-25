#!/usr/bin/env python3
"""
Script pour renommer les fichiers images dans le dossier PLATS en utilisant l'ID du plat,
et mettre à jour l'image_url dans la base de données.
"""
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, select
from app.core.database import engine
from app.models.plat import Plat

def rename_images_to_ids():
    plats_dir = Path("/home/eren/Documents/projet_restaurant/backend/PLATS")
    
    if not plats_dir.exists():
        print(f"❌ Erreur: Le dossier {plats_dir} n'existe pas.")
        return

    with Session(engine) as session:
        statement = select(Plat)
        plats = session.exec(statement).all()
        
        renamed_count = 0
        error_count = 0
        
        for plat in plats:
            if not plat.image_url:
                continue
            
            # On ignore les URLs absolues (http...)
            if plat.image_url.startswith(("http://", "https://")):
                print(f"⏭️  Ignoré (URL externe): {plat.nom} -> {plat.image_url}")
                continue
                
            old_filename = plat.image_url
            old_file_path = plats_dir / old_filename
            
            if old_file_path.exists():
                # On récupère l'extension originale
                extension = old_file_path.suffix or ".jpg"
                new_filename = f"{plat.id}{extension}"
                new_file_path = plats_dir / new_filename
                
                try:
                    # Renommage du fichier
                    os.rename(old_file_path, new_file_path)
                    
                    # Mise à jour de la base de données
                    plat.image_url = new_filename
                    session.add(plat)
                    
                    print(f"✅ Renommé: '{old_filename}' -> '{new_filename}' (Plat: {plat.nom})")
                    renamed_count += 1
                except Exception as e:
                    print(f"❌ Erreur lors du renommage de '{old_filename}': {e}")
                    error_count += 1
            else:
                print(f"⚠️  Fichier non trouvé: '{old_filename}' pour le plat '{plat.nom}'")
        
        session.commit()
        
        print(f"\n📊 Résumé:")
        print(f"   - Images renommées et DB mise à jour: {renamed_count}")
        print(f"   - Erreurs: {error_count}")
        print("✅ Opération terminée!")

if __name__ == "__main__":
    rename_images_to_ids()
