from fastapi import APIRouter, Depends, Body, Path, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from typing import List
from datetime import datetime

from app.services.reservation_service import (
    create_reservation,
    read_reservation,
    list_reservations,
    update_reservation,
    delete_reservation,
    confirmer_reservation,
    annuler_reservation,
    is_table_available
)       

from app.schemas.reservation import (
    ReservationCreate,
    ReservationRead,
    ReservationUpdate
)

router = APIRouter(
    prefix="/reservations",
    tags=["Réservations"]
)

@router.post("/", response_model=ReservationRead)
async def create_reservation_endpoint(
    session: Session = Depends(get_session),
    reservation_in: ReservationCreate = Body(...)
):
    """Créer une réservation avec vérification de disponibilité."""
    try:
        return create_reservation(session, reservation_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{reservation_id}", response_model=ReservationRead)
async def read_reservation_endpoint(
    session: Session = Depends(get_session),
    reservation_id: int = Path(...)
):
    """Récupérer une réservation par son ID."""
    reservation = read_reservation(session, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    return reservation

@router.get("/", response_model=List[ReservationRead])
async def list_reservations_endpoint(
    session: Session = Depends(get_session)
):
    """Lister toutes les réservations."""
    return list_reservations(session)

@router.put("/{reservation_id}", response_model=ReservationRead)
async def update_reservation_endpoint(
    session: Session = Depends(get_session),
    reservation_id: int = Path(...),
    reservation_in: ReservationUpdate = Body(...)
):
    """Mettre à jour une réservation."""
    reservation = update_reservation(session, reservation_id, reservation_in)
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    return reservation

@router.delete("/{reservation_id}", response_model=ReservationRead)
async def delete_reservation_endpoint(
    session: Session = Depends(get_session),
    reservation_id: int = Path(...)
):
    """Supprimer une réservation."""
    reservation = delete_reservation(session, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    return reservation

@router.post("/{reservation_id}/confirmer", response_model=ReservationRead)
async def confirmer_reservation_endpoint(
    reservation_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Confirmer une réservation (Personnel)."""
    reservation = confirmer_reservation(session, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    return reservation

@router.post("/{reservation_id}/annuler", response_model=ReservationRead)
async def annuler_reservation_endpoint(
    reservation_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Annuler une réservation."""
    reservation = annuler_reservation(session, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    return reservation

@router.get("/disponibilite/", response_model=bool)
async def check_disponibilite_endpoint(
    table_id: int,
    date_reservation: datetime,
    session: Session = Depends(get_session)
):
    """Vérifier si une table est disponible à une date donnée."""
    return is_table_available(session, table_id, date_reservation)
