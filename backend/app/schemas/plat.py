from sqlmodel import SQLModel
from typing import Optional

class PlatBase(SQLModel):
    nom: str
    description: str | None = None
    prix: int
    categorie_id: int
    image_url: str | None = None
    disponible: bool = True
    temps_preparation: int | None = None

class PlatCreate(PlatBase):
    pass

class PlatRead(PlatBase):
    id: int

class PlatUpdate(SQLModel):
    nom: str | None = None
    description: str | None = None
    prix: int | None = None
    categorie_id: int | None = None
    image_url: str | None = None
    disponible: bool | None = None
    temps_preparation: int | None = None
