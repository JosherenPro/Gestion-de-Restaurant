from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.commande import Commande
    from app.models.reservation import Reservation

from enum import Enum

class TableStatus(str, Enum):
    LIBRE = "libre"
    OCCUPEE = "occupee"
    RESERVEE = "reservee"

class RestaurantTable(SQLModel, table=True):
    __tablename__ = "table"
    id: int | None = Field(default=None, primary_key=True)
    numero_table: str
    capacite: int
    statut: TableStatus = Field(default=TableStatus.LIBRE)
    qr_code: str | None = None
    
    # Relationships
    commandes: List["Commande"] = Relationship(back_populates="table")
    reservations: List["Reservation"] = Relationship(back_populates="table") 