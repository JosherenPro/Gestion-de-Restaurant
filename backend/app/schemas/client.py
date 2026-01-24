from sqlmodel import SQLModel


class ClientCreate(SQLModel):
    utilisateur_id: int
    

from app.schemas.utilisateur import UtilisateurRead
from typing import Optional

class ClientRead(SQLModel):
    id: int
    utilisateur_id: int
    utilisateur: Optional[UtilisateurRead] = None

class ClientUpdate(SQLModel):
    utilisateur_id: int | None = None
