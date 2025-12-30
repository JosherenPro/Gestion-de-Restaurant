from fastapi import APIRouter, Depends, HTTPException, Path, Body
from sqlmodel import Session
from app.core.database import get_session
from app.schemas.paiement import PaiementRead, PaiementCreate
from app.services.paiement_service import (
    process_payment, 
    get_addition, 
    get_paiement_by_commande
)

router = APIRouter(
    prefix="/paiements",
    tags=["Paiements"]
)

@router.post("/", response_model=PaiementRead)
async def create_payment_endpoint(
    session: Session = Depends(get_session),
    paiement_in: PaiementCreate = Body(...)
):
    """Effectuer un paiement."""
    return process_payment(session, paiement_in)

@router.get("/addition/{commande_id}")
async def get_addition_endpoint(
    commande_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Obtenir le montant total à payer pour une commande."""
    total = get_addition(session, commande_id)
    return {"commande_id": commande_id, "total": total}

@router.get("/commande/{commande_id}", response_model=PaiementRead)
async def get_payment_by_commande_endpoint(
    commande_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Récupérer le paiement d'une commande."""
    paiement = get_paiement_by_commande(session, commande_id)
    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement non trouvé pour cette commande")
    return paiement
