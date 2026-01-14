import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, select
from app.core.database import engine
from app.models.categorie import Categorie
from app.models.plat import Plat
from app.models.table import RestaurantTable, TableStatus

def seed_data():
    with Session(engine) as session:
        # 1. Add Categories
        categories_data = [
            {"nom": "Burgers", "description": "Délicieux burgers maison"},
            {"nom": "Pizzas", "description": "Pizzas artisanales cuites au feu de bois"},
            {"nom": "Boissons", "description": "Rafraîchissements et boissons chaudes"},
            {"nom": "Desserts", "description": "Douceurs sucrées"},
            {"nom": "Salades", "description": "Salades fraîches et composées"}
        ]
        
        categories = {}
        for cat_data in categories_data:
            statement = select(Categorie).where(Categorie.nom == cat_data["nom"])
            existing_cat = session.exec(statement).first()
            if not existing_cat:
                cat = Categorie(**cat_data)
                session.add(cat)
                session.commit()
                session.refresh(cat)
                categories[cat.nom] = cat
            else:
                categories[existing_cat.nom] = existing_cat

        # 2. Add Plats (Dishes)
        plats_data = [
            # Burgers
            {"nom": "Royal Cheese Burger", "description": "Boeuf rassis, cheddar, oignons, cornichons, moutarde, ketchup", "prix": 1250, "categorie_id": categories["Burgers"].id, "disponible": True},
            {"nom": "Chicken Burger", "description": "Poulet croustillant, salade, tomate, sauce mayo", "prix": 1150, "categorie_id": categories["Burgers"].id, "disponible": True},
            {"nom": "Veggie Burger", "description": "Galette de légumes, avocat, salade, tomate", "prix": 1050, "categorie_id": categories["Burgers"].id, "disponible": True},
            
            # Pizzas
            {"nom": "Margherita", "description": "Tomate, mozzarella, basilic frais", "prix": 1290, "categorie_id": categories["Pizzas"].id, "disponible": True},
            {"nom": "Reine", "description": "Tomate, mozzarella, jambon, champignons", "prix": 1450, "categorie_id": categories["Pizzas"].id, "disponible": True},
            {"nom": "4 Fromages", "description": "Tomate, mozzarella, gorgonzola, chèvre, parmesan", "prix": 1590, "categorie_id": categories["Pizzas"].id, "disponible": True},
            
            # Boissons
            {"nom": "Coca-Cola 33cl", "description": "Boisson rafraîchissante", "prix": 350, "categorie_id": categories["Boissons"].id, "disponible": True},
            {"nom": "Eau Minérale 50cl", "description": "Eau plate", "prix": 200, "categorie_id": categories["Boissons"].id, "disponible": True},
            {"nom": "Jus d'Orange Frais", "description": "Orange pressée", "prix": 500, "categorie_id": categories["Boissons"].id, "disponible": True},
            
            # Desserts
            {"nom": "Tiramisu Maison", "description": "Le classique italien au café", "prix": 650, "categorie_id": categories["Desserts"].id, "disponible": True},
            {"nom": "Fondant au Chocolat", "description": "Coeur coulant, servi avec une boule de glace vanille", "prix": 750, "categorie_id": categories["Desserts"].id, "disponible": True},
            
            # Salades
            {"nom": "Salade César", "description": "Poulet grillé, croûtons, parmesan, sauce César", "prix": 1350, "categorie_id": categories["Salades"].id, "disponible": True}
        ]

        for plat_data in plats_data:
            statement = select(Plat).where(Plat.nom == plat_data["nom"])
            existing_plat = session.exec(statement).first()
            if not existing_plat:
                plat = Plat(**plat_data)
                session.add(plat)
        
        session.commit()

        # 3. Add Tables
        for i in range(1, 11):
            num_table = f"{i}"
            statement = select(RestaurantTable).where(RestaurantTable.numero_table == num_table)
            existing_table = session.exec(statement).first()
            if not existing_table:
                # Alternate capacities
                cap = 2 if i % 2 != 0 else 4
                if i == 10: cap = 6
                
                table = RestaurantTable(
                    numero_table=num_table,
                    capacite=cap,
                    statut=TableStatus.LIBRE,
                    qr_code=f"QR_TABLE_{i}"
                )
                session.add(table)
        
        session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
