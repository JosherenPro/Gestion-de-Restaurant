from sqlmodel import SQLModel, Field
from app.models.commande import CommandeBase, CommandeStatus
from datetime import datetime


class CommandeCreate(CommandeBase):
    pass


from typing import Optional
from app.schemas.table import TableRead
# Avoid circular import by defining ClientRead minimal or importing if safe
# Use TYPE_CHECKING or just Optional for now
from app.schemas.client import ClientRead

class CommandeRead(CommandeBase):
    id: int
    date_commande: datetime
    client: Optional[ClientRead] = None
    table: Optional[TableRead] = None

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

