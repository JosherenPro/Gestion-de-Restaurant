from sqlmodel import SQLModel
from typing import Optional

class CategorieBase(SQLModel):
    nom: str
    description: str | None = None
    actif: bool = True

class CategorieCreate(CategorieBase):
    pass

class CategorieRead(CategorieBase):
    id: int
    
class CategorieUpdate(SQLModel):
    nom: str | None = None
    description: str | None = None
    actif: bool | None = None
