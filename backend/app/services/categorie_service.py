from app.models.categorie import Categorie
from app.schemas.categorie import CategorieCreate, CategorieRead, CategorieUpdate
from sqlmodel import Session, select
from typing import List

def create_categorie(session: Session, categorie_in: CategorieCreate) -> Categorie:
    """Créer une nouvelle catégorie."""
    categorie = Categorie.model_validate(categorie_in)
    session.add(categorie)
    session.commit()
    session.refresh(categorie)
    return categorie

def read_categorie(session: Session, categorie_id: int) -> CategorieRead | None:
    """Récupérer une catégorie par son ID."""
    categorie = session.get(Categorie, categorie_id)
    if not categorie:
        return None
    return CategorieRead.model_validate(categorie)

def list_categories(session: Session, skip: int = 0, limit: int = 100) -> List[Categorie]:
    """Lister toutes les catégories."""
    statement = select(Categorie).offset(skip).limit(limit)
    return session.exec(statement).all()

def update_categorie(session: Session, categorie_id: int, categorie_in: CategorieUpdate) -> CategorieRead | None:
    """Mettre à jour une catégorie."""
    db_categorie = session.get(Categorie, categorie_id)
    if not db_categorie:
        return None
    categorie_data = categorie_in.model_dump(exclude_unset=True)
    db_categorie.sqlmodel_update(categorie_data)
    session.add(db_categorie)
    session.commit()
    session.refresh(db_categorie)
    return db_categorie

def delete_categorie(session: Session, categorie_id: int) -> Categorie | None:
    """Supprimer une catégorie."""
    db_categorie = session.get(Categorie, categorie_id)
    if not db_categorie:
        return None
    session.delete(db_categorie)
    session.commit()
    return db_categorie
