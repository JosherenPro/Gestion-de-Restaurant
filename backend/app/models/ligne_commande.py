from sqlmodel import SQLModel, Field, Relationship

from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.commande import Commande
    from app.models.plat import Plat
    from app.models.menu import Menu



class LigneCommande(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    commande_id: int = Field(foreign_key="commande.id")
    plat_id: int | None = Field(default=None, foreign_key="plat.id")
    menu_id: int | None = Field(default=None, foreign_key="menu.id")
    quantite: int
    prix_unitaire: float # prix au moment de la commande
    notes_speciales: str | None = None
    statut: str = "en_attente"
    
    # Relationships
    commande: "Commande" = Relationship(back_populates="lignes")
    plat: "Plat" = Relationship(back_populates="lignes_commande")
    menu: Optional["Menu"] = Relationship(back_populates="lignes_commande")
