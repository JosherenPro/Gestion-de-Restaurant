from sqlmodel import create_engine, Session, select, delete
from app.models.table import RestaurantTable, TableStatus
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

def reset_tables():
    with Session(engine) as session:
        print("Resetting tables...")
        
        # 1. Delete all existing tables
        # Note: We might need to handle foreign key constraints if there are lingering orders/reservations.
        # Ideally, previous cleanup scripts handled this, but let's be safe.
        # If cascading is set up in DB, simple delete works. If not, this might fail if orders exist.
        # Assuming orders are cleared or we want to force this.
        
        # Check for existing tables
        tables = session.exec(select(RestaurantTable)).all()
        print(f"Found {len(tables)} existing tables. Deleting...")
        
        for table in tables:
            session.delete(table)
            
        session.commit()
        
        # 2. Create new tables T1..T4
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
    reset_tables()
