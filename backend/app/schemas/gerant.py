from sqlmodel import SQLModel


class GerantCreate(SQLModel):
    personnel_id: int
    

class GerantRead(SQLModel):
    id: int
    personnel_id: int
    

class GerantUpdate(SQLModel):
    personnel_id: int | None = None
