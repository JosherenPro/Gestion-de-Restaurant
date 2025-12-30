from sqlmodel import SQLModel, Field
from app.models.commande import CommandeBase, CommandeStatus
from datetime import datetime


class CommandeCreate(CommandeBase):
    pass


class CommandeRead(CommandeBase):
    id: int
    date_commande: datetime

    class Config:
        from_attributes = True


class CommandeUpdate(SQLModel):
    client_id: int | None = None
    table_id: int | None = None
    serveur_id: int | None = None
    status: CommandeStatus | None = None
    montant_total: int | None = None
    type_commande: str | None = None
    notes: str | None = None
