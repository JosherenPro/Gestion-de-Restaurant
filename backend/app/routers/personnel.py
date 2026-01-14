from fastapi import APIRouter, Depends, Body, Path, HTTPException, BackgroundTasks
from sqlmodel import Session
from app.core.database import get_session
from typing import List

from app.services.personnel_service import (
    create_personnel,
    create_personnel_full,
    create_gerant,
    create_gerant_full,
    create_serveur,
    create_serveur_full,
    create_cuisinier,
    create_cuisinier_full,
    read_personnel,
    list_personnel,
    delete_personnel
)       

from app.schemas.personnel import PersonnelCreate, PersonnelRead
from app.schemas.gerant import GerantCreate, GerantRead
from app.schemas.serveur import ServeurCreate, ServeurRead
from app.schemas.cuisinier import cuisinierCreate, cuisinierRead
from app.schemas.personnel_full import (
    PersonnelCreateFull, GerantCreateFull, ServeurCreateFull, CuisinierCreateFull
)

from app.security.rbac import allow_gerant

router = APIRouter(
    prefix="/personnel",
    tags=["Personnel"],
    dependencies=[Depends(allow_gerant)]
)

@router.post("/", response_model=PersonnelRead)
async def create_personnel_endpoint(
    session: Session = Depends(get_session),
    personnel_in: PersonnelCreate = Body(...)
):
    return create_personnel(session, personnel_in)

@router.post("/register", response_model=PersonnelRead)
async def register_personnel_endpoint(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    personnel_in: PersonnelCreateFull = Body(...)
):
    """Créer un utilisateur et un profil personnel."""
    try:
        return create_personnel_full(session, personnel_in, background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/register/gerants", response_model=GerantRead)
async def register_gerant_endpoint(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    gerant_in: GerantCreateFull = Body(...)
):
    """Créer un utilisateur et un profil gérant."""
    try:
        return create_gerant_full(session, gerant_in, background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/register/serveurs", response_model=ServeurRead)
async def register_serveur_endpoint(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    serveur_in: ServeurCreateFull = Body(...)
):
    """Créer un utilisateur et un profil serveur."""
    try:
        return create_serveur_full(session, serveur_in, background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/register/cuisiniers", response_model=PersonnelRead)
async def register_cuisinier_endpoint(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    cuisinier_in: CuisinierCreateFull = Body(...)
):
    """Créer un utilisateur et un profil cuisinier."""
    try:
        return create_cuisinier_full(session, cuisinier_in, background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/gerants", response_model=GerantRead)
async def create_gerant_endpoint(
    session: Session = Depends(get_session),
    gerant_in: GerantCreate = Body(...)
):
    return create_gerant(session, gerant_in)

@router.post("/serveurs", response_model=ServeurRead)
async def create_serveur_endpoint(
    session: Session = Depends(get_session),
    serveur_in: ServeurCreate = Body(...)
):
    return create_serveur(session, serveur_in)

@router.post("/cuisiniers", response_model=cuisinierRead)
async def create_cuisinier_endpoint(
    session: Session = Depends(get_session),
    cuisinier_in: cuisinierCreate = Body(...)
):
    return create_cuisinier(session, cuisinier_in)

@router.get("/{personnel_id}", response_model=PersonnelRead)
async def read_personnel_endpoint(
    session: Session = Depends(get_session),
    personnel_id: int = Path(...)
):
    personnel = read_personnel(session, personnel_id)
    if not personnel:
        raise HTTPException(status_code=404, detail="Personnel non trouvé")
    return personnel

@router.get("/", response_model=List[PersonnelRead])
async def list_personnel_endpoint(
    session: Session = Depends(get_session)
):
    return list_personnel(session)

@router.delete("/{personnel_id}", response_model=PersonnelRead)
async def delete_personnel_endpoint(
    session: Session = Depends(get_session),
    personnel_id: int = Path(...)
):
    personnel = delete_personnel(session, personnel_id)
    if not personnel:
        raise HTTPException(status_code=404, detail="Personnel non trouvé")
    return personnel
