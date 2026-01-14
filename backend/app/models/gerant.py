from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.personnel import Personnel



class Gerant(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)

    personnel_id: int = Field(
        foreign_key="personnel.id",
        index=True
    )

    # pour les relations ORM permet de lier avec la table utilisateur
    personnel: "Personnel" = Relationship(back_populates="gerant")
