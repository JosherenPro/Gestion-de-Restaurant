from app.models.avis import Avis
from app.schemas.avis import AvisCreate, AvisRead, AvisUpdate
from sqlmodel import Session, select
from typing import List

from app.models.commande import Commande, CommandeStatus

def create_avis(session: Session, avis_in: AvisCreate) -> Avis:
    """Créer un nouvel avis avec validation."""
    # 1. Vérifier si la commande existe et est payée
    commande = session.get(Commande, avis_in.commande_id)
    if not commande:
        raise ValueError("Commande non trouvée")
    if commande.status != CommandeStatus.PAYEE:
        raise ValueError("Vous ne pouvez laisser un avis que pour une commande payée.")

    # 2. Vérifier si un avis existe déjà pour cette commande
    statement = select(Avis).where(Avis.commande_id == avis_in.commande_id)
    existing_avis = session.exec(statement).first()
    if existing_avis:
        raise ValueError("Un avis a déjà été laissé pour cette commande.")

    # 3. Création
    avis = Avis.model_validate(avis_in)
    session.add(avis)
    session.commit()
    session.refresh(avis)
    return avis

def read_avis(session: Session, avis_id: int) -> AvisRead | None:
    """Récupérer un avis par son ID."""
    avis = session.get(Avis, avis_id)
    if not avis:
        return None
    return AvisRead.model_validate(avis)

def list_avis(session: Session, skip: int = 0, limit: int = 100) -> List[Avis]:
    """Lister tous les avis."""
    statement = select(Avis).offset(skip).limit(limit)
    return session.exec(statement).all()

def update_avis(session: Session, avis_id: int, avis_in: AvisUpdate) -> AvisRead | None:
    """Mettre à jour un avis."""
    db_avis = session.get(Avis, avis_id)
    if not db_avis:
        return None
    avis_data = avis_in.model_dump(exclude_unset=True)
    db_avis.sqlmodel_update(avis_data)
    session.add(db_avis)
    session.commit()
    session.refresh(db_avis)
    return db_avis

def delete_avis(session: Session, avis_id: int) -> Avis | None:
    """Supprimer un avis."""
    db_avis = session.get(Avis, avis_id)
    if not db_avis:
        return None
    session.delete(db_avis)
    session.commit()
    return db_avis
