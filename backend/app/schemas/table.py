from sqlmodel import SQLModel
from typing import Optional
from app.models.table import TableStatus

class TableBase(SQLModel):
    numero_table: str
    capacite: int
    statut: TableStatus = TableStatus.LIBRE
    qr_code: str | None = None

class TableCreate(TableBase):
    pass

class TableRead(TableBase):
    id: int

class TableUpdate(SQLModel):
    numero_table: str | None = None
    capacite: int | None = None
    statut: TableStatus | None = None
    qr_code: str | None = None
 