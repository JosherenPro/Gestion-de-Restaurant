from sqlmodel import SQLModel
from datetime import datetime
from typing import Optional
from app.models.paiement import PaymentStatus, PaymentMethod

class PaiementBase(SQLModel):
    commande_id: int
    montant: int
    methode_paiement: PaymentMethod
    statut: PaymentStatus = PaymentStatus.EN_ATTENTE
    reference_transaction: str | None = None

class PaiementCreate(PaiementBase):
    pass

class PaiementRead(PaiementBase):
    id: int
    date_paiement: datetime

class PaiementUpdate(SQLModel):
    montant: int | None = None
    methode_paiement: PaymentMethod | None = None
    statut: PaymentStatus | None = None
    reference_transaction: str | None = None
