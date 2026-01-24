from sqlmodel import Relationship, SQLModel, Field
from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, List


if TYPE_CHECKING:
    from app.models.table import RestaurantTable
    from app.models.client import Client



class ReservationStatus(str, Enum):
    EN_ATTENTE: str = "en_attente"
    CONFIRMEE: str = "confirmee"
    ANNULEE: str = "annulee"
    TERMINEE: str = "terminee"
    NON_PRESENT: str = "non_present"


class ReservationBase(SQLModel):
    client_id: int = Field(foreign_key="client.id")
    table_id: int = Field(foreign_key="table.id")
    date_reservation: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    nombre_personnes: int
    status: ReservationStatus = Field(default=ReservationStatus.EN_ATTENTE)
    notes: str | None = None


class Reservation(ReservationBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    
    # Relationships
    table: "RestaurantTable" = Relationship(back_populates="reservations")
    client: "Client" = Relationship(back_populates="reservations")
