from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.cuisinier import Cuisinier
    from app.models.gerant import Gerant
    from app.models.serveur import Serveur
    from app.models.utilisateur import Utilisateur


class Personnel(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)

    utilisateur_id: int = Field(foreign_key="utilisateur.id", index=True)

    # pour les relations ORM permet de lier avec la table utilisateur
    utilisateur: "Utilisateur" = Relationship(back_populates="personnels")
    # pour gerer l'association avec gerant et cuisinier
    gerant: "Gerant" = Relationship(back_populates="personnel")
    cuisinier: Optional["Cuisinier"] = Relationship(back_populates="personnel")
    serveur: Optional["Serveur"] = Relationship(back_populates="personnel")
