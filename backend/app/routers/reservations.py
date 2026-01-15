from fastapi import APIRouter, Depends, Body, Path, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from typing import List
from datetime import datetime

from app.services.reservation_service import (
    create_reservation,
    read_reservation,
    list_reservations,
    list_reservations_by_client,
    update_reservation,
    delete_reservation,
    confirmer_reservation,
    annuler_reservation,
    is_table_available
)       

from app.services.client_service import get_client_by_utilisateur_id
from app.security.auth import get_current_user
from app.models.utilisateur import Utilisateur

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
    reservation_in: ReservationCreate = Body(...),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Créer une réservation (lien automatique au profil du client si connecté)."""
    # Si c'est un client, on force son ID de client
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client:
             raise HTTPException(status_code=400, detail="Profil client manquant.")
        reservation_in.client_id = client.id

    try:
        return create_reservation(session, reservation_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{reservation_id}", response_model=ReservationRead)
async def read_reservation_endpoint(
    session: Session = Depends(get_session),
    reservation_id: int = Path(...),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Récupérer une réservation par son ID (avec vérification de propriété)."""
    reservation = read_reservation(session, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    
    # Vérification de propriété pour les clients
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client or reservation.client_id != client.id:
            raise HTTPException(status_code=403, detail="Accès non autorisé à cette réservation.")
            
    return reservation

@router.get("/", response_model=List[ReservationRead])
async def list_reservations_endpoint(
    session: Session = Depends(get_session),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Lister les réservations (filtrées pour les clients, toutes pour le staff)."""
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client:
            return []
        return list_reservations_by_client(session, client.id)
    
    # Pour le manager, serveur, cuisinier, on lister tout
    return list_reservations(session)

@router.put("/{reservation_id}", response_model=ReservationRead)
async def update_reservation_endpoint(
    session: Session = Depends(get_session),
    reservation_id: int = Path(...),
    reservation_in: ReservationUpdate = Body(...),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Mettre à jour une réservation (avec vérification de propriété)."""
    db_reservation = read_reservation(session, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
        
    # Vérification de propriété pour les clients
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client or db_reservation.client_id != client.id:
            raise HTTPException(status_code=403, detail="Action non autorisée sur cette réservation.")

    reservation = update_reservation(session, reservation_id, reservation_in)
    return reservation

@router.delete("/{reservation_id}", response_model=ReservationRead)
async def delete_reservation_endpoint(
    session: Session = Depends(get_session),
    reservation_id: int = Path(...),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Supprimer une réservation (avec vérification de propriété)."""
    db_reservation = read_reservation(session, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
        
    # Vérification de propriété pour les clients
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client or db_reservation.client_id != client.id:
            raise HTTPException(status_code=403, detail="Action non autorisée sur cette réservation.")

    reservation = delete_reservation(session, reservation_id)
    return reservation

@router.post("/{reservation_id}/confirmer", response_model=ReservationRead)
async def confirmer_reservation_endpoint(
    reservation_id: int = Path(...),
    session: Session = Depends(get_session),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Confirmer une réservation (Personnel uniquement)."""
    if current_user.role.upper() == "CLIENT":
        raise HTTPException(status_code=403, detail="Seul le personnel peut confirmer une réservation.")
        
    reservation = confirmer_reservation(session, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
    return reservation

@router.post("/{reservation_id}/annuler", response_model=ReservationRead)
async def annuler_reservation_endpoint(
    reservation_id: int = Path(...),
    session: Session = Depends(get_session),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Annuler une réservation (Propriétaire ou Personnel)."""
    db_reservation = read_reservation(session, reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Réservation non trouvée")
        
    # Vérification de propriété pour les clients
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client or db_reservation.client_id != client.id:
            raise HTTPException(status_code=403, detail="Action non autorisée sur cette réservation.")

    reservation = annuler_reservation(session, reservation_id)
    return reservation

@router.get("/disponibilite/", response_model=bool)
async def check_disponibilite_endpoint(
    table_id: int,
    date_reservation: datetime,
    session: Session = Depends(get_session)
):
    """Vérifier si une table est disponible à une date donnée."""
    return is_table_available(session, table_id, date_reservation)
