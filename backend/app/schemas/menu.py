from sqlmodel import SQLModel
from typing import Optional, List

# Definitions for ContenuMenu (Join table)
class ContenuMenuBase(SQLModel):
    menu_id: int
    plat_id: int

class ContenuMenuCreate(ContenuMenuBase):
    pass

class ContenuMenuRead(ContenuMenuBase):
    pass

# Definitions for Menu
class MenuBase(SQLModel):
    nom: str
    prix_fixe: int
    actif: bool = True

class MenuCreate(MenuBase):
    pass

class MenuRead(MenuBase):
    id: int

class MenuUpdate(SQLModel):
    nom: str | None = None
    prix_fixe: int | None = None
    actif: bool | None = None
