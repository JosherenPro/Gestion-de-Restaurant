from datetime import datetime, timedelta
from typing import List
from sqlmodel import Session, select
from app.models.reservation import Reservation, ReservationStatus
from app.schemas.reservation import ReservationCreate, ReservationRead, ReservationUpdate

def is_table_available(session: Session, table_id: int, start_time: datetime, exclude_id: int | None = None) -> bool:
    """Vérifie si une table est disponible (fenêtre de 2h)."""
    # Fenêtre de 2 heures
    buffer = timedelta(hours=2)
    start_window = start_time - buffer
    end_window = start_time + buffer
    
    statement = select(Reservation).where(
        Reservation.table_id == table_id,
        Reservation.date_reservation > start_window,
        Reservation.date_reservation < end_window,
        Reservation.status != ReservationStatus.ANNULEE
    )
    if exclude_id:
        statement = statement.where(Reservation.id != exclude_id)
        
    overlap = session.exec(statement).first()
    return overlap is None

def create_reservation(session: Session, reservation_in: ReservationCreate) -> Reservation:
    """Créer une nouvelle réservation si la table est libre."""
    if not is_table_available(session, reservation_in.table_id, reservation_in.date_reservation):
        raise ValueError("La table est déjà réservée pour ce créneau (fenêtre de 2h).")

    reservation = Reservation.model_validate(reservation_in)
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return reservation

def confirmer_reservation(session: Session, reservation_id: int) -> Reservation | None:
    """Confirmer une réservation."""
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        return None
    reservation.status = ReservationStatus.CONFIRMEE
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return reservation

def annuler_reservation(session: Session, reservation_id: int) -> Reservation | None:
    """Annuler une réservation."""
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        return None
    reservation.status = ReservationStatus.ANNULEE
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return reservation

def read_reservation(session: Session, reservation_id: int) -> ReservationRead | None:
    """Récupérer une réservation par son ID."""
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        return None
    return ReservationRead.model_validate(reservation)

def list_reservations(session: Session, skip: int = 0, limit: int = 100) -> List[Reservation]:
    """Lister toutes les réservations."""
    statement = select(Reservation).offset(skip).limit(limit)
    return session.exec(statement).all()

def update_reservation(session: Session, reservation_id: int, reservation_in: ReservationUpdate) -> ReservationRead | None:
    """Mettre à jour une réservation."""
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation:
        return None
    reservation_data = reservation_in.model_dump(exclude_unset=True)
    db_reservation.sqlmodel_update(reservation_data)
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)
    return db_reservation

def delete_reservation(session: Session, reservation_id: int) -> Reservation | None:
    """Supprimer une réservation."""
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation:
        return None
    session.delete(db_reservation)
    session.commit()
    return db_reservation
