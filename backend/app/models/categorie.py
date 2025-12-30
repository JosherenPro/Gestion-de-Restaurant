from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.plat import Plat

class Categorie(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nom: str
    description: str | None = None
    actif: bool = True
    
    # Relationships
    plats: List["Plat"] = Relationship(back_populates="categorie")
