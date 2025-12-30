from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings


# creation du moteur de connection a la base de donnees
engine = create_engine(settings.DATABASE_URL, echo=settings.DEBUG)


def create_db_and_tables():
    # creation des tables dans la base de donnnes au denmarrage de l'application
    SQLModel.metadata.create_all(engine)


def get_session():
    # creation d'une session de connection a la base de donnees
    with Session(engine) as session:
        yield session