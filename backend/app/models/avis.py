from sqlmodel import Relationship, SQLModel, Field
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.commande import Commande



class Avis(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    client_id: int = Field(foreign_key="client.id")
    commande_id: int = Field(foreign_key="commande.id")
    
    note: int = Field(ge=1, le=5)
    commentaire: str | None = None
    date_avis: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    client: "Client" = Relationship(back_populates="avis")
    commande: "Commande" = Relationship(back_populates="avis")
