from sqlmodel import SQLModel


class cuisinierCreate(SQLModel):
    personnel_id: int


class cuisinierRead(SQLModel):
    id: int
    personnel_id: int


class cuisinierUpdate(SQLModel):
    personnel_id: int | None = None
