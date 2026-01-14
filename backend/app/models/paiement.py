from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.commande import Commande

from enum import Enum

class PaymentStatus(str, Enum):
    EN_ATTENTE = "en_attente"
    REUSSI = "reussi"
    ECHOUE = "echoue"

class PaymentMethod(str, Enum):
    CARTE = "carte"
    ESPECES = "especes"
    MOBILE = "mobile"

class Paiement(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    commande_id: int = Field(foreign_key="commande.id")
    montant: int
    methode_paiement: PaymentMethod
    date_paiement: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    statut: PaymentStatus = Field(default=PaymentStatus.EN_ATTENTE)
    reference_transaction: str | None = None
    
    # Relationships
    commande: "Commande" = Relationship(back_populates="paiement")
