from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.plat import Plat
    from app.models.ligne_commande import LigneCommande

    

class ContenuMenu(SQLModel, table=True):
    menu_id: int = Field(foreign_key="menu.id", primary_key=True)
    plat_id: int = Field(foreign_key="plat.id", primary_key=True)
    
    # Relationships
    menu: "Menu" = Relationship(back_populates="contenus")
    plat: "Plat" = Relationship(back_populates="contenus_menu")


class Menu(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nom: str
    prix_fixe: int
    actif: bool = True
    
    # Relationships
    contenus: List["ContenuMenu"] = Relationship(back_populates="menu")
    lignes_commande: List["LigneCommande"] = Relationship(back_populates="menu")
