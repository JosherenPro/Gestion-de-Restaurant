from sqlmodel import Session, select
from app.models.paiement import Paiement, PaymentStatus, PaymentMethod
from app.models.commande import Commande, CommandeStatus
from app.models.ligne_commande import LigneCommande
from app.schemas.paiement import PaiementCreate
from fastapi import HTTPException

def get_addition(session: Session, commande_id: int) -> float:
    """Calculer le montant total de la commande."""
    statement = select(LigneCommande).where(LigneCommande.commande_id == commande_id)
    lignes = session.exec(statement).all()
    if not lignes:
        return 0.0
    return sum(l.prix_unitaire * l.quantite for l in lignes)

def process_payment(session: Session, paiement_in: PaiementCreate) -> Paiement:
    """Traiter un paiement et mettre à jour le statut de la commande."""
    # 1. Vérifier la commande
    commande = session.get(Commande, paiement_in.commande_id)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")

    # 2. Créer l'entrée de paiement
    # Simulation: Si c'est mobile, on génère une réf
    reference = paiement_in.reference_transaction
    if paiement_in.methode_paiement == PaymentMethod.MOBILE and not reference:
        import uuid
        reference = f"MOB-{uuid.uuid4().hex[:8].upper()}"

    paiement = Paiement(
        commande_id=paiement_in.commande_id,
        montant=paiement_in.montant,
        methode_paiement=paiement_in.methode_paiement,
        statut=PaymentStatus.REUSSI, # Simulation: succès direct
        reference_transaction=reference
    )
    
    session.add(paiement)
    
    # 3. Mettre à jour la commande
    commande.status = CommandeStatus.PAYEE
    session.add(commande)
    
    session.commit()
    session.refresh(paiement)
    return paiement

def get_paiement_by_commande(session: Session, commande_id: int) -> Paiement | None:
    """Récupérer le paiement associé à une commande."""
    statement = select(Paiement).where(Paiement.commande_id == commande_id)
    return session.exec(statement).first()
