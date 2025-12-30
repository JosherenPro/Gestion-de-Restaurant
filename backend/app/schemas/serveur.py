from sqlmodel import SQLModel


class ServeurCreate(SQLModel):
    personnel_id: int
    

class ServeurRead(SQLModel):
    id: int
    personnel_id: int
    

class ServeurUpdate(SQLModel):
    personnel_id: int | None = None
