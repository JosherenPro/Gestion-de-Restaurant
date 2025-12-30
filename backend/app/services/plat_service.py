from app.models.plat import Plat
from app.schemas.plat import PlatCreate, PlatRead, PlatUpdate

from sqlmodel import Session, select
from typing import List

from app.core.database import get_session




def create_plat(session: Session, plat_in: PlatCreate) -> Plat:
    """Creer un nouvel plat dans la base de donnees."""
    plat = Plat(
        nom=plat_in.nom,
        description=plat_in.description,
        prix=plat_in.prix,
        categorie_id=plat_in.categorie_id,
        image_url=plat_in.image_url,
        disponible=plat_in.disponible,
        temps_preparation=plat_in.temps_preparation
    )
    session.add(plat)
    session.commit()
    session.refresh(plat)
    return plat


def read_plat(session: Session, plat_id: int) -> PlatRead | None:
    """Recuperer un plat par son ID."""
    plat = session.get(Plat, plat_id)
    if not plat:
        return None
    return PlatRead.model_validate(plat)


def get_plat_by_nom(session: Session, nom: str) -> PlatRead | None:
    statement = select(Plat).where(Plat.nom == nom)
    plat = session.exec(statement).first()
    if plat:
        return PlatRead.model_validate(plat)
    return None


def delete_plat(session: Session, plat_id: int) -> Plat | None:
    """Supprimer un plat par son ID."""
    plat = session.get(Plat, plat_id)
    if plat:
        session.delete(plat)
        session.commit()
        return plat
    return None


def update_plat(
    session: Session,
    plat_id: int,
    plat_in: PlatUpdate
) ->  PlatRead | None:
    """Mettre a jour les infos sur un plat."""
    plat = session.get(Plat, plat_id)
    if not plat: 
        return None

    updates = plat_in.model_dump(exclude_unset=True)

    plat.sqlmodel_update(updates)
    
    session.add(plat)
    session.commit()
    session.refresh(plat)
    return plat



def list_plats(session: Session, skip: int = 0, limit: int = 100) -> List[Plat]:
    statement = select(Plat).offset(skip).limit(limit)
    return session.exec(statement).all()