from sqlmodel import SQLModel


class ClientCreate(SQLModel):
    utilisateur_id: int
    

class ClientRead(SQLModel):
    id: int
    utilisateur_id: int
    

class ClientUpdate(SQLModel):
    utilisateur_id: int | None = None
