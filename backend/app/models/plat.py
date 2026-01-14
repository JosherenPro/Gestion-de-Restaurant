from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.ligne_commande import LigneCommande
    from app.models.menu import ContenuMenu
    from app.models.categorie import Categorie



class Plat(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nom: str
    description: str | None = None
    prix: int
    categorie_id: int = Field(foreign_key="categorie.id")
    image_url: str | None = None
    disponible: bool = True
    temps_preparation: int | None = None # en minutes

    # Relationships
    categorie: "Categorie" = Relationship(back_populates="plats")
    lignes_commande: List["LigneCommande"] = Relationship(back_populates="plat")
    contenus_menu: List["ContenuMenu"] = Relationship(back_populates="plat")
