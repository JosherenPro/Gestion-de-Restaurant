from fastapi import APIRouter, Depends, Body, Path, HTTPException, BackgroundTasks
from sqlmodel import Session
from app.core.database import get_session
from typing import List

from app.services.client_service import (
    create_client,
    create_client_full,
    read_client,
    list_clients,
    delete_client
)       

from app.schemas.client import (
    ClientCreate,
    ClientRead
)
from app.schemas.client_full import ClientCreateFull

router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)

@router.post("/", response_model=ClientRead)
async def create_client_endpoint(
    session: Session = Depends(get_session),
    client_in: ClientCreate = Body(...)
):
    return create_client(session, client_in)

@router.post("/register", response_model=ClientRead)
async def register_client_endpoint(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    client_in: ClientCreateFull = Body(...)
):
    """Créer un utilisateur et son profil client en une seule fois."""
    try:
        return create_client_full(session, client_in, background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{client_id}", response_model=ClientRead)
async def read_client_endpoint(
    session: Session = Depends(get_session),
    client_id: int = Path(...)
):
    client = read_client(session, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return client

@router.get("/", response_model=List[ClientRead])
async def list_clients_endpoint(
    session: Session = Depends(get_session)
):
    return list_clients(session)

@router.delete("/{client_id}", response_model=ClientRead)
async def delete_client_endpoint(
    session: Session = Depends(get_session),
    client_id: int = Path(...)
):
    client = delete_client(session, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return client
