from sqlmodel import create_engine, Session, select, delete
from app.models.table import RestaurantTable, TableStatus
from app.models.commande import Commande
from app.models.reservation import Reservation
from app.models.ligne_commande import LigneCommande
from app.models.paiement import Paiement
from app.models.avis import Avis
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

def reset_tables_v2():
    with Session(engine) as session:
        print("Resetting tables (v2)...")
        
        # 1. Clear Commandes and related data first to avoid FK constraints
        # Since we are deleting ALL tables, we effectively need to clear all active orders linked to them
        # or at least the ones linked to tables.
        # To be safe and clean, let's clear dependent transaction data.
        
        print("Clearing dependent data (LigneCommande, Paiement, Avis)...")
        session.exec(delete(LigneCommande))
        session.exec(delete(Paiement))
        session.exec(delete(Avis))
        
        print("Clearing Commandes and Reservations...")
        session.exec(delete(Commande))
        session.exec(delete(Reservation))
        
        # 2. Now Delete Tables
        print("Deleting Tables...")
        session.exec(delete(RestaurantTable))
        
        session.commit()
        
        # 3. Create new tables T1..T4
        print("Creating new tables T1, T2, T3, T4...")
        new_tables = [
            RestaurantTable(numero_table="1", capacite=4, statut=TableStatus.LIBRE),
            RestaurantTable(numero_table="2", capacite=4, statut=TableStatus.LIBRE),
            RestaurantTable(numero_table="3", capacite=4, statut=TableStatus.LIBRE),
            RestaurantTable(numero_table="4", capacite=4, statut=TableStatus.LIBRE),
        ]
        
        for t in new_tables:
            session.add(t)
            
        session.commit()
        print("Successfully created Tables T1, T2, T3, T4.")

if __name__ == "__main__":
    reset_tables_v2()
