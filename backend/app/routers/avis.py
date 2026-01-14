from fastapi import APIRouter, Depends, Body, Path, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from typing import List

from app.services.avis_service import (
    create_avis,
    read_avis,
    list_avis,
    update_avis,
    delete_avis
)       

from app.schemas.avis import (
    AvisCreate,
    AvisRead,
    AvisUpdate
)

router = APIRouter(
    prefix="/avis",
    tags=["Avis"]
)

@router.post("/", response_model=AvisRead)
async def create_avis_endpoint(
    session: Session = Depends(get_session),
    avis_in: AvisCreate = Body(...)
):
    """Laisser un avis (uniquement pour les commandes payées)."""
    try:
        return create_avis(session, avis_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{avis_id}", response_model=AvisRead)
async def read_avis_endpoint(
    session: Session = Depends(get_session),
    avis_id: int = Path(...)
):
    avis = read_avis(session, avis_id)
    if not avis:
        raise HTTPException(status_code=404, detail="Avis non trouvé")
    return avis

@router.get("/", response_model=List[AvisRead])
async def list_avis_endpoint(
    session: Session = Depends(get_session)
):
    return list_avis(session)

@router.put("/{avis_id}", response_model=AvisRead)
async def update_avis_endpoint(
    session: Session = Depends(get_session),
    avis_id: int = Path(...),
    avis_in: AvisUpdate = Body(...)
):
    avis = update_avis(session, avis_id, avis_in)
    if not avis:
        raise HTTPException(status_code=404, detail="Avis non trouvé")
    return avis

@router.delete("/{avis_id}", response_model=AvisRead)
async def delete_avis_endpoint(
    session: Session = Depends(get_session),
    avis_id: int = Path(...)
):
    avis = delete_avis(session, avis_id)
    if not avis:
        raise HTTPException(status_code=404, detail="Avis non trouvé")
    return avis
