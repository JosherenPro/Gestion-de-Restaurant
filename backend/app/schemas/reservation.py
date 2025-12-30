from sqlmodel import SQLModel, Field
from app.models.reservation import ReservationBase, ReservationStatus
from datetime import datetime


class ReservationCreate(ReservationBase):
    pass


class ReservationRead(ReservationBase):
    id: int

    class Config:
        from_attributes = True


class ReservationUpdate(SQLModel):
    client_id: int | None = None
    table_id: int | None = None
    date_reservation: datetime | None = None
    nombre_personnes: int | None = None
    status: ReservationStatus | None = None
    notes: str | None = None