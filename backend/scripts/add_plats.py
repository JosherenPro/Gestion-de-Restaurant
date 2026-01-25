#!/usr/bin/env python3
"""
Script pour ajouter les nouveaux plats à la base de données
"""
import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, select
from app.core.database import engine
from app.models.plat import Plat

def add_plats():
    with Session(engine) as session:
        # Nouveaux plats à ajouter
        plats_data = [
            {
                "nom": "Attiékè",
                "description": "Semoule de manioc traditionnelle",
                "prix": 2000,
                "categorie_id": 2,
                "image_url": "Attiékè.jpg",
                "disponible": True,
                "temps_preparation": 20
            },
            {
                "nom": "Ayimolou",
                "description": "Riz au haricot rouge et sauce tomate",
                "prix": 2500,
                "categorie_id": 2,
                "image_url": "Ayimolou.jpg",
                "disponible": True,
                "temps_preparation": 30
            },
            {
                "nom": "Ayimolou revisité",
                "description": "Version améliorée du ayimolou",
                "prix": 3000,
                "categorie_id": 2,
                "image_url": "Ayimolou revisité.jpg",
                "disponible": True,
                "temps_preparation": 35
            },
            {
                "nom": "Foufou",
                "description": "Pâte traditionnelle africaine",
                "prix": 2000,
                "categorie_id": 2,
                "image_url": "Foufou.jpg",
                "disponible": True,
                "temps_preparation": 25
            },
            {
                "nom": "Foufou igname",
                "description": "Foufou à base d’igname",
                "prix": 2500,
                "categorie_id": 2,
                "image_url": "Foufou igname.jpg",
                "disponible": True,
                "temps_preparation": 30
            },
            {
                "nom": "Foufou banane",
                "description": "Foufou à base de banane plantain",
                "prix": 2500,
                "categorie_id": 2,
                "image_url": "Foufou banane.jpg",
                "disponible": True,
                "temps_preparation": 30
            },
            {
                "nom": "Riz blanc au poulet",
                "description": "Riz blanc servi avec du poulet",
                "prix": 3000,
                "categorie_id": 2,
                "image_url": "Riz blanc au poulet.jpg",
                "disponible": True,
                "temps_preparation": 30
            },
            {
                "nom": "Frites et poulet",
                "description": "Poulet frit accompagné de frites",
                "prix": 3000,
                "categorie_id": 2,
                "image_url": "Frittes et poulet.jpg",
                "disponible": True,
                "temps_preparation": 25
            },
            {
                "nom": "Spaghetti",
                "description": "Spaghetti à la sauce maison",
                "prix": 2000,
                "categorie_id": 2,
                "image_url": "Spaghetti.jpg",
                "disponible": True,
                "temps_preparation": 20
            },
            {
                "nom": "Macaroni",
                "description": "Macaroni à la sauce tomate",
                "prix": 2000,
                "categorie_id": 2,
                "image_url": "Macaroni.jpg",
                "disponible": True,
                "temps_preparation": 20
            },
            {
                "nom": "Soupe poisson",
                "description": "Soupe traditionnelle au poisson",
                "prix": 2500,
                "categorie_id": 2,
                "image_url": "Soupe poisson.jpg",
                "disponible": True,
                "temps_preparation": 35
            },
            {
                "nom": "Kom",
                "description": "Plat traditionnel à base de maïs",
                "prix": 2000,
                "categorie_id": 2,
                "image_url": "Kom.jpg",
                "disponible": True,
                "temps_preparation": 30
            },
            {
                "nom": "Pinon",
                "description": "Plat local traditionnel",
                "prix": 2000,
                "categorie_id": 2,
                "image_url": "Pinon.jpg",
                "disponible": True,
                "temps_preparation": 30
            }
        ]
        
        added_count = 0
        skipped_count = 0
        
        for plat_data in plats_data:
            # Vérifier si le plat existe déjà
            statement = select(Plat).where(Plat.nom == plat_data["nom"])
            existing_plat = session.exec(statement).first()
            
            if not existing_plat:
                plat = Plat(**plat_data)
                session.add(plat)
                print(f"✅ Ajouté: {plat_data['nom']}")
                added_count += 1
            else:
                print(f"⏭️  Déjà existant: {plat_data['nom']}")
                skipped_count += 1
        
        session.commit()
        
        print(f"\n📊 Résumé:")
        print(f"   - Plats ajoutés: {added_count}")
        print(f"   - Plats ignorés (existants): {skipped_count}")
        print("✅ Opération terminée avec succès!")

if __name__ == "__main__":
    add_plats()
