from app.models.utilisateur import UtilisateurBase
from sqlmodel import SQLModel
from datetime import datetime
from pydantic import EmailStr



class UtilisateurCreate(UtilisateurBase):
    password: str


class UtilisateurRead(UtilisateurBase):
    id: int
    active: bool
    date_creation: datetime

    # pour mapper les objets
    class Config:
        from_attributes = True


class UtilisateurUpdate(SQLModel):
    nom: str | None = None
    prenom: str | None = None
    email: EmailStr | None = None
    telephone: str | None = None
    role: str | None = None
    password: str | None = None
    active: bool | None = None
