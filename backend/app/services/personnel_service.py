from app.models.personnel import Personnel
from app.models.gerant import Gerant
from app.models.serveur import Serveur
from app.models.cuisinier import Cuisinier
from app.schemas.personnel import PersonnelCreate, PersonnelRead, PersonnelUpdate
from app.schemas.gerant import GerantCreate
from app.schemas.serveur import ServeurCreate
from app.schemas.cuisinier import cuisinierCreate # Note: lowercase in schema
from app.schemas.personnel_full import (
    PersonnelCreateFull, GerantCreateFull, ServeurCreateFull, CuisinierCreateFull
)
from app.services.utilisateur_service import create_utilisateur
from sqlmodel import Session, select
from typing import List
from fastapi import BackgroundTasks

def create_personnel(session: Session, personnel_in: PersonnelCreate) -> Personnel:
    """Créer un nouveau personnel de base."""
    personnel = Personnel.model_validate(personnel_in)
    session.add(personnel)
    session.commit()
    session.refresh(personnel)
    return personnel

def create_personnel_full(
    session: Session, 
    personnel_in: PersonnelCreateFull,
    background_tasks: BackgroundTasks
) -> Personnel:
    """Créer un utilisateur et un personnel en une seule fois."""
    utilisateur = create_utilisateur(session, personnel_in, background_tasks)
    personnel = Personnel(utilisateur_id=utilisateur.id)
    session.add(personnel)
    session.commit()
    session.refresh(personnel)
    return personnel

def create_gerant_full(
    session: Session, 
    gerant_in: GerantCreateFull,
    background_tasks: BackgroundTasks
) -> Gerant:
    """Créer un utilisateur, un personnel et un gérant en une seule fois."""
    personnel = create_personnel_full(session, gerant_in, background_tasks)
    gerant = Gerant(personnel_id=personnel.id)
    session.add(gerant)
    session.commit()
    session.refresh(gerant)
    return gerant

def create_serveur_full(
    session: Session, 
    serveur_in: ServeurCreateFull,
    background_tasks: BackgroundTasks
) -> Serveur:
    """Créer un utilisateur, un personnel et un serveur en une seule fois."""
    personnel = create_personnel_full(session, serveur_in, background_tasks)
    serveur = Serveur(personnel_id=personnel.id)
    session.add(serveur)
    session.commit()
    session.refresh(serveur)
    return serveur

def create_cuisinier_full(
    session: Session, 
    cuisinier_in: CuisinierCreateFull,
    background_tasks: BackgroundTasks
) -> Cuisinier:
    """Créer un utilisateur, un personnel et un cuisinier en une seule fois."""
    personnel = create_personnel_full(session, cuisinier_in, background_tasks)
    cuisinier = Cuisinier(personnel_id=personnel.id)
    session.add(cuisinier)
    session.commit()
    session.refresh(cuisinier)
    return cuisinier

def create_gerant(session: Session, gerant_in: GerantCreate) -> Gerant:
    """Créer un gérant."""
    gerant = Gerant.model_validate(gerant_in)
    session.add(gerant)
    session.commit()
    session.refresh(gerant)
    return gerant

def create_serveur(session: Session, serveur_in: ServeurCreate) -> Serveur:
    """Créer un serveur."""
    serveur = Serveur.model_validate(serveur_in)
    session.add(serveur)
    session.commit()
    session.refresh(serveur)
    return serveur

def create_cuisinier(session: Session, cuisinier_in: cuisinierCreate) -> Cuisinier:
    """Créer un cuisinier."""
    cuisinier = Cuisinier.model_validate(cuisinier_in)
    session.add(cuisinier)
    session.commit()
    session.refresh(cuisinier)
    return cuisinier

def read_personnel(session: Session, personnel_id: int) -> Personnel | None:
    """Récupérer un personnel par son ID."""
    return session.get(Personnel, personnel_id)

def list_personnel(session: Session, skip: int = 0, limit: int = 100) -> List[Personnel]:
    """Lister tout le personnel."""
    statement = select(Personnel).offset(skip).limit(limit)
    return session.exec(statement).all()

def delete_personnel(session: Session, personnel_id: int) -> Personnel | None:
    """Supprimer un personnel."""
    db_personnel = session.get(Personnel, personnel_id)
    if not db_personnel:
        return None
    session.delete(db_personnel)
    session.commit()
    return db_personnel
