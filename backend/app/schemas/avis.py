from sqlmodel import SQLModel
from datetime import datetime


class AvisCreate(SQLModel):
    client_id: int
    commande_id: int
    note: int
    commentaire: str | None = None


class AvisRead(SQLModel):
    id: int
    client_id: int
    commande_id: int
    note: int
    commentaire: str | None = None
    date_avis: datetime

class AvisUpdate(SQLModel):
    note: int | None = None
    commentaire: str | None = None