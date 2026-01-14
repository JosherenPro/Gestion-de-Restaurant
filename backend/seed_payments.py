from sqlmodel import Session
from app.core.database import engine
from app.models.paiement import Paiement, PaymentStatus
from app.models.commande import Commande, CommandeStatus
from datetime import datetime

def seed_payment():
    session = Session(engine)
    try:
        # Create a dummy order if needed or just a payment linked to an existing one?
        # Ideally linked. Let's find a paid order or create one.
        # Simplest: Just insert a payment record if the chart only aggregates payments.
        # But stats service joins? No, get_revenue_by_period uses Paiement table directly.
        
        # Check if we have any order to link to, just in case constraints exist (though not enforced strongly in some separate checks)
        # But let's be safe.
        
        new_payment = Paiement(
            commande_id=1, # Assuming 1 exists or doesn't matter for the aggregate query if no foreign key constraint block
            montant=5000.0,
            date_paiement=datetime.now(),
            methode="Especes",
            statut=PaymentStatus.REUSSI
        )
        session.add(new_payment)
        
        new_payment_2 = Paiement(
            commande_id=2, 
            montant=7500.0,
            date_paiement=datetime.now(),
            methode="Mobile Money",
            statut=PaymentStatus.REUSSI
        )
        session.add(new_payment_2)
        
        session.commit()
        print("Successfully seeded 2 fresh payments for today.")
    except Exception as e:
        print(f"Error seeding: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_payment()
