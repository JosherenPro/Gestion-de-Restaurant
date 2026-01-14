from sqlmodel import Relationship, SQLModel, Field
from pydantic import EmailStr
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING, List

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.personnel import Personnel


class UtilisateurBase(SQLModel):
    nom: str
    prenom: str
    email: EmailStr = Field(default=None, index=True, unique=True)
    telephone: str = Field(default=None, index=True, unique=True)
    role: str


class Utilisateur(UtilisateurBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    active: bool = True
    is_verified: bool = False
    verification_token: str | None = Field(default=None, index=True)
    verification_token_expires: datetime | None = None
    date_creation: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # pour les relations ORM permet de lier avec la table client
    clients: Optional[List["Client"]] = Relationship(
        back_populates="utilisateur"
    )
    personnels: Optional[List["Personnel"]] = Relationship(
        back_populates="utilisateur"
    )

