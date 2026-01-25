from sqlmodel import SQLModel
from typing import Optional

class LigneCommandeBase(SQLModel):
    commande_id: int
    plat_id: int | None = None
    menu_id: int | None = None
    quantite: int
    prix_unitaire: float
    notes_speciales: str | None = None
    statut: str = "en_attente"

class LigneCommandeCreate(LigneCommandeBase):
    pass

class LigneCommandeRead(LigneCommandeBase):
    id: int
    plat: Optional["PlatRead"] = None

    class Config:
        from_attributes = True

# Import at end to avoid circular import
from app.schemas.plat import PlatRead
LigneCommandeRead.model_rebuild()

class LigneCommandeUpdate(SQLModel):
    quantite: int | None = None
    notes_speciales: str | None = None
    statut: str | None = None
