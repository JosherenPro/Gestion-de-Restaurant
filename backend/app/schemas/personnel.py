from sqlmodel import SQLModel


class PersonnelCreate(SQLModel):
    utilisateur_id: int
    

class PersonnelRead(SQLModel):
    id: int
    utilisateur_id: int
    

class PersonnelUpdate(SQLModel):
    utilisateur_id: int | None = None
