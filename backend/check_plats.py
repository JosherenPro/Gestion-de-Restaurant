from sqlmodel import create_engine, Session, select, func
from app.models.plat import Plat
from app.models.categorie import Categorie
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

with Session(engine) as session:
    plat_count = session.exec(select(func.count()).select_from(Plat)).one()
    rec_plats = session.exec(select(Plat).limit(5)).all()
    cat_count = session.exec(select(func.count()).select_from(Categorie)).one()
    
    print(f"Total Plats: {plat_count}")
    print(f"Total Categories: {cat_count}")
    print("Sample Plats:")
    for p in rec_plats:
        print(f" - {p.nom} (Cat: {p.categorie_id}, Dispo: {p.disponible})")
