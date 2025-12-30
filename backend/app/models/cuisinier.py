from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.commande import Commande
    from app.models.personnel import Personnel


class Cuisinier(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)

    personnel_id: int = Field(foreign_key="personnel.id", index=True)

    # pour les relations ORM permet de lier avec la table utilisateur
    personnel: "Personnel" = Relationship(back_populates="cuisinier")
    commandes: list["Commande"] = Relationship(back_populates="cuisinier")
