from app.models.client import Client
from app.schemas.client import ClientCreate, ClientRead, ClientUpdate
from app.schemas.client_full import ClientCreateFull
from app.services.utilisateur_service import create_utilisateur
from sqlmodel import Session, select
from typing import List
from fastapi import BackgroundTasks

def create_client(session: Session, client_in: ClientCreate) -> Client:
    """Créer un nouveau client."""
    client = Client.model_validate(client_in)
    session.add(client)
    session.commit()
    session.refresh(client)
    return client

def create_client_full(
    session: Session, 
    client_in: ClientCreateFull,
    background_tasks: BackgroundTasks
) -> Client:
    """Créer un utilisateur et un client en une seule fois."""
    # 1. Créer ou mettre à jour l'utilisateur
    utilisateur = create_utilisateur(session, client_in, background_tasks)
    
    # 2. Vérifier si un client existe déjà pour cet utilisateur
    statement = select(Client).where(Client.utilisateur_id == utilisateur.id)
    existing_client = session.exec(statement).first()
    
    if existing_client:
        print(f"ℹ️ CREATE_CLIENT : Client existant trouvé (ID: {existing_client.id}) pour Utilisateur {utilisateur.id}")
        return existing_client

    # 3. Créer le client lié si absent
    print(f"✨ CREATE_CLIENT : Création d'un nouveau profil client pour Utilisateur {utilisateur.id}")
    client = Client(utilisateur_id=utilisateur.id)
    session.add(client)
    session.commit()
    session.refresh(client)
    return client

def read_client(session: Session, client_id: int) -> ClientRead | None:
    """Récupérer un client par son ID."""
    client = session.get(Client, client_id)
    if not client:
        return None
    return ClientRead.model_validate(client)

def list_clients(session: Session, skip: int = 0, limit: int = 100) -> List[Client]:
    """Lister tous les clients."""
    statement = select(Client).offset(skip).limit(limit)
    return session.exec(statement).all()

def get_client_by_utilisateur_id(session: Session, utilisateur_id: int) -> Client | None:
    """Récupérer un client par son ID utilisateur."""
    statement = select(Client).where(Client.utilisateur_id == utilisateur_id)
    return session.exec(statement).first()

def delete_client(session: Session, client_id: int) -> Client | None:
    """Supprimer un client et son utilisateur associé."""
    db_client = session.get(Client, client_id)
    if not db_client:
        return None
    
    # Récupérer l'utilisateur associé avant de supprimer le client
    utilisateur_id = db_client.utilisateur_id
    
    # Supprimer le client
    session.delete(db_client)
    session.commit()
    
    # Supprimer l'utilisateur associé
    from app.models.utilisateur import Utilisateur
    utilisateur = session.get(Utilisateur, utilisateur_id)
    if utilisateur:
        session.delete(utilisateur)
        session.commit()
    
    return db_client

