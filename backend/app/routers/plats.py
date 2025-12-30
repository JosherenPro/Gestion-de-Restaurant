from fastapi import APIRouter, Depends, Body, Path, HTTPException
from sqlmodel import Session
from app.core.database import get_session

from app.services.plat_service import (
    delete_plat,
    update_plat,
    list_plats,
    read_plat,
    create_plat,
    get_plat_by_nom
)       

from app.schemas.plat import (
    PlatCreate,
    PlatRead,
    PlatUpdate
)

from app.security.rbac import allow_gerant

router = APIRouter(
    prefix="/plats",
    tags=["Plats"],
    dependencies=[Depends(allow_gerant)]
)

@router.post("/", response_model=PlatRead)
async def create_plat_endpoint(
    session: Session = Depends(get_session),
    plat_in: PlatCreate = Body(...)
) -> any:
    """
    Créer un plat
    """
    return create_plat(session, plat_in)


@router.get("/{plat_id}", response_model=PlatRead)
async def read_plat_endpoint(
    session: Session = Depends(get_session),
    plat_id: int = Path(...)
) -> any:
    """
    Récupérer un plat par son ID
    """
    plat = read_plat(session, plat_id)
    if not plat:
        raise HTTPException(status_code=404, detail="Plat non trouvé")
    return plat


@router.get("/nom/{nom}", response_model=PlatRead)
async def read_plat_by_nom_endpoint(
    session: Session = Depends(get_session),
    nom: str = Path(...)
) -> any:
    """
    Récupérer un plat par son nom
    """
    plat = get_plat_by_nom(session, nom)
    if not plat:
        raise HTTPException(status_code=404, detail="Plat non trouvé")
    return plat


@router.delete("/{plat_id}", response_model=PlatRead)
async def delete_plat_endpoint(
    session: Session = Depends(get_session),
    plat_id: int = Path(...)
) -> any:
    """
    Supprimer un plat
    """
    plat = delete_plat(session, plat_id)
    if not plat:
        raise HTTPException(status_code=404, detail="Plat non trouvé")
    return plat


@router.put("/{plat_id}", response_model=PlatRead)
async def update_plat_endpoint(
    session: Session = Depends(get_session),
    plat_id: int = Path(...),
    plat_in: PlatUpdate = Body(...)
) -> any:
    """
    Mettre à jour un plat
    """
    return update_plat(session, plat_id, plat_in)


@router.get("/", response_model=list[PlatRead])
def list_plats_endpoint(
    session: Session = Depends(get_session)
) -> any:
    """
    Lire tous les plats
    """
    return list_plats(session)


