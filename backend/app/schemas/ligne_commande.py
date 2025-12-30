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

class LigneCommandeUpdate(SQLModel):
    quantite: int | None = None
    notes_speciales: str | None = None
    statut: str | None = None
